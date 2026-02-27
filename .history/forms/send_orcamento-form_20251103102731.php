<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false, 'stage' => null);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Sanitiza e valida os dados recebidos do formulário
    $nome = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
    $sobrenome = htmlspecialchars($_POST['sobrenome'] ?? '', ENT_QUOTES, 'UTF-8');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8');
    $modelo = htmlspecialchars($_POST['modelo'] ?? '', ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
    $retorno = htmlspecialchars($_POST['retorno'] ?? '', ENT_QUOTES, 'UTF-8');
    $recaptchaToken = htmlspecialchars($_POST['recaptchaToken'] ?? '', ENT_QUOTES, 'UTF-8');

    $response['stage'] = 'valid_request';

    // Verifica o reCAPTCHA com a API do Google
    $recaptchaSecret = '6LfEIoYqAAAAAAL1cz_o2W1sKjy_CR8wKyDQtbFb';
    $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';

    if (empty($recaptchaToken)) {
        $response['stage'] = 'recaptcha_missing';
        $response['error'] = 'Token reCAPTCHA ausente. Recarregue a página e tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Tenta verificar via cURL (mais robusto). Se falhar, faz fallback para file_get_contents
    $response['stage'] = 'recaptcha_verification';
    $recaptchaData = null;
    $recaptchaResponse = null;

    if (function_exists('curl_init')) {
        $ch = curl_init($recaptchaUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'secret' => $recaptchaSecret,
            'response' => $recaptchaToken,
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        // Tentar com verificação SSL padrão
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        $recaptchaResponse = curl_exec($ch);

        if ($recaptchaResponse === false) {
            $firstError = curl_error($ch);
            // Fallback TEMPORÁRIO: desabilita verificação SSL para permitir diagnóstico
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            $recaptchaResponse = curl_exec($ch);
            if ($recaptchaResponse === false) {
                $response['error'] = 'Falha na comunicação com reCAPTCHA.';
                $response['debug'] = 'cURL error: ' . $firstError;
                $response['stage'] = 'recaptcha_http_error';
                curl_close($ch);
                header('Content-Type: application/json');
                echo json_encode($response);
                exit;
            } else {
                $response['debug'] = 'SSL verification disabled for reCAPTCHA request (temporary fallback). Original error: ' . $firstError;
                $response['stage'] = 'recaptcha_verification_insecure';
            }
        }
        curl_close($ch);
        $recaptchaData = json_decode($recaptchaResponse, true);
    } else {
        $recaptchaResponse = @file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecret . '&response=' . $recaptchaToken);
        if ($recaptchaResponse === false) {
            $response['error'] = 'Falha na comunicação com reCAPTCHA (HTTP).';
            $response['stage'] = 'recaptcha_http_error';
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
        }
        $recaptchaData = json_decode($recaptchaResponse, true);
    }

    if (is_array($recaptchaData) && !empty($recaptchaData['success']) && isset($recaptchaData['score']) && $recaptchaData['score'] >= 0.5) {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp-mail.outlook.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'contatomastrodascia@outlook.com';
            $mail->Password = 'rqnltoiacvpcacgl'; // Certifique-se de proteger essa senha
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;            
            $mail->CharSet = 'UTF-8';        
            $mail->Encoding = 'base64';
            // Evita logs sensíveis no output; usar error_log se necessário
            $mail->SMTPDebug = 0;
            // Opções TLS para ambiente local sem CA configurada
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
            ];
            // Alguns servidores exigem AUTH LOGIN
            $mail->AuthType = 'LOGIN';

            $mail->setFrom($mail->Username, 'Contato Mastro DAscia');
            $mail->addAddress('contatomastrodascia@outlook.com', 'Contato Mastro DAscia'); // Envia para o próprio e-mail

            $mail->isHTML(true);
            $mail->Subject = 'Oba! Novo contato pelo site';
            $mail->Body = "
                <h1>Recebemos um Novo Pedido de Or&ccedil;amento!</h1>
                <p><strong>Enviado de:</strong> Formul&aacute;rio de Or&ccedil;amento do site</p>
                <p><strong>Nome:</strong> $nome $sobrenome</p>
                <p><strong>E-mail:</strong> $email</p>
                <p><strong>Telefone:</strong> $phone</p>
                <p><strong>Modelo:</strong> $modelo</p>
                <p><strong>Mensagem:</strong> $message</p>
                <p><strong>Prefere retorno:</strong> $retorno</p>
            ";

            $sendOk = false;
            try {
                $mail->send();
                $sendOk = true;
            } catch (Exception $e1) {
                // Se falhar autenticação, tenta host alternativo do Office365
                $primaryError = $mail->ErrorInfo;
                if (stripos($primaryError, 'Could not authenticate') !== false) {
                    try {
                        // Tenta fallback
                        $mail->clearAddresses();
                        $mail->Host = 'smtp.office365.com';
                        $mail->addAddress('contatomastrodascia@outlook.com', 'Contato Mastro DAscia');
                        $mail->send();
                        $sendOk = true;
                        $response['stage'] = 'smtp_send_ok_fallback_office365';
                    } catch (Exception $e2) {
                        $response['stage'] = 'smtp_auth_error';
                        $response['error'] = "Falha de autenticação no SMTP. Confira usuário/senha ou habilite SMTP AUTH.";
                        $response['debug'] = 'primary: ' . $primaryError . ' | fallback: ' . $mail->ErrorInfo;
                    }
                } else {
                    $response['stage'] = 'smtp_error';
                    $response['error'] = "Algo deu errado no envio... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
                    $response['debug'] = isset($mail) ? $mail->ErrorInfo : $e1->getMessage();
                }
            }

            if ($sendOk) {
                $response['success'] = true;
                if (!isset($response['stage'])) {
                    $response['stage'] = 'smtp_send_ok';
                }
            }
        } catch (Exception $e) {
            $response['stage'] = 'smtp_error';
            $response['error'] = "Algo deu errado no envio... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
            // Inclui detalhes de erro para depuração no console (não expõe credenciais)
            $response['debug'] = isset($mail) ? $mail->ErrorInfo : $e->getMessage();
        }
    } else {
        // ReCAPTCHA falhou
        $response['stage'] = 'recaptcha_failed';
        $response['error'] = 'Falha na validação do reCAPTCHA. Por favor, tente novamente.';
        $response['debug'] = is_array($recaptchaData) ? $recaptchaData : null;
    }
} else {
    $response['stage'] = 'invalid_method';
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

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
        $recaptchaResponse = curl_exec($ch);
        if ($recaptchaResponse === false) {
            $response['error'] = 'Falha na comunicação com reCAPTCHA.';
            $response['debug'] = 'cURL error: ' . curl_error($ch);
            $response['stage'] = 'recaptcha_http_error';
            curl_close($ch);
            header('Content-Type: application/json');
            echo json_encode($response);
            exit;
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
            $mail->Password = 'rqwltoisnvpcacgl'; // Certifique-se de proteger essa senha
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;            
            $mail->CharSet = 'UTF-8';        
            $mail->Encoding = 'base64';
            // Evita logs sensíveis no output; usar error_log se necessário
            $mail->SMTPDebug = 0;

            $mail->setFrom('contatomastrodascia@outlook.com', 'Contato Mastro DAscia');
                <p><strong>Modelo:</strong> $modelo</p>
                <p><strong>Mensagem:</strong> $message</p>
                <p><strong>Prefere retorno:</strong> $retorno</p>
            ";

            $mail->send();
            $response['success'] = true;
            $response['stage'] = 'smtp_send_ok';
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

<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';
// Loader de variáveis de ambiente/arquivo seguro
require __DIR__ . '/config/env.php';

$response = array('success' => false);

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

    // Funções utilitárias
    $validEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!$validEmail) {
        $response['error'] = 'E-mail inválido. Por favor, verifique e tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Verifica o reCAPTCHA com a API do Google (via cURL, com timeout e remoteip)
    $recaptchaSecret = env('RECAPTCHA_SECRET');
    $recaptchaData = ['success' => false, 'score' => 0];
    if ($recaptchaSecret) {
        $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
        $post = [
            'secret' => $recaptchaSecret,
            'response' => $recaptchaToken,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ];
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($post),
        ]);
        $recaptchaResponse = curl_exec($ch);
        curl_close($ch);
        if ($recaptchaResponse !== false) {
            $recaptchaData = json_decode($recaptchaResponse, true) ?: $recaptchaData;
        }
    }

    if (!empty($recaptchaData['success']) && ($recaptchaData['score'] ?? 0) >= 0.5) {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = env('SMTP_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth = true;
            $mail->Username = env('SMTP_USER');
            $mail->Password = env('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = (int) env('SMTP_PORT', 587);
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->Timeout = 15;
            $mail->SMTPKeepAlive = false;
            $mail->XMailer = '';

            $fromEmail = env('SMTP_FROM_EMAIL', env('SMTP_USER'));
            $fromName = env('SMTP_FROM_NAME', 'Contato Mastro DAscia');
            $toEmail = env('SMTP_TO_EMAIL', $fromEmail);
            $toName = env('SMTP_TO_NAME', $fromName);

            if (!$fromEmail || !$mail->Username || !$mail->Password) {
                throw new Exception('Configuração de e-mail ausente.');
            }

            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail, $toName); // Envia para o próprio e-mail
            $mail->addReplyTo($validEmail, $nome . ' ' . $sobrenome);

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
            $mail->AltBody = "Novo pedido de orçamento:\nNome: $nome $sobrenome\nE-mail: $email\nTelefone: $phone\nModelo: $modelo\nMensagem: $message\nPrefere retorno: $retorno";

            $mail->send();
            $response['success'] = true;
            // Log de sucesso (sem segredos)
            (function () use ($nome, $sobrenome, $email, $phone, $modelo) {
                $dir = __DIR__ . '/../logs';
                if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
                $data = [
                    'status' => 'success',
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
                    'nome' => $nome . ' ' . $sobrenome,
                    'email' => $email,
                    'phone' => $phone,
                    'modelo' => $modelo,
                    'time' => date('c'),
                ];
                @file_put_contents($dir . '/send_orcamento.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
            })();
        } catch (Exception $e) {
            $response['error'] = "Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
            // Log do erro sem expor segredos
            (function ($err, $mailErr) {
                $dir = __DIR__ . '/../logs';
                if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
                $data = [
                    'status' => 'error',
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
                    'error' => $err,
                    'mailer' => $mailErr,
                    'time' => date('c'),
                ];
                @file_put_contents($dir . '/send_orcamento.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
            })($e->getMessage(), isset($mail) ? $mail->ErrorInfo : null);
        }
    } else {
        // ReCAPTCHA falhou
        $response['error'] = 'Falha na validação do reCAPTCHA. Por favor, tente novamente.';
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

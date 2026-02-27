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
    $full_name = $_POST['full_name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    $recaptchaToken = $_POST['g-recaptcha-response'] ?? ($_POST['recaptchaToken'] ?? '');

    // Sanitiza e valida e-mail
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    $validEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!$validEmail) {
        $response['error'] = 'E-mail inválido. Por favor, verifique e tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Verifica o reCAPTCHA v3 (cURL com fallback)
    $secretKey = env('RECAPTCHA_SECRET');
    $recaptchaMinScore = (float) env('RECAPTCHA_MIN_SCORE', 0.5);
    $recaptchaData = ['success' => false, 'score' => 0];
    if ($secretKey && $recaptchaToken) {
        $post = [
            'secret' => $secretKey,
            'response' => $recaptchaToken,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ];
        $verifyResponse = false;
        if (function_exists('curl_init')) {
            $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query($post),
            ]);
            $verifyResponse = curl_exec($ch);
            curl_close($ch);
        }
        if ($verifyResponse === false) {
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/x-www-form-urlencoded',
                    'content' => http_build_query($post),
                    'timeout' => 10,
                ],
            ]);
            $verifyResponse = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
        }
        if ($verifyResponse !== false) {
            $recaptchaData = json_decode($verifyResponse, true) ?: $recaptchaData;
        }
    }

    if (empty($recaptchaData['success']) || ($recaptchaData['score'] ?? 0) < $recaptchaMinScore) {
        $response['error'] = 'Falha na validação do reCAPTCHA. Tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        // Loga detalhes de falha
        (function ($recaptchaData) {
            $dir = __DIR__ . '/../logs';
            if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
            $safe = [
                'status' => 'recaptcha_failed',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
                'success' => $recaptchaData['success'] ?? null,
                'score' => $recaptchaData['score'] ?? null,
                'action' => $recaptchaData['action'] ?? null,
                'hostname' => $recaptchaData['hostname'] ?? null,
                'error-codes' => $recaptchaData['error-codes'] ?? null,
                'time' => date('c'),
            ];
            @file_put_contents($dir . '/send_contact_fast.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($safe, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
        })($recaptchaData);
        exit;
    }

    // Configuração do PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = env('SMTP_HOST', 'smtp.gmail.com');
        $mail->SMTPAuth = true;
        $mail->Username = env('SMTP_USER');
        $mail->Password = env('SMTP_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = (int) env('SMTP_PORT', 587);

        $mail->CharSet = 'UTF-8'; // Define a codificação para UTF-8
        $mail->Encoding = 'base64'; // Garante que o conteúdo seja codificado corretamente
        $mail->Timeout = 15;
        $mail->SMTPKeepAlive = false;
        $mail->XMailer = '';

        $fromEmail = env('SMTP_FROM_EMAIL', env('SMTP_USER'));
        $fromName = env('SMTP_FROM_NAME', "Contato Mastro D'Ascia");
        $toEmail = env('SMTP_TO_EMAIL', $fromEmail);
        $toName = env('SMTP_TO_NAME', $fromName);

        if (!$fromEmail || !$mail->Username || !$mail->Password) {
            throw new Exception('Configuração de e-mail ausente.');
        }

        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($toEmail, $toName); // Envia para o próprio e-mail
        if ($validEmail) {
            $mail->addReplyTo($email, $full_name ?: $email);
        }

        $mail->isHTML(true);
        $mail->Subject = 'Mensagem do site: ' . $subject;
        $mail->Body = "
            <h2>Nova mensagem recebida pelo site!</h2>
            <p><strong>Enviado de:</strong> Formulário de Contato na página principal</p>
            <p><strong>Nome Completo:</strong> " . htmlspecialchars($full_name, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Telefone:</strong> " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>E-mail:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Assunto:</strong> " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Mensagem:</strong> " . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
        ";
        $mail->AltBody = 'Nova mensagem recebida pelo site!\n' .
            'Nome: ' . $full_name . "\n" .
            'Telefone: ' . $phone . "\n" .
            'E-mail: ' . $email . "\n" .
            'Assunto: ' . $subject . "\n" .
            'Mensagem: ' . $message;

        $mail->send();
        $response['success'] = true;
        // Log de sucesso (sem segredos)
        (function () use ($full_name, $email, $phone, $subject) {
            $dir = __DIR__ . '/../logs';
            if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
            $data = [
                'status' => 'success',
                'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
                'name' => $full_name,
                'email' => $email,
                'phone' => $phone,
                'subject' => $subject,
                'time' => date('c'),
            ];
            @file_put_contents($dir . '/send_contact_fast.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
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
            @file_put_contents($dir . '/send_contact_fast.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
        })($e->getMessage(), isset($mail) ? $mail->ErrorInfo : null);
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

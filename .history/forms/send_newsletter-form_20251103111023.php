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
    $email = $_POST['fast_email'] ?? '';
    $name = $_POST['fast_name'] ?? ''; 
    $tele = $_POST['fast_tel'] ?? '';
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

    // Verificar o reCAPTCHA v3 (cURL com fallback)
    $secretKey = env('RECAPTCHA_SECRET');
    $recaptchaMinScore = (float) env('RECAPTCHA_MIN_SCORE', 0.5);
    $recaptchaData = ['success' => false, 'score' => 0];
    if ($secretKey && $recaptchaToken) {
        $post = [
            'secret' => $secretKey,
            'response' => $recaptchaToken,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ];
        $recaptchaResponse = false;
        if (function_exists('curl_init')) {
            $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query($post),
            ]);
            $recaptchaResponse = curl_exec($ch);
            curl_close($ch);
        }
        if ($recaptchaResponse === false) {
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/x-www-form-urlencoded',
                    'content' => http_build_query($post),
                    'timeout' => 10,
                ],
            ]);
            $recaptchaResponse = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
        }
        if ($recaptchaResponse !== false) {
            $recaptchaData = json_decode($recaptchaResponse, true) ?: $recaptchaData;
        }
    }

    // Verificar o score retornado pelo reCAPTCHA v3
    if (!empty($recaptchaData['success']) && ($recaptchaData['score'] ?? 0) >= $recaptchaMinScore) {
        // Se o reCAPTCHA for validado com sucesso e o score for suficientemente alto, processa o envio do e-mail
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
            $fromName = env('SMTP_FROM_NAME', "Contato Mastro D'Ascia");
            $toEmail = env('SMTP_TO_EMAIL', $fromEmail);
            $toName = env('SMTP_TO_NAME', $fromName);

            if (!$fromEmail || !$mail->Username || !$mail->Password) {
                throw new Exception('Configuração de e-mail ausente.');
            }

            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail, $toName); // Envia para o próprio e-mail
            if ($validEmail) {
                $mail->addReplyTo($email, $name ?: $email);
            }

            $mail->isHTML(true);
            $mail->Subject = 'Novo Inscrito no Site da Mastro';
            $mail->Body = "
            <h2>Um visitante deixou seu e-mail / telefone para enviarmos material:</h2>
            <p><strong>Enviado de:</strong> Input de assinatura da newsletter</p>       
            <p><strong>Nome:</strong> $name</p> <!-- Inclua o nome no corpo do e-mail -->
            <p><strong>E-mail:</strong> $email</p>
            <p><strong>Telefone:</strong> $tele</p>
            
            <p>Ele gostaria de receber novidades e promo&ccedil;&otilde;es!</p>";

            $mail->AltBody = "Novo inscrito na newsletter:\nNome: $name\nE-mail: $email\nTelefone: $tele";

            $mail->send();
            $response['success'] = true;
            // Log de sucesso (sem segredos)
            (function () use ($name, $email, $tele) {
                $dir = __DIR__ . '/../logs';
                if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
                $data = [
                    'status' => 'success',
                    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
                    'name' => $name,
                    'email' => $email,
                    'tel' => $tele,
                    'time' => date('c'),
                ];
                @file_put_contents($dir . '/send_newsletter.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
            })();
        } catch (Exception $e) {
            $response['error'] = "Erro ao enviar. Tente novamente mais tarde.";
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
                @file_put_contents($dir . '/send_newsletter.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
            })($e->getMessage(), isset($mail) ? $mail->ErrorInfo : null);
        }
    } else {
        // Se o reCAPTCHA falhar ou o score for baixo
        $response['error'] = 'Falha na verificação do reCAPTCHA. Tente novamente.';
        // Loga detalhes do recaptcha para diagnóstico
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
            @file_put_contents($dir . '/send_newsletter.log', '[' . date('Y-m-d H:i:s') . '] ' . json_encode($safe, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
        })($recaptchaData);
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../phpmailer/src/Exception.php';
require __DIR__ . '/../phpmailer/src/PHPMailer.php';
require __DIR__ . '/../phpmailer/src/SMTP.php';
require __DIR__ . '/config/env.php';

$response = ['success' => false];
$logFile = __DIR__ . '/../logs/send_customization.log';

function write_log($file, $data) {
    $line = '[' . date('Y-m-d H:i:s') . '] ' . (is_string($data) ? $data : json_encode($data)) . PHP_EOL;
    @file_put_contents($file, $line, FILE_APPEND);
}

function verify_recaptcha($secret, $token, $remoteIp) {
    if (!$secret || !$token) {
        return ['transport' => null, 'result' => ['success' => false, 'error' => 'missing_secret_or_token']];
    }
    $url = 'https://www.google.com/recaptcha/api/siteverify';

    // cURL primeiro
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $remoteIp]),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $resp = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($resp !== false && $http === 200) {
            return ['transport' => 'curl', 'result' => json_decode($resp, true) ?: ['success' => false, 'error' => 'invalid_json']];
        }
        // falha no cURL, continua para fallback
    }

    // Fallback com stream
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-type: application/x-www-form-urlencoded',
            'content' => http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $remoteIp]),
            'timeout' => 8,
        ]
    ]);
    $resp = @file_get_contents($url, false, $ctx);
    if ($resp === false) {
        return ['transport' => 'stream', 'result' => ['success' => false, 'error' => 'no_response']];
    }
    return ['transport' => 'stream', 'result' => json_decode($resp, true) ?: ['success' => false, 'error' => 'invalid_json']];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
    $token = $_POST['custom-recaptcha-response']
        ?? $_POST['g-recaptcha-response']
        ?? $_POST['recaptchaToken']
        ?? '';

    $secret = env('RECAPTCHA_SECRET', '');
    $minScore = floatval(env('RECAPTCHA_MIN_SCORE', '0.5'));


    if (!$secret || !$token) {
        write_log($logFile, ['event' => 'recaptcha_missing', 'ip' => $remoteIp, 'has_secret' => (bool)$secret, 'has_token' => (bool)$token]);
        $response['error'] = 'Falha na verificação do reCAPTCHA. Tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    $verification = verify_recaptcha($secret, $token, $remoteIp);
    $recaptcha = $verification['result'];

    if (empty($recaptcha['success']) || (isset($recaptcha['score']) && $recaptcha['score'] < $minScore)) {
        write_log($logFile, [
            'event' => 'recaptcha_failed',
            'ip' => $remoteIp,
            'transport' => $verification['transport'],
            'score' => $recaptcha['score'] ?? null,
            'action' => $recaptcha['action'] ?? null,
            'hostname' => $recaptcha['hostname'] ?? null,
            'error_codes' => $recaptcha['error-codes'] ?? null,
        ]);
        $response['error'] = 'Falha na verificação do reCAPTCHA. Tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }


    $clientName = isset($_POST['clientName']) ? htmlspecialchars($_POST['clientName']) : 'Não informado';
    $clientContact = isset($_POST['clientContact']) ? htmlspecialchars($_POST['clientContact']) : 'Sem dados de contato';
    $boatName = isset($_POST['boatName']) ? htmlspecialchars($_POST['boatName']) : 'Não informado';
    $comercialRep = isset($_POST['comercialRep']) ? htmlspecialchars($_POST['comercialRep']) : 'Não informado';
    $email = isset($_POST['emailCustom']) ? filter_var($_POST['emailCustom'], FILTER_SANITIZE_EMAIL) : '';
    $additionalNotes = isset($_POST['additionalNotes']) ? htmlspecialchars($_POST['additionalNotes']) : 'Nenhuma observação adicional.';
    $paymentMethod = isset($_POST['paymentMethod']) ? htmlspecialchars($_POST['paymentMethod']) : 'Não informado';
    $boatType = isset($_POST['boatType']) ? htmlspecialchars($_POST['boatType']) : 'Não informado';
    $hiddenMotorName = isset($_POST['hiddenMotorName']) ? htmlspecialchars($_POST['hiddenMotorName']) : '';
    $budgetDate = isset($_POST['budgetDate']) ? $_POST['budgetDate'] : null;

    if ($budgetDate) {
        $budgetDate = date('d/m/Y', strtotime($budgetDate));
    } else {
        $budgetDate = 'Não informado';
    }

    $options = isset($_POST['options']) ? json_decode($_POST['options'], true) : [];
    $assemblyTotal = isset($_POST['assemblyTotal']) ? htmlspecialchars($_POST['assemblyTotal']) : '0,00';
    $motorizationTotal = isset($_POST['motorizationTotal']) ? htmlspecialchars($_POST['motorizationTotal']) : '0,00';
    $optionsTotal = isset($_POST['optionsTotal']) ? htmlspecialchars($_POST['optionsTotal']) : '0,00';
    $totalPrice = isset($_POST['totalPrice']) ? htmlspecialchars($_POST['totalPrice']) : '0,00';

    if (empty($email)) {
        $response['error'] = 'Por favor, informe um e-mail válido.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    $message = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <h2 style='color: #0056b3;'>Resumo de customização de modelo feita pela área do representante:</h2>
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color: #f9f9f9;'>
            <h3 style='color: #0056b3; margin-bottom: 5px;'>Dados do Cliente</h3>
            <p><strong>Nome do Cliente:</strong> $clientName </p>
            <p><strong>Contato do Cliente:</strong> $clientContact</p>
            <p><strong>Nome do Representante Comercial:</strong> $comercialRep</p>
            <p><strong>Nome do Barco ou Projeto:</strong> $boatName</p>
            <p><strong>Data do orçamento:</strong> $budgetDate</p>
        </div>
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color: #f2f7fc;'>
            <h3 style='color: #0056b3; margin-bottom: 10px;'>Customização do Produto</h3>
            <p><strong>Modelo de Barco:</strong> $boatType</p>
            <p><strong>Modelo do Motor:</strong> $hiddenMotorName</p>";

    if (!empty($options)) {
        $message .= "
            <p><strong>Opcionais Escolhidos:</strong></p>
            <ul style='margin: 0; padding: 0 20px;'>";
        foreach ($options as $option) {
            $name = htmlspecialchars($option['name'] ?? '');
            $price = htmlspecialchars($option['price'] ?? '');
            $message .= "<li>$name - R$ $price</li>";
        }
        $message .= "</ul>";
    } else {
        $message .= "<p><strong>Opcionais Escolhidos:</strong> Nenhum opcional selecionado</p>";
    }

    $message .= "
            <p><strong>Detalhes e Observações Adicionais:</strong> $additionalNotes</p>
        </div>
        <div style='padding: 5px 20px; background-color: #fff3e6;'>
            <h3 style='color: #d35400; margin-bottom: 10px;'>Valores</h3>
            <p><strong>Total da Montagem e Barco:</strong> R$ $assemblyTotal</p>
            <p><strong>Total da Motorização:</strong> R$ $motorizationTotal</p>
            <p><strong>Total dos Opcionais:</strong> R$ $optionsTotal</p>
            <p style='font-size: 1.2em; font-weight: bold; color: #d35400; margin-top: 15px;'>
                Valor Total: R$ $totalPrice
            </p>
        </div>
    </div>";

    $message .= "
    <div style='padding: 5px 20px;'>
        <p style='font-size: 1.1em;'>
            <strong style='color: #0056b3;'>Verifique os valores:</strong> Antes de encaminhar uma proposta revise os valores.
        </p>
        <p style='font-size: 1.1em;'>Lembre-se que este e-mail é de uso interno e não deve ser compartilhado sem autorização.</p>
    </div>";

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = env('SMTP_HOST', 'smtp.gmail.com');
        $mail->SMTPAuth = true;
        $mail->Username = env('SMTP_USER', '');
        $mail->Password = env('SMTP_PASS', '');
        $secure = strtolower(env('SMTP_SECURE', 'tls'));
        $mail->SMTPSecure = ($secure === 'ssl') ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = intval(env('SMTP_PORT', '587'));
        $mail->Timeout = 15;
        $mail->SMTPKeepAlive = false;

        $fromEmail = env('SMTP_FROM', $mail->Username);
        $fromName = env('SMTP_FROM_NAME', 'Contato Mastro DAscia');
        $mail->setFrom($fromEmail ?: 'no-reply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), $fromName);
        $mail->addAddress($email);

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isHTML(true);
        $mail->Subject = 'Pedido de Personalizar Barco Recebido';
        $mail->Body = $message;

        $mail->send();
        $response['success'] = true;
        write_log($logFile, ['event' => 'mail_sent', 'to' => $email, 'ip' => $remoteIp]);
    } catch (Exception $e) {
        $response['error'] = 'Erro ao enviar o e-mail.';
        write_log($logFile, ['event' => 'mail_error', 'to' => $email, 'ip' => $remoteIp, 'error' => $mail->ErrorInfo]);
    }
} else {
    $response['error'] = 'Método de requisição inválido.';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

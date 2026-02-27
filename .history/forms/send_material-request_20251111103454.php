<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../phpmailer/src/Exception.php';
require __DIR__ . '/../phpmailer/src/PHPMailer.php';
require __DIR__ . '/../phpmailer/src/SMTP.php';
require __DIR__ . '/config/env.php';

$response = ['success' => false];
$logFile = __DIR__ . '/../logs/send_material_request.log';

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

    // Dados do pedido de materiais
    $barcoId = isset($_POST['barco_id']) ? intval($_POST['barco_id']) : 0;
    $barcoLabel = isset($_POST['barco_label']) ? htmlspecialchars($_POST['barco_label']) : '';
    $usuario = isset($_POST['usuario']) ? htmlspecialchars($_POST['usuario']) : 'Usuário';
    $urgente = isset($_POST['urgente']) ? (($_POST['urgente'] == '1' || $_POST['urgente'] === 1 || $_POST['urgente'] === true) ? true : false) : false;
    $comentario = isset($_POST['comentario']) ? htmlspecialchars($_POST['comentario']) : '';
    $itens = isset($_POST['itens']) ? json_decode($_POST['itens'], true) : [];

    if ($barcoId <= 0 || empty($itens)) {
        $response['error'] = 'Pedido inválido: barco ou itens ausentes.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Monta corpo do e-mail
    $message = "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>";
    $message .= "<h2 style='color: #0056b3; margin:0 0 10px;'>Solicitação de Materiais</h2>";
    $message .= "<div style='padding: 8px 20px; background-color:#f9f9f9; margin-bottom:10px;'>";
    $message .= "<p><strong>Barco:</strong> " . ($barcoLabel ?: 'Não informado') . " (ID: " . htmlspecialchars((string)$barcoId) . ")</p>";
    $message .= "<p><strong>Solicitante:</strong> " . $usuario . "</p>";
    $message .= "<p><strong>Urgente:</strong> " . ($urgente ? 'Sim' : 'Não') . "</p>";
    $message .= "</div>";

    if ($comentario) {
        $message .= "<div style='padding: 8px 20px; background-color:#f2f7fc; margin-bottom:10px;'>";
        $message .= "<p><strong>Observações:</strong> " . $comentario . "</p>";
        $message .= "</div>";
    }

    $message .= "<div style='padding: 8px 20px;'>";
    $message .= "<h3 style='color:#0056b3; margin:0 0 8px;'>Itens Solicitados</h3>";
    $message .= "<table style='width:100%; border-collapse:collapse;'>";
    $message .= "<thead><tr style='background:#eee; text-align:left;'>".
                "<th style='padding:6px; border:1px solid #ddd;'>Código</th>".
                "<th style='padding:6px; border:1px solid #ddd;'>Item</th>".
                "<th style='padding:6px; border:1px solid #ddd;'>Quantidade</th>".
                "<th style='padding:6px; border:1px solid #ddd;'>Unidade</th>".
                "</tr></thead><tbody>";
    foreach ($itens as $it) {
        $codigo = htmlspecialchars($it['codigo_produto'] ?? '');
        $nome = htmlspecialchars($it['nome'] ?? '');
        $quantidade = htmlspecialchars((string)($it['quantidade'] ?? ''));
        $unidade = htmlspecialchars($it['unidade_medida'] ?? '');
        $message .= "<tr>".
                    "<td style='padding:6px; border:1px solid #ddd;'>$codigo</td>".
                    "<td style='padding:6px; border:1px solid #ddd;'>$nome</td>".
                    "<td style='padding:6px; border:1px solid #ddd;'>$quantidade</td>".
                    "<td style='padding:6px; border:1px solid #ddd;'>$unidade</td>".
                    "</tr>";
    }
    $message .= "</tbody></table></div>";

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

        $fromEmail = env('SMTP_FROM_EMAIL', env('SMTP_USER', ''));
        $fromName = env('SMTP_FROM_NAME', 'Solicitações Mastro DAscia');
        $mail->setFrom($fromEmail ?: ('no-reply@' . ($_SERVER['SERVER_NAME'] ?? 'localhost')), $fromName);
        $toEmail = env('SMTP_TO_EMAIL', 'marcelo@mastrodascia.com.br');
        $toName = env('SMTP_TO_NAME', 'Marcelo');
        $mail->addAddress($toEmail, $toName);

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isHTML(true);
        $mail->Subject = 'Solicitação de Materiais' . ($barcoLabel ? (' - ' . $barcoLabel) : '') . ($urgente ? ' [URGENTE]' : '');
        $mail->Body = $message;

        $mail->send();
        $response['success'] = true;
        write_log($logFile, ['event' => 'mail_sent', 'to' => $toEmail, 'ip' => $remoteIp, 'barco_id' => $barcoId, 'count_items' => count($itens), 'urgent' => $urgente]);
    } catch (Exception $e) {
        $response['error'] = 'Erro ao enviar o e-mail.';
        write_log($logFile, ['event' => 'mail_error', 'to' => $toEmail ?? null, 'ip' => $remoteIp, 'error' => $mail->ErrorInfo]);
    }
} else {
    $response['error'] = 'Método de requisição inválido.';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

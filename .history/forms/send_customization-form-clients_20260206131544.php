<?php // CUSTOMIZAÇÃO DOS CLIENTES
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../phpmailer/src/Exception.php';
require __DIR__ . '/../phpmailer/src/PHPMailer.php';
require __DIR__ . '/../phpmailer/src/SMTP.php';
require __DIR__ . '/config/env.php';

// Importa conexão com banco de dados para cálculo de preços
require_once __DIR__ . '/../progenese/api/conexao.php';

$response = ['success' => false];
$logFile = __DIR__ . '/../logs/send_customization_clients.log';

function write_log($file, $data) {
    $line = '[' . date('Y-m-d H:i:s') . '] ' . (is_string($data) ? $data : json_encode($data)) . PHP_EOL;
    @file_put_contents($file, $line, FILE_APPEND);
}

function verify_recaptcha($secret, $token, $remoteIp) {
    if (!$secret || !$token) {
        return ['transport' => null, 'result' => ['success' => false, 'error' => 'missing_secret_or_token']];
    }
    $url = 'https://www.google.com/recaptcha/api/siteverify';

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
        curl_close($ch);
        if ($resp !== false && $http === 200) {
            return ['transport' => 'curl', 'result' => json_decode($resp, true) ?: ['success' => false, 'error' => 'invalid_json']];
        }
    }

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

/*
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
*/

    // Coleta dados do cliente
    $clientName = isset($_POST['clientName']) ? htmlspecialchars($_POST['clientName']) : 'Não informado';
    $clientEmail = isset($_POST['clientEmail']) ? filter_var($_POST['clientEmail'], FILTER_SANITIZE_EMAIL) : '';
    $boatName = isset($_POST['boatName']) ? htmlspecialchars($_POST['boatName']) : 'Não informado';
    $comercialRep = isset($_POST['comercialRep']) ? htmlspecialchars($_POST['comercialRep']) : 'Não informado';
    $clientPhone = isset($_POST['clientPhone']) ? htmlspecialchars($_POST['clientPhone']) : '';
    $additionalNotes = isset($_POST['additionalNotes']) ? htmlspecialchars($_POST['additionalNotes']) : 'Nenhuma observação adicional.';
    $paymentMethod = isset($_POST['paymentMethod']) ? htmlspecialchars($_POST['paymentMethod']) : 'Não informado';
    
    // Coleta dados da customização
    $boatType = isset($_POST['boatType']) ? $_POST['boatType'] : '';
    $motorId = isset($_POST['motorId']) ? intval($_POST['motorId']) : 0;
    $optionIds = isset($_POST['optionIds']) ? json_decode($_POST['optionIds'], true) : [];

    if (empty($clientEmail)) {
        $response['error'] = 'Por favor, informe um e-mail válido.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // --- CÁLCULO DE PREÇOS NO SERVIDOR ---
    $assemblyVal = 0;
    $motorVal = 0;
    $optionsVal = 0;
    $totalVal = 0;

    $motorName = "Sem motor selecionado";
    $selectedOptions = []; // Array de nomes e preços para o email

    try {
        $pdo = getConnection();

        // 1. Buscar preço base do barco
        if ($boatType) {
            // Busca por modelo. Atenção: $boatType vem do dataset-type, ex: "7CC", "TitanCC"
            // O campo no banco é 'modelo'
            $stmt = $pdo->prepare("SELECT barco_montagem_valor, modelo FROM site_barco WHERE modelo = :modelo");
            $stmt->execute([':modelo' => $boatType]);
            $boatData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($boatData) {
                $assemblyVal = floatval($boatData['barco_montagem_valor']);
            }
        }

        // 2. Buscar preço do motor
        if ($motorId > 0) {
            $stmt = $pdo->prepare("SELECT motor, valor FROM site_motor WHERE id = :id");
            $stmt->execute([':id' => $motorId]);
            $motorData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($motorData) {
                $motorVal = floatval($motorData['valor']);
                $motorName = $motorData['motor'];
            }
        } elseif ($motorId === 0) {
            $motorName = "Sem motor";
        }

        // 3. Buscar preços dos opcionais
        if (!empty($optionIds) && is_array($optionIds)) {
            // Sanitização simples para IN clause
            $ids = array_map('intval', $optionIds);
            $ids = array_filter($ids, fn($id) => $id > 0);
            
            if (!empty($ids)) {
                $inQuery = implode(',', $ids);
                // Não usamos prepared statement para o IN dessa forma, mas como são intvals, é seguro.
                $stmt = $pdo->query("SELECT opcional, valor FROM site_opcionais WHERE id IN ($inQuery)");
                $optsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($optsData as $opt) {
                    $val = floatval($opt['valor']);
                    $optionsVal += $val;
                    $selectedOptions[] = [
                        'name' => $opt['opcional'],
                        'price' => number_format($val, 2, ',', '.')
                    ];
                }
            }
        }

        $totalVal = $assemblyVal + $motorVal + $optionsVal;

    } catch (Exception $dbEx) {
        write_log($logFile, ['event' => 'db_error', 'error' => $dbEx->getMessage()]);
        // Em caso de erro de banco, continuamos com valores zerados ou retornamos erro?
        // Melhor continuar para garantir que o lead chegue, mesmo sem preços, ou alertar?
        // Vamos continuar e avisar no log.
    }

    // Formatação
    $assemblyTotal = number_format($assemblyVal, 2, ',', '.');
    $motorizationTotal = number_format($motorVal, 2, ',', '.');
    $optionsTotal = number_format($optionsVal, 2, ',', '.');
    $totalPrice = number_format($totalVal, 2, ',', '.');

    // --- FIM CÁLCULO ---

    $message = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <h2 style='color: #0056b3;'>Resumo de customização de modelo feita por um <span style='color:rgb(51, 180, 255);'>cliente no site</span>:</h2>
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color:rgb(242, 255, 254);'>
            <h3 style='color:rgb(179, 0, 84); margin-bottom: 5px;'>Dados do Cliente</h3>
            <p><strong>Nome do Cliente:</strong> $clientName </p>
            <p><strong>Email do Cliente:</strong> $clientEmail</p>
            <p><strong>Telefone do Cliente:</strong> $clientPhone</p>
            <p><strong>Nome do Representante Comercial:</strong> $comercialRep</p>
            <p><strong>Nome do Barco ou Projeto:</strong> $boatName</p>
        </div>
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color:rgb(252, 250, 242);'>
            <h3 style='color:rgb(243, 153, 153); margin-bottom: 10px;'>Customização do Produto</h3>
            <p><strong>Modelo de Barco:</strong> $boatType</p>
            <p><strong>Modelo do Motor:</strong> $motorName</p>";

    if (!empty($selectedOptions)) {
        $message .= "
            <p><strong>Opcionais Escolhidos:</strong></p>
            <ul style='margin: 0; padding: 0 20px;'>";
        foreach ($selectedOptions as $option) {
            $name = htmlspecialchars($option['name'] ?? '');
            $price = $option['price'] ?? '0,00';
            $message .= "<li>$name - R$ $price</li>";
        }
        $message .= "</ul>";
    } else {
        $message .= "<p><strong>Opcionais Escolhidos:</strong> Nenhum opcional selecionado</p>";
    }

    $message .= "
            <p><strong>Detalhes e Observações Adicionais:</strong> $additionalNotes</p>
        </div>
        <div style='padding: 5px 20px; background-color:rgb(231, 255, 230);'>
            <h3 style='color: #d35400; margin-bottom: 10px;'>Valores (Cálculo Automático do Sistema)</h3>
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
            <strong style='color: #0056b3;'>Revise os preços antes de avançar a negociação:</strong> Esse cálculo dos valores é exclusivo deste e-mail, baseado nos valores atuais do banco de dados.
        </p>
        <p style='font-size: 1.1em;'>
            O cliente não visualizou os preços ao selecionar os opcionais.
        </p>
    </div>
    ";

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
        $mail->addAddress(env('SMTP_TO', $mail->Username) ?: $mail->Username, 'Contato Mastro DAscia');

        if (!empty($clientEmail) && filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($clientEmail, $clientName);
        }

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isHTML(true);
        $mail->Subject = 'Pedido de Personalizar Barco Recebido';
        $mail->Body = $message;

        $mail->send();
        $response['success'] = true;
        write_log($logFile, ['event' => 'mail_sent', 'to' => 'internal', 'ip' => $remoteIp]);
    } catch (Exception $e) {
        $response['error'] = 'Erro ao enviar o e-mail.';
        write_log($logFile, ['event' => 'mail_error', 'ip' => $remoteIp, 'error' => $mail->ErrorInfo]);
    }
} else {
    $response['error'] = 'Método de requisição inválido.';
}

header('Content-Type: application/json');
echo json_encode($response);
?>
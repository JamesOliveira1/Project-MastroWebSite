<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Captura o token do reCAPTCHA
    $recaptchaToken = isset($_POST['custom-recaptcha-response']) ? $_POST['custom-recaptcha-response'] : '';

    // === 🔹 CONFIGURAÇÃO DO reCAPTCHA ===  
    $recaptchaSecretKey = '6LfEIoYqAAAAAAL1cz_o2W1sKjy_CR8wKyDQtbFb'; // 🔴 Substitua pela sua chave secreta do reCAPTCHA v3
    $recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";

    // Faz a requisição para validar o reCAPTCHA
    $recaptchaResponse = file_get_contents($recaptchaURL . "?secret=" . $recaptchaSecretKey . "&response=" . $recaptchaToken);
    $recaptchaData = json_decode($recaptchaResponse, true);

    // Verifica se o reCAPTCHA foi validado com sucesso e tem uma pontuação alta (ex: > 0.5)
    if (!$recaptchaData['success'] || $recaptchaData['score'] < 0.5) {
        $response['error'] = 'Falha na verificação do reCAPTCHA. Tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // === 🔹 CAPTURA DOS DADOS DO FORMULÁRIO ===  
    $clientName = isset($_POST['clientName']) ? htmlspecialchars($_POST['clientName']) : 'Não informado';
    $clientContact = isset($_POST['clientContact']) ? htmlspecialchars($_POST['clientContact']) : 'Sem dados de contato';
    $boatName = isset($_POST['boatName']) ? htmlspecialchars($_POST['boatName']) : 'Não informado';
    $comercialRep = isset($_POST['comercialRep']) ? htmlspecialchars($_POST['comercialRep']) : 'Não informado';
    $email = isset($_POST['emailCustom']) ? filter_var($_POST['emailCustom'], FILTER_SANITIZE_EMAIL) : '';
    $additionalNotes = isset($_POST['additionalNotes']) ? htmlspecialchars($_POST['additionalNotes']) : 'Nenhuma observação adicional.';
    $paymentMethod = isset($_POST['paymentMethod']) ? htmlspecialchars($_POST['paymentMethod']) : 'Não informado';
    $boatType = isset($_POST['boatType']) ? htmlspecialchars($_POST['boatType']) : 'Não informado';
    $hiddenMotorName = isset($_POST['hiddenMotorName']) ? $_POST['hiddenMotorName'] : '';
    $budgetDate = isset($_POST['budgetDate']) ? $_POST['budgetDate'] : null;

if ($budgetDate) {
    $budgetDate = date("d/m/Y", strtotime($budgetDate));
} else {
    $budgetDate = 'Não informado';
}

    $options = isset($_POST['options']) ? json_decode($_POST['options'], true) : array();
    $assemblyTotal = isset($_POST['assemblyTotal']) ? htmlspecialchars($_POST['assemblyTotal']) : '0,00';
    $motorizationTotal = isset($_POST['motorizationTotal']) ? htmlspecialchars($_POST['motorizationTotal']) : '0,00';
    $optionsTotal = isset($_POST['optionsTotal']) ? htmlspecialchars($_POST['optionsTotal']) : '0,00';
    $totalPrice = isset($_POST['totalPrice']) ? htmlspecialchars($_POST['totalPrice']) : '0,00';

    // Validação básica
    if (empty($email)) {
        $response['error'] = 'Por favor, informe um e-mail válido.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // === 🔹 MENSAGEM DO E-MAIL ===  
    $message = "
    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <h2 style='color: #0056b3;'>Resumo de customização de modelo feita pela área do representante:</h2>
        
        <!-- Dados do Cliente -->
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color: #f9f9f9;'>
            <h3 style='color: #0056b3; margin-bottom: 5px;'>Dados do Cliente</h3>
            <p><strong>Nome do Cliente:</strong> $clientName </p>            
            <p><strong>Contato do Cliente:</strong> $clientContact</p>
            <p><strong>Nome do Representante Comercial:</strong> $comercialRep</p>
            <p><strong>Nome do Barco ou Projeto:</strong> $boatName</p>
            <p><strong>Data do orçamento:</strong> $budgetDate</p>
        </div>
        
        <!-- Customização do Produto -->
        <div style='padding: 5px 20px; margin-bottom: 10px; background-color: #f2f7fc;'>
            <h3 style='color: #0056b3; margin-bottom: 10px;'>Customização do Produto</h3>
            <p><strong>Modelo de Barco:</strong> $boatType</p>
            <p><strong>Modelo do Motor:</strong> $hiddenMotorName</p>";
            
if (!empty($options)) {
    $message .= "
            <p><strong>Opcionais Escolhidos:</strong></p>
            <ul style='margin: 0; padding: 0 20px;'>";
    foreach ($options as $option) {
        $message .= "<li>" . $option['name'] . " - R$ " . $option['price'] . "</li>";
    }
    $message .= "</ul>";
} else {
    $message .= "<p><strong>Opcionais Escolhidos:</strong> Nenhum opcional selecionado</p>";
}

$message .= "
            <p><strong>Detalhes e Observações Adicionais:</strong> $additionalNotes</p>
        </div>
        
        <!-- Valores -->
        <div style='padding: 5px 20px; background-color: #fff3e6;'>
            <h3 style='color: #d35400; margin-bottom: 10px;'>Valores</h3>
            <p><strong>Forma de Pagamento:</strong> $paymentMethod</p>
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
        <p style='font-size: 1.1em; '>
            <strong style='color: #0056b3;'>Verifique os valores:</strong> Antes de encaminhar uma proposta revise os valores. </p>
           <p style='font-size: 1.1em;'> Lembre-se que este e-mail é de uso interno e não deve ser compartilhado sem autorização.</p>
    </div>";
    
    $mail = new PHPMailer(true);

    try {
        // Configuração do servidor SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'contatomastrodascia@gmail.com';
        $mail->Password = 'wxux ddgm hwvn kica'; // ⚠️ Troque pela senha correta do SMTP (ou use App Passwords)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Configuração do e-mail
        $mail->setFrom('contatomastrodascia@gmail.com', 'Contato Mastro DAscia');
        $mail->addAddress($email); // Envia para o email do fornecedor colocado no formulário
        
        $mail->CharSet = 'UTF-8';        
        $mail->Encoding = 'base64';
        $mail->isHTML(true);
        $mail->Subject = 'Pedido de Personalizar Barco Recebido';
        $mail->Body = $message;


        // Envia o e-mail
        $mail->send();
        $response['success'] = true;

    } catch (Exception $e) {
        $response['error'] = "Erro ao enviar o e-mail: " . $mail->ErrorInfo;
    }
} else {
    $response['error'] = 'Método de requisição inválido.';
}

// Retorna a resposta em formato JSON
header('Content-Type: application/json');
echo json_encode($response);
?>

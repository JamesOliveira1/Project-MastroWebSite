<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['fast_email'] ?? '';
    $name = $_POST['fast_name'] ?? ''; 
    $tele = $_POST['fast_tel'] ?? '';
    $recaptchaResponse = $_POST['g-recaptcha-response'];

    // Verificar o reCAPTCHA 
    $secretKey = '6LfEIoYqAAAAAAL1cz_o2W1sKjy_CR8wKyDQtbFb'; // chave secreta
    $verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
    
    // Enviar a solicitação de verificação
    $recaptchaVerification = file_get_contents($verifyURL . '?secret=' . $secretKey . '&response=' . $recaptchaResponse);
    $recaptchaResponseKeys = json_decode($recaptchaVerification, true);

    // Verificar o score retornado pelo reCAPTCHA v3
    if ($recaptchaResponseKeys["success"] && $recaptchaResponseKeys["score"] >= 0.5) {
        // Se o reCAPTCHA for validado com sucesso e o score for suficientemente alto, processa o envio do e-mail
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'contatomastrodascia@gmail.com';
            $mail->Password = 'wxux ddgm hwvn kica'; // Certifique-se de usar uma senha de aplicativo
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;            
            $mail->CharSet = 'UTF-8';        
            $mail->Encoding = 'base64';

            $mail->setFrom('contatomastrodascia@gmail.com', 'Contato Mastro DAscia');
            $mail->addAddress('contatomastrodascia@gmail.com', 'Contato Mastro DAscia'); // Envia para o próprio e-mail

            $mail->isHTML(true);
            $mail->Subject = 'Novo Inscrito no Site da Mastro';
            $mail->Body = "
            <h2>Um visitante deixou seu e-mail / telefone para enviarmos material:</h2>
            <p><strong>Enviado de:</strong> Input de assinatura da newsletter</p>       
            <p><strong>Nome:</strong> $name</p> <!-- Inclua o nome no corpo do e-mail -->
            <p><strong>E-mail:</strong> $email</p>
            <p><strong>Telefone:</strong> $tele</p>
            
            <p>Ele gostaria de receber novidades e promo&ccedil;&otilde;es!</p>";

            $mail->send();
            $response['success'] = true;
        } catch (Exception $e) {
            $response['error'] = "Erro ao enviar: " . $mail->ErrorInfo;
        }
    } else {
        // Se o reCAPTCHA falhar ou o score for baixo
        $response['error'] = 'Falha na verificação do reCAPTCHA. Tente novamente.';
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

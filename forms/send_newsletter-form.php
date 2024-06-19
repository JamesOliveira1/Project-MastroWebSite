<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.office365.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'contatomastrodascia@outlook.com';
        $mail->Password = 'pswdhfltjqoiimhr';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('contatomastrodascia@outlook.com', 'Contato Mastro DAscia');
        $mail->addAddress('contatomastrodascia@outlook.com', 'Contato Mastro DAscia'); // Envia para o próprio e-mail

        $mail->isHTML(true);
        $mail->Subject = 'Novo Inscrito no Site da Mastro';
        $mail->Body = "
        <h2>Um visitante deixou seu e-mail para enviarmos material:</h2>
        <p><strong>Enviado de:</strong> Input de assinatura da newsletter</p>       
        <p><strong>E-mail:</strong> $email</p>
        <p>Ele gostaria de receber novidades e promo&ccedil;&otilde;es!</p>";

        // Simular um erro (descomente a linha abaixo para simular um erro)
        //throw new Exception("Este é um erro simulado");

        $mail->send();
        $response['success'] = true;
    } catch (Exception $e) {
        $response['error'] = 'Erro ao enviar e-mail.';
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

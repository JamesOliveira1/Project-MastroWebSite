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
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'contatomastrodascia@gmail.com';
        $mail->Password = 'wxux ddgm hwvn kica';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom('contatomastrodascia@gmail.com', 'Contato Mastro DAscia');
        $mail->addAddress('contatomastrodascia@gmail.com', 'Contato Mastro DAscia'); // Envia para o próprio e-mail

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
        $response['error'] = "Erro ao enviar: " . $mail->ErrorInfo;
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

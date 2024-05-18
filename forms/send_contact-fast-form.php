<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

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
        $mail->Subject = 'Mensagem do site: ' . $subject;
        $mail->Body = "
            <h2>Nova mensagem recebida pelo site!</h2>
            <p><strong>Enviado de:</strong> Formul&aacute;rio de Contato na p&aacute;gina principal</p>
            <p><strong>Nome:</strong> $name</p>
            <p><strong>E-mail:</strong> $email</p>
            <p><strong>Assunto:</strong> $subject</p>
            <p><strong>Mensagem:</strong> $message</p>
        ";

        // Simular um erro (descomente a linha abaixo para simular um erro)
        // throw new Exception("Este é um erro simulado");

        $mail->send();
        $response['success'] = true;
    } catch (Exception $e) {
        $response['error'] = "Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

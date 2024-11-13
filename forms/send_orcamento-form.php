<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome = $_POST['nome'];
    $sobrenome = $_POST['sobrenome'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $modelo = $_POST['modelo'];
    $message = $_POST['message'];
    $retorno = $_POST['retorno'];

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
        $mail->Subject = 'Oba! Novo contato pelo site';
        $mail->Body = "
            <h1>Recebemos um Novo Pedido de Or&ccedil;amento!</h1>
            <p><strong>Enviado de:</strong> Formul&aacute;rio de Or&ccedil;amento do site</p>
            <p><strong>Nome:</strong> $nome $sobrenome</p>
            <p><strong>E-mail:</strong> $email</p>
            <p><strong>Telefone:</strong> $phone</p>
            <p><strong>Modelo:</strong> $modelo</p>
            <p><strong>Mensagem:</strong> $message</p>
            <p><strong>Prefere retorno:</strong> $retorno</p>
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

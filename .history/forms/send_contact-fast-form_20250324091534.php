<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

// Chave secreta do reCAPTCHA
$recaptchaSecret = '6LfEIoYqAAAAAAL1cz_o2W1sKjy_CR8wKyDQtbFb';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $full_name = $_POST['full_name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    $recaptchaToken = $_POST['g-recaptcha-response'] ?? '';

    // Verifica o reCAPTCHA v3
    $recaptchaResponse = file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify?secret=' . $recaptchaSecret . '&response=' . $recaptchaToken
    );
    $recaptchaResult = json_decode($recaptchaResponse, true);

    if (!$recaptchaResult['success'] || $recaptchaResult['score'] < 0.5 || $recaptchaResult['action'] !== 'contact_fast') {
        $response['error'] = 'Falha na validação do reCAPTCHA. Tente novamente.';
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }

    // Configuração do PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'contatomastrodascia@gmail.com';
        $mail->Password = 'wxux ddgm hwvn kica';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->CharSet = 'UTF-8'; // Define a codificação para UTF-8
        $mail->Encoding = 'base64'; // Garante que o conteúdo seja codificado corretamente

        $mail->setFrom('contatomastrodascia@gmail.com', 'Contato Mastro DAscia');
        $mail->addAddress('jamesio123@gmail.com', 'Contato Mastro DAscia'); // Envia para o próprio e-mail

        $mail->isHTML(true);
        $mail->Subject = 'Mensagem do site: ' . $subject;
        $mail->Body = "
            <h2>Nova mensagem recebida pelo site!</h2>
            <p><strong>Enviado de:</strong> Formulário de Contato na página principal</p>
            <p><strong>Nome Completo:</strong> " . htmlspecialchars($full_name, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Telefone:</strong> " . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>E-mail:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Assunto:</strong> " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "</p>
            <p><strong>Mensagem:</strong> " . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
        ";

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

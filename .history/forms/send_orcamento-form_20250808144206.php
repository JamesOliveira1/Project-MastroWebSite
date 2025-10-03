<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Sanitiza e valida os dados recebidos do formulário
    $nome = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
    $sobrenome = htmlspecialchars($_POST['sobrenome'] ?? '', ENT_QUOTES, 'UTF-8');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars($_POST['phone'] ?? '', ENT_QUOTES, 'UTF-8');
    $modelo = htmlspecialchars($_POST['modelo'] ?? '', ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
    $retorno = htmlspecialchars($_POST['retorno'] ?? '', ENT_QUOTES, 'UTF-8');
    $recaptchaToken = htmlspecialchars($_POST['recaptchaToken'] ?? '', ENT_QUOTES, 'UTF-8');

    // Verifica o reCAPTCHA com a API do Google
    $recaptchaSecret = '6LfEIoYqAAAAAAL1cz_o2W1sKjy_CR8wKyDQtbFb';
    $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';

    $recaptchaResponse = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecret . '&response=' . $recaptchaToken);
    $recaptchaData = json_decode($recaptchaResponse, true);

    if ($recaptchaData['success'] && $recaptchaData['score'] >= 0.5) {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'contatomastrodascia@gmail.com';
            $mail->Password = 'wxux ddgm hwvn kica'; // Certifique-se de proteger essa senha
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;            
            $mail->CharSet = 'UTF-8';        
            $mail->Encoding = 'base64';

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

            $mail->send();
            $response['success'] = true;
        } catch (Exception $e) {
            $response['error'] = "Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
        }
    } else {
        // ReCAPTCHA falhou
        $response['error'] = 'Falha na validação do reCAPTCHA. Por favor, tente novamente.';
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

header('Content-Type: application/json');
echo json_encode($response);
?>

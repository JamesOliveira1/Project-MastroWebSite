<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Inclui os arquivos do PHPMailer
require '../phpmailer/src/Exception.php';
require '../phpmailer/src/PHPMailer.php';
require '../phpmailer/src/SMTP.php';

$response = array('success' => false);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $boatName = $_POST['boatName'];
    $email = $_POST['email'];
    $subject = 'Pedido de Personalizar Barco Recebido';
    $message = "<h2>Recebemos a seguinte customiza&ccedil;&atilde;o de modelo pelo site:</h2>
    <p><strong>Enviado por:</strong> $email</p>";
    $message .= "<p><strong>Detalhes e Observa&ccedil;&otilde;es Adicionais:</strong> " . $_POST['additionalNotes'] . "</p>";


    // Captura os dados adicionais
    $boatType = isset($_POST['boatType']) ? $_POST['boatType'] : '';
    $options = isset($_POST['options']) ? json_decode($_POST['options']) : array();
    $colors = isset($_POST['colors']) ? json_decode($_POST['colors']) : array();
    $power = isset($_POST['power']) ? $_POST['power'] : '';

    // Formata as cores para exibição legível
    $formattedColors = array_map('formatColor', $colors);
    $formattedColorsString = implode(', ', $formattedColors);

    // Constrói a mensagem com os dados adicionais
    $message .= "<p><strong>\nModelo de Barco:</strong> $boatType\n</p>
    <p><strong>Nome do Barco ou Projeto:</strong> $boatName\n\n</p>";    
    if (!empty($power)) {
        $message .= "<p><strong>Motor Selecionado:</strong> $power\n</p>";
    }
    if (!empty($options)) {
        $message .= "<p><strong>Opcionais Selecionados:</strong> " . implode(', ', $options) . "\n</p>";
    }
    if (!empty($formattedColorsString)) {
        $message .= "<p><strong>Cores Escolhidas para o Casco:</strong>\n</p>";
        foreach ($colors as $color) {
            $message .= "<div style=\"width: 20px; height: 20px; background-color: $color; display: inline-block; margin-right: 5px;\"></div>";
        }
        $message .= "\n";
    }
    $mail = new PHPMailer(true);

    try {

        // Simular um erro (descomente a linha abaixo para simular um erro)
        // throw new Exception("Este é um erro simulado");

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
        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();
        $response['success'] = true;

    } catch (Exception $e) {
        $response['error'] = "Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href=\"https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;\" target=\"_blank\">Whatsapp.</a>";
    }
} else {
    $response['error'] = 'Método de requisição inválido';
}

// Função para formatar a cor
function formatColor($color) {
    $rgb = sscanf($color, 'rgb(%d, %d, %d)');
    return sprintf('#%02x%02x%02x', $rgb[0], $rgb[1], $rgb[2]);
}

header('Content-Type: application/json');
echo json_encode($response);
?>

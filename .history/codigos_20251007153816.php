<?php
// Defina os usuários e senhas
$usuarios = [
    'leo' => '157.470@leo',
    'marcelo' => 'senha123',
    'james' => '12345'
];

// Verifique se o usuário está autenticado
if (!isset($_SERVER['PHP_AUTH_USER']) || 
    !isset($usuarios[$_SERVER['PHP_AUTH_USER']]) || 
    $_SERVER['PHP_AUTH_PW'] !== $usuarios[$_SERVER['PHP_AUTH_USER']]) {
    header('WWW-Authenticate: Basic realm="Área restrita"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Acesso negado...';
    exit;
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!--Codificação de caracteres e estrutura-->
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">

<!-- Meta tag de idioma-->
<meta http-equiv="Content-Language" content="pt-BR">

<!-- Tag para motores de busca -->
<meta name="robots" content="noindex, nofollow">

<!-- Informações do autor -->
<meta name="author" content="Mastro D'Ascia Náutica">

<!-- Icone de favorito para usabilidade -->
<link href="assets/img/favicon.png" rel="icon" type="image/png">
<link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">

<!-------------------------------------------------------------------------------------->
<!-- Titulo da pagina -->
<title>Mastro D'Ascia Náutica - Personalize Seu Catamarã</title>

<!-- Descrição da página -->
<meta name="description" content="Personalize seu catamarã com acessórios exclusivos e mais opções customizáveis. Crie o barco perfeito para pesca e lazer na Mastro D'Ascia Náutica.">

<!-- Metakeywords - Keywords curtas e Long-tail keywords -->
<meta name="keywords" content="customização de barcos, acessórios de barcos, motores para catamarã, personalizar lanchas, barcos customizáveis, catamarãs personalizados, estaleiro de barcos customizáveis, personalização de lanchas de pesca, acessórios náuticos">

<!-- Tags para melhorar compartilhamento em redes sociais -->
<meta property="og:title" content="Mastro D'Ascia Náutica - Personalize Seu Catamarã">
<meta property="og:description" content="Selecione acessórios e crie o catamarã dos seus sonhos com a Mastro D'Ascia Náutica. Personalize sua lancha para pesca e lazer.">
<meta property="og:image" content="https://mastrodascia.com.br/assets/img/produtos/8.5XF/foto%20(21).jpg">
<meta property="og:url" content="https://mastrodascia.com.br/custom">
<meta property="og:type" content="website">

<!-- Identificar o link com a versão principal -->
<link rel="canonical" href="https://mastrodascia.com.br/custom">
<!-------------------------------------------------------------------------------------->

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Raleway:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet">

<!-- Vendor CSS Files -->
<link href="assets/vendor/aos/aos.css" rel="stylesheet">
<link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
<link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet">
<link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet">
<link href="assets/vendor/remixicon/remixicon.css" rel="stylesheet">
<link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

  <!-- Template Main CSS File -->
  <link href="assets/css/style.css" rel="stylesheet">
  <link href="assets/css/carrossel.css" rel="stylesheet">

  <!-- Recaptcha do google -->
  <script src="https://www.google.com/recaptcha/api.js?render=6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL"></script>

</head>
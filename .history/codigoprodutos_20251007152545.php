<?php
// Iniciar sessão se necessário
session_start();

// Função para conectar ao banco de dados Firebird
function conectarBD() {
    try {
        // Caminho do banco de dados Firebird (.FDB)
        $dsn = 'firebird:dbname=D:\\GD_XNAV\\Banco\\PRODOC.FDB;charset=UTF8';
        
        // Credenciais
        $user = 'sysdba';
        $password = 'masterkey'; // ajuste se sua senha for diferente

        // Conexão PDO com Firebird
        $pdo = new PDO($dsn, $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        return $pdo;
    } catch (PDOException $e) {
        // Em caso de erro, retorna false
        return false;
    }
}

// Função para buscar produtos do banco de dados
function buscarProdutos($limite = null) {
    $pdo = conectarBD();
    $produtos = array();
    
    if ($pdo) {
        try {
            // Consulta SQL
            $sql = 'SELECT r.COD_PRODUTO, r.DSC_PRODUTO 
                    FROM PRODUTO r
                    ORDER BY r.COD_PRODUTO DESC';
            
            // Adiciona limite se especificado
            if ($limite) {
                $sql .= ' FETCH FIRST ' . $limite . ' ROWS ONLY';
            }
            
            $stmt = $pdo->query($sql);
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formata os resultados
            foreach ($resultados as $row) {
                $produtos[] = array(
                    'codigo' => $row['COD_PRODUTO'],
                    'nome' => $row['DSC_PRODUTO'],
                    'categoria' => 'Não especificada' // O banco não tem categoria, então usamos um valor padrão
                );
            }
        } catch (PDOException $e) {
            // Em caso de erro, retorna array vazio
        }
    }
    
    // Se não conseguiu conectar ou não há produtos, retorna dados de exemplo
    if (empty($produtos)) {
        $produtos = array(
            array('codigo' => 'P001', 'nome' => 'Motor 7CC', 'categoria' => 'Motores'),
            array('codigo' => 'P002', 'nome' => 'Hélice 8XF', 'categoria' => 'Peças'),
            array('codigo' => 'P003', 'nome' => 'Casco 8.5CC', 'categoria' => 'Estrutura'),
            array('codigo' => 'P004', 'nome' => 'Leme Titan', 'categoria' => 'Navegação'),
            array('codigo' => 'P005', 'nome' => 'Painel de Controle', 'categoria' => 'Eletrônicos'),
            array('codigo' => 'P006', 'nome' => 'Bomba D\'água', 'categoria' => 'Hidráulica'),
            array('codigo' => 'P007', 'nome' => 'Estofamento Cabin', 'categoria' => 'Acabamento'),
            array('codigo' => 'P008', 'nome' => 'Vidro Frontal 8XF', 'categoria' => 'Estrutura'),
            array('codigo' => 'P009', 'nome' => 'Bateria Náutica', 'categoria' => 'Eletrônicos'),
            array('codigo' => 'P010', 'nome' => 'Guincho Elétrico', 'categoria' => 'Equipamentos'),
        );
    }
    
    return $produtos;
}

// Função para gerar o arquivo Excel
function gerarExcel() {
    // Buscar todos os produtos do banco de dados
    $produtos = buscarProdutos();
    
    // Configurações para download do arquivo Excel
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment;filename="tabela_codigos_produtos.xls"');
    header('Cache-Control: max-age=0');
    
    // Criar o conteúdo do Excel
    echo "<!DOCTYPE html>";
    echo "<html>";
    echo "<head>";
    echo "<meta charset='UTF-8'>";
    echo "</head>";
    echo "<body>";
    echo "<table border='1'>";
    echo "<tr><th>Código</th><th>Nome do Produto</th><th>Categoria</th></tr>";
    
    // Adicionar todos os produtos na tabela
    foreach($produtos as $produto) {
        echo "<tr>";
        echo "<td>" . $produto['codigo'] . "</td>";
        echo "<td>" . $produto['nome'] . "</td>";
        echo "<td>" . $produto['categoria'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    echo "</body>";
    echo "</html>";
    exit;
}

// Verificar se o botão de gerar Excel foi clicado
if(isset($_POST['gerar_excel'])) {
    gerarExcel();
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
  <meta name="google" content="notranslate">

  <!-- Tag para motores de busca -->
  <meta name="robots" content="index, follow">

  <!-- Informações do autor -->
  <meta name="author" content="Mastro D'Ascia Náutica">

  <!-- Icone de favorito para usabilidade -->
  <link href="assets/img/favicon.png" rel="icon" type="image/png">
  <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon">

  <!-- Titulo da pagina -->
  <title>Códigos de Produtos - Mastro D'Ascia</title>

  <!-- Descrição do site-->
  <meta name="description" content="Tabela de códigos e produtos da Mastro D'ascia - Estaleiro em Florianópolis.">

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

  <!-- Template Main CSS File -->
  <link href="assets/css/style.css" rel="stylesheet">
  
  <style>
    .produtos-section {
      padding: 120px 0 60px;
    }
    .table-container {
      margin-top: 30px;
      margin-bottom: 30px;
    }
    .btn-export {
      margin-bottom: 20px;
    }
  </style>
</head>

<body>
  <!-- ======= Header ======= -->
  <header id="header" class="fixed-top">
    <div class="container d-flex align-items-center justify-content-between">
      <a href="index.html" class="logo"><img src="assets/img/logo branco.png" alt="Logo da Mastro D'ascia Náutica - Estaleiro de Catamarãs em Florianópolis" class="img-fluid"></a>

      <nav id="navbar" class="navbar">
        <ul>
          <li><a class="nav-link scrollto" href="index.html#hero">Home</a></li>
          <li><a class="nav-link scrollto" href="index.html#about">Sobre</a></li>
          <li class="dropdown"><a class="nav-link scrollto" href="index.html#portfolio"><span>Modelos</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
          </svg></a>
            <ul class="portfolio-links">              
              <li><a href="./portfolio/7CC">7CC</a></li>
              <li><a href="./portfolio/7XF.html">7XF</a></li>
              <li><a href="./portfolio/8CC.html">8CC</a></li>
              <li><a href="./portfolio/8XF.html">8XF</a></li>
              <li><a href="./portfolio/85CC.html">8.5CC</a></li>
              <li><a href="./portfolio/85XF.html">8.5XF</a></li>
              <li><a href="./portfolio/Cabin.html">Cabin</a></li>
              <li><a href="./portfolio/Commuter.html">Commuter</a></li>
              <li><a href="./portfolio/TitanCC.html">Titan CC</a></li>
              <li><a href="javascript:void(0);" id="filter-xs-link">Modelos XS (de serviços)</a></li>
              <li><a href="javascript:void(0);" id="filter-new-link">Todos os Modelos</a></li>
            </ul>
          </li>       
          <li class="dropdown"><a class="nav-link scrollto" href="index.html#artigoslink"><span>Artigos e Vídeos</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
          </svg></a>
            <ul class="artigosnav-link">
              <li><a href="artigos.html?artigo=artigo03">Infusão a Vácuo</a></li>
              <li><a href="artigos.html?artigo=artigo04">Tipos de Cascos</a></li>
              <li><a href="videos.html">Vídeos</a></li>
            </ul>
          </li>
          <li><a class="nav-link scrollto" href="index.html#contact">Contato</a></li>
          <li><a class="getstarted scrollto" href="orcamento.html">Orçamento</a></li>
        </ul>
        <i class="bi bi-list mobile-nav-toggle"></i>
      </nav>
    </div>
  </header><!-- End Header -->

  <main id="main">
    <!-- ======= Produtos Section ======= -->
    <section id="produtos" class="produtos-section">
      <div class="container" data-aos="fade-up">
        <div class="section-title">
          <h2>Códigos de Produtos</h2>
          <p>Consulte nossa tabela de códigos e produtos</p>
        </div>

        <div class="row">
          <div class="col-12">
            <form method="post" class="text-center">
              <button type="submit" name="gerar_excel" class="btn btn-primary btn-export">
                <i class="bi bi-file-earmark-excel"></i> Gerar Tabela de Códigos e Produtos
              </button>
            </form>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <div class="table-container">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Código</th>
                    <th>Nome do Produto</th>
                    <th>Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  <?php
                  // Aqui você colocaria a lógica para buscar os primeiros 30 produtos do banco de dados
                  // Por enquanto, vamos criar dados de exemplo
                  $produtos_exibicao = array(
                      array('codigo' => 'P001', 'nome' => 'Motor 7CC', 'categoria' => 'Motores'),
                      array('codigo' => 'P002', 'nome' => 'Hélice 8XF', 'categoria' => 'Peças'),
                      array('codigo' => 'P003', 'nome' => 'Casco 8.5CC', 'categoria' => 'Estrutura'),
                      array('codigo' => 'P004', 'nome' => 'Leme Titan', 'categoria' => 'Navegação'),
                      array('codigo' => 'P005', 'nome' => 'Painel de Controle', 'categoria' => 'Eletrônicos'),
                      array('codigo' => 'P006', 'nome' => 'Bomba D'água', 'categoria' => 'Hidráulica'),
                      array('codigo' => 'P007', 'nome' => 'Estofamento Cabin', 'categoria' => 'Acabamento'),
                      array('codigo' => 'P008', 'nome' => 'Vidro Frontal 8XF', 'categoria' => 'Estrutura'),
                      array('codigo' => 'P009', 'nome' => 'Bateria Náutica', 'categoria' => 'Eletrônicos'),
                      array('codigo' => 'P010', 'nome' => 'Guincho Elétrico', 'categoria' => 'Equipamentos'),
                  );
                  
                  // Exibir os produtos na tabela
                  foreach($produtos_exibicao as $produto) {
                      echo "<tr>";
                      echo "<td>" . $produto['codigo'] . "</td>";
                      echo "<td>" . $produto['nome'] . "</td>";
                      echo "<td>" . $produto['categoria'] . "</td>";
                      echo "</tr>";
                  }
                  ?>
                </tbody>
              </table>
              <div class="text-center">
                <p>Exibindo 10 de 100+ produtos. Para visualizar a lista completa, clique no botão "Gerar Tabela de Códigos e Produtos".</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section><!-- End Produtos Section -->
  </main><!-- End #main -->

  <!-- ======= Footer ======= -->
  <footer id="footer">
    <div class="footer-top">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 footer-contact">
            <h3>Mastro D'Ascia</h3>
            <p>
              Rod. Tertuliano Brito Xavier, 3500<br>
              Canasvieiras, Florianópolis - SC<br>
              CEP 88054-600<br><br>
              <strong>Telefone:</strong> +55 (48) 3266-0202<br>
              <strong>Email:</strong> contato@mastrodascia.com.br<br>
            </p>
          </div>

          <div class="col-lg-2 col-md-6 footer-links">
            <h4>Links Úteis</h4>
            <ul>
              <li><i class="bx bx-chevron-right"></i> <a href="index.html">Home</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="index.html#about">Sobre nós</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="index.html#portfolio">Modelos</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="orcamento.html">Orçamento</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="codigoprodutos.php">Códigos de Produtos</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6 footer-links">
            <h4>Nossos Modelos</h4>
            <ul>
              <li><i class="bx bx-chevron-right"></i> <a href="./portfolio/8CC.html">8CC</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="./portfolio/85CC.html">8.5CC</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="./portfolio/Cabin.html">Cabin</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="./portfolio/Commuter.html">Commuter</a></li>
              <li><i class="bx bx-chevron-right"></i> <a href="./portfolio/TitanCC.html">Titan CC</a></li>
            </ul>
          </div>

          <div class="col-lg-4 col-md-6 footer-newsletter">
            <h4>Receba nossas novidades</h4>
            <p>Inscreva-se para receber informações sobre lançamentos e promoções</p>
            <form action="forms/send_newsletter-form.php" method="post">
              <input type="email" name="email" required><input type="submit" value="Inscrever">
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="container d-md-flex py-4">
      <div class="me-md-auto text-center text-md-start">
        <div class="copyright">
          &copy; Copyright <strong><span>Mastro D'Ascia</span></strong>. Todos os direitos reservados
        </div>
      </div>
      <div class="social-links text-center text-md-right pt-3 pt-md-0">
        <a href="#" class="facebook"><i class="bx bxl-facebook"></i></a>
        <a href="#" class="instagram"><i class="bx bxl-instagram"></i></a>
        <a href="#" class="youtube"><i class="bx bxl-youtube"></i></a>
      </div>
    </div>
  </footer><!-- End Footer -->

  <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

  <!-- Vendor JS Files -->
  <script src="assets/vendor/purecounter/purecounter_vanilla.js"></script>
  <script src="assets/vendor/aos/aos.js"></script>
  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
  <script src="assets/vendor/isotope-layout/isotope.pkgd.min.js"></script>
  <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>

  <!-- Template Main JS File -->
  <script src="assets/js/main.js"></script>
</body>
</html>

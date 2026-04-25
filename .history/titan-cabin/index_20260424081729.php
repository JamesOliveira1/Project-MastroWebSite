<?php
// PHP Header
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>Titan Cabin - Mastro D'Ascia Náutica</title>
  <meta name="description" content="Engenharia naval de alta performance traduzida em embarcações exclusivas e personalizadas. Descubra a Titan Cabin.">
  
  <link href="../assets/img/favicon.png" rel="icon" type="image/png">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@300;400;600&display=swap" rel="stylesheet">

  <!-- Vendor CSS Files -->
  <link href="../assets/vendor/aos/aos.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">

  <!-- Main CSS -->
  <link href="../assets/css/style.css" rel="stylesheet">
  <link href="titan-style.css" rel="stylesheet">
</head>
<body class="titan-page">
  
  <!-- Header Minimalista (Botão de Voltar) -->
  <header class="titan-header">
    <div class="container d-flex align-items-center justify-content-between">
      <a href="../index.html" class="logo"><img src="../assets/img/logo branco.png" alt="Mastro D'Ascia"></a>
      <a href="#lead-gen" class="btn-budget" data-aos="fade-left">Fazer Orçamento</a>
    </div>
  </header>

  <!-- 1. Hero Section -->
  <section id="hero-titan" class="hero-titan dark-blueprint">
    <div class="blueprint-grid"></div>
    <div class="container hero-content">
      <div class="row align-items-center">
        <div class="col-lg-6" data-aos="fade-right">
          <div class="subtitle-tech"><span>PROJETO #TC-001</span> // ENGENHARIA NAVAL</div>
          <h1 class="titan-title">TITAN CABIN</h1>
          <p class="titan-desc">Engenharia naval de alta performance traduzida em embarcações exclusivas e personalizadas.</p>
          <a href="#dna" class="btn-tech scrollto">EXPLORAR O PROJETO <i class="bi bi-arrow-down-right"></i></a>
        </div>
        <div class="col-lg-6 position-relative" data-aos="zoom-in" data-aos-delay="200">
          <img src="img/titan_blueprint_hero_1776873403383.png" alt="Titan Cabin Blueprint" class="img-fluid hero-image">
          <div class="handwritten-note note-1" data-aos="fade-up" data-aos-delay="500">Design Hidrodinâmico Otimizado</div>
          <div class="handwritten-note note-2" data-aos="fade-up" data-aos-delay="700">Cabine Panorâmica</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 2. DNA Mastro D'Ascia -->
  <section id="dna" class="dna-section light-paper">
    <div class="container">
      <div class="section-title text-center" data-aos="fade-up">
        <h2>DNA Mastro D'Ascia</h2>
        <p>A espinha dorsal tecnológica de cada embarcação</p>
      </div>

      <div class="row mt-5">
        <div class="col-md-4" data-aos="fade-up" data-aos-delay="100">
          <div class="tech-card">
            <div class="tech-icon"><i class="bi bi-layers"></i></div>
            <h3>Infusão a Vácuo</h3>
            <p>Construção ultraleve com resistência estrutural superior, garantindo melhor relação peso-potência.</p>
            <div class="tech-line"></div>
          </div>
        </div>
        <div class="col-md-4" data-aos="fade-up" data-aos-delay="200">
          <div class="tech-card">
            <div class="tech-icon"><i class="bi bi-shield-check"></i></div>
            <h3>Wood-Free</h3>
            <p>Composição 100% livre de madeira. Zero risco de apodrecimento, garantindo longevidade eterna do casco.</p>
            <div class="tech-line"></div>
          </div>
        </div>
        <div class="col-md-4" data-aos="fade-up" data-aos-delay="300">
          <div class="tech-card">
            <div class="tech-icon"><i class="bi bi-water"></i></div>
            <h3>Eficiência Hidrodinâmica</h3>
            <p>Design projetado para cortes de onda precisos, proporcionando navegação estável até em mar grosso.</p>
            <div class="tech-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Wrapper para Grid Unificado (Seções 2.1 e 3) -->
  <div class="unified-grid-wrapper position-relative">
    <!-- O Elemento Inteiro do Grid -->
    <div class="blueprint-grid" style="z-index: 2; pointer-events: none;"></div>

    <!-- 2.1 Background de fotos -->
    <section class="photo-bg-section" style="z-index: auto;">
      <!-- Overlay gradiente -->
      <div class="photo-overlay"></div>
      
      <!-- Content Container -->
      <div class="container position-relative h-100 d-flex align-items-center justify-content-start" style="z-index: 3;">
        <!-- Pagination -->
        <div class="swiper-pagination photo-bg-pagination position-absolute"></div>

        <!-- Specs Box -->
        <div class="specs-panel ms-5" data-aos="fade-right">
          <div class="section-title text-start mb-0">
            <h2>Especificações Técnicas</h2>
            <p>Comprimento: 11.35m</p>
            <p>Largura: 3.2m</p>
            <p>Calado: 0.42m</p>
            <p>Peso: 4146Kg</p>
            <p>Água: 120L</p>
            <p>Combustível: 1200L</p>
            <p>Motorização: 2x300hp - 2x400hp</p>
            <p>Passageiros: 16</p>
            <p>Pernoite: 2</p>
          </div>
        </div>
      </div>

      <!-- Swiper Container -->
      <div class="swiper photoBgSwiper h-100 w-100 position-absolute top-0 start-0">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="slide-bg" style="background-image: url('img/foto (12).jpeg');"></div>
          </div>
          <div class="swiper-slide">
            <div class="slide-bg" style="background-image: url('img/foto (1).jpeg');"></div>
          </div>
          <div class="swiper-slide">
            <div class="slide-bg" style="background-image: url('img/foto (4).jpeg');"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Performance -->
    <section id="performance" class="performance-section dark-blueprint" style="z-index: auto;">
      <div class="container position-relative" style="z-index: 3;">
      <div class="section-title text-light text-center" data-aos="fade-up">
        <h2>Performance Bruta</h2>
        <p>Números que redefinem a categoria</p>
      </div>

      <div class="row performance-chart-row mt-5" data-aos="fade-up">
        <!-- Card 1 -->
        <div class="col-md-4 d-flex align-items-end mb-4 mb-md-0" data-aos="fade-up" data-aos-delay="100">
          <div class="perf-card perf-step-1 w-100">
            <div class="perf-bg" style="background-image: url('img/01.png');"></div>
            <div class="perf-content">
              <div class="counter-wrapper">
                <span data-purecounter-start="0" data-purecounter-end="19.6" data-purecounter-decimals="1" data-purecounter-duration="2" class="purecounter">0</span>
                <span class="unit">NÓS</span>
              </div>
              <p>Velocidade de Cruzeiro Econômico</p>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="col-md-4 d-flex align-items-end mb-4 mb-md-0" data-aos="fade-up" data-aos-delay="300">
          <div class="perf-card perf-step-2 w-100">
            <div class="perf-bg" style="background-image: url('img/02.png');"></div>
            <div class="perf-content">
              <div class="counter-wrapper">
                <span data-purecounter-start="0" data-purecounter-end="445" data-purecounter-duration="2" class="purecounter">0</span>
                <span class="unit">MILHAS</span>
              </div>
              <p>Autonomia em Cruzeiro Econômico</p>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="col-md-4 d-flex align-items-end" data-aos="fade-up" data-aos-delay="500">
          <div class="perf-card perf-step-3 w-100">
            <div class="perf-bg" style="background-image: url('img/03.png');"></div>
            <div class="perf-content">
              <div class="counter-wrapper">
                <span data-purecounter-start="0" data-purecounter-end="41.18" data-purecounter-decimals="2" data-purecounter-duration="2" class="purecounter">0</span>
                <span class="unit">NÓS</span>
              </div>
              <p>Velocidade Máxima</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  </div> <!-- Fim do Wrapper Grid Unificado -->

  <!-- 4. Personalização -->
  <section id="personalization" class="personalization-section light-paper">
    <div class="container">
      <div class="section-title text-light text-center" data-aos="fade-up">
        <h2>Personalização Exclusiva</h2>
        <p>Abaixo os principais destaques de acabamento</p>
      </div>

      <div class="row position-relative mt-5">
        <div class="col-lg-10">
          <div class="hotspot-container" data-aos="zoom-in">
            <img src="img/titan_performance_1776873424061.png" alt="Titan Cabin Personalização" class="img-fluid performance-img">
            
            <div class="hotspot hs-mat" data-aos="fade-up" data-aos-delay="300">
              <div class="hotspot-marker"></div>
              <div class="hotspot-tooltip">
                <strong>Acabamentos em materiais premium</strong>
              </div>
            </div>

            <div class="hotspot hs-layout" data-aos="fade-up" data-aos-delay="400">
              <div class="hotspot-marker"></div>
              <div class="hotspot-tooltip">
                <strong>Layouts adaptáveis (Lounge vs Pesca)</strong>
              </div>
            </div>

            <div class="hotspot hs-elec" data-aos="fade-up" data-aos-delay="500">
              <div class="hotspot-marker"></div>
              <div class="hotspot-tooltip">
                <strong>Eletrônica de navegação sob medida</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Painel Desktop -->
        <div class="col-lg-4 position-absolute end-0 top-50 translate-middle-y d-none d-lg-block" style="z-index: 5;">
          <div class="options-panel w-100" data-aos="fade-left">
            <div class="options-list">
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Ar condicionado</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Capa de Proteção modelo 8</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Carreta de encalhe TITAN</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Corrimão de popa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira Elétrica</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira INOX 56l</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Guincho elétrico</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Kit painel solar</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Luz de proa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Luz subaquática (par)</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Mesa de cabine</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Pintura de casco</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em madeira TECA</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Piso sintético em EVA</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Salvatagem completa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Tenda de proa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Viveiros de popa</label>
            </div>
          </div>
        </div>

        <!-- Painel Mobile -->
        <div class="col-12 d-block d-lg-none mt-5">
          <div class="options-panel w-100 mx-auto" data-aos="fade-up">
            <div class="options-list">
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Ar condicionado</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Capa de proteção</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Carreta de encalhe</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira </label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Guincho elétrico</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Kit painel solar</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Luz de proa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Luz subaquática</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Mesa de cabine</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Pintura de casco</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em madeira </label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em EVA</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Salvatagem completa</label>
              <label class="chalk-checkbox"><input type="checkbox"><span class="chalk-checkmark"></span>Tenda de proa</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Seleção de Motores (Carrossel) -->
      <div class="engine-section-wrapper mt-5 pt-5 pb-4">
        <div class="row w-100 mx-0">
          <div class="col-12 d-flex justify-content-end mb-4 pe-4" data-aos="fade-left">
            <div class="section-title text-end mb-0">
              <p class="mb-0">Escolha seu motor.</p>
            </div>
          </div>
        </div>
        
        <div class="engine-carousel-wrapper" data-aos="fade-up">
          <div class="swiper engineSwiper">
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng2" value="2 MERCURY 300 VERADO">
                  <label for="eng2" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 MERCURY 300 VERADO.png" alt="2 MERCURY 300 VERADO">
                    </div>
                    <div class="engine-name">Mercury 300hp Verado</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng1" value="2 MERCURY 300 VERADO com JOY">
                  <label for="eng1" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 MERCURY 300 VERADO com JOY.png" alt="2 MERCURY 300 VERADO com JOY">
                    </div>
                    <div class="engine-name">Mercury 300hp Verado <br><small>com JOY</small></div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng7" value="2 YAMAHA 300hp">
                  <label for="eng7" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 YAMAHA 300hp.png" alt="2 YAMAHA 300hp">
                    </div>
                    <div class="engine-name">Yamaha 300hp</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng5" value="2 SUZUKI 300hp">
                  <label for="eng5" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 SUZUKI 300hp.png" alt="2 SUZUKI 300hp">
                    </div>
                    <div class="engine-name">Suzuki 300hp</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng6" value="2 SUZUKI 325hp">
                  <label for="eng6" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 SUZUKI 325hp.png" alt="2 SUZUKI 325hp">
                    </div>
                    <div class="engine-name">Suzuki 325hp</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng8" value="2 YAMAHA 350hp">
                  <label for="eng8" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 YAMAHA 350hp.png" alt="2 YAMAHA 350hp">
                    </div>
                    <div class="engine-name">Yamaha 350hp</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng3" value="2 MERCURY 400 V10 VERADO JOY">
                  <label for="eng3" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 MERCURY 400 V10 VERADO JOY.png" alt="2 MERCURY 400 V10 VERADO JOY">
                    </div>
                    <div class="engine-name">Mercury 400hp V10 Verado <br><small>com JOY</small></div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng9" value="2 YAMAHA 450hp">
                  <label for="eng9" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 YAMAHA 450hp.png" alt="2 YAMAHA 450hp">
                    </div>
                    <div class="engine-name">Yamaha 450hp</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              <div class="swiper-slide">
                <div class="engine-card">
                  <input type="radio" name="engine_selection" id="eng4" value="2 MERCURY 450 RACING">
                  <label for="eng4" class="engine-label">
                    <div class="engine-img-wrapper">
                      <img src="img/submot/2 MERCURY 450 RACING.png" alt="2 MERCURY 450 RACING">
                    </div>
                    <div class="engine-name">Mercury 450hp Racing</div>
                    <div class="engine-check">
                      <img src="../assets/img/checkbox.webp" alt="Selected">
                    </div>
                  </label>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. Prova Social (Carrossel Instagram) -->
  <section id="social" class="social-section dark-blueprint pb-5">
    <div class="blueprint-grid"></div>
    <div class="container">
      <div class="section-title text-light text-center" data-aos="fade-up">
        <h2>Titan na Água</h2>
        <p>Acompanhe quem já vive essa experiência</p>
      </div>

      <div class="swiper social-swiper mt-4" data-aos="fade-up">
        <div class="swiper-wrapper">
          <!-- Slide 1 -->
          <div class="swiper-slide">
            <div class="insta-card">
              <div class="insta-img"><img src="../assets/img/produtos/Titan CC/foto (2).jpg" alt="Insta 1"></div>
              <div class="insta-content">
                <p>"A estabilidade dessa embarcação é algo de outro mundo! Mesmo no mar agitado, a navegação é seca e firme."</p>
                <span class="insta-user">@cliente_mastro</span>
              </div>
            </div>
          </div>
          <!-- Slide 2 -->
          <div class="swiper-slide">
            <div class="insta-card">
              <div class="insta-img"><img src="../assets/img/produtos/Titan CC/foto (3).jpg" alt="Insta 2"></div>
              <div class="insta-content">
                <p>"Melhor aquisição para pesca esportiva. Espaço de sobra e uma hidrodinâmica perfeita."</p>
                <span class="insta-user">@pesca_extrema</span>
              </div>
            </div>
          </div>
          <!-- Slide 3 -->
          <div class="swiper-slide">
            <div class="insta-card">
              <div class="insta-img"><img src="../assets/img/produtos/Titan CC/foto (7).jpg" alt="Insta 3"></div>
              <div class="insta-content">
                <p>"O conforto da cabine e os acabamentos são de altíssimo nível. Recomendo o estaleiro!"</p>
                <span class="insta-user">@navegacao_sul</span>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </div>
  </section>

  <!-- 6. FAQ -->
  <section id="faq" class="faq-section light-paper pt-5 pb-5">
    <div class="container" data-aos="fade-up">
      <div class="section-title text-center">
        <h2>Dúvidas Comuns</h2>
        <p>Tudo o que você precisa saber</p>
      </div>

      <div class="accordion custom-accordion mt-4" id="faqAccordion">
        <!-- FAQ 1 -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
              Qual o prazo médio de construção e entrega?
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Como cada embarcação é construída de forma personalizada sob encomenda, o prazo varia de acordo com os detalhes do projeto, mas em média gira em torno de 4 a 6 meses.
            </div>
          </div>
        </div>
        <!-- FAQ 2 -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              Vocês realizam exportação para outros países?
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Sim! Realizamos a exportação das nossas embarcações com toda a assessoria documental necessária. Já possuímos modelos navegando em águas internacionais com total certificação.
            </div>
          </div>
        </div>
        <!-- FAQ 3 -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
              Quais motorizações são compatíveis com a Titan Cabin?
            </button>
          </h2>
          <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              A Titan Cabin é projetada para receber parelhas de motores de popa de alta performance. Podemos adaptar o projeto para suportar as principais marcas e cavalarias do mercado, conforme a sua necessidade de velocidade e torque.
            </div>
          </div>
        </div>
        <!-- FAQ 4 -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingFour">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
              Como escolher o barco ideal sem errar?
            </button>
          </h2>
          <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              O ponto de partida é definir o uso principal: pesca esportiva, lazer em família ou ambos. Em seguida, avalie o ambiente de navegação — mar aberto, baías ou rios — pois isso determina o casco e a motorização ideais. O comprimento define capacidade e conforto, enquanto os itens opcionais adaptam a embarcação ao seu estilo de vida. Nossa equipe técnica acompanha você desde a consultoria até a entrega, garantindo que cada detalhe do projeto faça sentido para o seu perfil de navegação.
            </div>
          </div>
        </div>
        <!-- FAQ 5 -->
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingFive">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
              Quais as condições de pagamento?
            </button>
          </h2>
          <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              Trabalhamos com condições diferenciadas e flexíveis para viabilizar o seu projeto. As formas de pagamento incluem entrada + parcelas durante a construção, financiamento via instituições parceiras e permuta de embarcações. Entre em contato para receber uma proposta personalizada de acordo com o seu planejamento financeiro.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 7. Lead Gen (Orçamento) -->
  <section id="lead-gen" class="lead-section dark-blueprint py-5">
    <div class="blueprint-grid"></div>
    <div class="container" data-aos="zoom-in">
      <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
          <div class="section-title text-light mb-4">
            <h2>Pronto para construir sua Titan?</h2>
            <p>Preencha os dados e entraremos em contato para um orçamento detalhado.</p>
          </div>
          
          <form class="tech-form" action="#" method="post" id="titanForm">
            <div class="row">
              <div class="col-md-6 mb-3">
                <input type="text" class="form-control" placeholder="Seu Nome Completo" required>
              </div>
              <div class="col-md-6 mb-3">
                <input type="email" class="form-control" placeholder="Seu E-mail" required>
              </div>
              <div class="col-md-6 mb-3">
                <input type="tel" class="form-control" placeholder="WhatsApp / Telefone" required>
              </div>
              <div class="col-md-6 mb-3">
                <select class="form-select">
                  <option selected disabled>Qual o seu principal uso?</option>
                  <option value="pesca">Pesca Esportiva</option>
                  <option value="lazer">Lazer / Família</option>
                  <option value="misto">Misto (Pesca e Lazer)</option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <textarea class="form-control" rows="4" placeholder="Mensagem ou dúvidas adicionais..."></textarea>
              </div>
              <div class="col-12">
                <button type="button" class="btn-submit-tech w-100" onclick="alert('Formulário enviado com sucesso! Entraremos em contato em breve.')">Solicitar Orçamento</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- 8. Footer -->
  <?php include '../assets/page/site_footer.html'; ?>

  <!-- Vendor JS Files -->
  <script src="../assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="../assets/vendor/aos/aos.js"></script>
  <script src="../assets/vendor/swiper/swiper-bundle.min.js"></script>
  <script src="../assets/vendor/purecounter/purecounter_vanilla.js"></script>

  <!-- Main JS -->
  <script src="titan-scripts.js"></script>
</body>
</html>
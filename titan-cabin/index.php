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
  <link href="../assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="../assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="../assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet">

  <!-- Main CSS -->
  <link href="titan-style.css" rel="stylesheet">
</head>
<body class="titan-page">
  <div id="smooth-wrapper">
    <div id="smooth-content">
  
  <div class="titan-bg-gradient-1">
    <!-- 1. Hero Section -->
    <section id="hero-titan" class="hero-titan dark-blueprint">
      <!-- Header moved inside to stay visible during pin -->
      <header class="titan-header">
        <div class="container d-flex align-items-center justify-content-between">
          <a href="../index.html" class="logo"><img src="../assets/img/logo branco 2.png" alt="Mastro D'Ascia"></a> --- Site em desenvolvimento, imagens genéricas ilustrativas
          <div class="lang-selector-wrapper">
            <div class="lang-selector">
              <img src="../assets/img/icons/flagbr.png" alt="Português" class="lang-flag active" data-lang="pt">
              <img src="../assets/img/icons/flagen.png" alt="English" class="lang-flag" data-lang="en">
              <img src="../assets/img/icons/flages.png" alt="Español" class="lang-flag" data-lang="es">
            </div>
            <div class="lang-message">Tradução será implementada após revisão final do texto</div>
          </div>
        </div>
      </header>
      
      <div class="container hero-content">
        <div class="row align-items-center">
          <div class="col-lg-6 hero-text-col">
            <div class="subtitle-tech"><span>PROJETO #TC-001</span> // ENGENHARIA NAVAL</div>
            <h1 class="titan-title">TITAN CABIN</h1>
            <p class="titan-desc">Engenharia naval de alta performance traduzida em embarcações exclusivas e personalizadas.</p>
            <a href="#dna" class="btn-tech scrollto">EXPLORAR O PROJETO <i class="bi bi-arrow-down-right"></i></a>
          </div>
          <div class="col-lg-6 hero-media-col">
            <div class="hero-reveal-container">
              <img src="img/titan_blueprint_hero_1776873403383.png" alt="Titan Blueprint" class="img-fluid hero-reveal-img img-1">
              <img src="img/titan_performance_1776873424061.png" alt="Titan Performance" class="img-fluid hero-reveal-img img-2">
              <img src="img/foto (12).jpeg" alt="Titan Real" class="img-fluid hero-reveal-img img-3">
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- 2. DNA Mastro D'Ascia -->
  <section id="dna" class="dna-section light-paper">
    <div class="section-parallax-bg" data-speed="0.6"></div>
    <div class="container">
      <div class="section-title text-center" data-aos="fade-up">
        <h2>DNA Mastro D'Ascia</h2>
        <p>A espinha dorsal tecnológica de cada embarcação</p>
      </div>

      <div class="row mt-5">
        <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="100">
          <div class="tech-card">
            <div class="tech-icon"><i class="bi bi-layers"></i></div>
            <h3>Infusão a Vácuo</h3>
            <p>Construção ultraleve com resistência estrutural superior, garantindo melhor relação peso-potência.</p>
            <div class="tech-line"></div>
          </div>
        </div>
        <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="200">
          <div class="tech-card">
            <div class="tech-icon"><i class="bi bi-shield-check"></i></div>
            <h3>Wood-Free</h3>
            <p>Composição 100% livre de madeira. Zero risco de apodrecimento, garantindo longevidade eterna do casco.</p>
            <div class="tech-line"></div>
          </div>
        </div>
        <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="300">
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

  <div class="titan-bg-gradient-2">
    <!-- Wrapper para Grid Unificado (Seções 2.1 e 3) -->
    <div class="unified-grid-wrapper position-relative">
      

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
              <div class="slide-bg" style="background-image: url('img/tecnicas_1.jpeg');"></div>
            </div>
            <div class="swiper-slide">
              <div class="slide-bg" style="background-image: url('img/tecnicas_2.jpeg');"></div>
            </div>
            <div class="swiper-slide">
              <div class="slide-bg" style="background-image: url('img/tecnicas_3.jpeg');"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="performance" class="performance-section dark-blueprint" style="z-index: auto;">
        <div class="container position-relative" style="z-index: 3;">
          <div class="section-title text-light text-center" data-aos="fade-up">
            <h2>Performance Bruta</h2>
            <p>Números que redefinem a categoria</p>
          </div>

          <div class="performance-technical-layout mt-5" data-aos="fade-up">
            <!-- Featured Technical Image -->
            <div class="perf-featured-container mb-4">
              <div class="performance-scanner">
                <!-- Border lines for GSAP animation -->
                <div class="perf-border-line pt-top"></div>
                <div class="perf-border-line pt-right"></div>
                <div class="perf-border-line pt-bottom"></div>
                <div class="perf-border-line pt-left"></div>

                <img src="img/desempenho.png" alt="Titan Cabin Performance" class="img-fluid perf-main-img">
                <div class="perf-image-overlay"></div>
                <div class="scan-line"></div>
                
                <!-- Interactive Hotspots (Simplified) -->
                <div class="perf-hotspot h1 pulse" data-target="perf-box-1">
                  <div class="hotspot-info left-sided">
                    <h4>Cruzeiro</h4>
                    <p>Eficiência máxima em navegação contínua.</p>
                  </div>
                </div>

                <div class="perf-hotspot h2 pulse" data-target="perf-box-2">
                  <div class="hotspot-info left-sided">
                    <h4>Autonomia</h4>
                    <p>Alcance estendido para longas travessias.</p>
                  </div>
                </div>

                <div class="perf-hotspot h3 pulse" data-target="perf-box-3">
                  <div class="hotspot-info left-sided">
                    <h4>Top Speed</h4>
                    <p>Poder total e performance bruta.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Blocks Horizontal -->
            <div class="row g-4 perf-boxes-container">
              <!-- Block 1 -->
              <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="300">
                <div class="perf-callout-box" id="perf-box-1">
                  <div class="box-header">
                    <span class="box-id">TC-PERF // 01</span>
                  </div>
                  <div class="box-body">
                    <div class="box-value">
                      <span data-purecounter-start="0" data-purecounter-end="19.6" data-purecounter-decimals="1" data-purecounter-duration="2" class="purecounter">0</span>
                      <span class="unit">NÓS</span>
                    </div>
                    <p class="box-label">CRUZEIRO ECONÔMICO</p>
                  </div>
                </div>
              </div>

              <!-- Block 2 -->
              <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="300">
                <div class="perf-callout-box" id="perf-box-2">
                  <div class="box-header">
                    <span class="box-id">TC-PERF // 02</span>
                  </div>
                  <div class="box-body">
                    <div class="box-value">
                      <span data-purecounter-start="0" data-purecounter-end="445" data-purecounter-duration="2" class="purecounter">0</span>
                      <span class="unit">MILHAS</span>
                    </div>
                    <p class="box-label">AUTONOMIA MÁXIMA</p>
                  </div>
                </div>
              </div>

              <!-- Block 3 -->
              <div class="col-md-4 stagger-item" data-aos="fade-up" data-aos-delay="300">
                <div class="perf-callout-box highlight" id="perf-box-3">
                  <div class="box-header">
                    <span class="box-id">TC-PERF // 03</span>
                    <div class="power-glow">MAX</div>
                  </div>
                  <div class="box-body">
                    <div class="box-value">
                      <span data-purecounter-start="0" data-purecounter-end="41.18" data-purecounter-decimals="2" data-purecounter-duration="2" class="purecounter">0</span>
                      <span class="unit">NÓS</span>
                    </div>
                    <p class="box-label">VELOCIDADE DE TOP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div> <!-- Fim do Wrapper Grid Unificado -->

    <!-- 4. Personalização -->
    <section id="personalization" class="personalization-section light-paper">
      <div class="parallax-bg-element parallax-bg-1" data-speed="0.6"></div>
      <div class="container">
        <div class="section-title text-light text-center" data-aos="fade-up">
          <h2>Personalização Exclusiva</h2>
          <p>Abaixo os principais destaques de acabamento</p>
        </div>

        <div class="row position-relative mt-5">
          <div class="col-lg-10">
            <div class="hotspot-container" data-aos="zoom-in">
              <div class="swiper personalizationSwiper">
                <div class="swiper-wrapper">
                  <div class="swiper-slide">
                    <img src="img/titan_performance_1776873424061.png" alt="Titan Cabin 1" class="img-fluid performance-img">
                  </div>
                  <div class="swiper-slide">
                    <img src="img/foto (1).jpeg" alt="Titan Cabin 2" class="img-fluid performance-img">
                  </div>
                  <div class="swiper-slide">
                    <img src="img/foto (2).jpeg" alt="Titan Cabin 3" class="img-fluid performance-img">
                  </div>
                  <div class="swiper-slide">
                    <img src="img/foto (3).jpeg" alt="Titan Cabin 4" class="img-fluid performance-img">
                  </div>
                </div>
                <div class="swiper-pagination personalization-progress"></div>
              </div>
            </div>
          </div>

          <!-- Painel Desktop -->
          <div class="col-lg-4 position-absolute end-0 top-50 translate-middle-y d-none d-lg-block" style="z-index: 5;">
            <div class="options-panel w-100" data-aos="fade-left">
              <div class="options-list">
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Ar condicionado</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Capa de Proteção modelo 8</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Carreta de encalhe TITAN</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Corrimão de popa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira Elétrica</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira INOX 56l</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Guincho elétrico</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Kit painel solar</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Luz de proa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Luz subaquática (par)</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Mesa de cabine</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Pintura de casco</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em madeira TECA</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Piso sintético em EVA</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Salvatagem completa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Tenda de proa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Viveiros de popa</label>
              </div>
            </div>
          </div>

          <!-- Painel Mobile -->
          <div class="col-12 d-block d-lg-none mt-5">
            <div class="options-panel w-100 mx-auto" data-aos="fade-up">
              <div class="options-list">
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Ar condicionado</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Capa de proteção</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Carreta de encalhe</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Geladeira </label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Guincho elétrico</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Kit painel solar</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Luz de proa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Luz subaquática</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Mesa de cabine</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Pintura de casco</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em madeira </label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Piso em EVA</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Salvatagem completa</label>
                <label class="chalk-checkbox stagger-item"><input type="checkbox"><span class="chalk-checkmark"></span>Tenda de proa</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Seleção de Motores (Carrossel) -->
        <div class="engine-section-wrapper mt-3 pt-5 pb-4">
          <div class="row w-100 mx-0">
            <div class="col-12 d-flex justify-content-end mb-4 pe-4" data-aos="fade-left">
              <div class="section-title text-end mb-0">
                <p class="mb-0">Escolha seu motor !</p>
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
    <section id="social" class="social-section dark-blueprint">
      <div class="parallax-bg-element parallax-bg-2" data-speed="0.8"></div>
      
      <div class="container">
        <div class="row align-items-center">
          <!-- Título na Esquerda (Desktop) -->
          <div class="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
            <div class="section-title text-light text-lg-start text-center m-0">
              <h2>Titan na Água</h2>
              <p>Acompanhe quem já vive essa experiência em canais oficiais e redes sociais.</p>
            </div>
          </div>

          <!-- Carrossel na Direita (Desktop) -->
          <div class="col-lg-6" data-aos="fade-left">
            <div class="swiper social-swiper">
              <div class="swiper-wrapper">
                <!-- Slide 1 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img"><img src="img/subdep/depoimento_1.png" alt="Depoimento 1"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Grandes conquistas são feitas em parceria. <br>Respeito, visão e compromisso com o melhor."</p>
                    </div>
                  </div>
                </div>
                <!-- Slide 2 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img vertical-mode"><img src="img/subdep/depoimento_2.png" alt="Depoimento 2"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Uauuu….. essa é um show de barco! Parabéns a toda equipe Mastro Dascia por estar sempre se aperfeiçoando para realizar nossos sonhos" </p>
                    </div>
                  </div>
                </div>
                <!-- Slide 3 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img vertical-mode"><img src="img/subdep/depoimento_3.png" alt="Depoimento 3"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Se me pedissem uma palavra para definir essa embarcação eu diria: Espetáculo."</p>
                    </div>
                  </div>
                </div>
                <!-- Slide 4 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img"><img src="img/subdep/depoimento_4.png" alt="Depoimento 4"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Ficou linda 👏👏... Parabéns para equipe mastrodascia "</p>
                    </div>
                  </div>
                </div>
                <!-- Slide 5 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img"><img src="img/subdep/depoimento_5.png" alt="Depoimento 5"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Mastro D’acia e algo fora da realidade do mercado quem conhece sabe."</p>
                    </div>
                  </div>
                </div>
                <!-- Slide 6 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img vertical-mode"><img src="img/subdep/depoimento_6.png" alt="Depoimento 6"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i>"Pronto para escrever novas histórias no mar." </p>
                    </div>
                  </div>
                </div>
                <!-- Slide 7 -->
                <div class="swiper-slide">
                  <div class="insta-card">
                    <div class="insta-img vertical-mode"><img src="img/subdep/depoimento_7.png" alt="Depoimento 7"></div>
                    <div class="insta-content">
                      <p><i class="bi bi-instagram"></i> "Barco fantástico, pura tecnologia embarcada !!!"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- 6. FAQ -->
  <section id="faq" class="faq-section light-paper pt-5 pb-5">
    <div class="section-parallax-bg" data-speed="0.6"></div>
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

  <div class="titan-bg-gradient-3">
    <!-- 7. Lead Gen (Orçamento) -->
    <section id="lead-gen" class="lead-section dark-blueprint py-5">
      <!-- Parallax Background Element -->
      <div class="parallax-bg-element parallax-bg-3" data-speed="0.8"></div>
      
      <div class="container" data-aos="zoom-in">
        <div class="row justify-content-center">
          <div class="col-lg-8 text-center">
            <div class="section-title text-light mb-4">
              <h2>Pronto para sua Titan?</h2>
              <p>Preencha os dados e entraremos em contato para um orçamento detalhado.</p>
            </div>
            
            <form class="tech-form" action="../forms/send_landingpage_cabin-form.php" method="post" id="titanForm">
              <div class="row">
                <div class="col-md-12 mb-3">
                  <input type="text" name="full_name" class="form-control" placeholder="Seu Nome Completo" required pattern="^[A-Za-zÀ-ÿ\s]+$" title="Por favor, insira apenas letras" oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')">
                </div>
                <div class="col-md-6 mb-3">
                  <input type="email" name="email" class="form-control" placeholder="Seu E-mail" required title="Por favor, insira um endereço de e-mail válido">
                </div>
                <div class="col-md-6 mb-3">
                  <input type="tel" name="phone" class="form-control" placeholder="WhatsApp / Telefone (apenas números)" required pattern="[0-9]+" minlength="10" maxlength="15" oninput="this.value = this.value.replace(/[^0-9]/g, '')" title="Por favor, insira apenas números (com DDD)">
                </div>
                <div class="col-12 mb-3">
                  <textarea name="message" class="form-control" rows="4" placeholder="Mensagem ou dúvidas adicionais..."></textarea>
                </div>
                
                <!-- Hidden Fields for Personalization -->
                <input type="hidden" name="engine" id="hiddenEngine">
                <input type="hidden" name="optionals" id="hiddenOptionals">
                <input type="hidden" name="subject" value="Interesse na Titan Cabin">

                <div class="col-12">
                  <button type="submit" class="btn-submit-tech2 w-100">Solicitar Orçamento</button>
                </div>
                <div class="col-12 mt-3">
                  <div class="form-message" id="formMessage"></div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. Footer -->
    <footer class="titan-footer dark-blueprint">
      <div class="container">
        <div class="titan-footer-shell" data-aos="fade-up">
          <div class="row g-4 align-items-start">
            <div class="col-lg-5">
              <div class="titan-footer-brand">
                <a href="../index.html" class="titan-footer-logo" aria-label="Ir para o site principal da Mastro D'Ascia">
                  <img src="../assets/img/logo branco 2.png" alt="Mastro D'Ascia">
                </a>
                <p class="titan-footer-copy">
                  A Titan Cabin traduz a assinatura da Mastro D'Ascia em uma embarcação de alto desempenho, acabamento preciso e configuração sob medida.
                </p>
                <div class="titan-footer-social" aria-label="Redes sociais">
                  <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pela%20landing%20da%20Titan%20Cabin" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <i class="bi bi-whatsapp"></i>
                  </a>
                  <a href="https://www.facebook.com/MastroDAscia" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="https://www.instagram.com/mastrodascia" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i class="bi bi-instagram"></i>
                  </a>
                  <a href="https://www.youtube.com/@mastrodascia1115" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <i class="bi bi-youtube"></i>
                  </a>
                </div>
              </div>
            </div>

            <div class="col-lg-7">
              <div class="text-end mb-4">
                <h3 class="titan-footer-title">Continue a experiência</h3>
              </div>
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="titan-footer-card">
                    <span class="titan-footer-kicker">Navegação</span>
                    <ul class="titan-footer-links">
                      <li><a href="../index.html">Ver site principal</a></li>
                      <li><a href="../orcamento.html" target="_blank">Solicitar orcamento</a></li>
                      <li><a href="mailto:comercial@mastrodascia.com.br">Contato por e-mail</a></li>
                    </ul>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="titan-footer-card">
                    <span class="titan-footer-kicker">Outros modelos</span>
                    <ul class="titan-footer-links">
                      <li><a href="../portfolio/7CC.html" target="_blank">Nomad 7 CC</a></li>                
                      <li><a href="../portfolio/8CC.html" target="_blank">Nomad 8 CC</a></li>
                      <li><a href="../portfolio/85XF.html" target="_blank">Nomad 8.5 XF</a></li>
                      <li><a href="../portfolio/TitanCC.html" target="_blank">Titan CC</a></li>
                      <li><a href="../portfolio/Commuter.html" target="_blank">Commuter</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="titan-footer-meta">
          <div class="titan-footer-meta-content">
            <div class="titan-footer-legal">
              <p>Copyright &copy; <span id="current-year"></span> <strong>Mastro D'Ascia</strong> - All Rights Reserved.</p>
              <p class="recaptchatext">
                Este site e protegido pelo <img class="recaptchalogo" src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="Google reCAPTCHA Logo"> reCAPTCHA e esta sujeito a
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Politica de Privacidade</a>
                e aos
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Termos de Servico</a> do Google.
              </p>
            </div>
            <div class="titan-footer-seal">
              <span id="siteseal"><script async type="text/javascript" src="https://seal.godaddy.com/getSeal?sealID=fwES6NOeULvL4kTGGTraoLpyjORCXEkDMXcqOLHO1b0OLD76PQhGy5qek6yR"></script></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>

  </div> <!-- smooth-content -->
  </div> <!-- smooth-wrapper -->

  <a
    href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pela%20landing%20da%20Titan%20Cabin"
    class="titan-whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Conversar por WhatsApp"
  >
    <i class="bi bi-whatsapp"></i>
    <span>Conversar no WhatsApp</span>
  </a>

  <!-- Vendor JS Files -->
  <script src="../assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="../assets/vendor/swiper/swiper-bundle.min.js"></script>
  <script src="../assets/vendor/purecounter/purecounter_vanilla.js"></script>
  <script src="../assets/vendor/gsap/gsap.min.js"></script>
  <script src="../assets/vendor/gsap/ScrollTrigger.min.js"></script>
  <script src="../assets/vendor/gsap/ScrollSmoother.min.js"></script>

  <!-- Main JS -->
  <script src="titan-scripts.js"></script>
</body>
</html>

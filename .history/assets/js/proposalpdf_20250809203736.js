document.addEventListener("DOMContentLoaded", function () {
  // Inicializar mensagens como ocultas ao carregar a página
  initializeStatusMessages();
  
  const btn = document.getElementById("proposalgeneratepdf");
  if (btn) {
    btn.addEventListener("click", handleGerarPDF);
  }
});

// Função para inicializar as mensagens como ocultas
function initializeStatusMessages() {
  const loading = document.querySelector(".loadproposta");
  const error = document.querySelector(".error-messageproposta");
  const success = document.querySelector(".sent-messageproposta");
  
  if (loading) loading.style.display = "none";
  if (error) error.style.display = "none";
  if (success) success.style.display = "none";
}

// Função para controlar as mensagens de status
function showStatusMessage(type) {
  // Ocultar todas as mensagens primeiro
  const loading = document.querySelector(".loadproposta");
  const error = document.querySelector(".error-messageproposta");
  const success = document.querySelector(".sent-messageproposta");
  
  if (loading) loading.style.display = "none";
  if (error) error.style.display = "none";
  if (success) success.style.display = "none";
  
  // Mostrar a mensagem específica
  switch (type) {
    case "loading":
      if (loading) loading.style.display = "block";
      break;
    case "error":
      if (error) error.style.display = "block";
      break;
    case "success":
      if (success) success.style.display = "block";
      break;
    case "hide":
      // Todas já foram ocultadas acima
      break;
  }
}

// Função wrapper para controlar o processo de geração
async function handleGerarPDF() {
  try {
    // Mostrar mensagem de carregamento
    showStatusMessage("loading");
    
    // Aguardar um pequeno delay para garantir que a mensagem apareça
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Executar a geração do PDF
    await gerarPDF();
    
    // Mostrar mensagem de sucesso
    showStatusMessage("success");
    
    // Ocultar mensagem de sucesso após 8 segundos
    setTimeout(() => {
      showStatusMessage("hide");
    }, 8000);
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    
    // Mostrar mensagem de erro
    showStatusMessage("error");
    
    // Ocultar mensagem de erro após 5 segundos
    setTimeout(() => {
      showStatusMessage("hide");
    }, 5000);
  }
}

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Definir cores padrão em RGB
  const darkBlue = [3, 30, 59]; // #031e3b
  const white = [255, 255, 255]; // #ffffff

  // Função para configurar estilo padrão (Helvetica 14px darkBlue normal)
  function setDefaultStyle() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  }

  // Função para configurar estilo bold (Helvetica 14px darkBlue bold)
  function setBoldStyle() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  }

  // Função para configurar estilo branco normal
  function setWhiteStyle() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(white[0], white[1], white[2]);
  }

  // Função para configurar estilo branco bold
  function setWhiteBoldStyle() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(white[0], white[1], white[2]);
  }

  // Função para splitTextToSize segura
  function safeSplitTextToSize(text, maxWidth) {
    try {
      return doc.splitTextToSize(text, maxWidth, { fontName: 'helvetica' });
    } catch (error) {
      return doc.splitTextToSize(text, maxWidth, { fontName: 'helvetica' });
    }
  }

  // Função para adicionar imagem de fundo
  async function adicionarFundo(doc, imagemPath) {
    const img = new Image();
    img.src = imagemPath;
    await img.decode();
    doc.addImage(img, "PNG", 0, 0, 297, 210);
  }

  // OTIMIZAÇÃO: Função addImageCover simplificada e otimizada
  async function addImageCover(doc, imgSrc, x, y, targetWmm, targetHmm) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Para evitar problemas de CORS
    img.src = imgSrc;
    
    // Aguardar o carregamento da imagem
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const mmToPt = 2.83465; // 1mm = 2.83465pt
    const targetW = targetWmm * mmToPt;
    const targetH = targetHmm * mmToPt;

    const aspectImg = img.width / img.height;
    const aspectTarget = targetW / targetH;

    let drawW, drawH;
    if (aspectImg > aspectTarget) {
      // imagem mais larga que o espaço → ajusta pela altura
      drawH = targetH;
      drawW = targetH * aspectImg;
      doc.addImage(
        img,
        "JPEG",
        x,
        y,
        drawW / mmToPt,
        drawH / mmToPt
      );
    } else {
      // imagem mais alta que o espaço → ajusta pela largura
      drawW = targetW;
      drawH = targetW / aspectImg;
      doc.addImage(
        img,
        "JPEG",
        x,
        y,
        drawW / mmToPt,
        drawH / mmToPt
      );
    }
    
    console.log(`Imagem do motor adicionada com sucesso: ${imgSrc}`);
  }

  // Função para converter data de YYYY-MM-DD para DD/MM/YYYY
  function formatDate(dateString) {
    if (!dateString || dateString === "—") return dateString;
    
    // Se já está no formato DD/MM/YYYY, retorna como está
    if (dateString.includes("/")) return dateString;
    
    // Se está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  }

  // ========================================
  // PÁGINA 1 - FUNDO 1.PNG
  // ========================================
  await adicionarFundo(doc, "assets/img/proposta/1.png");

  // ========================================
  // PÁGINA 2 - FUNDO 2.PNG
  // ========================================
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/2.png");

  // ========================================
// PÁGINA 3 - MODELO, ANO, FOTOS
// ========================================
doc.addPage("a4", "landscape");
await adicionarFundo(doc, "assets/img/proposta/3FUNDO.png");

let model = document.getElementById("proposalmodel")?.value || "—";

// Se começar com número, adiciona "Nomad " no início
if (/^\d/.test(model)) {
  model = "Nomad " + model;
}
const year = document.getElementById("proposalyear")?.value || "—";
const foto1 = document.getElementById("proposalfoto1")?.value;
const foto2 = document.getElementById("proposalfoto2")?.value;
const foto3 = document.getElementById("proposalfoto3")?.value;

// Texto modelo - alinhado à direita
setBoldStyle();
doc.setFont("helvetica", "bold");
doc.setFontSize(47);
doc.setTextColor(white[0], white[1], white[2]);
doc.text(model, 258, 67, { align: "right" });

// Texto ano - alinhado à direita
setBoldStyle();
doc.setFont("helvetica", "bold");
doc.setFontSize(32);
doc.text(year, 258, 80, { align: "right" });

// Função para adicionar imagem mantendo proporção, alinhada pelo topo
async function addImageCoverTop(doc, imgSrc, x, y, targetWmm, targetHmm) {
  const img = new Image();
  img.src = imgSrc;
  await img.decode();

  const mmToPt = 2.83465; // 1mm = 2.83465pt
  const targetW = targetWmm * mmToPt;
  const targetH = targetHmm * mmToPt;

  const aspectImg = img.width / img.height;
  const aspectTarget = targetW / targetH;

  let drawW, drawH;
  if (aspectImg > aspectTarget) {
    // imagem mais larga que o espaço → ajusta pela altura
    drawH = targetH;
    drawW = targetH * aspectImg;
    doc.addImage(
      img,
      "JPEG",
      x,
      y,
      drawW / mmToPt,
      drawH / mmToPt
    );
  } else {
    // imagem mais alta que o espaço → ajusta pela largura
    drawW = targetW;
    drawH = targetW / aspectImg;
    doc.addImage(
      img,
      "JPEG",
      x,
      y,
      drawW / mmToPt,
      drawH / mmToPt
    );
  }
}

// Página 3 com alinhamento pelo topo
if (foto1) {
  await addImageCoverTop(doc, foto1, 18, 90, 133, 95);
}
if (foto2) {
  await addImageCoverTop(doc, foto2, 158, 90, 80, 45);
}
if (foto3) {
  await addImageCoverTop(doc, foto3, 158, 140, 80, 45);
}


  // ========================================
  // PÁGINA 4 - MODELO INFO, ITENS DE SÉRIE, OPCIONAIS
  // ========================================
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/4FUNDO.png");

  setBoldStyle();
   doc.setFont("helvetica", "bold");
  doc.setFontSize(47);
  doc.text(model, 258, 27, { align: "right" });

  const modelInfo = document.getElementById("proposalmodelinfo")?.value || "—";
  const seriesItems = document.getElementById("proposalseriesitems")?.value || "—";

// Capturar opcionais selecionados
let selectedOptions = [];
const checkboxes = document.querySelectorAll("#proposaloptions input[type='checkbox']");
checkboxes.forEach(cb => {
  if (cb.checked) {
    selectedOptions.push(cb.value.trim());
  }
});

const optionsText = selectedOptions.length > 0
  ? selectedOptions.join("\n") // <-- quebra de linha entre cada item
  : "Nenhum opcional selecionado.";

// Aplicar estilo bold para inputs

setWhiteBoldStyle()
doc.text(safeSplitTextToSize(modelInfo, 260), 22, 95, { baseline: "top", lineHeightFactor: 2.0 });
setBoldStyle();
doc.text(safeSplitTextToSize(seriesItems, 260), 122, 95, { baseline: "top", lineHeightFactor: 2.0 });
doc.text(safeSplitTextToSize(optionsText, 260), 207, 95, { baseline: "top", lineHeightFactor: 2.0 }); 


  // ========================================
  // PÁGINA 5 - DIFERENCIAIS
  // ========================================
// ========================================
// PÁGINA 5 - DIFERENCIAIS
// ========================================
doc.addPage("a4", "landscape");
await adicionarFundo(doc, "assets/img/proposta/5FUNDO.png");

const differentials = document.getElementById("proposaldifferentials")?.value || "—";

// Quebra o texto em frases (usando cada " - " como início de uma nova)
let frases = differentials.split("\n").map(f => f.trim()).filter(f => f.length > 0);

// Área onde o texto será limitado
const startX = 20;      // posição inicial X (mm)
const startY = 40;      // posição inicial Y (mm)
const maxWidth = 240;   // largura máxima do texto (mm)
const lineHeight = 8;   // espaçamento entre linhas

setBoldStyle();
doc.setFont("helvetica", "bold");
doc.setFontSize(12);

// Escreve cada frase com cor alternada
let y = startY;
frases.forEach((frase, index) => {
    if (index % 2 === 0) {
        doc.setTextColor(255, 255, 255); // branco
    } else {
        doc.setTextColor(45, 171, 255); // azul
    }

    // Quebra a frase caso ultrapasse a largura máxima
    const linhas = doc.splitTextToSize(frase, maxWidth);
    doc.text(linhas, startX, y, { align: "left" });

    // Avança Y conforme quantidade de linhas
    y += linhas.length * lineHeight;
});


// ========================================
// PÁGINA 6 - CONFIGURAÇÃO BÁSICA E MOTOR
// ========================================
doc.addPage("a4", "landscape");
await adicionarFundo(doc, "assets/img/proposta/6FUNDO.png");

const basicSetup = document.getElementById("proposalbasicsetup")?.value || "—";
const motorConfig = document.getElementById("proposalmotorconfig")?.value || "—";

setBoldStyle();
doc.text(safeSplitTextToSize(basicSetup, 260), 20, 40);
doc.text(safeSplitTextToSize(motorConfig, 260), 216, 153, { align: "right" });

// OTIMIZAÇÃO: Lógica simplificada para carregar a imagem do motor
let motorImgPath = document.getElementById("proposalmotorimg")?.value;

// Se não há caminho definido, construir baseado no motor selecionado (com espaços)
if (!motorImgPath || motorImgPath.trim() === "") {
  if (motorConfig && motorConfig !== "—" && motorConfig.trim() !== "") {
    // Usar o nome do motor diretamente com espaços (sem substituições)
    motorImgPath = `assets/img/motor/${motorConfig}.jpg`;
  }
}

// Tentar adicionar a imagem do motor se houver caminho
if (motorImgPath && motorImgPath.trim() !== "") {
  try {
    console.log(`Carregando imagem do motor: ${motorImgPath}`);
    await addImageCover(doc, motorImgPath, 232, 201, 45, 88);
  } catch (error) {
    console.warn("Erro ao carregar imagem do motor:", motorImgPath, error);
  }
} else {
  console.warn("Nenhum caminho de imagem do motor encontrado");
}


  // ========================================
  // PÁGINA 7 - CLIENTE, PRAZOS E CONDIÇÕES
  // ========================================
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/7FUNDO.png");

  // Captura de dados
  const client = document.getElementById("proposalclientname")?.value || "—";
  const delivery = document.getElementById("proposaldeliverytime")?.value || "—";
  const date = document.getElementById("proposaldate")?.value || "—";
  const validity = document.getElementById("proposalvalidity")?.value || "—";
  const payment = document.getElementById("proposalpayment")?.value || "—";
  const notes = document.getElementById("proposalnotes")?.value || "—";
  const value = document.getElementById("proposalvalue")?.value || "—";
  const valuedesc = document.getElementById("proposalvaluedesc")?.value || "—";
  const currency = document.getElementById("proposalcurrency")?.value || "R$";

  // === SEÇÃO ESQUERDA (FUNDO CLARO) ===

  // Nome do Cliente 
  setBoldStyle();
  doc.text(client, 138, 27.61);

  // Prazo de entrega 
  setBoldStyle();
  const deliveryLines = safeSplitTextToSize(delivery, 120);
  doc.text(deliveryLines, 94, 96.40);

  // Data 
  setBoldStyle();
  doc.text(formatDate(date), 19, 155);

  // Validade
  setBoldStyle();
  doc.text(validity, 68.5, 161.5);

  // === SEÇÃO DIREITA (FUNDO AZUL ESCURO) ===

  // Valor da proposta 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text(`${currency} ${value}`, 146, 64);

  // Descrição do valor 
  setWhiteBoldStyle();
  doc.text(valuedesc, 195, 75);

  // Condições de pagamento
  setWhiteBoldStyle();
  const paymentLines = safeSplitTextToSize(payment, 120);
  doc.text(paymentLines, 136, 124);

  // Observações
  setWhiteBoldStyle();
  const notesLines = safeSplitTextToSize(notes, 120);
  doc.text(notesLines, 136, 180);

  // ========================================
  // PÁGINA 8 - FUNDO 8.PNG
  // ========================================
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/8.png");

  // Salvar PDF com nome personalizado
  const fileName = `Proposta Mastro D'Ascia - ${client || 'Cliente'}.pdf`;
  doc.save(fileName);
}

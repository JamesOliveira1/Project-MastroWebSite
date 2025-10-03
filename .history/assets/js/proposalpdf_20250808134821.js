document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("proposalgeneratepdf");
  if (btn) {
    btn.addEventListener("click", gerarPDF);
  }
});

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // ========================================
  // CONFIGURAÇÃO DA FONTE ARIAL
  // ========================================
  // Adicionar fonte Arial ao jsPDF
  doc.addFont('Arial', 'Arial', 'normal');
  doc.addFont('Arial', 'Arial', 'bold');

  // Definir cores padrão em RGB (jsPDF funciona melhor com RGB do que hex)
  const darkBlue = [3, 30, 59]; // #031e3b convertido para RGB
  const white = [255, 255, 255]; // #ffffff convertido para RGB

  // Função para configurar estilo padrão (Arial 14px darkBlue)
  function setDefaultStyle() {
    doc.setFont("Arial", "normal");
    doc.setFontSize(14);
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  }

  // Função para adicionar imagem de fundo
  async function adicionarFundo(doc, imagemPath) {
    const img = new Image();
    img.src = imagemPath;
    await img.decode();
    doc.addImage(img, "PNG", 0, 0, 297, 210); // landscape: 297x210 mm
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
  const model = document.getElementById("proposalmodel")?.value || "—";
  const year = document.getElementById("proposalyear")?.value || "—";
  const foto1 = document.getElementById("proposalfoto1")?.value;
  const foto2 = document.getElementById("proposalfoto2")?.value;
  const foto3 = document.getElementById("proposalfoto3")?.value;

  // Aplicar estilo padrão (Arial 14px darkBlue)
  setDefaultStyle();
  doc.text(`Modelo: ${model}`, 20, 30);
  doc.text(`Ano: ${year}`, 20, 45);

  // Adiciona as três imagens (fotos) pequenas
  let x = 20, y = 60, w = 60, h = 45;
  for (let [i, foto] of [foto1, foto2, foto3].entries()) {
    if (foto) {
      const img = new Image();
      img.src = foto;
      try {
        await img.decode();
        doc.addImage(img, "JPEG", x + i * (w + 10), y, w, h);
      } catch (e) {
        console.warn(`Erro ao carregar imagem ${i + 1}:`, foto);
      }
    }
  }

  // ========================================
  // PÁGINA 4 - MODELO INFO, ITENS DE SÉRIE, OPCIONAIS
  // ========================================
  doc.addPage("a4", "landscape");

  const modelInfo = document.getElementById("proposalmodelinfo")?.value || "—";
  const seriesItems = document.getElementById("proposalseriesitems")?.value || "—";

  // 🔍 Aqui pegamos todos os checkboxes marcados dentro de #proposaloptions
  let selectedOptions = [];
  const checkboxes = document.querySelectorAll("#proposaloptions input[type='checkbox']");
  checkboxes.forEach(cb => {
    if (cb.checked) {
      selectedOptions.push(cb.value.trim());
    }
  });

  const optionsText = selectedOptions.length > 0
    ? selectedOptions.join(", ")
    : "Nenhum opcional selecionado.";

  // Aplicar estilo padrão (Arial 14px darkBlue)
  setDefaultStyle();
  doc.text("Informações do modelo:", 20, 30);
  doc.text(modelInfo, 20, 40, { maxWidth: 260 });

  doc.text("Itens de série:", 20, 80);
  doc.text(seriesItems, 20, 90, { maxWidth: 260 });

  doc.text("Opcionais selecionados:", 20, 130);
  doc.text(optionsText, 20, 140, { maxWidth: 260 });

  // ========================================
  // PÁGINA 5 - DIFERENCIAIS
  // ========================================
  doc.addPage("a4", "landscape");
  const differentials = document.getElementById("proposaldifferentials")?.value || "—";
  
  // Aplicar estilo padrão (Arial 14px darkBlue)
  setDefaultStyle();
  doc.text("Diferenciais:", 20, 30);
  doc.text(differentials, 20, 40, { maxWidth: 260 });

  // ========================================
  // PÁGINA 6 - CONFIGURAÇÃO BÁSICA E MOTOR
  // ========================================
  doc.addPage("a4", "landscape");
  const basicSetup = document.getElementById("proposalbasicsetup")?.value || "—";
  const motorConfig = document.getElementById("proposalmotorconfig")?.value || "—";

  // Aplicar estilo padrão (Arial 14px darkBlue)
  setDefaultStyle();
  doc.text("Configuração básica:", 20, 30);
  doc.text(basicSetup, 20, 40, { maxWidth: 260 });
  doc.text("Configuração do motor:", 20, 80);
  doc.text(motorConfig, 20, 90, { maxWidth: 260 });

  // ========================================
  // PÁGINA 7 - CLIENTE, PRAZOS E CONDIÇÕES
  // ========================================
  doc.addPage("a4", "landscape");

  // Adicionar imagem de fundo da página 7
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

  // Cliente - posicionado no topo da área clara (sem "A/C:" pois já está na imagem)
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text(client, 85, 35);

  // Prazo de entrega - na seção "Prazo de entrega"
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  // Quebrar o texto em múltiplas linhas se necessário
  const deliveryLines = doc.splitTextToSize(delivery, 120);
  doc.text(deliveryLines, 85, 110);

  // Data - na seção "Data e validade" (primeira linha)
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text(date, 85, 180);

  // Validade - na seção "Data e validade" (segunda linha, sem "Proposta válida por" pois já está na imagem)
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text(validity, 85, 195);

  // === SEÇÃO DIREITA (FUNDO AZUL ESCURO) ===

  // Valor da proposta (grande, no topo da área azul)
  doc.setFont("Arial", "bold");
  doc.setFontSize(32);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text(`${currency} ${value}`, 170, 70);

  // Descrição do valor (abaixo do valor principal)
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text(valuedesc, 170, 85);

  // Condições de pagamento - na seção "Condições de pagamento"
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(white[0], white[1], white[2]);
  // Quebrar o texto em múltiplas linhas se necessário, limitando a largura
  const paymentLines = doc.splitTextToSize(payment, 120);
  doc.text(paymentLines, 170, 140);

  // Observações - na seção "Observações"
  doc.setFont("Arial", "normal");
  doc.setFontSize(14);
  doc.setTextColor(white[0], white[1], white[2]);
  // Quebrar o texto em múltiplas linhas se necessário, limitando a largura
  const notesLines = doc.splitTextToSize(notes, 120);
  doc.text(notesLines, 170, 200);

  // ========================================
  // PÁGINA 8 - FUNDO 8.PNG
  // ========================================
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/8.png");

  // Salvar PDF
  doc.save("proposta.pdf");
}
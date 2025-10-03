document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("proposalgeneratepdf");
  if (btn) {
    btn.addEventListener("click", gerarPDF);
  }
});

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Função para adicionar imagem de fundo
  async function adicionarFundo(doc, imagemPath) {
    const img = new Image();
    img.src = imagemPath;
    await img.decode();
    doc.addImage(img, "PNG", 0, 0, 297, 210); // landscape: 297x210 mm
  }

  // Página 1 - fundo 1.png
  await adicionarFundo(doc, "assets/img/proposta/1.png");

  // Página 2 - fundo 2.png
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/2.png");

  // Página 3 - modelo, ano, fotos
  doc.addPage("a4", "landscape");
  const model = document.getElementById("proposalmodel")?.value || "—";
  const year = document.getElementById("proposalyear")?.value || "—";
  const foto1 = document.getElementById("proposalfoto1")?.value;
  const foto2 = document.getElementById("proposalfoto2")?.value;
  const foto3 = document.getElementById("proposalfoto3")?.value;

  doc.setFontSize(14);
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

 // Página 4 - modelo info, itens de série, opcionais
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

doc.setFontSize(12);
doc.text("Informações do modelo:", 20, 30);
doc.text(modelInfo, 20, 40, { maxWidth: 260 });

doc.text("Itens de série:", 20, 80);
doc.text(seriesItems, 20, 90, { maxWidth: 260 });

doc.text("Opcionais selecionados:", 20, 130);
doc.text(optionsText, 20, 140, { maxWidth: 260 });


  // Página 5 - diferenciais
  doc.addPage("a4", "landscape");
  const differentials = document.getElementById("proposaldifferentials")?.value || "—";
  doc.setFontSize(12);
  doc.text("Diferenciais:", 20, 30);
  doc.text(differentials, 20, 40, { maxWidth: 260 });

  // Página 6 - configuração básica e motor
  doc.addPage("a4", "landscape");
  const basicSetup = document.getElementById("proposalbasicsetup")?.value || "—";
  const motorConfig = document.getElementById("proposalmotorconfig")?.value || "—";

  doc.setFontSize(12);
  doc.text("Configuração básica:", 20, 30);
  doc.text(basicSetup, 20, 40, { maxWidth: 260 });
  doc.text("Configuração do motor:", 20, 80);
  doc.text(motorConfig, 20, 90, { maxWidth: 260 });

 /// Página 7 - cliente, prazos e condições 
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

// Definir cores
const darkBlue = "#031e3b";
const white = "#ffffff";

// === SEÇÃO ESQUERDA (FUNDO CLARO) ===

// Cliente (A/C:) - posicionado no topo da área clara
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(darkBlue);
doc.text(`A/C: ${client}`, 85, 35);

// Prazo de entrega - na seção "Prazo de entrega"
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(darkBlue);
// Quebrar o texto em múltiplas linhas se necessário
const deliveryLines = doc.splitTextToSize(delivery, 120);
doc.text(deliveryLines, 85, 110);

// Data e validade - na seção "Data e validade"
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(darkBlue);
doc.text(`${date} - Proposta válida por ${validity}`, 85, 190);

// === SEÇÃO DIREITA (FUNDO AZUL ESCURO) ===

// Valor da proposta (grande, no topo da área azul)
doc.setFont("arial", "bold");
doc.setFontSize(32);
doc.setTextColor(white);
doc.text(`${currency} ${value}`, 170, 70);

// Descrição do valor (abaixo do valor principal)
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(white);
doc.text(valuedesc, 170, 85);

// Condições de pagamento - na seção "Condições de pagamento"
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(white);
// Quebrar o texto em múltiplas linhas se necessário, limitando a largura
const paymentLines = doc.splitTextToSize(payment, 120);
doc.text(paymentLines, 170, 140);

// Observações - na seção "Observações"
doc.setFont("arial", "normal");
doc.setFontSize(14);
doc.setTextColor(white);
// Quebrar o texto em múltiplas linhas se necessário, limitando a largura
const notesLines = doc.splitTextToSize(notes, 120);
doc.text(notesLines, 170, 200);


  // Página 8 - fundo 8.png
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/8.png");

  // Salvar PDF
  doc.save("proposta.pdf");
}

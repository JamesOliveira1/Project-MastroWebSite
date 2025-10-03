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

  // Página 7 - cliente, prazos e condições
  doc.addPage("a4", "landscape");
  const client = document.getElementById("proposalclientname")?.value || "—";
  const delivery = document.getElementById("proposaldeliverytime")?.value || "—";
  const date = document.getElementById("proposaldate")?.value || "—";
  const validity = document.getElementById("proposalvalidity")?.value || "—";
  const payment = document.getElementById("proposalpayment")?.value || "—";
  const notes = document.getElementById("proposalnotes")?.value || "—";

  doc.setFontSize(12);
  doc.text(`Cliente: ${client}`, 20, 30);
  doc.text(`Data da proposta: ${date}`, 20, 40);
  doc.text(`Validade: ${validity}`, 20, 50);
  doc.text(`Entrega: ${delivery}`, 20, 60);
  doc.text(`Pagamento: ${payment}`, 20, 70);
  doc.text("Observações:", 20, 90);
  doc.text(notes, 20, 100, { maxWidth: 260 });

  // Página 8 - fundo 8.png
  doc.addPage("a4", "landscape");
  await adicionarFundo(doc, "assets/img/proposta/8.png");

  // Salvar PDF
  doc.save("proposta.pdf");
}

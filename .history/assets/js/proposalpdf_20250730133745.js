document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("proposalgeneratepdf");
  if (btn) {
    btn.addEventListener("click", gerarPDF);
  }
});

async function gerarPDF() {
  const { jsPDF } = window.jspdf;

  // Página 1: em branco, modo paisagem
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Página 2: com imagem de fundo (2.png)
  doc.addPage("a4", "portrait");
  const img = new Image();
  img.src = "assets/img/proposta/2.png";
  await img.decode();
  doc.addImage(img, "PNG", 0, 0, 210, 297); // largura x altura de A4

  // Página 3: dados do formulário
  doc.addPage("a4", "portrait");

  const nomeCliente = document.getElementById("proposalclientname")?.value || "—";
  const pagamento = document.getElementById("proposalpayment")?.value || "—";
  const motor = document.getElementById("proposalmotorconfig")?.value || "—";

  doc.setFontSize(14);
  doc.text(`Nome do cliente: ${nomeCliente}`, 20, 40);
  doc.text(`Forma de pagamento: ${pagamento}`, 20, 60);
  doc.text(`Configuração do motor: ${motor}`, 20, 80);

  // Finalizar
  doc.save("proposta.pdf");
}

// Função para gerar PDF A4 paisagem com marcações de régua
document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('proposalgeneratepdf');
    if (btn) {
        btn.addEventListener('click', function () {
            var doc = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            var pageWidth = doc.internal.pageSize.getWidth();
            var pageHeight = doc.internal.pageSize.getHeight();

            // Teste: escreva um texto para garantir que o PDF está sendo gerado
            doc.setFontSize(20);
            doc.setTextColor(255, 0, 0);
            doc.text('Teste PDF - Clique funcionou', 20, 20);

            // Carregar imagem de fundo
            var img = new window.Image();
            img.onload = function() {
                doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
                doc.save("proposta.pdf");
            };
            img.onerror = function() {
                // Se a imagem falhar, ainda salva o PDF com o texto de teste
                doc.save("proposta.pdf");
            };
            img.src = '/assets/img/proposta/2.png';
        });
    }
});
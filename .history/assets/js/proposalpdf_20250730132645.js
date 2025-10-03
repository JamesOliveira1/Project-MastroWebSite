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

            var img = new Image();
            img.onload = function() {
                doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
                doc.save("proposta.pdf");
            };
            img.src = '/assets/img/proposta/2.png';
        });
    }
});
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
            doc.setFontSize(6);

            // marcações horizontais
            for (let y = 10; y < 200; y += 10) {
                doc.text(`${y}mm`, 2, y);
                doc.line(10, y, 287, y);
            }

            // marcações verticais
            for (let x = 10; x < 287; x += 10) {
                doc.text(`${x}mm`, x, 7);
                doc.line(x, 10, x, 200);
            }

            doc.save("regua.pdf");
        });
    }
});
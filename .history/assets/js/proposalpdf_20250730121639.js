// Função para gerar PDF A4 paisagem com 3 páginas e imagens de fundo
document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('proposalgeneratepdf');
    if (btn) {
        btn.addEventListener('click', function () {
            // jsPDF v2.x (window.jspdf.jsPDF)
            var doc = new window.jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Caminhos das imagens (use caminho relativo ao HTML)
            var imgs = [
                'assets/img/proposta/1.png',
                'assets/img/proposta/2.png',
                'assets/img/proposta/8.png'
            ];

            // Tamanho da página A4 paisagem em mm
            var pageWidth = doc.internal.pageSize.getWidth();
            var pageHeight = doc.internal.pageSize.getHeight();

            // Carregar imagens e adicionar ao PDF
            var loaded = 0;
            var imgDataArr = [];

            imgs.forEach(function (src, idx) {
                var img = new window.Image();
                img.crossOrigin = ""; // tente vazio para imagens locais
                img.onload = function () {
                    // Ajusta o canvas para o tamanho da página PDF
                    var canvas = document.createElement('canvas');
                    canvas.width = pageWidth * 4; // jsPDF usa 1mm = 4px (aprox)
                    canvas.height = pageHeight * 4;
                    var ctx = canvas.getContext('2d');
                    // Preenche o canvas com branco (evita fundo preto)
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // Desenha a imagem ajustando para o tamanho do canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    var dataUrl = canvas.toDataURL('image/png');
                    imgDataArr[idx] = dataUrl;
                    loaded++;
                    if (loaded === imgs.length) {
                        // Todas as imagens carregadas, montar PDF
                        imgDataArr.forEach(function (imgData, i) {
                            if (i > 0) doc.addPage('a4', 'landscape');
                            if (imgData)
                                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                        });
                        doc.save('proposta.pdf');
                    }
                };
                img.onerror = function () {
                    loaded++;
                    imgDataArr[idx] = null;
                    if (loaded === imgs.length) {
                        imgDataArr.forEach(function (imgData, i) {
                            if (i > 0) doc.addPage('a4', 'landscape');
                            if (imgData)
                                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                        });
                        doc.save('proposta.pdf');
                    }
                };
                img.src = src;
            });
        });
    }
});




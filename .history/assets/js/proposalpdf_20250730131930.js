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
                var img = new window.Image();
                img.crossOrigin = ""; // tente vazio para imagens locais
                img.onload = function () {
                    // Ajusta o canvas para o tamanho da página PDF
                    var canvas = document.createElement('canvas');
                    canvas.width = pageWidth * 4; // jsPDF usa 1mm = 4px (aprox)
                    canvas.height = pageHeight * 4;
                    var ctx = canvas.getContext('2d');
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    var dataUrl = canvas.toDataURL('image/png');
                    imgDataArr[idx] = dataUrl;
                    loaded++;
                    if (loaded === imgs.length) {
                        imgDataArr.forEach(function (imgData, i) {
                            if (i > 0) doc.addPage('a4', 'landscape');
                            // Teste: escreva um texto no topo de cada página
                            doc.setFontSize(18);
                            doc.setTextColor(200, 0, 0);
                            doc.text('Página ' + (i + 1) + ' - Teste de texto', 20, 20);
                            // Se a imagem foi carregada, desenhe-a
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
                            doc.setFontSize(18);
                            doc.setTextColor(200, 0, 0);
                            doc.text('Página ' + (i + 1) + ' - Teste de texto', 20, 20);
                            if (imgData)
                                doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                        });
                        doc.save('proposta.pdf');
                    }
                };
                // Caminho relativo correto para assets/img/proposta/ a partir de assets/js/
                img.src = '../img/proposta/' + src.split('/').pop();
            });
        });
    }
});




//  
// Preencher ano e data automaticamente
              document.addEventListener('DOMContentLoaded', function () {
                var now = new Date();
                document.getElementById('proposalyear').value = now.getFullYear();
                document.getElementById('proposaldate').value = now.toISOString().split('T')[0];
              });
////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
  const nameInput = document.getElementById('proposalclientname');

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      let words = nameInput.value
        .toLowerCase()
        .split(/(\s+)/) // <-- separa também os espaços
        .map(word => {
          return word.trim() ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        });

      nameInput.value = words.join('');
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('proposalvalue');

  // Apenas formata ao sair do campo
  input.addEventListener('blur', function () {
    const raw = input.value;

    if (!raw) {
      input.value = '0,00';
      return;
    }

    // Converte ponto para vírgula, se necessário
    let sanitized = raw.replace(/\./g, '').replace(',', '.');

    // Tenta transformar em número
    const number = parseFloat(sanitized);

    if (isNaN(number)) {
      input.value = '0,00';
      return;
    }

    // Converte para formato brasileiro
    input.value = number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });
});


////////////////////////////////////////////////
////////////////////////////////////////////////

/// Não funciona JPEG no PDF

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const mastroproposta = {
    "7CC": {
        foto1: "assets/img/produtos/7CC/fotox.jpg",
        foto2: "assets/img/produtos/7CC/fotoy.jpg",
        foto3: "assets/img/produtos/7CC/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Center Console" },
            { name: "Comprimento: 7,30m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 1400Kg" },
            { name: "Água: 50L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x150HP" },
            { name: "Passageiros: 6" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "4 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em inox 316l" },
            { name: "WC elétrico" }
        ],
        options: [
            { name: "Capa de Proteção", price: "3500.00" },
            { name: "Carreta de encalhe", price: "22815.00" },
            { name: "Guincho elétrico", price: "7230.60" },
            { name: "Kit de lavagem de deck", price: "1100.00" },
            { name: "Luz subaquática (par)", price: "1028.00" },
            { name: "Pintura de casco", price: "6000.00" },
            { name: "Piso sintético em EVA", price: "8745.30" },
            { name: "Toldo articulado", price: "4780.00" },
            { name: "T-Top", price: "9200.00" },
        ],
        powers: [
            { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
            { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
            { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
            { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
            { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "7XF": {
        foto1: "assets/img/produtos/7XF/fotox.jpg",
        foto2: "assets/img/produtos/7XF/fotoy.jpg",
        foto3: "assets/img/produtos/7XF/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XF" },
            { name: "Comprimento: 7,70m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 1400Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x150HP" },
            { name: "Passageiros: 6" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "4 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em inox 316l" },
            { name: "WC elétrico" }
        ],
        options: [
           { name: "Banheiro Fechado", price: "4200.00" },
      { name: "Caixas de peixe removíveis", price: "1640.87" },
      { name: "Capa de Proteção", price: "3500.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Fechamento frontal", price: "2446.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "6000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Solário de Proa", price: "900.00" },
      { name: "Toldo articulado", price: "4780.00" },
        ],
        powers: [
            { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
            { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
            { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
            { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
            { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "7XS": {
        foto1: "assets/img/produtos/7XS/fotox.jpg",
        foto2: "assets/img/produtos/7XS/fotoy.jpg",
        foto3: "assets/img/produtos/7XS/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XS" },
            { name: "Comprimento: 7,70m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 1400Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x150HP" },
            { name: "Passageiros: 6" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "4 Bombas de porão com automático" },
            { name: "Escada de popa em aço inox" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Luzes de navegação" },
            { name: "Posto de comando fechado" }
        ],
        options: [
              { name: "2 vigias laterais", price: "2423.36" },
      { name: "Assentos rebatíveis de popa", price: "2210.00" },
      { name: "Caixas de peixe removíveis", price: "1640.87" },
      { name: "Capa de Proteção", price: "3500.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Chuveiro de popa", price: "1000.00" },
      { name: "Corrimão de popa", price: "1800.00" },
      { name: "Farol de busca", price: "5270.40" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Luz de proa", price: "2220.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "6000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Porta-caniço no costado", price: "280.00" },
      { name: "Verdugo de borracha 40mm", price: "7800.00" },
      { name: "WC elétrico", price: "4646.56" },
        ],
        powers: [
            { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
            { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
            { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
            { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
            { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8CC": {
        foto1: "assets/img/produtos/8CC/fotox.jpg",
        foto2: "assets/img/produtos/8CC/fotoy.jpg",
        foto3: "assets/img/produtos/8CC/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Center Console" },
            { name: "Comprimento: 8,70m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 1800Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x150HP" },
            { name: "Passageiros: 8" }
        ],
        serieitens: [
            { name: "Assentos rebatíveis de popa" },
            { name: "6 Bombas de porão com automático" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Luzes de navegação" },
            { name: "Porta caniço no costado" }
        ],
        options: [
              { name: "Caixas de peixe removíveis", price: "1640.87" },
      { name: "Capa de Proteção", price: "3500.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Farol de busca", price: "5270.40" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Piso sintético em EVA", price: "8745.30" },
      { name: "Toldo articulado", price: "4780.00" },
      { name: "T-Top", price: "9200.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
            { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
      { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
      { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
      { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
      { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8XF": {
        foto1: "assets/img/produtos/8XF/fotox.jpg",
        foto2: "assets/img/produtos/8XF/fotoy.jpg",
        foto3: "assets/img/produtos/8XF/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Nomad XF" },
            { name: "Comprimento: 7,70m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 1400Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x150HP" },
            { name: "Passageiros: 6" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em inox 316l" },
            { name: "WC elétrico" }
        ],
        options: [
              { name: "Banheiro Fechado", price: "4200.00" },
      { name: "Capa de Proteção", price: "3500.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Fechamento frontal", price: "2446.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Solário de Proa", price: "900.00" },
      { name: "Teto rígido", price: "14194.20" },
      { name: "Toldo articulado", price: "4780.00" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
      { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
      { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
      { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8XS": {
        foto1: "assets/img/produtos/8XS/fotox.jpg",
        foto2: "assets/img/produtos/8XS/fotoy.jpg",
        foto3: "assets/img/produtos/8XS/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XS" },
            { name: "Comprimento: 8,70m" },
            { name: "Largura: 2,45m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 2600Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 400L" },
            { name: "Motorização: 2x115HP a 2x200HP" },
            { name: "Passageiros: 8" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "6 Bombas de porão com automático" },
            { name: "Escada de popa em aço inox" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Luzes de navegação" },
            { name: "Posto de comando fechado" }
        ],
        options: [
                { name: "2 vigias laterais", price: "2423.36" },
      { name: "Ar condicionado", price: "24707.08" },
      { name: "Assentos rebatíveis de popa", price: "2210.00" },
      { name: "Capa de Proteção", price: "3500.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Chuveiro de popa", price: "1000.00" },
      { name: "Corrimão de popa", price: "1800.00" },
      { name: "Farol de busca", price: "5270.40" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Geladeira INOX 56l", price: "5722.04" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz de proa", price: "2220.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Pintura de fundo Coppercoat", price: "21000.00"},
      { name: "Piso sintético", price: "11880.00" },
      { name: "Porta-caniço no costado", price: "280.00" },
      { name: "Verdugo de borracha 40mm", price: "7800.00" },
      { name: "WC elétrico", price: "4646.56" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
      { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
      { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
      { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8.5CC": {
        foto1: "assets/img/produtos/8.5CC/fotox.jpg",
        foto2: "assets/img/produtos/8.5CC/fotoy.jpg",
        foto3: "assets/img/produtos/8.5CC/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Center Console" },
            { name: "Comprimento: 8,90m" },
            { name: "Largura: 2,95m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 2000Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 600L" },
            { name: "Motorização: 2x200HP a 2x300HP" },
            { name: "Passageiros: 10" }
        ],
        serieitens: [
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Kit de lavagem de deck" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" }
        ],
        options: [
              { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético em EVA", price: "13745.30" },
      { name: "Tanques de combustível de 310l cada", price: "1800.00" },
      { name: "Teto Rígido", price: "17280.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
              { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8.5XF": {
        foto1: "assets/img/produtos/8.5XF/fotox.jpg",
        foto2: "assets/img/produtos/8.5XF/fotoy.jpg",
        foto3: "assets/img/produtos/8.5XF/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Nomad XF" },
            { name: "Comprimento: 8,90m" },
            { name: "Largura: 2,95m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 2600Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 600L" },
            { name: "Motorização: 2x200HP a 2x300HP" },
            { name: "Passageiros: 10" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Kit de lavagem de deck" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em fibra" },
            { name: "WC elétrico" }
        ],
        options: [
              { name: "Ar condicionado", price: "24707.08" },
      { name: "Banheiro Fechado", price: "4200.00" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Duas Caixas térmicas 120l", price: "2980.00" },
      { name: "Fechamento frontal", price: "2446.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Geladeira INOX 56l", price: "5722.04" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Solário de Proa", price: "900.00" },
      { name: "Tanques de combustível de 310l cada", price: "1800.00" },
      { name: "Terrova112Libras", price: "43800.00" },
      { name: "Teto rígido", price: "14194.20" },
      { name: "Teto rígido com frontal full", price: "32199.00" },
      { name: "Toldo articulado", price: "4780.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "8.5XS": {
        foto1: "assets/img/produtos/8.5XS/fotox.jpg",
        foto2: "assets/img/produtos/8.5XS/fotoy.jpg",
        foto3: "assets/img/produtos/8.5XS/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã XS" },
            { name: "Comprimento: 8,70m" },
            { name: "Largura: 2,95m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 3000Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 600L" },
            { name: "Motorização: 2x150HP a 2x250HP" },
            { name: "Passageiros: 10" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [ 
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Luzes de navegação" },
            { name: "Posto de comando fechado" }
        ],
        options: [
              { name: "2 vigias laterais", price: "2423.36" },
      { name: "Ar condicionado", price: "24707.08" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Chuveiro de popa", price: "1000.00" },
      { name: "Corrimão de popa", price: "1800.00" },
      { name: "Farol de busca", price: "5270.40" },
      { name: "Gaiuta 19 polegadas", price: "2200.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit de lavagem de deck", price: "1100.00" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz de proa", price: "2220.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Par de ventiladores", price: "580.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Pintura de fundo antiencrustrante Coppercoat", price: "21000.00"},
      { name: "Piso sintético", price: "11880.00" },
      { name: "Porta-caniço no costado", price: "280.00" },
      { name: "Tanques de combustível de 310l cada", price: "1800.00" },
      { name: "Verdugo de borracha 40mm", price: "7800.00" },
      { name: "Viveiros de popa", price: "6322.72" },
      { name: "WC elétrico", price: "4646.56" },
        ],
        powers: [
           { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "Titan CC": {
        foto1: "assets/img/produtos/TitanCC/fotox.jpg",
        foto2: "assets/img/produtos/TitanCC/fotoy.jpg",
        foto3: "assets/img/produtos/TitanCC/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Center Console" },
            { name: "Comprimento: 11,30m" },
            { name: "Largura: 3,20m" },
            { name: "Calado: 0,38m" },
            { name: "Peso: 3600Kg" },
            { name: "Água: 100L" },
            { name: "Combustível: 1200L" },
            { name: "Motorização: 2x250HP a 2x400HP" },
            { name: "Passageiros: 16" },
        ],
        serieitens: [
            { name: "6 Bombas de porão com automático" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Kit de lavagem de deck" },
            { name: "Luzes de navegação" },
            { name: "WC elétrico" }
        ],
        options: [
              { name: "Boiler", price: "9000.00" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "35100.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Guincho elétrico", price: "6933.65" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Motores montados em cavaletes", price: "48600.00" },
      { name: "Pintura de costado", price: "18000.00" },
      { name: "Pintura de fundo Coppercoat", price: "21000.00"},
      { name: "Piso sintético em EVA", price: "13745.30" },
      { name: "Salvatagem completa", price: "3680.00" },
      { name: "Tenda de proa", price: "3570.00" },
      { name: "Teto Rígido", price: "17280.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "Cabin": {
        foto1: "assets/img/produtos/8.5XF/fotox.jpg",
        foto2: "assets/img/produtos/8.5XF/fotoy.jpg",
        foto3: "assets/img/produtos/8.5XF/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Nomad XF" },
            { name: "Comprimento: 8,90m" },
            { name: "Largura: 2,95m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 2600Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 600L" },
            { name: "Motorização: 2x200HP a 2x300HP" },
            { name: "Passageiros: 10" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Kit de lavagem de deck" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em fibra" },
            { name: "WC elétrico" }
        ],
        options: [
              { name: "Ar condicionado", price: "24707.08" },
      { name: "Banheiro Fechado", price: "4200.00" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Duas Caixas térmicas 120l", price: "2980.00" },
      { name: "Fechamento frontal", price: "2446.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Geladeira INOX 56l", price: "5722.04" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Solário de Proa", price: "900.00" },
      { name: "Tanques de combustível de 310l cada", price: "1800.00" },
      { name: "Terrova112Libras", price: "43800.00" },
      { name: "Teto rígido", price: "14194.20" },
      { name: "Teto rígido com frontal full", price: "32199.00" },
      { name: "Toldo articulado", price: "4780.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    "Commuter": {
        foto1: "assets/img/produtos/8.5XF/fotox.jpg",
        foto2: "assets/img/produtos/8.5XF/fotoy.jpg",
        foto3: "assets/img/produtos/8.5XF/fotoz.jpg",
        modelinfo: [
            { name: "Categoria: Catamarã Nomad XF" },
            { name: "Comprimento: 8,90m" },
            { name: "Largura: 2,95m" },
            { name: "Calado: 0,36m" },
            { name: "Peso: 2600Kg" },
            { name: "Água: 65L" },
            { name: "Combustível: 600L" },
            { name: "Motorização: 2x200HP a 2x300HP" },
            { name: "Passageiros: 10" },
            { name: "Pernoite: 2" }
        ],
        serieitens: [
            { name: "2 vigias laterais" },
            { name: "6 Bombas de porão com automático" },
            { name: "Assentos rebatíveis de popa" },
            { name: "Chuveiro de popa" },
            { name: "Escada de popa em aço inox" },
            { name: "Estofamento em courvin anti-mofo" },
            { name: "Fiação elétrica estanhada e codificada" },
            { name: "Gaiuta 19 polegadas" },
            { name: "Guarda-mancebo em inox 316l" },
            { name: "Kit de lavagem de deck" },
            { name: "Luzes de navegação" },
            { name: "Porta-caniço no costado" },
            { name: "Targa em fibra" },
            { name: "WC elétrico" }
        ],
        options: [
              { name: "Ar condicionado", price: "24707.08" },
      { name: "Banheiro Fechado", price: "4200.00" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "22815.00" },
      { name: "Duas Caixas térmicas 120l", price: "2980.00" },
      { name: "Fechamento frontal", price: "2446.00" },
      { name: "Geladeira Elétrica", price: "2950.00" },
      { name: "Geladeira INOX 56l", price: "5722.04" },
      { name: "Guincho elétrico", price: "7230.60" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Pintura de casco", price: "7000.00" },
      { name: "Piso sintético", price: "11880.00" },
      { name: "Solário de Proa", price: "900.00" },
      { name: "Tanques de combustível de 310l cada", price: "1800.00" },
      { name: "Terrova112Libras", price: "43800.00" },
      { name: "Teto rígido", price: "14194.20" },
      { name: "Teto rígido com frontal full", price: "32199.00" },
      { name: "Toldo articulado", price: "4780.00" },
      { name: "Viveiros de popa", price: "6322.72" },
        ],
        powers: [
            { name: "2 MERCURY 200 DTS", motorPrice: "261012.00" },
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
      { name: "2 MERCURY 225 DTS", motorPrice: "274485.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "Sem motor", motorPrice: "00.00" },
        ],
    },
    
};

// Preencher o select de modelos com os nomes dos modelos do mastroproposta
document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById('proposalmodel');
    if (select && typeof mastroproposta === 'object') {
        // Limpa opções existentes (exceto a primeira)
        while (select.options.length > 1) {
            select.remove(1);
        }
        Object.keys(mastroproposta).forEach(function(model) {
            var opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            select.appendChild(opt);
        });

        // Quando selecionar um modelo, preenche os campos de info, itens de série e motores
        select.addEventListener('change', function () {
            var selected = select.value;
            var infoField = document.getElementById('proposalmodelinfo');
            var seriesField = document.getElementById('proposalseriesitems');
            var motorSelect = document.getElementById('proposalmotorconfig');
            var optionsDiv = document.getElementById('proposaloptions');
            var foto1Input = document.getElementById('proposalfoto1');
            var foto2Input = document.getElementById('proposalfoto2');
            var foto3Input = document.getElementById('proposalfoto3');
            // Remove botão adicionar se já existir
            var addBtn = document.getElementById('add-opcional-btn');
            if (addBtn) addBtn.remove();

            if (selected && mastroproposta[selected]) {
                // Preencher informações do modelo
                if (infoField) {
                    infoField.value = (mastroproposta[selected].modelinfo || [])
                        .map(function(item) { return item.name; })
                        .join('\n');
                }
                // Preencher itens de série
                if (seriesField) {
                    seriesField.value = (mastroproposta[selected].serieitens || [])
                        .map(function(item) { return item.name; })
                        .join('\n');
                }
                // Preencher opções de motor
                if (motorSelect) {
                    // Limpa todas as opções
                    while (motorSelect.options.length > 0) {
                        motorSelect.remove(0);
                    }
                    // Adiciona placeholder
                    var placeholder = document.createElement('option');
                    placeholder.selected = true;
                    placeholder.disabled = true;
                    placeholder.textContent = 'Selecione o motor';
                    motorSelect.appendChild(placeholder);
                    
                    // Adiciona opções dos motores do modelo
                    var powers = mastroproposta[selected].powers || [];
                    powers.forEach(function(power) {
                        var opt = document.createElement('option');
                        opt.value = power.name;
                        opt.textContent = power.name;
                        motorSelect.appendChild(opt);
                    });

                    // OTIMIZAÇÃO: Adicionar listener para quando um motor for selecionado
                    // Usar o nome do motor diretamente com espaços (sem substituições)
                    motorSelect.addEventListener('change', function() {
                        const selectedMotor = motorSelect.value;
                        const motorImgInput = document.getElementById("proposalmotorimg");
                        
                        if (selectedMotor && selectedMotor.trim() !== "" && motorImgInput) {
                            // Usar o nome do motor diretamente com espaços
                            const motorImagePath = `assets/img/motor/${selectedMotor}.jpg`;
                            motorImgInput.value = motorImagePath;
                            
                            console.log(`Campo proposalmotorimg preenchido com: ${motorImagePath}`);
                        } else if (motorImgInput) {
                            // Limpar o campo se nenhum motor for selecionado
                            motorImgInput.value = "";
                        }
                    });
                }
                // Preencher opcionais
                if (optionsDiv) {
                    optionsDiv.innerHTML = '';
                    var options = mastroproposta[selected].options || [];
                    options.forEach(function(option) {
                        addOpcionalCheckbox(optionsDiv, option.name);
                    });
                    // Botão para adicionar novo opcional
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.id = 'add-opcional-btn';
                    btn.className = 'btn btn-sm btn-outline-primary mt-2 mb-2';
                    btn.textContent = '+ Adicionar opcional';
                    btn.onclick = function () {
                        addOpcionalCheckbox(optionsDiv, '', true);
                    };
                    optionsDiv.parentNode.appendChild(btn);
                }
                // Preencher campos hidden das fotos
                if (foto1Input) foto1Input.value = mastroproposta[selected].foto1 || '';
                if (foto2Input) foto2Input.value = mastroproposta[selected].foto2 || '';
                if (foto3Input) foto3Input.value = mastroproposta[selected].foto3 || '';

                // Limpar o campo da imagem do motor quando modelo muda
                const motorImgInput = document.getElementById("proposalmotorimg");
                if (motorImgInput) motorImgInput.value = '';

            } else {
                if (infoField) infoField.value = '';
                if (seriesField) seriesField.value = '';
                if (motorSelect) {
                    while (motorSelect.options.length > 0) {
                        motorSelect.remove(0);
                    }
                    var placeholder = document.createElement('option');
                    placeholder.selected = true;
                    placeholder.disabled = true;
                    placeholder.textContent = 'Selecione o motor';
                    motorSelect.appendChild(placeholder);
                }
                if (optionsDiv) {
                    optionsDiv.innerHTML = '';
                    var addBtn = document.getElementById('add-opcional-btn');
                    if (addBtn) addBtn.remove();
                }
                if (foto1Input) foto1Input.value = '';
                if (foto2Input) foto2Input.value = '';
                if (foto3Input) foto3Input.value = '';
                const motorImgInput = document.getElementById("proposalmotorimg");
                if (motorImgInput) motorImgInput.value = '';
            }
        });
    }
});

/**
 * Adiciona um checkbox de opcional ao container.
 * @param {HTMLElement} container 
 * @param {string} name 
 * @param {boolean} editable 
 */
function addOpcionalCheckbox(container, name, editable) {
    var div = document.createElement('div');
    div.className = 'form-check col-12 col-sm-6 col-md-4 opcional-extra';

    var input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.value = name || '';
    input.id = 'opcional-checkbox'; // id fixo para todos os checkboxes adicionados manualmente

      if (editable) {
    input.checked = true;
  }

    var label;
    if (editable) {
        label = document.createElement('input');
        label.type = 'text';
        label.className = 'form-control form-control-sm d-inline-block ms-2';
        label.style.width = '70%';
        label.placeholder = 'Nome do opcional';
        label.id = 'opcional-nome'; // id fixo para todos os inputs de nome
        label.oninput = function () {
            input.value = label.value;
        };
        // Remove opcional extra
        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-sm text-danger p-0 ms-2';
        removeBtn.title = 'Remover';
        removeBtn.innerHTML = '&times;';
        removeBtn.id = 'opcional-remove'; // id fixo para todos os botões de remover
        removeBtn.onclick = function () {
            div.remove();
        };
        div.appendChild(input);
        div.appendChild(label);
        div.appendChild(removeBtn);
    } else {
        label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = input.id;
        label.textContent = name;
        div.appendChild(input);
        div.appendChild(label);
    }
    container.appendChild(div);
}

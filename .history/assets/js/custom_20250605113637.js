////////////////////////////////////////////////
////////////////////////////////////////////////

/* Itens Sem Foto = {
  
2 vigias laterais
Boiler
Chuveiro de popa
Corrimão de popa
Duas Caixas térmicas 120l
Espaço Gourmet
Gaiuta 19 polegadas
Geladeira INOX 56l
Gerador a diesel 4KVA
Guincho elétrico
Kit painel solar
Luz de proa
Mesa de cabine
Mesa de proa
Motores montados em cavaletes
Par de ventiladores
Pintura de casco
Pintura de costado
Salvatagem completa
Solário de Proa
Tanques de combustível de 310l cada
Tenda de proa
T-Top
Teto rígido
Teto rígido com frontal full
Verdugo de borracha 40mm
Viveiros de popa
WC elétrico

}*/

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

//Modelos de barco com itens de série, opcionais, motores e preços
const boatOptions = {
  "7CC": {
    description: "7CC - O mais ágil da linha Nomad.",
    itens:
      "2 vigias laterais, 4 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Guarda-mancebo em inox 316l, Luzes de navegação, Porta-caniço no costado, Targa em inox 316l, WC elétrico",
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
    ],
    basePrice: "442781.78",
  },
  ///////////////////////////////////////  ///////////////////////////
  "7XF": {
    description: "7XF - Versátil e eficiente",
    itens:
      "2 vigias laterais, 4 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Guarda-mancebo em inox 316l, Luzes de navegação, Porta-caniço no costado, Targa em inox 316l, WC elétrico",
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
    ],
    basePrice: "568531.05",
  },
  "7XS": {
    description: "7XS - Leve e econômico para práticas náuticas.",
    itens:
      "4 Bombas de porão com automático, Escada de popa em aço inox, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Luzes de navegação, Posto de comando fechado",
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
    ],
    powers: [
      { name: "2 MERCURY EFI 115", motorPrice: "167908.00" },
      { name: "2 MERCURY EFI 150", motorPrice: "207035.00" },
      { name: "2 SUZUKI 140hp", motorPrice: "202182.00" },
      { name: "2 YAMAHA 150hp", motorPrice: "207035.00" },
    ],
    basePrice: "541388.79",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8CC": {
    description: "8CC - Muito espaço para pesca.",
    itens:
      "Assentos rebatíveis de popa, 6 Bombas de porão com automático, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Luzes de navegação, Porta caniço no costado",
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
      { name: "2 YAMAHA 200 4 DI", motorPrice: "285310.00" },
    ],
    basePrice: "533366.73",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8XF": {
    description: "8XF - Catamarã de alta performance com cabine espaçosa.",
    itens:
      "2 vigias laterais, 6 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Guarda-mancebo em inox 316l, Luzes de navegação, Porta-caniço no costado, Targa em inox 316l, WC elétrico",
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
    ],
    basePrice: "690577.82",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8XS": {
    description: "8XS - Desenvolvida para atividades de prática.",
    itens:
      "6 Bombas de porão com automático, Escada de popa em aço inox, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Luzes de navegação, Posto de comando fechado",
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
      {
        name: "Pintura de fundo antiencrustrante Coppercoat",
        price: "21000.00",
      },
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
    ],
    basePrice: "731077.82",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8.5XS": {
    description: "8.5XS - Catamarã de apoio para atividades de prática.",
    itens:
      "6 Bombas de porão com automático, Assentos rebatíveis de popa, Escada de popa em aço inox, Fiação elétrica estanhada e codificada, Guarda-mancebo em inox 316l, Luzes de navegação, Posto de comando fechado",
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
      {
        name: "Pintura de fundo antiencrustrante Coppercoat",
        price: "21000.00",
      },
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
    ],
    basePrice: "875134.66",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8.5CC": {
    description: "8.5CC - Muito espaço e qualidade para pesca.",
    itens:
      "6 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Kit de lavagem de deck, Luzes de navegação, Porta-caniço no costado",
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
    ],
    basePrice: "855893.92",
  },
  ///////////////////////////////////////  ///////////////////////////
  "8.5XF": {
    description: "8.5XF - Conforto e proteção em um catamarã top de linha.",
    itens:
      "2 vigias laterais, 6 Bombas de porão com automático, Assentos rebatíveis de popa, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Gaiuta 19 polegadas, Guarda-mancebo em inox 316l, Kit de lavagem de deck, Luzes de navegação, Porta-caniço no costado, Targa em fibra, WC elétrico",
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
    ],
    basePrice: "949217.14",
  },
  ///////////////////////////////////////  ///////////////////////////
  "Commuter": {
    description: "Commuter - Máxima proteção em qualquer clima.",
    itens:
      "6 Bombas de porão com automático, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Guarda-mancebo em inox 316l, Kit de lavagem de deck, Luzes de navegação, WC elétrico",
    options: [
      { name: "Ar condicionado", price: "24707.08" },
      { name: "Boiler", price: "9000.00" },
      { name: "Capa de Proteção", price: "5280.00" },
      { name: "Carreta de encalhe", price: "35100.00" },
      { name: "Corrimão de popa", price: "1800.00" },
      { name: "Espaço Gourmet", price: "4050.00" },
      { name: "Farol de busca", price: "5270.40" },
      { name: "Geladeira INOX 56l", price: "5722.04" },
      { name: "Gerador a diesel 4KVA", price: "95101.96" },
      { name: "Guincho elétrico", price: "6933.65" },
      { name: "Kit painel solar", price: "6979.47" },
      { name: "Luz de proa", price: "2220.00" },
      { name: "Luz subaquática (par)", price: "1028.00" },
      { name: "Mesa de cabine", price: "6920.00" },
      { name: "Mesa de proa", price: "11475.00" },
      { name: "Motores montados em cavaletes", price: "48600.00" },
      { name: "Pintura de costado", price: "18000.00" },
      {
        name: "Pintura de fundo antiencrustrante Coppercoat",
        price: "21000.00",
      },
      { name: "Piso sintético em EVA", price: "13745.30" },
      { name: "Salvatagem completa", price: "3680.00" },
      { name: "Tenda de proa", price: "3570.00" },
      { name: "Viveiros de popa", price: "6322.72" },
    ],
    powers: [
      { name: "2 MERCURY 300 SEAPRO", motorPrice: "315365.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "2 MERCURY 400 V10 VERADO JOY", motorPrice: "658581.00" },
      { name: "2 SUZUKI 325hp", motorPrice: "520330.50" },
      { name: "2 YAMAHA 300hp", motorPrice: "289863.00" },
      { name: "2 YAMAHA 350hp", motorPrice: "489422.04" },
      { name: "2 YAMAHA 450hp", motorPrice: "675560.00" },
    ],
    basePrice: "1662748.60",
  },
  ///////////////////////////////////////  ///////////////////////////
  "TitanCC": {
    description: "Titan CC - Alta qualidade e console central.",
    itens:
      "6 Bombas de porão com automático, Chuveiro de popa, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Guarda-mancebo em inox 316l, Kit de lavagem de deck, Luzes de navegação, WC elétrico",
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
      {
        name: "Pintura de fundo antiencrustrante Coppercoat",
        price: "21000.00",
      },
      { name: "Piso sintético em EVA", price: "13745.30" },
      { name: "Salvatagem completa", price: "3680.00" },
      { name: "Tenda de proa", price: "3570.00" },
      { name: "Teto Rígido", price: "17280.00" },
      { name: "Viveiros de popa", price: "6322.72" },
    ],
    powers: [
      { name: "2 MERCURY 300 SEAPRO", motorPrice: "315365.00" },
      { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
      { name: "2 MERCURY 300 VERADO com JOY", motorPrice: "513289.00" },
      { name: "2 MERCURY 350 V10 VERADO JOY", motorPrice: "551975.60" },
      { name: "2 MERCURY 400 V10 VERADO JOY", motorPrice: "658581.00" },
      { name: "2 MERCURY 450 RACING", motorPrice: "881267.00" },
      { name: "2 SUZUKI 325hp", motorPrice: "520330.50" },
      { name: "2 YAMAHA 200hp", motorPrice: "285310.00" },
      { name: "2 YAMAHA 300hp", motorPrice: "289863.00" },
      { name: "2 YAMAHA 350hp", motorPrice: "489422.04" },
      { name: "2 YAMAHA 450hp", motorPrice: "675560.00" },
    ],
    basePrice: "1322672.82",
  },
  ///////////////////////////////////////  ///////////////////////////
  "Cabin": {
  description: "Cabin - Catamarã com console central e cabine.",
  itens: "6 Bombas de porão com automático, Escada de popa em aço inox, Estofamento em courvin anti-mofo, Fiação elétrica estanhada e codificada, Luzes de navegação, WC elétrico",
  options: [
    { name: "Capa de Proteção", price: "5280.00" },
    { name: "Corrimão de popa", price: "1800.00" },
    { name: "Carreta de encalhe", price: "35100.00" },
    { name: "Geladeira Elétrica", price: "2950.00" },
    { name: "Guincho elétrico", price: "6933.65" },
    { name: "Kit de lavagem de deck", price: "1100.00" },
    { name: "Kit painel solar", price: "6979.47" },
    { name: "Luz de proa", price: "2220.00" },
    { name: "Luz subaquática (par)", price: "1028.00" },
    { name: "Mesa de cabine", price: "6920.00" },
    { name: "Mesa de proa", price: "11475.00" },
    { name: "Motores montados em cavaletes", price: "48600.00" },
    { name: "Pintura de costado", price: "18000.00" },
    { name: "Piso sintético em EVA", price: "13745.30" },
    { name: "Salvatagem completa", price: "3680.00" },
    { name: "Tenda de proa", price: "3570.00" },
    { name: "Viveiros de popa", price: "6322.72" }
  ],
  powers: [
    { name: "2 MERCURY 300 VERADO", motorPrice: "397289.00" },
    { name: "2 MERCURY 400 V10 VERADO JOY", motorPrice: "658581.00" },
    { name: "2 MERCURY 450 RACING", motorPrice: "881267.00" },
    { name: "2 SUZUKI 300hp", motorPrice: "396185.85" },
    { name: "2 SUZUKI 325hp", motorPrice: "520330.50" },
    { name: "2 YAMAHA 300hp", motorPrice: "289863.00" },
    { name: "2 YAMAHA 350hp", motorPrice: "489422.04" },
    { name: "2 YAMAHA 450hp", motorPrice: "675560.00" }
  ],
  basePrice: "1964543.20"
}
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Calculadora de preços
function updateTotalPriceToX() {
  // Obtém os totais de Assembly, Motorization e Options
  const assemblyTotal =
    parseFloat(
      document
        .getElementById("assemblyTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  const motorizationTotal =
    parseFloat(
      document
        .getElementById("motorizationTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  const optionsTotal =
    parseFloat(
      document
        .getElementById("optionsTotal")
        .textContent.replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;

  // Calcula o Total Price
  const totalPrice = assemblyTotal + motorizationTotal + optionsTotal;

  // Formata os valores para exibição
  const formattedAssemblyTotal = assemblyTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedMotorizationTotal = motorizationTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedOptionsTotal = optionsTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const formattedTotalPrice = totalPrice.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  // Atualiza os elementos da página com os totais formatados
  document.getElementById("assemblyTotal").textContent = formattedAssemblyTotal;
  document.getElementById("motorizationTotal").textContent =
    formattedMotorizationTotal;
  document.getElementById("optionsTotal").textContent = formattedOptionsTotal;
  document.getElementById("totalPrice").textContent = formattedTotalPrice;

  // Atualiza os campos ocultos com os valores formatados no padrão brasileiro
  document.getElementById("hiddenAssemblyTotal").value = formattedAssemblyTotal
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
  document.getElementById("hiddenMotorizationTotal").value =
    formattedMotorizationTotal
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(".", ",");
  document.getElementById("hiddenOptionsTotal").value = formattedOptionsTotal
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
  document.getElementById("hiddenTotalPrice").value = formattedTotalPrice
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(".", ",");
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Escolha do barco e construção da tela
document.querySelectorAll(".boat-option").forEach((option) => {
  option.addEventListener("click", function () {
    const type = this.dataset.type;
    const selectedBoat = boatOptions[type];

    // Resetar os valores dos opcionais e motorização ao trocar de barco
    document.getElementById("motorizationTotal").textContent = "R$ 0,00"; // Resetando motorização
    document.getElementById("optionsTotal").textContent = "R$ 0,00"; // Resetando opcionais

    // Atualização da imagem principal e descrição
    document.getElementById(
      "selectedImage"
    ).src = `./assets/img/produtos/${type}/fotoprincipal.jpg`;
    document.getElementById("selectedDescription").textContent =
      selectedBoat.description;

    // Atualizar o preço base do barco
    const basePrice = parseFloat(selectedBoat.basePrice);
    const formattedBasePrice = basePrice.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    document.getElementById("assemblyTotal").textContent = formattedBasePrice;
    updateTotalPriceToX();

    // Atualização da lista de itens
    const ul = document.getElementById("selectedItens");
    ul.innerHTML = "";
    const itensArray = selectedBoat.itens.split(", ");
    itensArray.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });

    // Atualização das opções
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    selectedBoat.options.forEach((option) => {
      const optionDiv = document.createElement("div");
      const optionInput = document.createElement("input");
      optionInput.type = "checkbox";
      optionInput.name = "option";
      optionInput.value = option.price; // Use o valor do preço aqui para facilitar o cálculo
      optionInput.dataset.name = option.name; // Adiciona o nome da opção como dataset
      const optionLink = document.createElement("a");
      optionLink.href = "#";

      const price = parseFloat(option.price);
      const formattedPrice = price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      optionLink.innerHTML = `${option.name} <span class="option-price">-  ${formattedPrice}</span>`;
      optionLink.className = "option-link";
      optionLink.onclick = function (event) {
        event.preventDefault();
        const selectedOptionalImage = document.getElementById(
          "selectedOptionalImage"
        );
        const imagePath = `./assets/img/options/${option.name}.jpg`;

        const img = new Image();
        img.onload = function () {
          selectedOptionalImage.src = imagePath;
        };
        img.onerror = function () {
          selectedOptionalImage.src = "./assets/img/options/no-image.jpg";
        };

        img.src = imagePath;
        selectedOptionalImage.classList.remove("hidden");
        document.getElementById(
          "itemPrice"
        ).textContent = `Preço do item: ${formattedPrice}`;
        document
          .getElementById("selectedOptionalPrice")
          .classList.remove("hidden");
      };

      // Evento de mudança para somar ou subtrair do total
      optionInput.addEventListener("change", function () {
        updateOptionsTotal();
      });

      optionDiv.appendChild(optionInput);
      optionDiv.appendChild(optionLink);
      optionsContainer.appendChild(optionDiv);
    });

    // Função para atualizar o total dos opcionais
    function updateOptionsTotal() {
      let total = 0;
      document
        .querySelectorAll('input[name="option"]:checked')
        .forEach((checkbox) => {
          total += parseFloat(checkbox.value);
        });
      const formattedTotal = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      document.getElementById("optionsTotal").textContent = formattedTotal;
      updateTotalPriceToX();
    }

    // Atualização dos motores
    const motorContainer = document.getElementById("motorOptionsContainer");
    motorContainer.innerHTML = ""; // Limpa o contêiner antes de adicionar os novos motores

    selectedBoat.powers.forEach((power, index) => {
      const containerBox = document.createElement("div");
      containerBox.classList.add("containerbox");

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `motor-${index}`;
      input.className = "motor-checkbox";
      input.dataset.price = power.motorPrice;

      const label = document.createElement("label");
      label.setAttribute("for", `motor-${index}`);

      const img = document.createElement("img");
      img.src = `./assets/img/motor/${power.name}.jpg`;

      const motorNameDiv = document.createElement("div");
      motorNameDiv.className = "motorname";
      motorNameDiv.textContent = power.name;

      label.appendChild(img);
      label.appendChild(motorNameDiv);

      containerBox.appendChild(input);
      containerBox.appendChild(label);
      motorContainer.appendChild(containerBox);
    });

    // Adicionar eventos aos novos checkboxes
    addMotorCheckboxEvent();

    // Mostrar seções relacionadas
    document.getElementById("selectedBoat").classList.remove("hidden");
    document.getElementById("optionsSection").classList.remove("hidden");
    document.getElementById("detailsSection").classList.remove("hidden");
    document.getElementById("statusandsubmit").classList.remove("hidden");

    document.querySelector(".bluecustomization").style.display = "block";

    // Marcar o barco selecionado
    document
      .querySelector(".boat-option.selected")
      ?.classList.remove("selected");
    this.classList.add("selected");

    // Ocultar imagem e preço do opcional selecionado
    document.getElementById("selectedOptionalImage").classList.add("hidden");
    document.getElementById("selectedOptionalImage").src = "";
    document.getElementById("selectedOptionalPrice").classList.add("hidden");
    document.getElementById("itemPrice").textContent = "";
  });
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Seleção de motores
function addMotorCheckboxEvent() {
  document.querySelectorAll(".motor-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Desmarcar outros checkboxes
        document.querySelectorAll(".motor-checkbox").forEach((box) => {
          if (box !== this) box.checked = false;
        });

        // Atualizar o preço da motorização
        const motorPrice = this.dataset.price;
        const formattedPrice = parseFloat(motorPrice).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        document.getElementById("motorizationTotal").textContent =
          formattedPrice;

        // Atualiza o nome do motor no input oculto
        const motorName =
          this.nextElementSibling.querySelector(".motorname").textContent;
        document.getElementById("hiddenMotorName").value = motorName; // Preenche o campo oculto com o nome do motor

        updateTotalPriceToX();
      }
    });
  });
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Envio do formulário por email
document.getElementById("customBoatForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const loadingElement = form.querySelector(".loading");
    const errorMessageElement = form.querySelector(".error-message");
    const sentMessageElement = form.querySelector(".sent-message");

    // Limpa mensagens anteriores
    errorMessageElement.style.display = "none";
    sentMessageElement.style.display = "none";

    loadingElement.style.display = "block"; // Mostra a mensagem de loading

    // Executa o reCAPTCHA v3
    grecaptcha.execute("6LfEIoYqAAAAAH-P0jb0mVzWDm4bkbmgXHpk7jsL", { action: "submit" })
      .then(function (token) {
        // Adiciona o token ao campo oculto
        document.getElementById("custom-recaptcha-response").value = token;

        const formData = new FormData(form);

        // Adiciona o tipo de barco selecionado
        const selectedBoat = form.querySelector(".boat-option.selected");
        if (selectedBoat) {
          formData.append("boatType", selectedBoat.dataset.type);
        } else {
          loadingElement.style.display = "none";
          errorMessageElement.innerHTML =
            "Por favor, selecione um modelo de barco.";
          errorMessageElement.style.display = "block";
          return;
        }

        // Adiciona os opcionais marcados com nome e preço
        const optionsChecked = form.querySelectorAll(
          'input[name="option"]:checked'
        );
        const optionsArray = Array.from(optionsChecked).map((option) => {
          return {
            name: option.dataset.name, // Acessa o nome da opção
            price: option.value, // Acessa o valor do preço da opção
          };
        });
        formData.append("options", JSON.stringify(optionsArray));

        // O cálculo dos totais já foi feito e os campos ocultos já estão preenchidos, então basta pegar os valores dos hidden inputs
        formData.append(
          "assemblyTotal",
          form.querySelector("#hiddenAssemblyTotal").value || "0"
        );
        formData.append(
          "motorizationTotal",
          form.querySelector("#hiddenMotorizationTotal").value || "0"
        );
        formData.append(
          "optionsTotal",
          form.querySelector("#hiddenOptionsTotal").value || "0"
        );
        formData.append(
          "totalPrice",
          form.querySelector("#hiddenTotalPrice").value || "0"
        );

        // Captura outros campos do formulário
        formData.append(
          "clientName",
          form.querySelector("#clientName").value || ""
        );
        formData.append(
          "clientContact",
          form.querySelector("#clientContact").value || ""
        );
        formData.append(
          "budgetDate",
          form.querySelector("#budgetDate").value || ""
      );      
        formData.append("boatName", form.querySelector("#boatName").value || "");
        formData.append(
          "comercialRep",
          form.querySelector("#comercialRep").value || ""
        );
        formData.append(
          "emailCustom",
          form.querySelector("#emailCustom").value || ""
        );
        formData.append(
          "additionalNotes",
          form.querySelector("#additionalNotes").value || ""
        );
        formData.append(
          "hiddenMotorName",
          form.querySelector("#hiddenMotorName").value || ""
        );

        // Captura forma de pagamento
        const paymentMethod = form.querySelector(
          'input[name="paymentMethod"]:checked'
        );
        if (paymentMethod) {
          formData.append("paymentMethod", paymentMethod.value);
        }

        // Adiciona o token reCAPTCHA ao formData
        formData.append("custom-recaptcha-response", token);

        // Envia os dados do formulário via fetch
        fetch(form.action, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            loadingElement.style.display = "none"; // Esconde a mensagem de loading
            if (data.success) {
              sentMessageElement.style.display = "block"; // Mostra a mensagem de sucesso
            } else {
              errorMessageElement.innerHTML =
                data.error ||
                'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
              errorMessageElement.style.display = "block"; // Mostra a mensagem de erro
            }
          })
          .catch((error) => {
            loadingElement.style.display = "none"; // Esconde a mensagem de loading
            errorMessageElement.innerHTML =
              'Algo deu errado... Tente novamente mais tarde ou entre em contato pelo <a href="https://api.whatsapp.com/send?phone=5548991466864&text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento;" target="_blank">Whatsapp.</a>';
            errorMessageElement.style.display = "block"; // Mostra a mensagem de erro
          });
      })
      .catch(function (error) {
        loadingElement.style.display = "none"; // Esconde a mensagem de loading
        errorMessageElement.innerHTML =
          "Erro ao carregar o reCAPTCHA. Verifique sua conexão e tente novamente.";
        errorMessageElement.style.display = "block";
      });
  });

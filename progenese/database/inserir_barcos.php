<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/conexao.php';

try {
    $pdo = getConnection();
    
    // Lista consolidada de motores extraída de custom.js
    $motoresData = [];

    // Lista de motores (Nome => Valor)
    $listaMotores = [
        ["2 MERCURY EFI 115", "167908.00"],
        ["2 MERCURY EFI 150", "207035.00"],
        ["2 SUZUKI 140hp", "202182.00"],
        ["2 YAMAHA 150hp", "207035.00"],
        ["2 MERCURY 200 DTS", "261012.00"],
        ["2 YAMAHA 200 4 DI", "285310.00"],
        ["2 MERCURY 225 DTS", "293089.00"],
        ["2 MERCURY 300 VERADO", "397289.00"],
        ["2 MERCURY 300 VERADO com JOY", "513289.00"],
        ["2 MERCURY 300 SEAPRO", "315365.00"],
        ["2 MERCURY 400 V10 VERADO JOY", "658581.00"],
        ["2 SUZUKI 325hp", "520330.50"],
        ["2 YAMAHA 300hp", "386253.00"],
        ["2 YAMAHA 350hp", "489422.04"],
        ["2 YAMAHA 450hp", "675560.00"],
        ["2 MERCURY 350 V10 VERADO JOY", "551975.60"],
        ["2 MERCURY 450 RACING", "881267.00"],
        ["2 SUZUKI 300hp", "396185.85"],
        ["2 YAMAHA 200hp", "285310.00"],
        ["Sem motor", "0.00"]
    ];

    foreach ($listaMotores as $motor) {
        $nome = $motor[0];
        $valor = floatval($motor[1]);
        $img = $nome . ".JPG"; // Formato solicitado: Nome do motor.JPG

        // Se já existe, sobrescreve (garante unicidade pelo nome na lista final)
        $motoresData[$nome] = ['valor' => $valor, 'img' => $img];
    }

    echo "Iniciando atualização de motores...\n";

    $checkSql = "SELECT id FROM site_motor WHERE motor = :motor";
    $updateSql = "UPDATE site_motor SET valor = :valor, img = :img WHERE id = :id";
    $insertSql = "INSERT INTO site_motor (motor, valor, img) VALUES (:motor, :valor, :img)";

    $checkStmt = $pdo->prepare($checkSql);
    $updateStmt = $pdo->prepare($updateSql);
    $insertStmt = $pdo->prepare($insertSql);

    foreach ($motoresData as $nome => $dados) {
        $checkStmt->execute([':motor' => $nome]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $updateStmt->execute([
                ':valor' => $dados['valor'],
                ':img' => $dados['img'],
                ':id' => $existing['id']
            ]);
            echo "Atualizado: {$nome}\n";
        } else {
            $insertStmt->execute([
                ':motor' => $nome,
                ':valor' => $dados['valor'],
                ':img' => $dados['img']
            ]);
            echo "Inserido: {$nome}\n";
        }
    }

    echo "Concluído com sucesso!\n";

    $listaOpcionais = [
        ["Capa de Proteção modelo 7", "3500.00"],
        ["Capa de Proteção modelo 8.5", "5280.00"],
        ["Carreta de encalhe", "22815.00"],
        ["Guincho elétrico", "7230.60"],
        ["Luz subaquática (par)", "1028.00"],
        ["Pintura de casco", "7000.00"],
        ["Piso sintético em EVA", "8745.30"],
        ["Toldo articulado", "4780.00"],
        ["T-Top", "9200.00"],
        ["Banheiro Fechado", "4200.00"],
        ["Caixas de peixe removíveis", "1640.87"],
        ["Fechamento frontal", "2446.00"],
        ["Geladeira Elétrica", "2950.00"],
        ["Piso sintético", "11880.00"],
        ["Solário de Proa", "900.00"],
        ["2 vigias laterais", "2423.36"],
        ["Assentos rebatíveis de popa", "2210.00"],
        ["Chuveiro de popa", "1000.00"],
        ["Corrimão de popa", "1800.00"],
        ["Farol de busca", "5270.40"],
        ["Luz de proa", "2220.00"],
        ["Porta-caniço no costado", "280.00"],
        ["Verdugo de borracha 40mm", "7800.00"],
        ["WC elétrico", "4646.56"],
        ["Viveiros de popa", "6322.72"],
        ["Ar condicionado", "24707.08"],
        ["Geladeira INOX 56l", "5722.04"],
        ["Kit painel solar", "6979.47"],
        ["Pintura de fundo antiencrustrante Coppercoat", "21000.00"],
        ["Gaiuta 19 polegadas", "2200.00"],
        ["Par de ventiladores", "580.00"],
        ["Tanques de combustível de 310l cada", "1800.00"],
        ["Teto Rígido", "17280.00"],
        ["Teto rígido", "14194.20"],
        ["Teto rígido com frontal full", "32199.00"],
        ["Duas Caixas térmicas 120l", "2980.00"],
        ["Terrova112Libras", "43800.00"],
        ["Espaço Gourmet", "4050.00"],
        ["Mesa de cabine", "6920.00"],
        ["Mesa de proa", "11475.00"],
        ["Motores montados em cavaletes", "48600.00"],
        ["Pintura de costado", "18000.00"],
        ["Salvatagem completa", "3680.00"],
        ["Tenda de proa", "3570.00"],
        ["Gerador a diesel 4KVA", "95101.96"]
    ];

    $opcionaisData = [];
    foreach ($listaOpcionais as $op) {
        $name = $op[0];
        $price = (float)$op[1];
        $key = mb_strtolower($name, 'UTF-8');
        if (!isset($opcionaisData[$key])) {
            $opcionaisData[$key] = [
                'opcional' => $name,
                'valor' => $price,
                'img' => $key . '.jpg'
            ];
        }
    }

    $checkOptSql = "SELECT id FROM site_opcionais WHERE opcional = :opcional";
    $insertOptSql = "INSERT INTO site_opcionais (opcional, valor, img) VALUES (:opcional, :valor, :img)";
    $checkOptStmt = $pdo->prepare($checkOptSql);
    $insertOptStmt = $pdo->prepare($insertOptSql);
    foreach ($opcionaisData as $dados) {
        $checkOptStmt->execute([':opcional' => $dados['opcional']]);
        $existingOpt = $checkOptStmt->fetch(PDO::FETCH_ASSOC);
        if (!$existingOpt) {
            $insertOptStmt->execute([
                ':opcional' => $dados['opcional'],
                ':valor' => $dados['valor'],
                ':img' => $dados['img']
            ]);
            echo "Inserido opcional: {$dados['opcional']}\n";
        } else {
            echo "Ignorado opcional (já existe): {$dados['opcional']}\n";
        }
    }
    echo "Atualização de opcionais concluída.\n";

    $listaItensSerie = [
        "2 vigias laterais",
        "4 Bombas de porão com automático",
        "6 Bombas de porão com automático",
        "Kit de lavagem de deck",
        "Escada de popa em aço inox",
        "Estofamento em courvin anti-mofo",
        "Fiação elétrica estanhada e codificada",
        "Gaiuta 19 polegadas",
        "Guarda-mancebo em inox 316l",
        "Luzes de navegação",
        "Porta-caniço no costado",
        "Targa em inox 316l",
        "Targa em fibra",
        "WC elétrico",
        "Posto de comando fechado"
    ];
    echo "Iniciando atualização de itens de série...\n";
    $checkSerieSql = "SELECT id FROM site_itens_de_serie WHERE item = :item";
    $insertSerieSql = "INSERT INTO site_itens_de_serie (item) VALUES (:item)";
    $checkSerieStmt = $pdo->prepare($checkSerieSql);
    $insertSerieStmt = $pdo->prepare($insertSerieSql);
    foreach ($listaItensSerie as $item) {
        $checkSerieStmt->execute([':item' => $item]);
        $existingSerie = $checkSerieStmt->fetch(PDO::FETCH_ASSOC);
        if (!$existingSerie) {
            $insertSerieStmt->execute([':item' => $item]);
            echo "Inserido item de série: {$item}\n";
        } else {
            echo "Ignorado item de série (já existe): {$item}\n";
        }
    }
    echo "Atualização de itens de série concluída.\n";

    $modelos = [
        [
            'modelo' => '7CC',
            'categoria' => 'Catamarã Center Console',
            'comprimento_m' => 7.30,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 1400,
            'agua_l' => 50,
            'combustivel_l' => 400,
            'motorizacao' => '2x115hp - 2x150hp',
            'passageiros' => 6,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 26.16,
            'autonomia_milhas' => 325.8,
            'velocidade_maxima_nos' => 49.36,
            'barco_montagem_valor' => 487059.96,
            'descricao' => '7CC - O mais ágil da linha Nomad.'
        ],
        [
            'modelo' => '7XF',
            'categoria' => 'Catamarã Nomad XF',
            'comprimento_m' => 7.70,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 1400,
            'agua_l' => 65,
            'combustivel_l' => 400,
            'motorizacao' => '2x115xp - 2x150hp',
            'passageiros' => 6,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 30.41,
            'autonomia_milhas' => 312.0,
            'velocidade_maxima_nos' => 49.53,
            'barco_montagem_valor' => 625384.15,
            'descricao' => '7XF - Versátil e eficiente.'
        ],
        [
            'modelo' => '7XS',
            'categoria' => 'Catamarã de serviços prático XS',
            'comprimento_m' => 7.70,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 1400,
            'agua_l' => 65,
            'combustivel_l' => 400,
            'motorizacao' => '2x115xp - 2x150hp',
            'passageiros' => 6,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 27.36,
            'autonomia_milhas' => 280.00,
            'velocidade_maxima_nos' => 44.57,
            'barco_montagem_valor' => 541388.79,
            'descricao' => '7XS - Leve e econômico para práticas náuticas.'
        ],
        [
            'modelo' => '8CC',
            'categoria' => 'Catamarã Center Console',
            'comprimento_m' => 8.70,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 1800,
            'agua_l' => 65,
            'combustivel_l' => 400,
            'motorizacao' => '2x115xp - 2x200hp',
            'passageiros' => 8,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 26.40,
            'autonomia_milhas' => 360.0,
            'velocidade_maxima_nos' => 43.70,
            'barco_montagem_valor' => 660041.32,
            'descricao' => '8CC - Muito espaço para pesca.'
        ],
        [
            'modelo' => '8XF',
            'categoria' => 'Catamarã Nomad XF',
            'comprimento_m' => 8.70,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 1800,
            'agua_l' => 65,
            'combustivel_l' => 360,
            'motorizacao' => '2x150hp',
            'passageiros' => 8,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 26.40,
            'autonomia_milhas' => 360.0,
            'velocidade_maxima_nos' => 43.70,
            'barco_montagem_valor' => 759635.60,
            'descricao' => '8XF - Catamarã de alta performance com cabine espaçosa.'
        ],
        [
            'modelo' => '8XS',
            'categoria' => 'Catamarã de serviços prático XS',
            'comprimento_m' => 8.70,
            'largura_m' => 2.45,
            'calado_m' => 0.36,
            'peso_kg' => 2600,
            'agua_l' => 65,
            'combustivel_l' => 400,
            'motorizacao' => '2x115hp-2x200hp',
            'passageiros' => 8,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 22.30,
            'autonomia_milhas' => 228.72,
            'velocidade_maxima_nos' => 43.40,
            'barco_montagem_valor' => 731077.82,
            'descricao' => '8XS - Desenvolvida para atividades de prática.'
        ],
        [
            'modelo' => '8.5CC',
            'categoria' => 'Catamarã Center Console',
            'comprimento_m' => 8.90,
            'largura_m' => 2.95,
            'calado_m' => 0.36,
            'peso_kg' => 2000,
            'agua_l' => 65,
            'combustivel_l' => 600,
            'motorizacao' => '2x200hp-2x300hp',
            'passageiros' => 10,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 21.10,
            'autonomia_milhas' => 274.74,
            'velocidade_maxima_nos' => 54.60,
            'barco_montagem_valor' => 855893.92,
            'descricao' => '8.5CC - Muito espaço e qualidade para pesca.'
        ],
        [
            'modelo' => '8.5XF',
            'categoria' => 'Catamarã Nomad XF',
            'comprimento_m' => 8.90,
            'largura_m' => 2.95,
            'calado_m' => 0.36,
            'peso_kg' => 2600,
            'agua_l' => 65,
            'combustivel_l' => 600,
            'motorizacao' => '2x200hp-2x300hp',
            'passageiros' => 10,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 20.00,
            'autonomia_milhas' => 286.53,
            'velocidade_maxima_nos' => 50.00,
            'barco_montagem_valor' => 949217.14,
            'descricao' => '8.5XF - Conforto e proteção em um catamarã top de linha.'
        ],
        [
            'modelo' => '8.5XS',
            'categoria' => 'Catamarã de serviços prático XS',
            'comprimento_m' => 8.70,
            'largura_m' => 2.95,
            'calado_m' => 0.36,
            'peso_kg' => 3000,
            'agua_l' => 65,
            'combustivel_l' => 600,
            'motorizacao' => '2x150hp-2x250hp',
            'passageiros' => 10,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 17.64,
            'autonomia_milhas' => 400.00,
            'velocidade_maxima_nos' => 37.62,
            'barco_montagem_valor' => 875134.66,
            'descricao' => '8.5XS - Catamarã de apoio para atividades de prática.'
        ],
        [
            'modelo' => 'Cabin',
            'categoria' => 'Catamarã XF',
            'comprimento_m' => 11.35,
            'largura_m' => 3.20,
            'calado_m' => 0.42,
            'peso_kg' => 3800,
            'agua_l' => 120,
            'combustivel_l' => 1200,
            'motorizacao' => '2x300hp-2x400hp',
            'passageiros' => 16,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 19.60,
            'autonomia_milhas' => 445.00,
            'velocidade_maxima_nos' => 41.18,
            'barco_montagem_valor' => 1964543.20,
            'descricao' => 'Cabin - Catamarã com console central e cabine.'
        ],
        [
            'modelo' => 'TitanCC',
            'categoria' => 'Catamarã Center Console',
            'comprimento_m' => 11.30,
            'largura_m' => 3.20,
            'calado_m' => 0.38,
            'peso_kg' => 3600,
            'agua_l' => 100,
            'combustivel_l' => 1200,
            'motorizacao' => '2x250hp-2x400hp',
            'passageiros' => 16,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 23.50,
            'autonomia_milhas' => 480.48,
            'velocidade_maxima_nos' => 51.10,
            'barco_montagem_valor' => 1322672.82,
            'descricao' => 'Titan CC - Alta qualidade e console central.'
        ],
        [
            'modelo' => 'Commuter',
            'categoria' => 'Catamarã XF',
            'comprimento_m' => 11.35,
            'largura_m' => 3.20,
            'calado_m' => 0.42,
            'peso_kg' => 3800,
            'agua_l' => 120,
            'combustivel_l' => 1200,
            'motorizacao' => '2x300hp-2x400hp',
            'passageiros' => 16,
            'pernoite' => 2,
            'velocidade_cruzeiro_nos' => 19.60,
            'autonomia_milhas' => 445.00,
            'velocidade_maxima_nos' => 41.8,
            'barco_montagem_valor' => 1662748.60,
            'descricao' => 'Commuter - Máxima proteção em qualquer clima.'
        ]
    ];

    echo "Iniciando atualização de modelos...\n";

    $checkModelSql = "SELECT id FROM site_barco WHERE modelo = :modelo";
    $updateModelSql = "UPDATE site_barco SET categoria = :categoria, comprimento_m = :comprimento_m, largura_m = :largura_m, calado_m = :calado_m, peso_kg = :peso_kg, agua_l = :agua_l, combustivel_l = :combustivel_l, motorizacao = :motorizacao, passageiros = :passageiros, pernoite = :pernoite, velocidade_cruzeiro_nos = :velocidade_cruzeiro_nos, autonomia_milhas = :autonomia_milhas, velocidade_maxima_nos = :velocidade_maxima_nos, barco_montagem_valor = :barco_montagem_valor, descricao = :descricao, img = :img WHERE id = :id";
    $insertModelSql = "INSERT INTO site_barco (modelo, categoria, comprimento_m, largura_m, calado_m, peso_kg, agua_l, combustivel_l, motorizacao, passageiros, pernoite, velocidade_cruzeiro_nos, autonomia_milhas, velocidade_maxima_nos, barco_montagem_valor, descricao, img) VALUES (:modelo, :categoria, :comprimento_m, :largura_m, :calado_m, :peso_kg, :agua_l, :combustivel_l, :motorizacao, :passageiros, :pernoite, :velocidade_cruzeiro_nos, :autonomia_milhas, :velocidade_maxima_nos, :barco_montagem_valor, :descricao, :img)";

    $checkModelStmt = $pdo->prepare($checkModelSql);
    $updateModelStmt = $pdo->prepare($updateModelSql);
    $insertModelStmt = $pdo->prepare($insertModelSql);

    foreach ($modelos as $m) {
        $img = "assets/img/produtos/" . $m['modelo'] . "/fotoprincipal.jpg";
        $checkModelStmt->execute([':modelo' => $m['modelo']]);
        $existingModel = $checkModelStmt->fetch(PDO::FETCH_ASSOC);
        if ($existingModel) {
            $updateModelStmt->execute([
                ':categoria' => $m['categoria'],
                ':comprimento_m' => $m['comprimento_m'],
                ':largura_m' => $m['largura_m'],
                ':calado_m' => $m['calado_m'],
                ':peso_kg' => $m['peso_kg'],
                ':agua_l' => $m['agua_l'],
                ':combustivel_l' => $m['combustivel_l'],
                ':motorizacao' => $m['motorizacao'],
                ':passageiros' => $m['passageiros'],
                ':pernoite' => $m['pernoite'],
                ':velocidade_cruzeiro_nos' => $m['velocidade_cruzeiro_nos'],
                ':autonomia_milhas' => $m['autonomia_milhas'],
                ':velocidade_maxima_nos' => $m['velocidade_maxima_nos'],
                ':barco_montagem_valor' => $m['barco_montagem_valor'],
                ':descricao' => $m['descricao'],
                ':img' => $img,
                ':id' => $existingModel['id']
            ]);
            echo "Atualizado modelo: {$m['modelo']}\n";
        } else {
            $insertModelStmt->execute([
                ':modelo' => $m['modelo'],
                ':categoria' => $m['categoria'],
                ':comprimento_m' => $m['comprimento_m'],
                ':largura_m' => $m['largura_m'],
                ':calado_m' => $m['calado_m'],
                ':peso_kg' => $m['peso_kg'],
                ':agua_l' => $m['agua_l'],
                ':combustivel_l' => $m['combustivel_l'],
                ':motorizacao' => $m['motorizacao'],
                ':passageiros' => $m['passageiros'],
                ':pernoite' => $m['pernoite'],
                ':velocidade_cruzeiro_nos' => $m['velocidade_cruzeiro_nos'],
                ':autonomia_milhas' => $m['autonomia_milhas'],
                ':velocidade_maxima_nos' => $m['velocidade_maxima_nos'],
                ':barco_montagem_valor' => $m['barco_montagem_valor'],
                ':descricao' => $m['descricao'],
                ':img' => $img
            ]);
            echo "Inserido modelo: {$m['modelo']}\n";
        }
    }
    echo "Atualização de modelos concluída.\n";

} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

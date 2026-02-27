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
        ["Capa de Proteção", "3500.00"],
        ["Carreta de encalhe", "22815.00"],
        ["Guincho elétrico", "7230.60"],
        ["Luz subaquática (par)", "1028.00"],
        ["Pintura de casco", "6000.00"],
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
        ["Tenda de proa", "3570.00"]
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

} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

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

} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

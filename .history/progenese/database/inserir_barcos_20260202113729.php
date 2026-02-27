<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/conexao.php';

try {
    $pdo = getConnection();
    
    // Lista de motores para inserir (ID, Motor, Valor, Imagem)
    // ID será auto-incremento para novos itens, mas manteremos a lógica para os existentes se necessário
    // Vamos usar o nome como chave para evitar duplicatas na lista PHP primeiro
    
    $motoresData = [];

    // Motores existentes no script anterior
    $motoresData['MERCURY 150HP 4T L'] = ['valor' => 90000.00, 'img' => '1 MERCURY 150HP 4T L.jpg'];
    $motoresData['MERCURY 200 DTS'] = ['valor' => 135000.00, 'img' => '2 MERCURY 200 DTS.jpg'];
    $motoresData['MERCURY 250 DTS V8'] = ['valor' => 160000.00, 'img' => '3 MERCURY 250 DTS V8.jpg'];
    $motoresData['MERCURY 300 DTS V8'] = ['valor' => 180000.00, 'img' => '4 MERCURY 300 DTS V8.jpg'];
    $motoresData['YAMAHA 150HP 4T'] = ['valor' => 92000.00, 'img' => '5 YAMAHA 150HP 4T.jpg'];
    $motoresData['YAMAHA 200HP 4T'] = ['valor' => 130000.00, 'img' => '6 YAMAHA 200HP 4T.jpg'];
    $motoresData['YAMAHA 250HP 4T'] = ['valor' => 155000.00, 'img' => '7 YAMAHA 250HP 4T.jpg'];
    $motoresData['YAMAHA 300HP 4T'] = ['valor' => 175000.00, 'img' => '8 YAMAHA 300HP 4T.jpg'];
    $motoresData['PARELHA MERCURY 150HP'] = ['valor' => 180000.00, 'img' => '9 PARELHA MERCURY 150HP.jpg'];
    $motoresData['PARELHA MERCURY 200HP'] = ['valor' => 270000.00, 'img' => '10 PARELHA MERCURY 200HP.jpg'];
    $motoresData['PARELHA YAMAHA 150HP'] = ['valor' => 184000.00, 'img' => '11 PARELHA YAMAHA 150HP.jpg'];
    $motoresData['PARELHA YAMAHA 200HP'] = ['valor' => 260000.00, 'img' => '12 PARELHA YAMAHA 200HP.jpg'];

    // Novos motores extraídos de custom.js
    $novosMotores = [
        ["2 MERCURY EFI 115", "167908.00"],
        ["2 MERCURY EFI 150", "207035.00"],
        ["2 SUZUKI 140hp", "202182.00"],
        ["2 YAMAHA 150hp", "207035.00"],
        ["2 MERCURY 200 DTS", "261012.00"], // Atualizará valor se já existir
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
        ["2 YAMAHA 200hp", "285310.00"] // Mesmo valor do '2 YAMAHA 200 4 DI', mas nome diferente
    ];

    foreach ($novosMotores as $motor) {
        $nome = $motor[0];
        $valor = floatval($motor[1]);
        $img = $nome . ".JPG"; // Formato solicitado: Nome do motor.JPG

        // Se já existe, atualizamos o valor e a imagem (ou mantemos se preferir)
        // Aqui vamos sobrescrever ou adicionar
        $motoresData[$nome] = ['valor' => $valor, 'img' => $img];
    }

    // Preparar SQL
    // Vamos usar INSERT OR REPLACE, mas como ID é autoincrement e não estamos fornecendo para os novos,
    // precisamos checar se existe pelo nome para fazer update, ou insert se não existir.
    // Como SQLite não tem "ON DUPLICATE KEY UPDATE" padrão sem chave única definida (além do ID),
    // vamos fazer SELECT e depois INSERT ou UPDATE.
    // Ou, podemos limpar a tabela e inserir tudo de novo se a intenção for resetar.
    // Dado o contexto "inserir_barcos.php" parece ser um script de setup/seed.
    
    // Vamos assumir UPDATE se o nome bater, INSERT se não.

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

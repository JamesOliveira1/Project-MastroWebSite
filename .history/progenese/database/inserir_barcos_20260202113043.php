<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/conexao.php';

try {
    $pdo = getConnection();
    
    // Lista de motores para inserir (ID, Motor, Valor, Imagem)
    // IDs são inseridos explicitamente para controle, mas poderiam ser auto-incremento
    $motores = [
        [1, 'MERCURY 150HP 4T L', 90000.00, '1 MERCURY 150HP 4T L.jpg'],
        [2, 'MERCURY 200 DTS', 135000.00, '2 MERCURY 200 DTS.jpg'],
        [3, 'MERCURY 250 DTS V8', 160000.00, '3 MERCURY 250 DTS V8.jpg'],
        [4, 'MERCURY 300 DTS V8', 180000.00, '4 MERCURY 300 DTS V8.jpg'],
        [5, 'YAMAHA 150HP 4T', 92000.00, '5 YAMAHA 150HP 4T.jpg'],
        [6, 'YAMAHA 200HP 4T', 130000.00, '6 YAMAHA 200HP 4T.jpg'],
        [7, 'YAMAHA 250HP 4T', 155000.00, '7 YAMAHA 250HP 4T.jpg'],
        [8, 'YAMAHA 300HP 4T', 175000.00, '8 YAMAHA 300HP 4T.jpg'],
        [9, 'PARELHA MERCURY 150HP', 180000.00, '9 PARELHA MERCURY 150HP.jpg'],
        [10, 'PARELHA MERCURY 200HP', 270000.00, '10 PARELHA MERCURY 200HP.jpg'],
        [11, 'PARELHA YAMAHA 150HP', 184000.00, '11 PARELHA YAMAHA 150HP.jpg'],
        [12, 'PARELHA YAMAHA 200HP', 260000.00, '12 PARELHA YAMAHA 200HP.jpg']
    ];

    $sql = "INSERT OR REPLACE INTO site_motor (id, motor, valor, img) VALUES (:id, :motor, :valor, :img)";
    $stmt = $pdo->prepare($sql);

    echo "Iniciando inserção de motores...\n";

    foreach ($motores as $motor) {
        $stmt->execute([
            ':id' => $motor[0],
            ':motor' => $motor[1],
            ':valor' => $motor[2],
            ':img' => $motor[3]
        ]);
        echo "Inserido/Atualizado: {$motor[1]} (ID: {$motor[0]})\n";
    }

    echo "Concluído com sucesso!\n";

} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

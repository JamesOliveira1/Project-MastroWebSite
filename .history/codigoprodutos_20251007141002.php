<?php
echo "<pre>";

try {
    // Caminho do banco de dados Firebird (.FDB)
    $dsn = 'firebird:dbname=D:\\GD_XNAV\\Banco\\PRODOC.FDB;charset=UTF8';
    
    // Credenciais
    $user = 'sysdba';
    $password = 'masterkey'; // ajuste se sua senha for diferente

    // Conexão PDO com Firebird
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Conexão Firebird estabelecida com sucesso!\n\n";

    // Executa a consulta desejada
    $sql = 'SELECT r.COD_PRODUTO, r.DSC_PRODUTO 
            FROM PRODUTO r
            ORDER BY r.COD_PRODUTO DESC';
    
    $stmt = $pdo->query($sql);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($resultados) === 0) {
        echo "Nenhum produto encontrado.\n";
    } else {
        echo "Resultados:\n";
        foreach ($resultados as $row) {
            echo str_pad($row['COD_PRODUTO'], 10) . " | " . $row['DSC_PRODUTO'] . "\n";
        }
    }
} catch (PDOException $e) {
    echo "❌ Erro ao conectar ou executar query:\n";
    echo $e->getMessage() . "\n";
}

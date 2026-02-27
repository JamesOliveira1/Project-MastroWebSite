<?php
try {
    // Banco de dados será criado no mesmo diretório
    $dbPath = __DIR__ . '/estaleiro.db';
    echo "📂 Caminho do banco: $dbPath<br>";

    // Conexão com SQLite
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ler o arquivo estrutura.sql no mesmo diretório
    $sqlFile = __DIR__ . '/estrutura.sql';
    echo "📄 Carregando arquivo SQL: $sqlFile<br>";

    $sql = file_get_contents($sqlFile);
    if (!$sql) {
        throw new Exception("Arquivo estrutura.sql não foi encontrado ou está vazio!");
    }

    $pdo->exec($sql);

    echo "✅ Banco criado e estrutura importada com sucesso!";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>

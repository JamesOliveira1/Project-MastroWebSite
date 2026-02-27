<?php
try {
    $dbPath = __DIR__ . '/database/estaleiro.db';

    // Cria conexão
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ativa integridade referencial
    $db->exec("PRAGMA foreign_keys = ON;");

    // Carrega SQL e executa
    $sql = file_get_contents(__DIR__ . '/database/estrutura.sql');
    $db->exec($sql);

    echo "✅ Banco criado com sucesso em: " . realpath($dbPath);
} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}

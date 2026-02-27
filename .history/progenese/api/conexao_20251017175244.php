<?php
declare(strict_types=1);

/**
 * Conexão PDO com SQLite (estaleiro.db)
 * Uso:
 *   require_once __DIR__ . '/conexao.php';
 *   $pdo = getConnection();
 *   $rows = queryAll('SELECT * FROM tabela');
 */

function getConnection(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dbPath = __DIR__ . '/../database/estaleiro.db';
    if (!file_exists($dbPath)) {
        throw new RuntimeException('SQLite DB não encontrado em: ' . $dbPath);
    }

    $dsn = 'sqlite:' . $dbPath;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_PERSISTENT => false,
    ];

    $pdo = new PDO($dsn, null, null, $options);

    // Ajustes recomendados para SQLite
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA synchronous = NORMAL');

    return $pdo;
}

/**
 * Executa SELECT e retorna todas as linhas
 */
function queryAll(string $sql, array $params = []): array
{
    $stmt = getConnection()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

/**
 * Executa SELECT e retorna uma linha ou null
 */
function queryOne(string $sql, array $params = []): ?array
{
    $stmt = getConnection()->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
}

/**
 * Executa INSERT/UPDATE/DELETE e retorna número de linhas afetadas
 */
function execute(string $sql, array $params = []): int
{
    $stmt = getConnection()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
}
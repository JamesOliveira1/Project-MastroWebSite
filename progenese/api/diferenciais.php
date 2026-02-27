<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

require_once __DIR__ . '/conexao.php';

function readJson(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function ensureTable(PDO $pdo): void {
  $pdo->exec('CREATE TABLE IF NOT EXISTS diferenciais_globais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    posicao INTEGER UNIQUE NOT NULL,
    texto TEXT NOT NULL,
    atualizado_em TEXT
  )');
  $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_diferenciais_posicao ON diferenciais_globais(posicao)');
}

try {
  $pdo = getConnection();
  ensureTable($pdo);
  $input = readJson();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

  switch ($action) {
    case 'listar': {
      $rows = queryAll('SELECT posicao, texto FROM diferenciais_globais ORDER BY posicao ASC');
      respond(['ok' => true, 'data' => $rows]);
    }
    case 'salvar': {
      $pos = (int)($_GET['posicao'] ?? $_POST['posicao'] ?? ($input['posicao'] ?? 0));
      $texto = trim((string)($_GET['texto'] ?? $_POST['texto'] ?? ($input['texto'] ?? '')));
      if ($pos < 1 || $pos > 5 || $texto === '') {
        respond(['ok' => false, 'error' => 'Parâmetros inválidos'], 400);
      }
      $now = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');
      $exists = queryOne('SELECT id FROM diferenciais_globais WHERE posicao = :pos', [':pos' => $pos]);
      if ($exists) {
        execute('UPDATE diferenciais_globais SET texto = :texto, atualizado_em = :atualizado_em WHERE posicao = :pos', [
          ':texto' => $texto,
          ':atualizado_em' => $now,
          ':pos' => $pos,
        ]);
      } else {
        execute('INSERT INTO diferenciais_globais (posicao, texto, atualizado_em) VALUES (:pos, :texto, :atualizado_em)', [
          ':pos' => $pos,
          ':texto' => $texto,
          ':atualizado_em' => $now,
        ]);
      }
      respond(['ok' => true]);
    }
    default:
      respond(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}
?>

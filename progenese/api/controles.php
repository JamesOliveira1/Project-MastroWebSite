<?php
declare(strict_types=1);

// Biblioteca + API de registro de atividades
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

function startCompatSession(): void {
  if (session_status() === PHP_SESSION_ACTIVE) return;
  @session_name('ESTALEIROSESS');
  if (!headers_sent()) { @session_start(); }
}

function controles_readJson(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function controles_jsonResponse($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function ensureActivityTable(PDO $pdo): void {
  $pdo->exec('CREATE TABLE IF NOT EXISTS atividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    usuario TEXT,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id INTEGER,
    barco_id INTEGER,
    descricao TEXT,
    ip TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_atividades_criado_em ON atividades(criado_em)');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_atividades_barco ON atividades(barco_id)');
}

/**
 * Registra uma atividade. Usa sessão para obter usuário.
 */
function logActivity(string $acao, string $entidade, ?int $entidadeId, ?int $barcoId, string $descricao): void {
  startCompatSession();
  $pdo = getConnection();
  ensureActivityTable($pdo);

  $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
  $usuarioNome = null;
  if (!empty($_SESSION['nome'])) {
    $usuarioNome = (string)$_SESSION['nome'];
  } elseif (!empty($_SESSION['usuario'])) {
    $usuarioNome = (string)$_SESSION['usuario'];
  }
  $ip = $_SERVER['REMOTE_ADDR'] ?? null;
  // Timestamp local explícito para evitar UTC padrão do SQLite
  $now = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');

  execute('INSERT INTO atividades (user_id, usuario, acao, entidade, entidade_id, barco_id, descricao, ip, criado_em) VALUES (:user_id, :usuario, :acao, :entidade, :entidade_id, :barco_id, :descricao, :ip, :criado_em)', [
    ':user_id' => $userId,
    ':usuario' => $usuarioNome,
    ':acao' => $acao,
    ':entidade' => $entidade,
    ':entidade_id' => $entidadeId,
    ':barco_id' => $barcoId,
    ':descricao' => $descricao,
    ':ip' => $ip,
    ':criado_em' => $now,
  ]);
}

// Somente executa como API se este arquivo for o script chamado diretamente
if (realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'] ?? '')) {
  try {
    $input = controles_readJson();
    $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

    switch ($action) {
      case 'listar': {
        $limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? ($input['limit'] ?? 50));
        $limit = max(1, min(200, $limit));
        $rows = queryAll('SELECT id, usuario, acao, entidade, entidade_id, barco_id, descricao, criado_em FROM atividades ORDER BY id DESC LIMIT :limit', [':limit' => $limit]);
        controles_jsonResponse(['ok' => true, 'data' => $rows]);
      }
      case 'registrar': {
        $acao = trim((string)($input['acao'] ?? $_POST['acao'] ?? ''));
        $entidade = trim((string)($input['entidade'] ?? $_POST['entidade'] ?? ''));
        $entidadeId = (int)($input['entidade_id'] ?? $_POST['entidade_id'] ?? 0);
        $barcoId = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
        $descricao = trim((string)($input['descricao'] ?? $_POST['descricao'] ?? ''));
        if ($acao === '' || $entidade === '' || $descricao === '') {
          controles_jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: acao, entidade, descricao'], 400);
        }
        logActivity($acao, $entidade, $entidadeId > 0 ? $entidadeId : null, $barcoId > 0 ? $barcoId : null, $descricao);
        controles_jsonResponse(['ok' => true]);
      }
      default:
        controles_jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
    }
  } catch (Throwable $e) {
    controles_jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
  }
}
?>

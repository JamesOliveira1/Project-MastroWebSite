<?php
declare(strict_types=1);

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
// CSP básica (ajuste conforme necessário)
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self';");

require_once __DIR__ . '/conexao.php';

// ===== Helpers =====
function readJsonInput(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function jsonResponse($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function isHttps(): bool {
  return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == '443';
}

function startSecureSession(): void {
  // Configure cookie params
  $params = [
    'lifetime' => 0, // until browser close
    'path' => '/',
    'domain' => '',
    'secure' => isHttps(),
    'httponly' => true,
    'samesite' => 'Lax',
  ];
  if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params($params);
  } else {
    session_set_cookie_params($params['lifetime'], $params['path'], $params['domain'], $params['secure'], $params['httponly']);
  }
  session_name('ESTALEIROSESS');
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  }
}

function generateCsrfToken(): string {
  $token = bin2hex(random_bytes(32));
  $_SESSION['csrf_token'] = $token;
  $_SESSION['csrf_token_time'] = time();
  return $token;
}

function verifyCsrfToken(?string $token): bool {
  if (!$token) return false;
  $sessionToken = $_SESSION['csrf_token'] ?? '';
  if (!$sessionToken) return false;
  return hash_equals($sessionToken, $token);
}

function currentIp(): string {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  return $ip;
}

// ===== Notes helpers =====
function ensureAnotacoesTable(PDO $pdo): void {
  $pdo->exec('CREATE TABLE IF NOT EXISTS anotacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    nota TEXT,
    data TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_anotacoes_usuario ON anotacoes(usuario_id)');
}

function requireAuthenticated(): void {
  if (!isset($_SESSION['user_id'])) {
    jsonResponse(['ok' => false, 'authenticated' => false, 'error' => 'Não autenticado'], 401);
  }
  if (!enforceSessionTimeout(1800)) {
    destroySession();
    jsonResponse(['ok' => false, 'authenticated' => false, 'error' => 'Sessão expirada'], 401);
  }
}

function requireCsrfHeader(): void {
  $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  if (!verifyCsrfToken($csrfHeader)) {
    jsonResponse(['ok' => false, 'error' => 'Token inválido'], 403);
  }
}

function ensureLoginAttemptsTable(PDO $pdo): void {
  $pdo->exec('CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT,
    ip TEXT,
    attempts INTEGER,
    last_attempt INTEGER,
    locked_until INTEGER
  )');
  $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attempts_user_ip ON login_attempts(usuario, ip)');
}

function getAttempts(PDO $pdo, string $usuario, string $ip): ?array {
  $stmt = $pdo->prepare('SELECT id, attempts, last_attempt, locked_until FROM login_attempts WHERE usuario = :usuario AND ip = :ip');
  $stmt->execute([':usuario' => $usuario, ':ip' => $ip]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return $row ?: null;
}

function recordFailedAttempt(PDO $pdo, string $usuario, string $ip, int $threshold = 5, int $windowSec = 900, int $lockSec = 600): void {
  $now = time();
  $existing = getAttempts($pdo, $usuario, $ip);
  if ($existing) {
    $attempts = (int)$existing['attempts'] + 1;
    $lockedUntil = (int)$existing['locked_until'];
    if ($attempts >= $threshold) {
      $lockedUntil = $now + $lockSec;
    }
    $stmt = $pdo->prepare('UPDATE login_attempts SET attempts = :attempts, last_attempt = :last_attempt, locked_until = :locked_until WHERE id = :id');
    $stmt->execute([':attempts' => $attempts, ':last_attempt' => $now, ':locked_until' => $lockedUntil, ':id' => $existing['id']]);
  } else {
    $stmt = $pdo->prepare('INSERT INTO login_attempts (usuario, ip, attempts, last_attempt, locked_until) VALUES (:usuario, :ip, :attempts, :last_attempt, :locked_until)');
    $stmt->execute([':usuario' => $usuario, ':ip' => $ip, ':attempts' => 1, ':last_attempt' => $now, ':locked_until' => 0]);
  }
}

function resetAttempts(PDO $pdo, string $usuario, string $ip): void {
  $existing = getAttempts($pdo, $usuario, $ip);
  if ($existing) {
    $stmt = $pdo->prepare('UPDATE login_attempts SET attempts = 0, last_attempt = :last_attempt, locked_until = 0 WHERE id = :id');
    $stmt->execute([':last_attempt' => time(), ':id' => $existing['id']]);
  }
}

function isLocked(?array $attemptRow): bool {
  if (!$attemptRow) return false;
  $lockedUntil = (int)$attemptRow['locked_until'];
  return $lockedUntil > time();
}

function validateCredentials(string $usuario, string $senha): ?string {
  if ($usuario === '' || $senha === '') return 'Usuário e senha são obrigatórios';
  if (strlen($usuario) < 3 || strlen($usuario) > 64) return 'Usuário inválido';
  if (strlen($senha) < 8 || strlen($senha) > 128) return 'Senha inválida';
  return null;
}

function destroySession(): void {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
  }
  session_destroy();
}

function enforceSessionTimeout(int $ttlSeconds = 1800): bool {
  // Ajusta TTL conforme "manter-se logado"
  $remember = !empty($_SESSION['remember']);
  $ttl = $remember ? (30 * 24 * 60 * 60) : $ttlSeconds; // 30 dias ou padrão
  $last = $_SESSION['last_activity'] ?? null;
  if ($last && (time() - (int)$last) > $ttl) {
    return false; // expired
  }
  $_SESSION['last_activity'] = time();
  return true;
}

// ===== Controller =====
try {
  startSecureSession();
  $pdo = getConnection();
  ensureLoginAttemptsTable($pdo);
  // Assegura tabela de anotações disponível
  ensureAnotacoesTable($pdo);

  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'session');

  switch ($action) {
    case 'csrf': {
      // Não rotaciona o token a cada chamada; retorna existente ou cria se ausente
      $token = $_SESSION['csrf_token'] ?? '';
      if (!$token) {
        $token = generateCsrfToken();
      }
      jsonResponse(['ok' => true, 'csrf' => $token]);
    }

    case 'login': {
      $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
      if (!verifyCsrfToken($csrfHeader)) {
        jsonResponse(['ok' => false, 'error' => 'Token inválido'], 403);
      }

      $usuario = trim((string)($input['usuario'] ?? $_POST['usuario'] ?? ''));
      $email   = trim((string)($input['email']   ?? $_POST['email']   ?? ''));
      $senha   = (string)($input['senha'] ?? $_POST['senha'] ?? '');
      $identity = $usuario !== '' ? $usuario : $email;
      // Ordem das validações: primeiro valida usuário; senha só após verificar existência
      if ($identity === '' || $senha === '') {
        jsonResponse(['ok' => false, 'error' => 'Usuário/E-mail e senha são obrigatórios'], 400);
      }
      // Valida identidade: se contiver @, trata como e-mail; caso contrário, usuário
      if (strpos($identity, '@') !== false) {
        if (!filter_var($identity, FILTER_VALIDATE_EMAIL)) {
          jsonResponse(['ok' => false, 'error' => 'E-mail inválido'], 400);
        }
      } else {
        if (strlen($identity) < 3 || strlen($identity) > 64) {
          jsonResponse(['ok' => false, 'error' => 'Usuário inválido'], 400);
        }
      }

      $ip = currentIp();
      $attemptRow = getAttempts($pdo, $identity, $ip);
      if (isLocked($attemptRow)) {
        jsonResponse(['ok' => false, 'error' => 'Conta temporariamente bloqueada. Tente novamente mais tarde.'], 429);
      }

      // Busca usuário
      if (strpos($identity, '@') !== false) {
        $stmt = $pdo->prepare('SELECT id, nome, usuario, email, senha, cargo FROM usuarios WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $identity]);
      } else {
        $stmt = $pdo->prepare('SELECT id, nome, usuario, email, senha, cargo FROM usuarios WHERE usuario = :usuario LIMIT 1');
        $stmt->execute([':usuario' => $identity]);
      }
      $user = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$user) {
        recordFailedAttempt($pdo, $identity, $ip);
        jsonResponse(['ok' => false, 'error' => 'Usuário inexistente', 'error_code' => 'USER_NOT_FOUND'], 404);
      }
      // Só valida complexidade da senha após confirmar existência do usuário
      if (strlen($senha) < 8 || strlen($senha) > 128) {
        recordFailedAttempt($pdo, $identity, $ip);
        jsonResponse(['ok' => false, 'error' => 'Senha inválida', 'error_code' => 'INVALID_PASSWORD_FORMAT'], 400);
      }
      if (!password_verify($senha, (string)$user['senha'])) {
        recordFailedAttempt($pdo, $identity, $ip);
        jsonResponse(['ok' => false, 'error' => 'Senha incorreta', 'error_code' => 'WRONG_PASSWORD'], 401);
      }

      // Sucesso
      resetAttempts($pdo, $identity, $ip);
      session_regenerate_id(true);
      $_SESSION['user_id'] = (int)$user['id'];
      $_SESSION['usuario'] = (string)$user['usuario'];
      $_SESSION['email']   = (string)($user['email'] ?? '');
      $_SESSION['nome']    = (string)($user['nome'] ?? '');
      $_SESSION['cargo']   = (string)($user['cargo'] ?? '');
      $_SESSION['last_activity'] = time();
      // Manter-se logado: se marcado, estende cookie e TTL
      $remember = (bool)($input['remember'] ?? $_POST['remember'] ?? false);
      $_SESSION['remember'] = $remember ? 1 : 0;
      if ($remember) {
        // Atualiza cookie da sessão para 30 dias
        setcookie(session_name(), session_id(), [
          'expires' => time() + (30 * 24 * 60 * 60),
          'path' => '/',
          'domain' => '',
          'secure' => isHttps(),
          'httponly' => true,
          'samesite' => 'Lax',
        ]);
      }
      // Renova CSRF
      generateCsrfToken();

      jsonResponse(['ok' => true, 'redirect' => '/progenese/inicio.html', 'email' => (string)($user['email'] ?? '')]);
    }

    case 'logout': {
      $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
      if (!verifyCsrfToken($csrfHeader)) {
        jsonResponse(['ok' => false, 'error' => 'Token inválido'], 403);
      }
      destroySession();
      jsonResponse(['ok' => true, 'redirect' => '/progenese/login.html']);
    }

    // ====== Notas (Anotações do usuário) ======
    case 'notes_list': {
      requireAuthenticated();
      $uid = (int)($_SESSION['user_id'] ?? 0);
      $stmt = $pdo->prepare('SELECT id, nota, data FROM anotacoes WHERE usuario_id = :uid ORDER BY id DESC');
      $stmt->execute([':uid' => $uid]);
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
      jsonResponse(['ok' => true, 'notes' => $rows]);
    }

    case 'notes_create': {
      requireAuthenticated();
      requireCsrfHeader();
      $inputNota = trim((string)($_POST['nota'] ?? ($input['nota'] ?? '')));
      if ($inputNota === '') {
        jsonResponse(['ok' => false, 'error' => 'Nota vazia'], 400);
      }
      $uid = (int)($_SESSION['user_id'] ?? 0);
      $agora = date('Y-m-d H:i:s');
      $stmt = $pdo->prepare('INSERT INTO anotacoes (usuario_id, nota, data) VALUES (:uid, :nota, :data)');
      $ok = $stmt->execute([':uid' => $uid, ':nota' => $inputNota, ':data' => $agora]);
      if (!$ok) {
        jsonResponse(['ok' => false, 'error' => 'Falha ao criar anotação'], 500);
      }
      $id = (int)$pdo->lastInsertId();
      jsonResponse(['ok' => true, 'note' => ['id' => $id, 'nota' => $inputNota, 'data' => $agora]]);
    }

    case 'notes_update': {
      requireAuthenticated();
      requireCsrfHeader();
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      $newNota = trim((string)($_POST['nota'] ?? ($input['nota'] ?? '')));
      if ($id <= 0 || $newNota === '') {
        jsonResponse(['ok' => false, 'error' => 'Parâmetros inválidos'], 400);
      }
      $uid = (int)($_SESSION['user_id'] ?? 0);
      $agora = date('Y-m-d H:i:s');
      $stmt = $pdo->prepare('UPDATE anotacoes SET nota = :nota, data = :data WHERE id = :id AND usuario_id = :uid');
      $affected = $stmt->execute([':nota' => $newNota, ':data' => $agora, ':id' => $id, ':uid' => $uid]);
      if (!$affected || $stmt->rowCount() < 1) {
        jsonResponse(['ok' => false, 'error' => 'Nota não encontrada ou não atualizada'], 404);
      }
      jsonResponse(['ok' => true]);
    }

    case 'notes_delete': {
      requireAuthenticated();
      requireCsrfHeader();
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      if ($id <= 0) {
        jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      }
      $uid = (int)($_SESSION['user_id'] ?? 0);
      $stmt = $pdo->prepare('DELETE FROM anotacoes WHERE id = :id AND usuario_id = :uid');
      $affected = $stmt->execute([':id' => $id, ':uid' => $uid]);
      if (!$affected || $stmt->rowCount() < 1) {
        jsonResponse(['ok' => false, 'error' => 'Nota não encontrada'], 404);
      }
      jsonResponse(['ok' => true]);
    }

    case 'session': {
      if (!isset($_SESSION['user_id'])) {
        jsonResponse(['ok' => false, 'authenticated' => false]);
      }
      if (!enforceSessionTimeout(1800)) {
        destroySession();
        jsonResponse(['ok' => false, 'authenticated' => false, 'error' => 'Sessão expirada']);
      }
      jsonResponse(['ok' => true, 'authenticated' => true, 'usuario' => $_SESSION['usuario'] ?? '', 'email' => $_SESSION['email'] ?? '', 'cargo' => $_SESSION['cargo'] ?? '', 'nome' => $_SESSION['nome'] ?? '']);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação inválida'], 400);
  }
} catch (Throwable $e) {
  // Mensagens genéricas, sem detalhes sensíveis
  jsonResponse(['ok' => false, 'error' => 'Falha interna'], 500);
}
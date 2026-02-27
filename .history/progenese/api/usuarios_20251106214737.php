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
  // Ajuste de política: permitir senhas mínimas de 4 caracteres (dev).
  // Em produção, recomenda-se mínimo de 8.
  if (strlen($senha) < 4 || strlen($senha) > 128) return 'Senha inválida';
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
  $last = $_SESSION['last_activity'] ?? null;
  if ($last && (time() - (int)$last) > $ttlSeconds) {
    return false; // expired
  }
  $_SESSION['last_activity'] = time();
  return true;
}

function updateSessionCookieLifetime(int $lifetimeSeconds): void {
  // Atualiza cookie da sessão atual para expirar conforme solicitado.
  $params = session_get_cookie_params();
  $expires = $lifetimeSeconds > 0 ? time() + $lifetimeSeconds : 0;
  // PHP >= 7.3 suporta array com samesite
  if (PHP_VERSION_ID >= 70300) {
    setcookie(session_name(), session_id(), [
      'expires'  => $expires,
      'path'     => $params['path'] ?? '/',
      'domain'   => $params['domain'] ?? '',
      'secure'   => $params['secure'] ?? isHttps(),
      'httponly' => $params['httponly'] ?? true,
      'samesite' => 'Lax',
    ]);
  } else {
    setcookie(session_name(), session_id(), $expires, $params['path'] ?? '/', $params['domain'] ?? '', $params['secure'] ?? isHttps(), $params['httponly'] ?? true);
  }
}

// ===== Controller =====
try {
  startSecureSession();
  $pdo = getConnection();
  ensureLoginAttemptsTable($pdo);

  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'session');

  switch ($action) {
    case 'csrf': {
      $token = generateCsrfToken();
      jsonResponse(['ok' => true, 'csrf' => $token]);
    }

    case 'login': {
      $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
      if (!verifyCsrfToken($csrfHeader)) {
        jsonResponse(['ok' => false, 'error' => 'Token inválido'], 403);
      }

      $usuario = trim((string)($input['usuario'] ?? $_POST['usuario'] ?? ''));
      $senha   = (string)($input['senha'] ?? $_POST['senha'] ?? '');
      $validationError = validateCredentials($usuario, $senha);
      if ($validationError) {
        jsonResponse(['ok' => false, 'error' => $validationError], 400);
      }

      $ip = currentIp();
      $attemptRow = getAttempts($pdo, $usuario, $ip);
      if (isLocked($attemptRow)) {
        jsonResponse(['ok' => false, 'error' => 'Conta temporariamente bloqueada. Tente novamente mais tarde.'], 429);
      }

      // Busca usuário
      $stmt = $pdo->prepare('SELECT id, nome, usuario, senha, cargo FROM usuarios WHERE usuario = :usuario LIMIT 1');
      $stmt->execute([':usuario' => $usuario]);
      $user = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$user || !password_verify($senha, (string)$user['senha'])) {
        recordFailedAttempt($pdo, $usuario, $ip);
        jsonResponse(['ok' => false, 'error' => 'Usuário ou senha inválidos'], 401);
      }

      // Sucesso
      resetAttempts($pdo, $usuario, $ip);
      session_regenerate_id(true);
      $_SESSION['user_id'] = (int)$user['id'];
      $_SESSION['usuario'] = (string)$user['usuario'];
      $_SESSION['nome']    = (string)($user['nome'] ?? '');
      $_SESSION['cargo']   = (string)($user['cargo'] ?? '');
      $_SESSION['last_activity'] = time();
      // Remember-me: se solicitado, aplica cookie persistente e TTL maior
      $remember = (bool)($input['remember'] ?? $_POST['remember'] ?? false);
      $_SESSION['remember'] = $remember ? 1 : 0;
      if ($remember) {
        updateSessionCookieLifetime(604800); // 7 dias
      } else {
        updateSessionCookieLifetime(0); // até fechar o navegador
      }
      // Renova CSRF
      generateCsrfToken();

      jsonResponse(['ok' => true, 'redirect' => '/progenese/estaleiro.html']);
    }

    case 'logout': {
      $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
      if (!verifyCsrfToken($csrfHeader)) {
        jsonResponse(['ok' => false, 'error' => 'Token inválido'], 403);
      }
      destroySession();
      jsonResponse(['ok' => true, 'redirect' => '/progenese/login.html']);
    }

    case 'session': {
      if (!isset($_SESSION['user_id'])) {
        jsonResponse(['ok' => false, 'authenticated' => false]);
      }
      $ttl = (!empty($_SESSION['remember']) ? 604800 : 1800);
      if (!enforceSessionTimeout($ttl)) {
        destroySession();
        jsonResponse(['ok' => false, 'authenticated' => false, 'error' => 'Sessão expirada']);
      }
      jsonResponse(['ok' => true, 'authenticated' => true, 'usuario' => $_SESSION['usuario'] ?? '', 'cargo' => $_SESSION['cargo'] ?? '']);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação inválida'], 400);
  }
} catch (Throwable $e) {
  // Mensagens genéricas, sem detalhes sensíveis
  jsonResponse(['ok' => false, 'error' => 'Falha interna'], 500);
}
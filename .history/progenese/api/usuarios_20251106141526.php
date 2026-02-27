<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

// Configuração de sessão com cookies seguros
function startSecureSession(): void {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    $params = [
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params($params);
    } else {
        session_set_cookie_params($params['lifetime'], $params['path'] . '; samesite=' . $params['samesite'], $params['domain'], $params['secure'], $params['httponly']);
    }
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('PROGENESESESSID');
        session_start();
    }
}

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

startSecureSession();

try {
    $input = readJsonInput();
    $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'session');

    switch ($action) {
        case 'login': {
            $usuario = trim((string)($_POST['usuario'] ?? ($input['usuario'] ?? '')));
            $senha   = (string)($_POST['senha'] ?? ($input['senha'] ?? ''));

            if ($usuario === '' || $senha === '') {
                jsonResponse(['ok' => false, 'error' => 'Usuário e senha são obrigatórios'], 400);
            }

            $row = queryOne('SELECT id, nome, usuario, senha, cargo FROM usuarios WHERE usuario = :usuario LIMIT 1', [':usuario' => $usuario]);
            if (!$row) {
                jsonResponse(['ok' => false, 'error' => 'Credenciais inválidas'], 401);
            }

            // Verifica hash de senha
            $hash = (string)$row['senha'];
            $valid = password_verify($senha, $hash);

            if (!$valid) {
                jsonResponse(['ok' => false, 'error' => 'Credenciais inválidas'], 401);
            }

            session_regenerate_id(true);
            $_SESSION['user'] = [
                'id'      => (int)$row['id'],
                'nome'    => (string)$row['nome'],
                'usuario' => (string)$row['usuario'],
                'cargo'   => (string)($row['cargo'] ?? ''),
            ];

            jsonResponse(['ok' => true, 'user' => $_SESSION['user']]);
        }

        case 'logout': {
            $_SESSION = [];
            if (session_id() !== '') {
                @session_destroy();
            }
            // Remove cookie da sessão
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
            jsonResponse(['ok' => true]);
        }

        case 'session': {
            $auth = isset($_SESSION['user']) && is_array($_SESSION['user']);
            jsonResponse(['ok' => true, 'authenticated' => $auth, 'user' => $auth ? $_SESSION['user'] : null]);
        }

        default:
            jsonResponse(['ok' => false, 'error' => 'Ação inválida'], 400);
    }
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'error' => $e->getMessage()], 500);
}

?>
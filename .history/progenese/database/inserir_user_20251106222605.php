<?php
declare(strict_types=1);
/*
  Inserção de usuários (como usar):
  - Campos obrigatórios:
    - usuario: login único (3–64 caracteres)
    - senha: mínimo 8 caracteres (será armazenada com hash)
  - Campos opcionais:
    - nome: nome de exibição (se omitido, usa ucfirst(usuario))
    - cargo: função do usuário (padrão: "Usuário")

  Exemplos de chamada:
  - GET:
    /website2/progenese/database/inserir_user.php?usuario=joao&senha=segredo123&nome=Joao%20Silva&cargo=Administrador
  - POST (form):
    usuario=joao&senha=segredo123&nome=Joao%20Silva&cargo=Administrador
  - POST (JSON):
    {"usuario":"joao","senha":"segredo123","nome":"Joao Silva","cargo":"Administrador"}

  Retornos (JSON):
  - Sucesso: { ok: true, user_id: <id>, usuario: "joao" }
  - Erro:    { ok: false, error: "mensagem" }
*/

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../api/conexao.php';

function jsonResponse($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function readInput(): array {
  $raw = file_get_contents('php://input');
  $json = $raw ? json_decode($raw, true) : null;
  if (is_array($json)) return $json;
  return [
    'usuario' => $_POST['usuario'] ?? $_GET['usuario'] ?? null,
    'senha'   => $_POST['senha']   ?? $_GET['senha']   ?? null,
    'nome'    => $_POST['nome']    ?? $_GET['nome']    ?? null,
    'cargo'   => $_POST['cargo']   ?? $_GET['cargo']   ?? null,
  ];
}

try {
  $pdo = getConnection();
  $input = readInput();

  $usuario = trim((string)($input['usuario'] ?? ''));
  $senha   = (string)($input['senha'] ?? '');
  $nome    = trim((string)($input['nome'] ?? ''));
  $cargo   = trim((string)($input['cargo'] ?? 'Usuário'));

  if ($usuario === '' || $senha === '') {
    jsonResponse(['ok' => false, 'error' => 'Parâmetros obrigatórios: usuario, senha'], 400);
  }
  if (strlen($usuario) < 3 || strlen($usuario) > 64) {
    jsonResponse(['ok' => false, 'error' => 'Usuário inválido (3-64 caracteres)'], 400);
  }
  if (strlen($senha) < 8 || strlen($senha) > 128) {
    jsonResponse(['ok' => false, 'error' => 'Senha inválida (mínimo 8 caracteres)'], 400);
  }

  // Verifica se já existe
  $check = $pdo->prepare('SELECT id FROM usuarios WHERE usuario = :usuario LIMIT 1');
  $check->execute([':usuario' => $usuario]);
  $existing = $check->fetch(PDO::FETCH_ASSOC);
  if ($existing) {
    jsonResponse(['ok' => false, 'error' => 'Usuário já existe', 'user_id' => (int)$existing['id']], 409);
  }

  $hash = password_hash($senha, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO usuarios (nome, usuario, senha, cargo) VALUES (:nome, :usuario, :senha, :cargo)');
  $stmt->execute([
    ':nome' => $nome !== '' ? $nome : ucfirst($usuario),
    ':usuario' => $usuario,
    ':senha' => $hash,
    ':cargo' => $cargo !== '' ? $cargo : 'Usuário',
  ]);
  $id = (int)$pdo->lastInsertId();

  jsonResponse(['ok' => true, 'user_id' => $id, 'usuario' => $usuario]);
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Falha ao inserir usuário'], 500);
}
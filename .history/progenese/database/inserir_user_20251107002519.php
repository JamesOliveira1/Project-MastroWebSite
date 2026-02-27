<?php
declare(strict_types=1);
/*
  Inserção de usuários (como usar):
  - Campos obrigatórios:
    - usuario: login único (3–64 caracteres)
    - senha: mínimo 8 caracteres (será armazenada com hash)
  - Campos opcionais:
    - nome: nome de exibição (se omitido, usa ucfirst(usuario))
    - email: e-mail de contato (opcional, validado se informado)
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

header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../api/conexao.php';

function isJsonRequest(): bool {
  $ct = $_SERVER['CONTENT_TYPE'] ?? '';
  return stripos($ct, 'application/json') !== false;
}

function renderForm(?string $message = null, bool $success = false): void {
  header('Content-Type: text/html; charset=utf-8');
  $self = htmlspecialchars($_SERVER['PHP_SELF'] ?? '/progenese/database/inserir_user.php', ENT_QUOTES, 'UTF-8');
  $msgClass = $success ? 'alert-success' : 'alert-danger';
  echo "<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>Inserir Usuário</title>\n<link href=\"/website2/assets/vendor/bootstrap/css/bootstrap.min.css\" rel=\"stylesheet\">\n<style>body{padding:24px;max-width:720px;margin:0 auto} .card{box-shadow:0 2px 10px rgba(0,0,0,.08)} .small{color:#666}</style>\n</head>\n<body>\n<div class=\"card\">\n<div class=\"card-body\">\n<h1 class=\"h4 mb-3\">Inserir novo usuário</h1>\n<p class=\"small\">Preencha os campos abaixo e clique em Inserir. Senha mínima de 8 caracteres.</p>\n";
  if ($message) {
    echo "<div class=\"alert {$msgClass}\">" . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "</div>";
  }
  echo "<form method=\"post\" action=\"{$self}\" class=\"mt-3\">\n<div class=\"mb-3\">\n<label for=\"usuario\" class=\"form-label\">Usuário</label>\n<input type=\"text\" class=\"form-control\" id=\"usuario\" name=\"usuario\" required minlength=\"3\" maxlength=\"64\" autocomplete=\"username\" placeholder=\"ex.: joao\">\n</div>\n<div class=\"mb-3\">\n<label for=\"nome\" class=\"form-label\">Nome</label>\n<input type=\"text\" class=\"form-control\" id=\"nome\" name=\"nome\" autocomplete=\"name\" placeholder=\"ex.: João Silva\">\n</div>\n<div class=\"mb-3\">\n<label for=\"email\" class=\"form-label\">E-mail (opcional)</label>\n<input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" autocomplete=\"email\" placeholder=\"ex.: joao@empresa.com\">\n</div>\n<div class=\"mb-3\">\n<label for=\"senha\" class=\"form-label\">Senha</label>\n<input type=\"password\" class=\"form-control\" id=\"senha\" name=\"senha\" required minlength=\"8\" maxlength=\"128\" autocomplete=\"new-password\" placeholder=\"mínimo 8 caracteres\">\n</div>\n<div class=\"mb-3\">\n<label for=\"cargo\" class=\"form-label\">Cargo</label>\n<input type=\"text\" class=\"form-control\" id=\"cargo\" name=\"cargo\" placeholder=\"ex.: Usuário ou Administrador\" value=\"Usuário\">\n</div>\n<button type=\"submit\" class=\"btn btn-primary\">Inserir</button>\n</form>\n</div>\n</div>\n</body>\n</html>";
  exit;
}

function jsonResponse($data, int $status = 200): void {
  header('Content-Type: application/json; charset=utf-8');
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
    'email'   => $_POST['email']   ?? $_GET['email']   ?? null,
    'cargo'   => $_POST['cargo']   ?? $_GET['cargo']   ?? null,
  ];
}

try {
  // Se for GET sem parâmetros, mostra formulário para facilitar uso via navegador.
  if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $hasParams = isset($_GET['usuario']) || isset($_GET['senha']) || isset($_GET['nome']) || isset($_GET['email']) || isset($_GET['cargo']);
    if (!$hasParams) {
      renderForm();
    }
  }

  $pdo = getConnection();
  $input = readInput();

  $usuario = trim((string)($input['usuario'] ?? ''));
  $senha   = (string)($input['senha'] ?? '');
  $nome    = trim((string)($input['nome'] ?? ''));
  $email   = trim((string)($input['email'] ?? ''));
  $cargo   = trim((string)($input['cargo'] ?? 'Usuário'));

  if ($usuario === '' || $senha === '') {
    if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'Parâmetros obrigatórios: usuario, senha'], 400);
    renderForm('Parâmetros obrigatórios: usuário e senha', false);
  }
  if (strlen($usuario) < 3 || strlen($usuario) > 64) {
    if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'Usuário inválido (3-64 caracteres)'], 400);
    renderForm('Usuário inválido (3–64 caracteres)', false);
  }
  if (strlen($senha) < 8 || strlen($senha) > 128) {
    if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'Senha inválida (mínimo 8 caracteres)'], 400);
    renderForm('Senha inválida (mínimo 8 caracteres)', false);
  }

  // Validação básica de e-mail (se informado)
  if ($email !== '') {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'E-mail inválido'], 400);
      renderForm('E-mail inválido', false);
    }
    if (strlen($email) > 254) {
      if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'E-mail muito longo'], 400);
      renderForm('E-mail muito longo', false);
    }
  }

  // Verifica se já existe
  $check = $pdo->prepare('SELECT id FROM usuarios WHERE usuario = :usuario LIMIT 1');
  $check->execute([':usuario' => $usuario]);
  $existing = $check->fetch(PDO::FETCH_ASSOC);
  if ($existing) {
    if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'Usuário já existe', 'user_id' => (int)$existing['id']], 409);
    renderForm('Usuário já existe', false);
  }

  $hash = password_hash($senha, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO usuarios (nome, usuario, senha, email, cargo) VALUES (:nome, :usuario, :senha, :email, :cargo)');
  $stmt->execute([
    ':nome' => $nome !== '' ? $nome : ucfirst($usuario),
    ':usuario' => $usuario,
    ':senha' => $hash,
    ':email' => $email !== '' ? $email : null,
    ':cargo' => $cargo !== '' ? $cargo : 'Usuário',
  ]);
  $id = (int)$pdo->lastInsertId();

  if (isJsonRequest()) {
    jsonResponse(['ok' => true, 'user_id' => $id, 'usuario' => $usuario, 'email' => $email !== '' ? $email : null]);
  }
  renderForm("Usuário cadastrado com sucesso (id: {$id})", true);
} catch (Throwable $e) {
  if (isJsonRequest()) jsonResponse(['ok' => false, 'error' => 'Falha ao inserir usuário'], 500);
  renderForm('Falha ao inserir usuário', false);
}
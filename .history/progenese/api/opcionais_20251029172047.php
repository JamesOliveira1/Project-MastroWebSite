<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

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

try {
  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

  switch ($action) {
    case 'listar': {
      $barco_id = (int)($_GET['barco_id'] ?? $_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      if ($barco_id <= 0) {
        jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
      }
      $rows = queryAll('SELECT id, barco_id, nome, descricao, quantidade, instalado, observacao FROM opcionais WHERE barco_id = :barco_id ORDER BY id ASC', [':barco_id' => $barco_id]);
      jsonResponse(['ok' => true, 'data' => $rows]);
    }

    case 'adicionar': {
      $barco_id = (int)($_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      $nome = trim((string)($_POST['nome'] ?? ($input['nome'] ?? '')));
      $descricao = trim((string)($_POST['descricao'] ?? ($input['descricao'] ?? '')));
      $quantidadeRaw = ($_POST['quantidade'] ?? ($input['quantidade'] ?? 0));
      $instaladoRaw = ($_POST['instalado'] ?? ($input['instalado'] ?? 0));
      $observacao = trim((string)($_POST['observacao'] ?? ($input['observacao'] ?? '')));

      if ($barco_id <= 0 || $nome === '') {
        jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: barco_id, nome'], 400);
      }

      $quantidade = is_numeric($quantidadeRaw) ? (float)$quantidadeRaw : 0.0;
      $instalado = (int)$instaladoRaw === 1 ? 1 : 0;

      // Verifica se barco existe (opcional mas útil)
      $existsBoat = queryOne('SELECT id FROM barcos WHERE id = :id', [':id' => $barco_id]);
      if (!$existsBoat) {
        jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
      }

      $affected = execute('INSERT INTO opcionais (barco_id, nome, descricao, quantidade, instalado, observacao) VALUES (:barco_id, :nome, :descricao, :quantidade, :instalado, :observacao)', [
        ':barco_id' => $barco_id,
        ':nome' => $nome,
        ':descricao' => $descricao !== '' ? $descricao : null,
        ':quantidade' => $quantidade,
        ':instalado' => $instalado,
        ':observacao' => $observacao !== '' ? $observacao : null,
      ]);

      if ($affected < 1) {
        jsonResponse(['ok' => false, 'error' => 'Falha ao inserir opcional'], 500);
      }

      $id = (int)getConnection()->lastInsertId();
      $row = queryOne('SELECT id, barco_id, nome, descricao, quantidade, instalado, observacao FROM opcionais WHERE id = :id', [':id' => $id]);
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'editar': {
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);

      $existing = queryOne('SELECT id FROM opcionais WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Opcional não encontrado'], 404);

      $nome = isset($_POST['nome']) ? trim((string)$_POST['nome']) : ($input['nome'] ?? null);
      $descricao = isset($_POST['descricao']) ? trim((string)$_POST['descricao']) : ($input['descricao'] ?? null);
      $quantidade = isset($_POST['quantidade']) ? $_POST['quantidade'] : ($input['quantidade'] ?? null);
      $instalado = isset($_POST['instalado']) ? $_POST['instalado'] : ($input['instalado'] ?? null);
      $observacao = isset($_POST['observacao']) ? trim((string)$_POST['observacao']) : ($input['observacao'] ?? null);

      $fields = [];
      $params = [':id' => $id];

      if ($nome !== null) { $fields[] = 'nome = :nome'; $params[':nome'] = trim((string)$nome); }
      if ($descricao !== null) { $fields[] = 'descricao = :descricao'; $params[':descricao'] = trim((string)$descricao) !== '' ? trim((string)$descricao) : null; }
      if ($quantidade !== null) { $fields[] = 'quantidade = :quantidade'; $params[':quantidade'] = is_numeric($quantidade) ? (float)$quantidade : 0.0; }
      if ($instalado !== null) { $fields[] = 'instalado = :instalado'; $params[':instalado'] = ((int)$instalado === 1 ? 1 : 0); }
      if ($observacao !== null) { $fields[] = 'observacao = :observacao'; $params[':observacao'] = trim((string)$observacao) !== '' ? trim((string)$observacao) : null; }

      if (empty($fields)) {
        jsonResponse(['ok' => false, 'error' => 'Nenhum campo para atualizar'], 400);
      }

      $sql = 'UPDATE opcionais SET ' . implode(', ', $fields) . ' WHERE id = :id';
      $affected = execute($sql, $params);
      if ($affected < 1) {
        jsonResponse(['ok' => false, 'error' => 'Nenhum opcional atualizado'], 500);
      }
      $row = queryOne('SELECT id, barco_id, nome, descricao, quantidade, instalado, observacao FROM opcionais WHERE id = :id', [':id' => $id]);
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'excluir': {
      $id = (int)($_POST['id'] ?? ($input['id'] ?? 0));
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $opt = queryOne('SELECT id FROM opcionais WHERE id = :id', [':id' => $id]);
      if (!$opt) jsonResponse(['ok' => false, 'error' => 'Opcional não encontrado'], 404);

      $affected = execute('DELETE FROM opcionais WHERE id = :id', [':id' => $id]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir opcional'], 500);
      jsonResponse(['ok' => true, 'data' => ['id' => $id]]);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}
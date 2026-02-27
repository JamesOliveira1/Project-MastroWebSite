<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';
require_once __DIR__ . '/controles.php';

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
      $params = [];
      $sql = 'SELECT id, barco_id, descricao, data, categoria, observacao FROM servicos';
      if ($barco_id > 0) { $sql .= ' WHERE barco_id = :barco_id'; $params[':barco_id'] = $barco_id; }
      $sql .= ' ORDER BY id DESC';
      $rows = queryAll($sql, $params);
      jsonResponse(['ok' => true, 'data' => $rows]);
    }

    case 'adicionar': {
      $barco_id = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
      $descricao = trim((string)($input['descricao'] ?? $_POST['descricao'] ?? ''));
      $data = trim((string)($input['data'] ?? $_POST['data'] ?? date('Y-m-d')));
      $categoria = trim((string)($input['categoria'] ?? $_POST['categoria'] ?? ''));
      $observacao = trim((string)($input['observacao'] ?? $_POST['observacao'] ?? ''));
      if ($barco_id <= 0 || $descricao === '') {
        jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: barco_id, descricao'], 400);
      }
      $existsBoat = queryOne('SELECT id, cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => $barco_id]);
      if (!$existsBoat) { jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404); }

      $affected = execute('INSERT INTO servicos (barco_id, descricao, data, categoria, observacao) VALUES (:barco_id, :descricao, :data, :categoria, :observacao)', [
        ':barco_id' => $barco_id,
        ':descricao' => $descricao,
        ':data' => $data,
        ':categoria' => $categoria !== '' ? $categoria : null,
        ':observacao' => $observacao !== '' ? $observacao : null,
      ]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao inserir serviço'], 500);
      $id = (int)getConnection()->lastInsertId();
      $row = queryOne('SELECT id, barco_id, descricao, data, categoria, observacao FROM servicos WHERE id = :id', [':id' => $id]);
      try {
        $desc = 'adicionou serviço ("' . $descricao . '") em barco #' . $barco_id . ' — ' . (string)($existsBoat['modelo'] ?? '') . ' — ' . (string)($existsBoat['cliente_nome'] ?? '');
        logActivity('adicionar', 'servicos', $id, $barco_id, $desc);
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'editar': {
      $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id, descricao FROM servicos WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Serviço não encontrado'], 404);

      $descricao = isset($input['descricao']) ? trim((string)$input['descricao']) : (isset($_POST['descricao']) ? trim((string)$_POST['descricao']) : null);
      $data = isset($input['data']) ? trim((string)$input['data']) : (isset($_POST['data']) ? trim((string)$_POST['data']) : null);
      $categoria = isset($input['categoria']) ? trim((string)$input['categoria']) : (isset($_POST['categoria']) ? trim((string)$_POST['categoria']) : null);
      $observacao = isset($input['observacao']) ? trim((string)$input['observacao']) : (isset($_POST['observacao']) ? trim((string)$_POST['observacao']) : null);

      $fields = [];
      $params = [':id' => $id];
      if ($descricao !== null) { $fields[] = 'descricao = :descricao'; $params[':descricao'] = $descricao; }
      if ($data !== null) { $fields[] = 'data = :data'; $params[':data'] = $data; }
      if ($categoria !== null) { $fields[] = 'categoria = :categoria'; $params[':categoria'] = $categoria !== '' ? $categoria : null; }
      if ($observacao !== null) { $fields[] = 'observacao = :observacao'; $params[':observacao'] = $observacao !== '' ? $observacao : null; }
      if (empty($fields)) jsonResponse(['ok' => false, 'error' => 'Nenhum campo para atualizar'], 400);

      $sql = 'UPDATE servicos SET ' . implode(', ', $fields) . ' WHERE id = :id';
      $affected = execute($sql, $params);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Nenhum serviço atualizado'], 500);
      $row = queryOne('SELECT id, barco_id, descricao, data, categoria, observacao FROM servicos WHERE id = :id', [':id' => $id]);
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$row['barco_id']]);
        $desc = 'editou serviço ("' . (string)($row['descricao'] ?? '') . '") em barco #' . (int)$row['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        logActivity('editar', 'servicos', (int)$row['id'], (int)$row['barco_id'], $desc);
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'excluir': {
      $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id, descricao FROM servicos WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Serviço não encontrado'], 404);
      $affected = execute('DELETE FROM servicos WHERE id = :id', [':id' => $id]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir serviço'], 500);
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$existing['barco_id']]);
        $desc = 'excluiu serviço ("' . (string)($existing['descricao'] ?? '') . '") em barco #' . (int)$existing['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        logActivity('excluir', 'servicos', $id, (int)$existing['barco_id'], $desc);
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'data' => ['id' => $id]]);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}
?>
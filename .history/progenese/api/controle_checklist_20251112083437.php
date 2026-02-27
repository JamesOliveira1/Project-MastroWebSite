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
      $sql = 'SELECT id, barco_id, item_verificado, data_verificacao, responsavel, resultado, comentario, documento_id FROM controles';
      if ($barco_id > 0) { $sql .= ' WHERE barco_id = :barco_id'; $params[':barco_id'] = $barco_id; }
      $sql .= ' ORDER BY id DESC';
      $rows = queryAll($sql, $params);
      jsonResponse(['ok' => true, 'data' => $rows]);
    }

    case 'adicionar': {
      $barco_id = (int)($input['barco_id'] ?? $_POST['barco_id'] ?? 0);
      $item = trim((string)($input['item_verificado'] ?? $_POST['item_verificado'] ?? ''));
      $data = trim((string)($input['data_verificacao'] ?? $_POST['data_verificacao'] ?? date('Y-m-d')));
      $responsavel = trim((string)($input['responsavel'] ?? $_POST['responsavel'] ?? ''));
      $resultado = trim((string)($input['resultado'] ?? $_POST['resultado'] ?? ''));
      $comentario = trim((string)($input['comentario'] ?? $_POST['comentario'] ?? ''));
      $documento_id = (int)($input['documento_id'] ?? $_POST['documento_id'] ?? 0);
      if ($barco_id <= 0 || $item === '') {
        jsonResponse(['ok' => false, 'error' => 'Campos obrigatórios: barco_id, item_verificado'], 400);
      }
      $existsBoat = queryOne('SELECT id, cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => $barco_id]);
      if (!$existsBoat) { jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404); }

      $affected = execute('INSERT INTO controles (barco_id, item_verificado, data_verificacao, responsavel, resultado, comentario, documento_id) VALUES (:barco_id, :item, :data, :responsavel, :resultado, :comentario, :documento_id)', [
        ':barco_id' => $barco_id,
        ':item' => $item,
        ':data' => $data,
        ':responsavel' => $responsavel !== '' ? $responsavel : null,
        ':resultado' => $resultado !== '' ? $resultado : null,
        ':comentario' => $comentario !== '' ? $comentario : null,
        ':documento_id' => $documento_id > 0 ? $documento_id : null,
      ]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao inserir controle'], 500);
      $id = (int)getConnection()->lastInsertId();
      $row = queryOne('SELECT id, barco_id, item_verificado, data_verificacao, responsavel, resultado, comentario, documento_id FROM controles WHERE id = :id', [':id' => $id]);
      try {
        $desc = 'adicionou controle ("' . $item . '") em barco #' . $barco_id . ' — ' . (string)($existsBoat['modelo'] ?? '') . ' — ' . (string)($existsBoat['cliente_nome'] ?? '');
        logActivity('adicionar', 'controles', $id, $barco_id, $desc);
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'editar': {
      $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id FROM controles WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Controle não encontrado'], 404);

      $item = isset($input['item_verificado']) ? trim((string)$input['item_verificado']) : (isset($_POST['item_verificado']) ? trim((string)$_POST['item_verificado']) : null);
      $data = isset($input['data_verificacao']) ? trim((string)$input['data_verificacao']) : (isset($_POST['data_verificacao']) ? trim((string)$_POST['data_verificacao']) : null);
      $responsavel = isset($input['responsavel']) ? trim((string)$input['responsavel']) : (isset($_POST['responsavel']) ? trim((string)$_POST['responsavel']) : null);
      $resultado = isset($input['resultado']) ? trim((string)$input['resultado']) : (isset($_POST['resultado']) ? trim((string)$_POST['resultado']) : null);
      $comentario = isset($input['comentario']) ? trim((string)$input['comentario']) : (isset($_POST['comentario']) ? trim((string)$_POST['comentario']) : null);
      $documento_id = isset($input['documento_id']) ? (int)$input['documento_id'] : (isset($_POST['documento_id']) ? (int)$_POST['documento_id'] : null);

      $fields = [];
      $params = [':id' => $id];
      if ($item !== null) { $fields[] = 'item_verificado = :item'; $params[':item'] = $item; }
      if ($data !== null) { $fields[] = 'data_verificacao = :data'; $params[':data'] = $data; }
      if ($responsavel !== null) { $fields[] = 'responsavel = :responsavel'; $params[':responsavel'] = $responsavel !== '' ? $responsavel : null; }
      if ($resultado !== null) { $fields[] = 'resultado = :resultado'; $params[':resultado'] = $resultado !== '' ? $resultado : null; }
      if ($comentario !== null) { $fields[] = 'comentario = :comentario'; $params[':comentario'] = $comentario !== '' ? $comentario : null; }
      if ($documento_id !== null) { $fields[] = 'documento_id = :documento_id'; $params[':documento_id'] = $documento_id > 0 ? $documento_id : null; }
      if (empty($fields)) jsonResponse(['ok' => false, 'error' => 'Nenhum campo para atualizar'], 400);

      $sql = 'UPDATE controles SET ' . implode(', ', $fields) . ' WHERE id = :id';
      $affected = execute($sql, $params);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Nenhum controle atualizado'], 500);
      $row = queryOne('SELECT id, barco_id, item_verificado, data_verificacao, responsavel, resultado, comentario, documento_id FROM controles WHERE id = :id', [':id' => $id]);
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$row['barco_id']]);
        $desc = 'editou controle ("' . (string)($row['item_verificado'] ?? '') . '") em barco #' . (int)$row['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        logActivity('editar', 'controles', (int)$row['id'], (int)$row['barco_id'], $desc);
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'data' => $row]);
    }

    case 'excluir': {
      $id = (int)($input['id'] ?? $_POST['id'] ?? 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id, item_verificado FROM controles WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Controle não encontrado'], 404);
      $affected = execute('DELETE FROM controles WHERE id = :id', [':id' => $id]);
      if ($affected < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir controle'], 500);
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$existing['barco_id']]);
        $desc = 'excluiu controle ("' . (string)($existing['item_verificado'] ?? '') . '") em barco #' . (int)$existing['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        logActivity('excluir', 'controles', $id, (int)$existing['barco_id'], $desc);
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
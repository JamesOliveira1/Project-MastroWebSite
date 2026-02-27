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

function getInt($arr, string $key, int $default = 0): int {
  $v = $arr[$key] ?? $default;
  return is_numeric($v) ? (int)$v : $default;
}

function sanitizeFileName(string $name): string {
  $name = preg_replace('/[^A-Za-z0-9_\.-]+/', '_', $name);
  return trim($name, '_');
}

try {
  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'listar');

  switch ($action) {
    case 'listar': {
      $barco_id = getInt($_GET + $_POST + $input, 'barco_id', 0);
      if ($barco_id <= 0) jsonResponse(['ok' => false, 'error' => 'barco_id obrigatório'], 400);
      $cats = queryAll('SELECT id, barco_id, nome, numero FROM categoria_servicos WHERE barco_id = :barco ORDER BY numero ASC', [':barco' => $barco_id]);
      $result = [];
      foreach ($cats as $c) {
        $svcs = queryAll('SELECT id, barco_id, descricao, data_inicio, data_concluido, categoria_id, observacao, status, COALESCE(posicao, id) AS posicao FROM servicos WHERE categoria_id = :cid ORDER BY posicao ASC, id ASC', [':cid' => (int)$c['id']]);
        $mapped = [];
        foreach ($svcs as $s) {
          $ctl = queryOne('SELECT item_verificado, data_verificacao, responsavel, resultado, link, comentario FROM controles WHERE servico_id = :sid', [':sid' => (int)$s['id']]);
          $mapped[] = [
            'id' => (int)$s['id'],
            'nome' => (string)$s['descricao'],
            'status' => (string)($s['status'] ?? 'Pendente'),
            'concluido' => ((string)($s['status'] ?? '') === 'Concluído'),
            'cq' => (string)($ctl['resultado'] ?? ''),
            'obs' => (string)($s['observacao'] ?? ''),
            'iniciadoEm' => (string)($s['data_inicio'] ?? ''),
            'realizadoEm' => (string)($s['data_concluido'] ?? ''),
            'anexoLink' => (string)($ctl['link'] ?? ''),
            'posicao' => (int)$s['posicao']
          ];
        }
        $result[] = [
          'id' => (int)$c['id'],
          'numero' => (int)$c['numero'],
          'nome' => (string)$c['nome'],
          'servicos' => $mapped
        ];
      }
      jsonResponse(['ok' => true, 'categorias' => $result]);
    }

    case 'categoria_adicionar': {
      $barco_id = getInt($input + $_POST, 'barco_id', 0);
      $nome = trim((string)($input['nome'] ?? $_POST['nome'] ?? ''));
      if ($barco_id <= 0 || $nome === '') jsonResponse(['ok' => false, 'error' => 'barco_id e nome obrigatórios'], 400);
      $max = queryOne('SELECT COALESCE(MAX(numero),0) AS m FROM categoria_servicos WHERE barco_id = :b', [':b' => $barco_id]);
      $numero = ((int)$max['m']) + 1;
      $aff = execute('INSERT INTO categoria_servicos (barco_id, nome, numero) VALUES (:b, :n, :num)', [':b' => $barco_id, ':n' => $nome, ':num' => $numero]);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao criar categoria'], 500);
      $id = (int)getConnection()->lastInsertId();
      jsonResponse(['ok' => true, 'categoria' => ['id' => $id, 'barco_id' => $barco_id, 'nome' => $nome, 'numero' => $numero]]);
    }

    case 'categoria_editar': {
      $id = getInt($input + $_POST, 'id', 0);
      $nome = isset($input['nome']) ? trim((string)$input['nome']) : (isset($_POST['nome']) ? trim((string)$_POST['nome']) : null);
      $numero = isset($input['numero']) ? (int)$input['numero'] : (isset($_POST['numero']) ? (int)$_POST['numero'] : null);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $fields = [];
      $params = [':id' => $id];
      if ($nome !== null) { $fields[] = 'nome = :n'; $params[':n'] = $nome; }
      if ($numero !== null) { $fields[] = 'numero = :num'; $params[':num'] = $numero; }
      if (empty($fields)) jsonResponse(['ok' => false, 'error' => 'Nenhum campo'], 400);
      $aff = execute('UPDATE categoria_servicos SET ' . implode(', ', $fields) . ' WHERE id = :id', $params);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao atualizar'], 500);
      jsonResponse(['ok' => true]);
    }

    case 'categoria_excluir': {
      $id = getInt($input + $_POST, 'id', 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $aff = execute('DELETE FROM categoria_servicos WHERE id = :id', [':id' => $id]);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir'], 500);
      jsonResponse(['ok' => true]);
    }

    case 'servico_adicionar': {
      $barco_id = getInt($input + $_POST, 'barco_id', 0);
      $categoria_id = getInt($input + $_POST, 'categoria_id', 0);
      $descricao = trim((string)($input['descricao'] ?? $_POST['descricao'] ?? 'Serviço'));
      if ($barco_id <= 0 || $categoria_id <= 0) jsonResponse(['ok' => false, 'error' => 'barco_id e categoria_id obrigatórios'], 400);
      $max = queryOne('SELECT COALESCE(MAX(COALESCE(posicao,id)),0) AS m FROM servicos WHERE categoria_id = :c', [':c' => $categoria_id]);
      $pos = ((int)$max['m']) + 1;
      $aff = execute('INSERT INTO servicos (barco_id, descricao, categoria_id, status, posicao) VALUES (:b, :d, :c, :s, :p)', [':b' => $barco_id, ':d' => $descricao, ':c' => $categoria_id, ':s' => 'Pendente', ':p' => $pos]);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao criar serviço'], 500);
      $id = (int)getConnection()->lastInsertId();
      $row = queryOne('SELECT id, barco_id, descricao, data_inicio, data_concluido, categoria_id, observacao, status, posicao FROM servicos WHERE id = :id', [':id' => $id]);
      try { logActivity('adicionar', 'servicos', $id, $barco_id, 'adicionou serviço "' . (string)$row['descricao'] . '" no barco #' . $barco_id); } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'servico' => $row]);
    }

    case 'servico_editar': {
      $id = getInt($input + $_POST, 'id', 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id, descricao, status FROM servicos WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Serviço não encontrado'], 404);
      $fields = [];
      $params = [':id' => $id];
      foreach ([
        'descricao' => 'descricao',
        'status' => 'status',
        'observacao' => 'observacao',
        'data_inicio' => 'data_inicio',
        'data_concluido' => 'data_concluido',
        'posicao' => 'posicao'
      ] as $k => $col) {
        if (array_key_exists($k, $input) || array_key_exists($k, $_POST)) {
          $val = $input[$k] ?? $_POST[$k];
          $fields[] = $col . ' = :' . $k;
          $params[':' . $k] = $val;
        }
      }
      if (empty($fields)) jsonResponse(['ok' => false, 'error' => 'Nenhum campo'], 400);
      $aff = execute('UPDATE servicos SET ' . implode(', ', $fields) . ' WHERE id = :id', $params);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao atualizar'], 500);
      if (array_key_exists('status', $input) || array_key_exists('status', $_POST)) {
        $newStatus = (string)($input['status'] ?? $_POST['status'] ?? '');
        if ($newStatus !== '' && $newStatus !== (string)($existing['status'] ?? '')) {
          try { logActivity('editar', 'servicos', $id, (int)$existing['barco_id'], 'alterou status do serviço "' . (string)$existing['descricao'] . '" para ' . $newStatus . ' no barco #' . (int)$existing['barco_id']); } catch (Throwable $_) {}
        }
      }
      jsonResponse(['ok' => true]);
    }

    case 'servico_excluir': {
      $id = getInt($input + $_POST, 'id', 0);
      if ($id <= 0) jsonResponse(['ok' => false, 'error' => 'ID inválido'], 400);
      $existing = queryOne('SELECT id, barco_id, descricao FROM servicos WHERE id = :id', [':id' => $id]);
      if (!$existing) jsonResponse(['ok' => false, 'error' => 'Serviço não encontrado'], 404);
      $aff = execute('DELETE FROM servicos WHERE id = :id', [':id' => $id]);
      if ($aff < 1) jsonResponse(['ok' => false, 'error' => 'Falha ao excluir'], 500);
      try { logActivity('excluir', 'servicos', $id, (int)$existing['barco_id'], 'excluiu serviço "' . (string)$existing['descricao'] . '" no barco #' . (int)$existing['barco_id']); } catch (Throwable $_) {}
      jsonResponse(['ok' => true]);
    }

    case 'servico_mover': {
      $updates = $input['updates'] ?? $_POST['updates'] ?? [];
      if (!is_array($updates) || empty($updates)) jsonResponse(['ok' => false, 'error' => 'updates vazio'], 400);
      foreach ($updates as $u) {
        if (!isset($u['id'], $u['posicao'])) continue;
        execute('UPDATE servicos SET posicao = :p WHERE id = :id', [':p' => (int)$u['posicao'], ':id' => (int)$u['id']]);
      }
      jsonResponse(['ok' => true]);
    }

    case 'categoria_mover': {
      $updates = $input['updates'] ?? $_POST['updates'] ?? [];
      if (!is_array($updates) || empty($updates)) jsonResponse(['ok' => false, 'error' => 'updates vazio'], 400);
      foreach ($updates as $u) {
        if (!isset($u['id'], $u['numero'])) continue;
        execute('UPDATE categoria_servicos SET numero = :n WHERE id = :id', [':n' => (int)$u['numero'], ':id' => (int)$u['id']]);
      }
      jsonResponse(['ok' => true]);
    }

    case 'controle_editar': {
      $servico_id = getInt($input + $_POST, 'servico_id', 0);
      if ($servico_id <= 0) jsonResponse(['ok' => false, 'error' => 'servico_id obrigatório'], 400);
      $existing = queryOne('SELECT id FROM controles WHERE servico_id = :s', [':s' => $servico_id]);
      $svc = queryOne('SELECT descricao, barco_id FROM servicos WHERE id = :id', [':id' => $servico_id]);
      $data = [
        'item_verificado' => $input['item_verificado'] ?? $_POST['item_verificado'] ?? null,
        'data_verificacao' => $input['data_verificacao'] ?? $_POST['data_verificacao'] ?? null,
        'responsavel' => $input['responsavel'] ?? $_POST['responsavel'] ?? null,
        'resultado' => $input['resultado'] ?? $_POST['resultado'] ?? null,
        'comentario' => $input['comentario'] ?? $_POST['comentario'] ?? null,
      ];
      if ($existing) {
        $fields = [];
        $params = [':id' => (int)$existing['id']];
        foreach ($data as $k => $v) { if ($v !== null) { $fields[] = "$k = :$k"; $params[":$k"] = $v; } }
        if (empty($fields)) jsonResponse(['ok' => true]);
        // Detecta alteração de resultado
        $prev = queryOne('SELECT resultado FROM controles WHERE id = :id', [':id' => (int)$existing['id']]);
        execute('UPDATE controles SET ' . implode(', ', $fields) . ' WHERE id = :id', $params);
        if ($data['resultado'] !== null && (string)$data['resultado'] !== (string)($prev['resultado'] ?? '')) {
          try { logActivity('editar', 'controles', (int)$existing['id'], (int)($svc['barco_id'] ?? 0), 'alterou controle de qualidade do serviço "' . (string)($svc['descricao'] ?? '') . '" para ' . (string)$data['resultado'] . ' no barco #' . (int)($svc['barco_id'] ?? 0)); } catch (Throwable $_) {}
        }
      } else {
        execute('INSERT INTO controles (servico_id, item_verificado, data_verificacao, responsavel, resultado, comentario) VALUES (:s, :i, :d, :r, :res, :c)', [
          ':s' => $servico_id,
          ':i' => $data['item_verificado'],
          ':d' => $data['data_verificacao'],
          ':r' => $data['responsavel'],
          ':res' => $data['resultado'],
          ':c' => $data['comentario'],
        ]);
        $cid = (int)getConnection()->lastInsertId();
        if ($data['resultado'] !== null) {
          try { logActivity('adicionar', 'controles', $cid, (int)($svc['barco_id'] ?? 0), 'definiu controle de qualidade do serviço "' . (string)($svc['descricao'] ?? '') . '" como ' . (string)$data['resultado'] . ' no barco #' . (int)($svc['barco_id'] ?? 0)); } catch (Throwable $_) {}
        }
      }
      jsonResponse(['ok' => true]);
    }

    case 'upload_controle': {
      $servico_id = getInt($_POST, 'servico_id', 0);
      if ($servico_id <= 0) jsonResponse(['ok' => false, 'error' => 'servico_id obrigatório'], 400);
      if (!isset($_FILES['anexo']) || !is_uploaded_file($_FILES['anexo']['tmp_name'])) jsonResponse(['ok' => false, 'error' => 'Arquivo ausente'], 400);
      $srv = queryOne('SELECT barco_id FROM servicos WHERE id = :id', [':id' => $servico_id]);
      if (!$srv || (int)$srv['barco_id'] <= 0) jsonResponse(['ok' => false, 'error' => 'Serviço não vinculado a barco'], 400);
      $barco_id = (int)$srv['barco_id'];
      $dir = dirname(__DIR__) . '/docs/' . $barco_id;
      if (!is_dir($dir)) @mkdir($dir, 0777, true);
      $orig = sanitizeFileName($_FILES['anexo']['name']);
      $fname = 'controle_' . $servico_id . '_' . time() . '_' . $orig;
      $path = $dir . '/' . $fname;
      if (!move_uploaded_file($_FILES['anexo']['tmp_name'], $path)) jsonResponse(['ok' => false, 'error' => 'Falha ao salvar arquivo'], 500);
      $link = '/progenese/docs/' . $barco_id . '/' . $fname;
      $existing = queryOne('SELECT id FROM controles WHERE servico_id = :s', [':s' => $servico_id]);
      if ($existing) {
        execute('UPDATE controles SET link = :l WHERE id = :id', [':l' => $link, ':id' => (int)$existing['id']]);
      } else {
        execute('INSERT INTO controles (servico_id, link) VALUES (:s, :l)', [':s' => $servico_id, ':l' => $link]);
      }
      jsonResponse(['ok' => true, 'link' => $link]);
    }

    default:
      jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}
?>
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

function getFirebirdConnection(): PDO {
  // Parâmetros conforme progenese/javascript/sync.php
  $dsn = 'firebird:dbname=D:\\GD_XNAV\\Banco\\PRODOC.FDB;charset=UTF8';
  $user = 'sysdba';
  $password = 'masterkey';

  $options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_TIMEOUT => 10,
    PDO::ATTR_PERSISTENT => false,
  ];

  // Validação do driver Firebird
  $drivers = PDO::getAvailableDrivers();
  if (!in_array('firebird', $drivers, true)) {
    throw new RuntimeException('Driver PDO Firebird não disponível no servidor.');
  }

  return new PDO($dsn, $user, $password, $options);
}

function ensureInventarioTable(PDO $sqlite): void {
  // Cria a tabela se não existir, garantindo UNIQUE em codigo_produto
  $sqlite->exec('CREATE TABLE IF NOT EXISTS itens_inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    codigo_produto TEXT UNIQUE NOT NULL,
    unidade_medida TEXT,
    categoria TEXT,
    quantidade_estoque INTEGER,
    tipo TEXT
  )');
  $sqlite->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_itens_inventario_codigo ON itens_inventario(codigo_produto)');
}

function fetchProdutosFirebird(PDO $fb): array {
  $sql = 'SELECT
    r.COD_PRODUTO AS codigo_produto,
    u.DSC_EXTENCAO_UNIDADE AS unidade_medida,
    r.DSC_PRODUTO AS nome,
    COALESCE(SUM(e.NUM_QUANTIDADE), 0) AS quantidade_estoque,
    c.DSC_CAT_PRODUTO AS categoria
  FROM PRODUTO r
  LEFT JOIN CATEGORIA_PRODUTO c ON c.SEQ_CAT_PRODUTO = r.SEQ_CAT_PRODUTO
  LEFT JOIN UNIDADE u ON u.COD_UNIDADE = r.COD_UNIDADE
  LEFT JOIN ESTOQUE e ON e.COD_PRODUTO = r.COD_PRODUTO
  GROUP BY r.COD_PRODUTO, u.DSC_EXTENCAO_UNIDADE, r.DSC_PRODUTO, c.DSC_CAT_PRODUTO
  ORDER BY r.COD_PRODUTO DESC';
  $stmt = $fb->query($sql);
  return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function clampInt(int $n, int $min, int $max): int { return max($min, min($max, $n)); }

try {
  $input = readJsonInput();
  $action = $_GET['action'] ?? $_POST['action'] ?? ($input['action'] ?? 'sincronizar');

  // Rotas: sincronizar (Firebird->SQLite), buscar (itens_inventario), adicionar_item_barco (inventario_barco), exportar_excel_inventario
  switch ($action) {
    case 'sincronizar': {
      $batchSize = (int)($_GET['batch_size'] ?? $_POST['batch_size'] ?? ($input['batch_size'] ?? 250));
      $batchSize = clampInt($batchSize, 50, 1000);

      $fb = getFirebirdConnection();
      $sqlite = getConnection();
      ensureInventarioTable($sqlite);

      $existingRows = queryAll('SELECT codigo_produto FROM itens_inventario');
      $existingSet = [];
      foreach ($existingRows as $er) {
        if (isset($er['codigo_produto'])) {
          $existingSet[(string)$er['codigo_produto']] = true;
        }
      }

      $produtos = fetchProdutosFirebird($fb);
      $total = count($produtos);

      $upsertSql = 'INSERT INTO itens_inventario (nome, codigo_produto, unidade_medida, categoria, quantidade_estoque)
                    VALUES (:nome, :codigo_produto, :unidade_medida, :categoria, :quantidade_estoque)
                    ON CONFLICT(codigo_produto) DO UPDATE SET
                      nome = excluded.nome,
                      unidade_medida = excluded.unidade_medida,
                      categoria = excluded.categoria,
                      quantidade_estoque = excluded.quantidade_estoque';
      $stmt = $sqlite->prepare($upsertSql);

      $inserted = 0;
      $updated = 0;
      $skipped = 0;
      $batches = 0;

      $chunks = array_chunk($produtos, $batchSize);
      foreach ($chunks as $chunk) {
        $batches++;
        $sqlite->beginTransaction();
        try {
          foreach ($chunk as $row) {
            $codigo = trim((string)($row['codigo_produto'] ?? ''));
            $nome = trim((string)($row['nome'] ?? ''));
            $unidade = trim((string)($row['unidade_medida'] ?? ''));
            $categoria = trim((string)($row['categoria'] ?? ''));
            $quantidade = $row['quantidade_estoque'] ?? 0;
            $quantidade = is_numeric($quantidade) ? (int)round((float)$quantidade) : 0;

            if ($codigo === '' || $nome === '') {
              $skipped++;
              continue;
            }

            $stmt->execute([
              ':nome' => $nome,
              ':codigo_produto' => $codigo,
              ':unidade_medida' => $unidade !== '' ? $unidade : null,
              ':categoria' => $categoria !== '' ? $categoria : null,
              ':quantidade_estoque' => $quantidade,
            ]);

            if (isset($existingSet[$codigo])) {
              $updated++;
            } else {
              $inserted++;
              $existingSet[$codigo] = true;
            }
          }
          $sqlite->commit();
        } catch (Throwable $e) {
          $sqlite->rollBack();
          throw $e;
        }
      }

      $fb = null;
      $sqlite = null;

      jsonResponse([
        'ok' => true,
        'message' => 'Sincronização concluída',
        'inserted' => $inserted,
        'updated' => $updated,
        'skipped' => $skipped,
        'total' => $total,
        'batch_size' => $batchSize,
        'batches' => $batches
      ]);
      break;
    }
    case 'buscar': {
      $sqlite = getConnection();
      ensureInventarioTable($sqlite);

      $q = trim((string)($_GET['q'] ?? $_POST['q'] ?? ($input['q'] ?? '')));
      $limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? ($input['limit'] ?? 30));
      $limit = clampInt($limit, 1, 100);
      $offset = (int)($_GET['offset'] ?? $_POST['offset'] ?? ($input['offset'] ?? 0));
      $offset = max(0, $offset);

      if ($q === '') {
        jsonResponse(['ok' => true, 'items' => []]);
      }

      // Busca por código prefixo e nome contendo
      $sql = 'SELECT id, codigo_produto, nome, unidade_medida, tipo, categoria, quantidade_estoque
              FROM itens_inventario
              WHERE codigo_produto LIKE :codigo OR nome LIKE :nome
              ORDER BY codigo_produto ASC
              LIMIT :limit OFFSET :offset';
      $stmt = $sqlite->prepare($sql);
      $codigoLike = $q . '%';
      $nomeLike = '%' . $q . '%';
      $stmt->bindValue(':codigo', $codigoLike, PDO::PARAM_STR);
      $stmt->bindValue(':nome', $nomeLike, PDO::PARAM_STR);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
      $stmt->execute();
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

      $sqlite = null;
      jsonResponse(['ok' => true, 'items' => $rows, 'offset' => $offset, 'limit' => $limit]);
      break;
    }
    case 'adicionar_item_barco': {
      $sqlite = getConnection();
      ensureInventarioTable($sqlite);

      $barcoId = (int)($_GET['barco_id'] ?? $_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      $itemId = (int)($_GET['item_id'] ?? $_POST['item_id'] ?? ($input['item_id'] ?? 0));
      $codigo = trim((string)($_GET['codigo_produto'] ?? $_POST['codigo_produto'] ?? ($input['codigo_produto'] ?? '')));
      $quantidade = (float)($_GET['quantidade'] ?? $_POST['quantidade'] ?? ($input['quantidade'] ?? 0));
      $observacao = trim((string)($_GET['observacao'] ?? $_POST['observacao'] ?? ($input['observacao'] ?? '')));
      $data = trim((string)($_GET['data'] ?? $_POST['data'] ?? ($input['data'] ?? date('Y-m-d'))));
      $tipo = trim((string)($_GET['tipo'] ?? $_POST['tipo'] ?? ($input['tipo'] ?? '')));

      if ($barcoId <= 0) {
        jsonResponse(['ok' => false, 'error' => 'barco_id inválido'], 400);
      }
      if (!is_finite($quantidade) || $quantidade <= 0) {
        jsonResponse(['ok' => false, 'error' => 'Quantidade deve ser maior que zero'], 400);
      }

      // Verifica barco existe
      $existsBoat = queryOne('SELECT id FROM barcos WHERE id = :id', [':id' => $barcoId]);
      if (!$existsBoat) {
        jsonResponse(['ok' => false, 'error' => 'Barco não encontrado'], 404);
      }

      // Recupera item por item_id ou código
      $item = null;
      if ($itemId > 0) {
        $item = queryOne('SELECT id, nome, codigo_produto, unidade_medida, tipo, categoria FROM itens_inventario WHERE id = :id', [':id' => $itemId]);
      } elseif ($codigo !== '') {
        $item = queryOne('SELECT id, nome, codigo_produto, unidade_medida, tipo, categoria FROM itens_inventario WHERE codigo_produto = :codigo', [':codigo' => $codigo]);
      }

      if (!$item || !isset($item['id'])) {
        jsonResponse(['ok' => false, 'error' => 'Item não encontrado no catálogo'], 404);
      }

      // Inserção transacional (atualiza tipo do item no catálogo, se informado)
      $sqlite->beginTransaction();
      try {
        if ($tipo !== '') {
          execute('UPDATE itens_inventario SET tipo = :tipo WHERE id = :id', [
            ':tipo' => $tipo,
            ':id' => (int)$item['id'],
          ]);
          // Reflete tipo atualizado no retorno
          $item['tipo'] = $tipo;
        }
        $affected = execute('INSERT INTO inventario_barco (barco_id, item_id, nome_item, codigo_produto, quantidade, unidade_medida, data, observacao)
                             VALUES (:barco_id, :item_id, :nome_item, :codigo_produto, :quantidade, :unidade_medida, :data, :observacao)', [
          ':barco_id' => $barcoId,
          ':item_id' => (int)$item['id'],
          ':nome_item' => (string)$item['nome'],
          ':codigo_produto' => (string)$item['codigo_produto'],
          ':quantidade' => (float)$quantidade,
          ':unidade_medida' => isset($item['unidade_medida']) && $item['unidade_medida'] !== '' ? (string)$item['unidade_medida'] : null,
          ':data' => $data !== '' ? $data : date('Y-m-d'),
          ':observacao' => $observacao !== '' ? $observacao : null,
        ]);
        if ($affected < 1) {
          throw new RuntimeException('Falha ao inserir item no inventário do barco');
        }
        $lastId = queryOne('SELECT last_insert_rowid() AS id');
        $sqlite->commit();

        jsonResponse([
          'ok' => true,
          'message' => 'Item adicionado ao inventário do barco',
          'item' => [
            'inventario_id' => (int)($lastId['id'] ?? 0),
            'barco_id' => $barcoId,
            'item_id' => (int)$item['id'],
            'nome_item' => (string)$item['nome'],
            'codigo_produto' => (string)$item['codigo_produto'],
            'quantidade' => (float)$quantidade,
            'unidade_medida' => $item['unidade_medida'] ?? null,
            'data' => $data !== '' ? $data : date('Y-m-d'),
            'observacao' => $observacao !== '' ? $observacao : null,
            'tipo' => $item['tipo'] ?? null,
            'categoria' => $item['categoria'] ?? null,
          ]
        ]);
        // Log de atividade: adicionar item ao inventário do barco
        try {
          $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => $barcoId]);
          $desc = 'adicionou inventário "' . (string)$item['nome'] . '" (cod ' . (string)$item['codigo_produto'] . ', qtd ' . (float)$quantidade . ') em barco #' . $barcoId . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
          logActivity('adicionar', 'inventario', (int)($lastId['id'] ?? 0), $barcoId, $desc);
        } catch (Throwable $_) {}
      } catch (Throwable $e) {
        $sqlite->rollBack();
        throw $e;
      }

      break;
    }
    case 'editar_item_barco': {
      $sqlite = getConnection();
      ensureInventarioTable($sqlite);

      $invId = (int)($_GET['id'] ?? $_POST['id'] ?? ($input['id'] ?? 0));
      if ($invId <= 0) { jsonResponse(['ok' => false, 'error' => 'ID de inventário inválido'], 400); }

      $row = queryOne('SELECT ib.id, ib.barco_id, ib.item_id, ib.nome_item, ib.codigo_produto, ib.quantidade, ib.unidade_medida, ib.data, ib.observacao
                       FROM inventario_barco ib WHERE ib.id = :id', [':id' => $invId]);
      if (!$row) { jsonResponse(['ok' => false, 'error' => 'Item de inventário não encontrado'], 404); }

      $quantidade = isset($input['quantidade']) ? (float)$input['quantidade'] : (isset($_POST['quantidade']) ? (float)$_POST['quantidade'] : null);
      $data = isset($input['data']) ? trim((string)$input['data']) : (isset($_POST['data']) ? trim((string)$_POST['data']) : null);
      $observacao = isset($input['observacao']) ? trim((string)$input['observacao']) : (isset($_POST['observacao']) ? trim((string)$_POST['observacao']) : null);
      $tipo = isset($input['tipo']) ? trim((string)$input['tipo']) : (isset($_POST['tipo']) ? trim((string)$_POST['tipo']) : null);
      $categoria = isset($input['categoria']) ? trim((string)$input['categoria']) : (isset($_POST['categoria']) ? trim((string)$_POST['categoria']) : null);

      $fields = [];
      $params = [':id' => $invId];
      if ($quantidade !== null) { if (!is_finite($quantidade) || $quantidade <= 0) { jsonResponse(['ok' => false, 'error' => 'Quantidade inválida'], 400); } $fields[] = 'quantidade = :quantidade'; $params[':quantidade'] = $quantidade; }
      if ($data !== null) { $fields[] = 'data = :data'; $params[':data'] = $data !== '' ? $data : date('Y-m-d'); }
      if ($observacao !== null) { $fields[] = 'observacao = :observacao'; $params[':observacao'] = $observacao !== '' ? $observacao : null; }

      $sqlite->beginTransaction();
      try {
        if (!empty($fields)) {
          $sql = 'UPDATE inventario_barco SET ' . implode(', ', $fields) . ' WHERE id = :id';
          $affected = execute($sql, $params);
          if ($affected < 1) { throw new RuntimeException('Nenhum item atualizado'); }
        }
        // Atualiza tipo/categoria no catálogo se informados
        if ($tipo !== null) {
          execute('UPDATE itens_inventario SET tipo = :tipo WHERE id = :id', [ ':tipo' => ($tipo !== '' ? $tipo : null), ':id' => (int)$row['item_id'] ]);
        }
        if ($categoria !== null) {
          execute('UPDATE itens_inventario SET categoria = :categoria WHERE id = :id', [ ':categoria' => ($categoria !== '' ? $categoria : null), ':id' => (int)$row['item_id'] ]);
        }

        $sqlite->commit();
      } catch (Throwable $e) {
        $sqlite->rollBack();
        throw $e;
      }

      // Monta retorno com join para refletir tipo/categoria atualizados
      $result = queryOne('SELECT ib.id, ib.barco_id, ib.item_id, ib.nome_item, ib.codigo_produto, ib.quantidade, ib.unidade_medida, ib.data, ib.observacao,
                                 ii.tipo, ii.categoria
                          FROM inventario_barco ib
                          LEFT JOIN itens_inventario ii ON ii.id = ib.item_id
                          WHERE ib.id = :id', [':id' => $invId]);
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$result['barco_id']]);
        $desc = 'editou inventário "' . (string)$result['nome_item'] . '" (cod ' . (string)$result['codigo_produto'] . ', qtd ' . (float)$result['quantidade'] . ') em barco #' . (int)$result['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        if (function_exists('logActivity')) { logActivity('editar', 'inventario', (int)$result['id'], (int)$result['barco_id'], $desc); }
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'item' => $result]);
      break;
    }
    case 'excluir_item_barco': {
      $sqlite = getConnection();
      ensureInventarioTable($sqlite);

      $invId = (int)($_GET['id'] ?? $_POST['id'] ?? ($input['id'] ?? 0));
      if ($invId <= 0) { jsonResponse(['ok' => false, 'error' => 'ID de inventário inválido'], 400); }
      $row = queryOne('SELECT id, barco_id, item_id, nome_item, codigo_produto, quantidade FROM inventario_barco WHERE id = :id', [':id' => $invId]);
      if (!$row) { jsonResponse(['ok' => false, 'error' => 'Item de inventário não encontrado'], 404); }
      $affected = execute('DELETE FROM inventario_barco WHERE id = :id', [':id' => $invId]);
      if ($affected < 1) { jsonResponse(['ok' => false, 'error' => 'Falha ao excluir item'], 500); }
      try {
        $boat = queryOne('SELECT cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => (int)$row['barco_id']]);
        $desc = 'excluiu inventário "' . (string)($row['nome_item'] ?? '') . '" (cod ' . (string)($row['codigo_produto'] ?? '') . ', qtd ' . (float)($row['quantidade'] ?? 0) . ') em barco #' . (int)$row['barco_id'] . ' — ' . (string)($boat['modelo'] ?? '') . ' — ' . (string)($boat['cliente_nome'] ?? '');
        if (function_exists('logActivity')) { logActivity('excluir', 'inventario', (int)$row['id'], (int)$row['barco_id'], $desc); }
      } catch (Throwable $_) {}
      jsonResponse(['ok' => true, 'deleted' => $invId]);
      break;
    }
    case 'exportar_excel_inventario': {
      // Gera um arquivo Excel (HTML) com os dados do inventário do barco
      $barcoId = (int)($_GET['barco_id'] ?? $_POST['barco_id'] ?? ($input['barco_id'] ?? 0));
      if ($barcoId <= 0) {
        // Remover header JSON e retornar erro simples
        if (function_exists('header_remove')) { header_remove('Content-Type'); }
        header('Content-Type: text/plain; charset=utf-8');
        echo 'barco_id inválido';
        exit;
      }

      $sqlite = getConnection();
      // Verifica barco existe
      $existsBoat = queryOne('SELECT id, cliente_nome, modelo FROM barcos WHERE id = :id', [':id' => $barcoId]);
      if (!$existsBoat) {
        if (function_exists('header_remove')) { header_remove('Content-Type'); }
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Barco não encontrado';
        exit;
      }

      $rows = queryAll('SELECT ib.nome_item, ib.codigo_produto, ib.quantidade, ib.unidade_medida, ib.data, ib.observacao, ii.tipo, ii.categoria
                        FROM inventario_barco ib
                        LEFT JOIN itens_inventario ii ON ii.id = ib.item_id
                        WHERE ib.barco_id = :barco
                        ORDER BY ib.codigo_produto ASC, ib.nome_item ASC', [':barco' => $barcoId]);

      // Headers para Excel (HTML)
      if (function_exists('header_remove')) { header_remove('Content-Type'); }
      header('Content-Type: application/vnd.ms-excel');
      header('Content-Disposition: attachment;filename="inventario_barco_'.$barcoId.'_simplificado.xls"');
      header('Cache-Control: max-age=0');

      // CSS no mesmo estilo do gerarExcelSimplificado (produtos)
      echo "<!DOCTYPE html>";
      echo "<html><head><meta charset='UTF-8'>";
      echo "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;}table{border-collapse:collapse;width:90%;margin:0 auto;}th{background-color:#0056b3;color:white;font-weight:bold;text-align:left;padding:4px 8px;border:1px solid #ddd;}th:first-child{width:100px;}td{padding:4px 8px;border:1px solid #ddd;font-size:12px;line-height:1.2;}td:first-child{text-align:left;}tr:nth-child(even){background-color:#f2f2f2;}tr:hover{background-color:#ddd;}caption{margin-bottom:10px;font-weight:bold;color:#333;text-align:left;}</style>";
      echo "</head><body>";
      $boatTitle = htmlspecialchars((string)($existsBoat['modelo'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $boatClient = htmlspecialchars((string)($existsBoat['cliente_nome'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      echo "<table>";
      echo "<caption>Inventário do Barco #$barcoId — $boatTitle — $boatClient</caption>";
      echo "<tr><th>Código</th><th>Item</th><th>Quantidade</th><th>Unidade</th><th>Data</th><th>Tipo</th><th>Categoria</th><th>Observação</th></tr>";

      if (!$rows || count($rows) === 0) {
        // Preenche algumas linhas vazias para manter estrutura
        for ($i = 0; $i < 5; $i++) {
          echo "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
        }
      } else {
        foreach ($rows as $r) {
          $codigo = htmlspecialchars((string)($r['codigo_produto'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $nome = htmlspecialchars((string)($r['nome_item'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $quantidade = htmlspecialchars((string)($r['quantidade'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $unidade = htmlspecialchars((string)($r['unidade_medida'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $data = htmlspecialchars((string)($r['data'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $tipo = htmlspecialchars((string)($r['tipo'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $categoria = htmlspecialchars((string)($r['categoria'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          $obs = htmlspecialchars((string)($r['observacao'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
          echo "<tr>";
          echo "<td>$codigo</td>";
          echo "<td>$nome</td>";
          echo "<td>$quantidade</td>";
          echo "<td>$unidade</td>";
          echo "<td>$data</td>";
          echo "<td>$tipo</td>";
          echo "<td>$categoria</td>";
          echo "<td>$obs</td>";
          echo "</tr>";
        }
      }

      echo "</table></body></html>";
      exit;
    }
    default:
      jsonResponse(['ok' => false, 'error' => 'Ação desconhecida'], 400);
  }
} catch (Throwable $e) {
  if (isset($sqlite) && $sqlite instanceof PDO) { try { $sqlite = null; } catch (Throwable $ee) {} }
  if (isset($fb) && $fb instanceof PDO) { try { $fb = null; } catch (Throwable $ee) {} }
  jsonResponse(['ok' => false, 'error' => 'Erro: ' . $e->getMessage()], 500);
}
?>
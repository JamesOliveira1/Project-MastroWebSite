<?php
// Login antigo removido: não usar autenticação básica aqui.

function conectarBD() {
    try {
        $dsn = 'firebird:dbname=D:\\GD_XNAV\\Banco\\PRODOC.FDB;charset=UTF8';
        $user = 'sysdba';
        $password = 'masterkey';
        $pdo = new PDO($dsn, $user, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function buscarProdutos($limite = null, $offset = 0, $fillPlaceholders = false) {
    $conexao = conectarBD();
    $produtos = array();
    $status = '';

    if (is_array($conexao) && isset($conexao['error'])) {
        $status = "❌ Erro ao conectar ou executar query:\n" . $conexao['error'];
    } else {
        try {
            $sql = 'SELECT
    r.COD_PRODUTO AS "codigo produto",
    u.DSC_EXTENCAO_UNIDADE AS "unidade medida",
    r.DSC_PRODUTO AS "item",
    COALESCE(SUM(e.NUM_QUANTIDADE), 0) AS "quantidade estoque",
    c.DSC_CAT_PRODUTO AS "categoria",
    s.DSC_CAT_PRODUTO AS "sub-categoria de"
FROM
    PRODUTO r
LEFT JOIN
    CATEGORIA_PRODUTO c ON c.SEQ_CAT_PRODUTO = r.SEQ_CAT_PRODUTO
LEFT JOIN
    CATEGORIA_PRODUTO s ON s.SEQ_CAT_PRODUTO = c.SEQ_SUPERCAT_PRODUTO
LEFT JOIN
    UNIDADE u ON u.COD_UNIDADE = r.COD_UNIDADE
LEFT JOIN
    ESTOQUE e ON e.COD_PRODUTO = r.COD_PRODUTO
GROUP BY
    r.COD_PRODUTO,
    u.DSC_EXTENCAO_UNIDADE,
    r.DSC_PRODUTO,
    c.DSC_CAT_PRODUTO,
    s.DSC_CAT_PRODUTO
ORDER BY
    r.COD_PRODUTO DESC';

            $stmt = $conexao->query($sql);
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Paginação simples em memória: aplica offset e limite
            $total = count($resultados);
            $offset = max(0, (int)$offset);
            $limite = $limite ? max(1, (int)$limite) : $total;
            $fim = min($total, $offset + $limite);

            for ($i = $offset; $i < $fim; $i++) {
                $row = $resultados[$i];
                $produtos[] = array(
                    'codigo_produto'    => $row['codigo produto'] ?? '',
                    'unidade_medida'    => $row['unidade medida'] ?? '',
                    'item'              => $row['item'] ?? '',
                    'quantidade_estoque'=> $row['quantidade estoque'] ?? 0,
                    'categoria'         => $row['categoria'] ?? '',
                    'sub_categoria_de'  => $row['sub-categoria de'] ?? ''
                );
            }

            if (count($produtos) > 0) {
                $status = "✅ Conexão com o banco estabelecida com sucesso!\n\n";
            } else {
                $status = "Nenhum produto encontrado.\n";
            }
        } catch (PDOException $e) {
            $status = "❌ Erro ao conectar ou executar query:\n" . $e->getMessage();
        }
    }

    if ($fillPlaceholders && empty($produtos)) {
        for ($i = 0; $i < 5; $i++) {
            $produtos[] = array(
                'codigo_produto' => '',
                'unidade_medida' => '',
                'item' => '',
                'quantidade_estoque' => '',
                'categoria' => '',
                'sub_categoria_de' => ''
            );
        }
    }

    return array('produtos' => $produtos, 'status' => $status, 'offset' => (int)$offset, 'limit' => (int)$limite);
}

function gerarExcelSimplificado() {
    $resultado = buscarProdutos(null, 0, true);
    $produtos = $resultado['produtos'];
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment;filename="tabela_codigos_produtos_simplificada.xls"');
    header('Cache-Control: max-age=0');
    echo "<!DOCTYPE html>";
    echo "<html><head><meta charset='UTF-8'>";
    echo "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;}table{border-collapse:collapse;width:60%;margin:0 auto;}th{background-color:#0056b3;color:white;font-weight:bold;text-align:left;padding:4px 8px;border:1px solid #ddd;}th:first-child{width:100px;}td{padding:4px 8px;border:1px solid #ddd;font-size:12px;line-height:1.2;}td:first-child{text-align:left;}tr:nth-child(even){background-color:#f2f2f2;}tr:hover{background-color:#ddd;}</style>";
    echo "</head><body><table>";
    echo "<tr><th>Código</th><th>Item</th></tr>";
    foreach($produtos as $p){
        echo "<tr><td>".$p['codigo_produto']."</td><td>".$p['item']."</td></tr>";
    }
    echo "</table></body></html>";
    exit;
}

function gerarExcelCompleto() {
    $resultado = buscarProdutos(null, 0, true);
    $produtos = $resultado['produtos'];
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment;filename="tabela_codigos_produtos_completa.xls"');
    header('Cache-Control: max-age=0');
    echo "<!DOCTYPE html>";
    echo "<html><head><meta charset='UTF-8'>";
    echo "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;}table{border-collapse:collapse;width:90%;margin:0 auto;}th{background-color:#0056b3;color:white;font-weight:bold;text-align:left;padding:4px 8px;border:1px solid #ddd;}td{padding:4px 8px;border:1px solid #ddd;font-size:12px;line-height:1.2;}tr:nth-child(even){background-color:#f2f2f2;}tr:hover{background-color:#ddd;}</style>";
    echo "</head><body><table>";
    echo "<tr><th>Código do Produto</th><th>Unidade de Medida</th><th>Item</th><th>Quantidade em Estoque</th><th>Categoria</th><th>Sub-categoria de</th></tr>";
    foreach($produtos as $p){
        echo "<tr>";
        echo "<td>".$p['codigo_produto']."</td>";
        echo "<td>".$p['unidade_medida']."</td>";
        echo "<td>".$p['item']."</td>";
        echo "<td>".$p['quantidade_estoque']."</td>";
        echo "<td>".$p['categoria']."</td>";
        echo "<td>".$p['sub_categoria_de']."</td>";
        echo "</tr>";
    }
    echo "</table></body></html>";
    exit;
}

// Roteamento simples
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['listar'])) {
    $limite = intval($_GET['listar']);
    if ($limite <= 0) { $limite = 10; }
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    if ($offset < 0) { $offset = 0; }
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(buscarProdutos($limite, $offset, false));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'sincronizar') {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['status' => 'ok', 'message' => 'Sincronização ainda não implementada']);
    exit;
}

if (isset($_POST['gerar_excel_completo'])) {
    gerarExcelCompleto();
} elseif (isset($_POST['gerar_excel_simplificado'])) {
    gerarExcelSimplificado();
}

// Resposta padrão
header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['status' => 'idle']);
?>
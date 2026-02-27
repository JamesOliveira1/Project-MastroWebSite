<?php
/**
 * API para gerenciamento de Moldes (Estaleiro)
 * Suporta GET, POST, DELETE
 */

require_once __DIR__ . '/conexao.php';
require_once __DIR__ . '/controles.php'; // Adicionar require para controles

// Configura cabeçalhos JSON
header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getConnection();
    startCompatSession(); // Iniciar sessão para pegar usuário logado

    // 1. Criar tabela se não existir
    $createTableSql = "
        CREATE TABLE IF NOT EXISTS moldes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            codigo TEXT NOT NULL,
            valor REAL,
            data_atribuicao TEXT,
            imagem TEXT,
            observacao TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ";
    $pdo->exec($createTableSql);

    // 2. Determinar método e ação
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_REQUEST['action'] ?? '';

    // Rota GET: Listar todos
    if ($method === 'GET') {
        if ($action === 'list') {
            $moldes = queryAll("SELECT * FROM moldes ORDER BY id DESC");
            echo json_encode($moldes);
            exit;
        }
        // Se tiver ID, retorna um específico (opcional, por enquanto list all serve)
    }

    // Rota POST: Criar ou Atualizar
    if ($method === 'POST') {
        if ($action === 'save') {
            handleSave($pdo);
            exit;
        }
        if ($action === 'delete') {
            handleDelete($pdo);
            exit;
        }
    }

    // Se chegou aqui, ação não encontrada
    // echo json_encode(['error' => 'Ação não definida ou método inválido']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Função para salvar (Insert ou Update)
 */
function handleSave($pdo) {
    $id = $_POST['id'] ?? '';
    $nome = $_POST['nome'] ?? '';
    $codigo = $_POST['codigo'] ?? '';
    $valor = $_POST['valor'] ?? null; // Pode ser null
    $data_atribuicao = $_POST['data_atribuicao'] ?? null; // Pode ser null
    $observacao = $_POST['observacao'] ?? '';

    // Validação básica
    if (empty($nome) || empty($codigo)) {
        echo json_encode(['error' => 'Nome e Código são obrigatórios.']);
        return;
    }

    // Tratamento de valores vazios para null no banco
    if ($valor === '') {
        $valor = null;
    } else {
        // Limpar formatação de moeda (R$ 1.500,00 -> 1500.00)
        // Remove tudo que não for dígito, ponto ou vírgula
        $valorLimpo = preg_replace('/[^\d,.]/', '', $valor);
        // Se tiver vírgula e ponto (1.500,00), remove ponto e troca vírgula por ponto
        if (strpos($valorLimpo, ',') !== false && strpos($valorLimpo, '.') !== false) {
            $valorLimpo = str_replace('.', '', $valorLimpo);
            $valorLimpo = str_replace(',', '.', $valorLimpo);
        } elseif (strpos($valorLimpo, ',') !== false) {
            // Se só tiver vírgula (1500,00), troca por ponto
            $valorLimpo = str_replace(',', '.', $valorLimpo);
        }
        $valor = (float) $valorLimpo;
    }
    
    if ($data_atribuicao === '') $data_atribuicao = null;

    // Upload de Imagem
    $imagemPath = null;
    
    // Extensões permitidas
    $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Se for update, recuperar imagem antiga caso não venha nova
    if ($id) {
        $oldMolde = queryOne("SELECT imagem FROM moldes WHERE id = ?", [$id]);
        if ($oldMolde) {
            $imagemPath = $oldMolde['imagem'];
        }
    }

    // Verificar se solicitou remover a imagem atual
    $removerImagem = isset($_POST['remover_imagem']) && $_POST['remover_imagem'] == '1';

    if ($removerImagem && $imagemPath) {
        // Tentar remover arquivo físico anterior se não for o padrão
        if (strpos($imagemPath, 'semfoto.png') === false) {
            $pathRelativoApi = str_replace('../assets', '../../assets', $imagemPath);
            $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
            if (file_exists($arquivoFisico)) {
                unlink($arquivoFisico);
            }
        }
        $imagemPath = null; // Reseta para null, que cairá no default abaixo
    }

    // Se enviou arquivo novo
    if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../assets/img/moldes/';
        
        // Criar diretório se não existir
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
        $novoNome = 'molde_' . uniqid() . '.' . $ext;
        $destino = $uploadDir . $novoNome;

        if (move_uploaded_file($_FILES['imagem']['tmp_name'], $destino)) {
            // Se tinha imagem anterior (e não foi removida explicitamente antes), deletar agora para substituir
            if ($imagemPath && strpos($imagemPath, 'semfoto.png') === false) {
                 $pathRelativoApi = str_replace('../assets', '../../assets', $imagemPath);
                 $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
                 if (file_exists($arquivoFisico)) {
                     unlink($arquivoFisico);
                 }
            }
            
            // Caminho relativo para salvar no banco
            $imagemPath = '../assets/img/moldes/' . $novoNome;
        }
    }

    // Se não tem imagem (nem nova nem antiga), usar default
    if (empty($imagemPath)) {
        $imagemPath = '../assets/img/moldes/semfoto.png';
    }

    if ($id) {
        // UPDATE
        $sql = "UPDATE moldes SET nome = ?, codigo = ?, valor = ?, data_atribuicao = ?, imagem = ?, observacao = ? WHERE id = ?";
        execute($sql, [$nome, $codigo, $valor, $data_atribuicao, $imagemPath, $observacao, $id]);
        
        // Registrar atividade
        logActivity(
            'editar', 
            'molde', 
            (int)$id, 
            null, 
            "Editou molde: $nome ($codigo)"
        );

        echo json_encode(['success' => true, 'message' => 'Molde atualizado com sucesso!', 'id' => $id]);
    } else {
        // INSERT
        $sql = "INSERT INTO moldes (nome, codigo, valor, data_atribuicao, imagem, observacao) VALUES (?, ?, ?, ?, ?, ?)";
        execute($sql, [$nome, $codigo, $valor, $data_atribuicao, $imagemPath, $observacao]);
        $newId = $pdo->lastInsertId();

        // Registrar atividade
        logActivity(
            'criar', 
            'molde', 
            (int)$newId, 
            null, 
            "Criou molde: $nome ($codigo)"
        );

        echo json_encode(['success' => true, 'message' => 'Molde criado com sucesso!', 'id' => $newId]);
    }
}

/**
 * Função para deletar
 */
function handleDelete($pdo) {
    $id = $_POST['id'] ?? '';
    if (!$id) {
        echo json_encode(['error' => 'ID não informado.']);
        return;
    }

    // Opcional: Deletar arquivo de imagem se não for o padrão
    $molde = queryOne("SELECT nome, codigo, imagem FROM moldes WHERE id = ?", [$id]);
    
    if (!$molde) {
        echo json_encode(['error' => 'Molde não encontrado.']);
        return;
    }

    if ($molde['imagem'] && strpos($molde['imagem'], 'semfoto.png') === false) {
        // Tentar remover arquivo físico
        // O caminho no banco é relativo (../assets...), converter para absoluto do sistema
        $arquivoFisico = __DIR__ . '/../' . $molde['imagem']; 
        // Ajuste: se o path começa com ../assets, em api/ ele volta pra progenese/assets... espera.
        // O path salvo é relative ao HTML que está em progenese/.
        // Então ../assets/img... a partir de progenese/api/ seria ../../assets/img...
        // Vamos ajustar o path:
        $pathRelativoApi = str_replace('../assets', '../../assets', $molde['imagem']);
        $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
        
        if (file_exists($arquivoFisico)) {
            unlink($arquivoFisico);
        }
    }

    execute("DELETE FROM moldes WHERE id = ?", [$id]);

    // Registrar atividade
    logActivity(
        'excluir', 
        'molde', 
        (int)$id, 
        null, 
        "Excluiu molde: {$molde['nome']} ({$molde['codigo']})"
    );

    echo json_encode(['success' => true, 'message' => 'Molde excluído com sucesso!']);
}

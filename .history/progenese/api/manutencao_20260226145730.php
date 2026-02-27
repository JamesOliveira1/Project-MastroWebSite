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

    // 1.1 Criar tabela de Equipamentos
    $createTableEquipSql = "
        CREATE TABLE IF NOT EXISTS equipamento_manutencao (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            codigo TEXT,
            fabricante TEXT,
            modelo TEXT,
            n_serie TEXT,
            data_aquisicao TEXT,
            n_nota TEXT,
            status TEXT,
            descricao TEXT,
            observacao TEXT,
            imagem TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ";
    $pdo->exec($createTableEquipSql);

    // 1.2 Criar tabela de Histórico de Manutenção
    $createTableHistSql = "
        CREATE TABLE IF NOT EXISTS historico_manutencao (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipamento_id INTEGER NOT NULL,
            data_inicial TEXT,
            data_retorno TEXT,
            tipo TEXT,
            observacao TEXT,
            responsavel TEXT,
            os TEXT,
            is_concluida INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(equipamento_id) REFERENCES equipamento_manutencao(id) ON DELETE CASCADE
        );
    ";
    $pdo->exec($createTableHistSql);

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
        
        if ($action === 'list_equip') {
            // Buscar equipamentos (Aliasing colunas para JS)
            $sql = "SELECT id, nome, codigo, fabricante, modelo, n_serie as serie, data_aquisicao, n_nota as nota_fiscal, status, descricao, observacao, imagem, created_at FROM equipamento_manutencao ORDER BY id DESC";
            $equips = queryAll($sql);
            
            // Para cada equipamento, buscar histórico
            foreach ($equips as &$eq) {
                $hist = queryAll("SELECT * FROM historico_manutencao WHERE equipamento_id = ? ORDER BY data_inicial DESC", [$eq['id']]);
                // Converter boolean
                foreach($hist as &$h) {
                    $h['concluida'] = $h['is_concluida'] == 1;
                }
                $eq['manutencoes'] = $hist;
            }
            
            echo json_encode($equips);
            exit;
        }
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
        
        if ($action === 'save_equip') {
            handleSaveEquip($pdo);
            exit;
        }
        if ($action === 'delete_equip') {
            handleDeleteEquip($pdo);
            exit;
        }
        
        if ($action === 'update_status') {
            handleUpdateStatus($pdo);
            exit;
        }
        
        if (action === 'save_history') {
            handleSaveHistory($pdo);
            exit;
        }

        if (action === 'update_history_status') {
            handleUpdateHistoryStatus($pdo);
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

        $ext = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $extensoesPermitidas)) {
            echo json_encode(['error' => 'Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP.']);
            return;
        }

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

/**
 * Função para salvar Equipamento (Insert ou Update)
 */
function handleSaveEquip($pdo) {
    $id = $_POST['id'] ?? '';
    $nome = $_POST['nome'] ?? '';
    
    // Campos
    $codigo = $_POST['codigo'] ?? '';
    $fabricante = $_POST['fabricante'] ?? '';
    $modelo = $_POST['modelo'] ?? '';
    $serie = $_POST['serie'] ?? '';
    $data_aquisicao = $_POST['data_aquisicao'] ?? null;
    $nota_fiscal = $_POST['nota_fiscal'] ?? '';
    $status = $_POST['status'] ?? 'Em uso';
    $descricao = $_POST['descricao'] ?? '';
    $observacao = $_POST['observacao'] ?? '';

    // Validação básica
    if (empty($nome)) {
        echo json_encode(['error' => 'Nome do equipamento é obrigatório.']);
        return;
    }
    
    if ($data_aquisicao === '') $data_aquisicao = null;

    // Upload de Imagem (Lógica similar a moldes, mas pasta diferente se quiser, ou mesma)
    // Vamos usar /assets/img/ferramentas/ para ficar organizado, ou moldes mesmo se preferir.
    // O JS usa 'ferramentas' no placeholder. Vamos criar 'ferramentas'.
    
    $imagemPath = null;
    $extensoesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Recuperar imagem antiga
    if ($id) {
        $oldEquip = queryOne("SELECT imagem FROM equipamento_manutencao WHERE id = ?", [$id]);
        if ($oldEquip) {
            $imagemPath = $oldEquip['imagem'];
        }
    }

    $removerImagem = isset($_POST['remover_imagem']) && $_POST['remover_imagem'] == '1';

    if ($removerImagem && $imagemPath) {
        if (strpos($imagemPath, 'semfoto.png') === false && strpos($imagemPath, 'default_tool.png') === false) {
            $pathRelativoApi = str_replace('../assets', '../../assets', $imagemPath);
            $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
            if (file_exists($arquivoFisico)) {
                unlink($arquivoFisico);
            }
        }
        $imagemPath = null;
    }

    if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../assets/img/ferramentas/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $extensoesPermitidas)) {
            echo json_encode(['error' => 'Formato de imagem inválido.']);
            return;
        }

        $novoNome = 'equip_' . uniqid() . '.' . $ext;
        $destino = $uploadDir . $novoNome;

        if (move_uploaded_file($_FILES['imagem']['tmp_name'], $destino)) {
            if ($imagemPath && strpos($imagemPath, 'semfoto.png') === false) {
                 $pathRelativoApi = str_replace('../assets', '../../assets', $imagemPath);
                 $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
                 if (file_exists($arquivoFisico)) unlink($arquivoFisico);
            }
            $imagemPath = '../assets/img/ferramentas/' . $novoNome;
        }
    }

    // Default image se vazio
    if (empty($imagemPath)) {
        // Se quiser usar a mesma dos moldes ou outra
        $imagemPath = '../assets/img/ferramentas/semfoto.png';
    }

    if ($id) {
        // UPDATE
        $sql = "UPDATE equipamento_manutencao SET 
                nome = ?, codigo = ?, fabricante = ?, modelo = ?, n_serie = ?, 
                data_aquisicao = ?, n_nota = ?, status = ?, descricao = ?, 
                observacao = ?, imagem = ? 
                WHERE id = ?";
        execute($sql, [
            $nome, $codigo, $fabricante, $modelo, $serie, 
            $data_aquisicao, $nota_fiscal, $status, $descricao, 
            $observacao, $imagemPath, $id
        ]);
        
        logActivity('editar', 'equipamento', (int)$id, null, "Editou equipamento: $nome");
        echo json_encode(['success' => true, 'message' => 'Equipamento atualizado!', 'id' => $id]);
    } else {
        // INSERT
        $sql = "INSERT INTO equipamento_manutencao (
                nome, codigo, fabricante, modelo, n_serie, 
                data_aquisicao, n_nota, status, descricao, 
                observacao, imagem
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        execute($sql, [
            $nome, $codigo, $fabricante, $modelo, $serie, 
            $data_aquisicao, $nota_fiscal, $status, $descricao, 
            $observacao, $imagemPath
        ]);
        $newId = $pdo->lastInsertId();
        
        logActivity('criar', 'equipamento', (int)$newId, null, "Criou equipamento: $nome");
        echo json_encode(['success' => true, 'message' => 'Equipamento cadastrado!', 'id' => $newId]);
    }
}

/**
 * Função para deletar Equipamento
 */
function handleDeleteEquip($pdo) {
    $id = $_POST['id'] ?? '';
    if (!$id) {
        echo json_encode(['error' => 'ID não informado.']);
        return;
    }

    $equip = queryOne("SELECT nome, imagem FROM equipamento_manutencao WHERE id = ?", [$id]);
    if (!$equip) {
        echo json_encode(['error' => 'Equipamento não encontrado.']);
        return;
    }

    if ($equip['imagem'] && strpos($equip['imagem'], 'semfoto.png') === false) {
        $pathRelativoApi = str_replace('../assets', '../../assets', $equip['imagem']);
        $arquivoFisico = __DIR__ . '/' . $pathRelativoApi;
        if (file_exists($arquivoFisico)) unlink($arquivoFisico);
    }

    execute("DELETE FROM equipamento_manutencao WHERE id = ?", [$id]);
    
    // Histórico deletado via CASCADE no banco, mas se não tiver suporte a FK ativo:
    // execute("DELETE FROM historico_manutencao WHERE equipamento_id = ?", [$id]);

    logActivity('excluir', 'equipamento', (int)$id, null, "Excluiu equipamento: {$equip['nome']}");
    echo json_encode(['success' => true, 'message' => 'Equipamento excluído!']);
}

/**
 * Função para atualizar status do Equipamento
 */
function handleUpdateStatus($pdo) {
    $id = $_POST['id'] ?? '';
    $status = $_POST['status'] ?? '';
    
    if (!$id || !$status) {
        echo json_encode(['error' => 'ID ou Status não informados.']);
        return;
    }
    
    // Validar status permitidos se necessário
    $allowed = ['Em uso', 'Em manutenção', 'Fora de serviço'];
    if (!in_array($status, $allowed)) {
        echo json_encode(['error' => 'Status inválido.']);
        return;
    }

    $sql = "UPDATE equipamento_manutencao SET status = ? WHERE id = ?";
    execute($sql, [$status, $id]);
    
    // Opcional: Logar mudança de status
    // logActivity('editar', 'equipamento', (int)$id, null, "Alterou status para: $status");

    echo json_encode(['success' => true, 'message' => 'Status atualizado!']);
}

/**
 * Função para salvar Histórico
 */
function handleSaveHistory($pdo) {
    $equipamento_id = $_POST['equipamento_id'] ?? '';
    $data_inicial = $_POST['data_inicial'] ?? '';
    $data_retorno = $_POST['data_retorno'] ?? null;
    $tipo = $_POST['tipo'] ?? 'Preventiva';
    $responsavel = $_POST['responsavel'] ?? '';
    $observacao = $_POST['observacao'] ?? '';
    $is_concluida = isset($_POST['is_concluida']) ? 1 : 0;

    if (!$equipamento_id || !$data_inicial) {
        echo json_encode(['error' => 'Equipamento e Data Inicial são obrigatórios.']);
        return;
    }
    
    if ($data_retorno === '') $data_retorno = null;

    // Upload de OS (PDF)
    $osPath = null;
    if (isset($_FILES['os_file']) && $_FILES['os_file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../docs/OS/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['os_file']['name'], PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            echo json_encode(['error' => 'Apenas arquivos PDF são permitidos para OS.']);
            return;
        }

        $novoNome = 'os_' . $equipamento_id . '_' . uniqid() . '.pdf';
        $destino = $uploadDir . $novoNome;

        if (move_uploaded_file($_FILES['os_file']['tmp_name'], $destino)) {
            $osPath = 'docs/OS/' . $novoNome;
        }
    }

    $sql = "INSERT INTO historico_manutencao (
        equipamento_id, data_inicial, data_retorno, tipo, 
        observacao, responsavel, os, is_concluida
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    execute($sql, [
        $equipamento_id, $data_inicial, $data_retorno, $tipo,
        $observacao, $responsavel, $osPath, $is_concluida
    ]);

    logActivity('criar', 'historico_manutencao', (int)$equipamento_id, null, "Adicionou manutenção ($tipo)");

    echo json_encode(['success' => true, 'message' => 'Histórico registrado!']);
}

/**
 * Função para atualizar status do Histórico
 */
function handleUpdateHistoryStatus($pdo) {
    $id = $_POST['id'] ?? '';
    $is_concluida = $_POST['is_concluida'] ?? '';

    if (!$id || $is_concluida === '') {
        echo json_encode(['error' => 'ID e Status são obrigatórios.']);
        return;
    }

    $sql = "UPDATE historico_manutencao SET is_concluida = ? WHERE id = ?";
    execute($sql, [$is_concluida, $id]);
    
    // Opcional: Logar a mudança?
    // Buscar id do equipamento para log
    // $hist = queryOne("SELECT equipamento_id FROM historico_manutencao WHERE id = ?", [$id]);
    // if($hist) {
    //    logActivity('editar', 'historico_manutencao', (int)$hist['equipamento_id'], null, "Alterou status conclusão ID $id para $is_concluida");
    // }

    echo json_encode(['success' => true, 'message' => 'Status atualizado!']);
}

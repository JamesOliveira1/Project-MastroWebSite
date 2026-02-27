<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/estaleiro.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("PRAGMA foreign_keys = ON;");

    echo "<h2>🚀 Inserindo dados de teste...</h2>";

    // 🔹 1️⃣ Usuário Admin
    $usuario = $db->query("SELECT COUNT(*) FROM usuarios WHERE usuario = 'admin'")->fetchColumn();
    if ($usuario == 0) {
        $stmt = $db->prepare("INSERT INTO usuarios (nome, usuario, senha, email, cargo) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['Administrador', 'admin', password_hash('12345678', PASSWORD_DEFAULT), 'admin@progenese.local', 'Admin']);
        echo "✅ Usuário admin inserido.<br>";
    } else {
        echo "ℹ️ Usuário admin já existe, ignorado.<br>";
    }

    // 🔹 1.2️⃣ Usuários adicionais com senha hash
    $usuariosExtras = [
        ['Leo', 'leo', '157.470@leo', 'leonardo@mastrodascia.com', 'Usuário'],
        ['Marcelo', 'marcelo', 'senha123', 'marcelo@progenese.com.br', 'Usuário'],
        ['James', 'james', '12345678', 'escrevaparajames@hotmail.com', 'Usuário'],
    ];

    $stmtExisteUsuario = $db->prepare("SELECT COUNT(*) FROM usuarios WHERE usuario = ?");
    $stmtInsereUsuario = $db->prepare("INSERT INTO usuarios (nome, usuario, senha, email, cargo) VALUES (?, ?, ?, ?, ?)");

    foreach ($usuariosExtras as [$nome, $usuarioLogin, $senhaPura, $email, $cargo]) {
        $stmtExisteUsuario->execute([$usuarioLogin]);
        if ($stmtExisteUsuario->fetchColumn() == 0) {
            $hash = password_hash($senhaPura, PASSWORD_DEFAULT);
            $stmtInsereUsuario->execute([$nome, $usuarioLogin, $hash, $email, $cargo]);
            echo "✅ Usuário inserido: {$usuarioLogin}.<br>";
        } else {
            echo "ℹ️ Usuário '{$usuarioLogin}' já existe, ignorado.<br>";
        }
    }

    // 🔹 2️⃣ Locais Fixos
    $locais = [
        ['Laminação', 'Área do processo de laminação e produção do casco'],
        ['Montagem', 'Galpão para montagem geral do barco e finalização'],
        ['Concluídos', 'Barcos finalizados e entregues'],
        ['Pré-Projetos', 'Planejamento e projetos iniciais'],
        ['Lixeira', 'Itens descartados ou obsoletos'],
    ];

    $stmt = $db->prepare("SELECT COUNT(*) FROM locais WHERE nome = ?");
    $insert = $db->prepare("INSERT INTO locais (nome, descricao) VALUES (?, ?)");

    foreach ($locais as $local) {
        $stmt->execute([$local[0]]);
        if ($stmt->fetchColumn() == 0) {
            $insert->execute($local);
            echo "✅ Local inserido: {$local[0]}<br>";
        } else {
            echo "ℹ️ Local '{$local[0]}' já existe, ignorado.<br>";
        }
    }

    // 🔹 3️⃣ Vagas para Laminação e Montagem (5 cada)
    $stmt_local = $db->prepare("SELECT id FROM locais WHERE nome = ?");
    $stmt_local->execute(['Laminação']);
    $laminacao_id = $stmt_local->fetchColumn();

    $stmt_local->execute(['Montagem']);
    $montagem_id = $stmt_local->fetchColumn();

    if ($laminacao_id) {
        for ($i = 1; $i <= 5; $i++) {
            $check = $db->prepare("SELECT COUNT(*) FROM vagas WHERE local_id = ? AND numero = ?");
            $check->execute([$laminacao_id, $i]);
            if ($check->fetchColumn() == 0) {
                $db->prepare("INSERT INTO vagas (local_id, numero) VALUES (?, ?)")->execute([$laminacao_id, $i]);
                echo "✅ Vaga $i criada em Laminação.<br>";
            }
        }
    }

    if ($montagem_id) {
        for ($i = 1; $i <= 5; $i++) {
            $check = $db->prepare("SELECT COUNT(*) FROM vagas WHERE local_id = ? AND numero = ?");
            $check->execute([$montagem_id, $i]);
            if ($check->fetchColumn() == 0) {
                $db->prepare("INSERT INTO vagas (local_id, numero) VALUES (?, ?)")->execute([$montagem_id, $i]);
                echo "✅ Vaga $i criada em Montagem.<br>";
            }
        }
    }

    echo "<hr><strong>🎉 Inserção concluída com sucesso!</strong>";

} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>

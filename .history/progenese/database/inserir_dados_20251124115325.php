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

    // 🔹 4️⃣ Diferenciais Globais (posições 1–3 com texto padrão)
    $db->exec("CREATE TABLE IF NOT EXISTS diferenciais_globais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        posicao INTEGER UNIQUE NOT NULL,
        texto TEXT NOT NULL,
        atualizado_em TEXT
    )");

    $texto1 = <<<TXT
Desenho exclusivo de popa – reduz calado, aumenta a eficiência hidrodinâmica e garante menor consumo de combustível.
Túnel em forma de “M” – contribui para maior capacidade de carga, melhor amortecimento das ondas e elevação do spray, proporcionando navegação mais confortável e seca.
Reserva de flutuação – segurança extra em qualquer situação: túnel selado e preenchido com material flutuante, servindo como reserva de flutuação.
Casco e convés em infusão a vácuo – tecnologia de ponta que resulta em peso reduzido e alta resistência estrutural.
Costado alto – segurança e proteção em navegação oceânica e mares agitados.
Acabamento premium – uso de gelcoats anti-osmose e anti-UV, que garantem durabilidade e beleza ao longo do tempo.
Espaços otimizados – layout funcional com amplo deck de trabalho, bancos escamoteáveis, plataforma de popa e generosos paióis secos.
Autonomia e praticidade – capacidade de combustível de 630 litros, sistemas independentes de abastecimento.
TXT;

    $texto2 = <<<TXT
Desenho exclusivo de popa – reduz calado, aumenta a eficiência hidrodinâmica e garante menor consumo de combustível.
Casco e convés em infusão a vácuo – tecnologia que resulta em peso reduzido e alta resistência estrutural.
Autonomia – capacidade de combustível de 1200 litros, sistemas independentes de abastecimento. Baixo consumo de combustível. Faz cruzeiro econômico a 20 nós gastando menos de 60l/h.
Estabilidade - catamarã mais estável e com melhor comportamento em curvas mesmo nas mais altas velocidades.
Destaque - devido a montagem elevada dos motores estes, quando levantados ficam completamente sem contato com a água o que torna o modelo perfeito para guarda em água por longos períodos.
TXT;

    $texto3 = <<<TXT
Geometria exclusiva de popa – configuração desenvolvida para reduzir o calado operacional, otimizar o escoamento hidrodinâmico e aumentar a eficiência propulsiva, resultando em menor consumo específico de combustível.
Túnel estrutural em seção “M” – solução que amplia a capacidade de carga útil, melhora a dissipação de energia de impacto das ondas e direciona o spray para fora da linha de navegação, assegurando maior estabilidade, suavidade e conforto durante a operação.
Reserva de flutuabilidade – compartimento de túnel totalmente selado e preenchido com material de alta flutuabilidade, proporcionando redundância de segurança e estabilidade em situações críticas.
Casco e convés fabricados por infusão a vácuo – processo avançado que garante melhor relação resistência/peso, elevada integridade estrutural e redução de massa total da embarcação.
Costado elevado – dimensionado para maior proteção contra embarque de água em navegação oceânica e em mares de alta energia.
Acabamento premium – aplicação de gelcoats técnicos com propriedades anti-osmose e anti-UV, assegurando maior durabilidade, resistência química e preservação estética ao longo do ciclo de vida.
Autonomia operacional – tanques com capacidade de 630 litros de combustível, dispostos em sistemas independentes de abastecimento, favorecendo praticidade de manutenção e maior raio de ação.
TXT;

    $agora = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s');

    $stmtCount = $db->prepare("SELECT COUNT(*) FROM diferenciais_globais WHERE posicao = ?");
    $stmtInsert = $db->prepare("INSERT INTO diferenciais_globais (posicao, texto, atualizado_em) VALUES (?, ?, ?)");

    $defaults = [
        [1, $texto1],
        [2, $texto2],
        [3, $texto3],
    ];

    foreach ($defaults as [$pos, $txt]) {
        $stmtCount->execute([$pos]);
        if ((int)$stmtCount->fetchColumn() === 0) {
            $stmtInsert->execute([$pos, $txt, $agora]);
            echo "✅ Diferencial padrão inserido na posição {$pos}.<br>";
        } else {
            echo "ℹ️ Diferencial na posição {$pos} já existe, ignorado.<br>";
        }
    }

    echo "<hr><strong>🎉 Inserção concluída com sucesso!</strong>";

} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>

-- =======================================================
-- BANCO DE DADOS: CONTROLE ESTALEIRO (versão SQLite)
-- =======================================================

PRAGMA foreign_keys = ON;

-- === Usuários (login) ===
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  usuario TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  email TEXT,
  cargo TEXT
);

-- === Locais e Vagas ===
CREATE TABLE locais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  descricao TEXT
);

CREATE TABLE vagas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  local_id INTEGER,
  numero INTEGER,
  barco_id INTEGER,
  FOREIGN KEY (local_id) REFERENCES locais(id),
  FOREIGN KEY (barco_id) REFERENCES barcos(id) ON DELETE SET NULL
);

-- === Barcos ===
CREATE TABLE barcos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_serie TEXT,
  cliente_nome TEXT,
  modelo TEXT,
  status_producao REAL,
  criado_em TEXT
);

-- === Informações fixas do barco ===
CREATE TABLE informacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  chassi TEXT,
  data_pedido TEXT,
  data_entrega TEXT,
  numero_proposta TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id)
);

-- === Informações extras (flexíveis) ===
CREATE TABLE informacoes_extras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  nome TEXT,
  valor TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id)
);

-- === Opcionais ===
CREATE TABLE opcionais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  nome TEXT,
  descricao TEXT,
  quantidade REAL,
  instalado INTEGER DEFAULT 0,
  observacao TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id)
);

-- === Itens de Inventário (catálogo geral) ===
CREATE TABLE itens_inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  codigo_produto TEXT UNIQUE,
  unidade_medida TEXT,
  tipo TEXT,
  categoria TEXT,
  quantidade_estoque REAL
);

-- === Inventário de cada barco ===
CREATE TABLE inventario_barco (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  item_id INTEGER,
  nome_item TEXT,
  codigo_produto TEXT,
  quantidade REAL,
  unidade_medida TEXT,
  data TEXT,
  observacao TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id),
  FOREIGN KEY (item_id) REFERENCES itens_inventario(id)
);

-- === Serviços realizados ===
CREATE TABLE servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  descricao TEXT,
  data_inicio TEXT,
  data_concluido TEXT,
  categoria_id INTEGER,
  posicao INTEGER,
  observacao TEXT,
  status TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id),
  FOREIGN KEY (categoria_id) REFERENCES categoria_servicos(id) ON DELETE CASCADE
);

CREATE TABLE categoria_servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  nome TEXT,
  numero INTEGER,
  FOREIGN KEY (barco_id) REFERENCES barcos(id)
);

-- === Anotações de usuários ===
CREATE TABLE anotacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  nota TEXT,
  data TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- === Documentos anexos ===
CREATE TABLE documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barco_id INTEGER,
  titulo TEXT,
  descricao TEXT,
  tipo TEXT,
  link TEXT,
  publico INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT,
  FOREIGN KEY (barco_id) REFERENCES barcos(id)
);

-- === Controles / Checklists ===
CREATE TABLE controles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servico_id INTEGER UNIQUE NOT NULL,
  item_verificado TEXT,
  data_verificacao TEXT,
  responsavel TEXT,
  resultado TEXT,
  link TEXT,
  comentario TEXT,
  FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);

-- === Atividades (logs de ações do sistema) ===
CREATE TABLE IF NOT EXISTS atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  usuario TEXT,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id INTEGER,
  barco_id INTEGER,
  descricao TEXT,
  ip TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- === Diferenciais globais ===
CREATE TABLE IF NOT EXISTS diferenciais_globais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  posicao INTEGER UNIQUE NOT NULL,
  texto TEXT NOT NULL,
  atualizado_em TEXT
);


-- =======================================================
-- Índices e Constraints adicionais para integridade e desempenho
-- =======================================================

-- Evitar vagas duplicadas por local
CREATE UNIQUE INDEX IF NOT EXISTS idx_unq_vagas_local_numero
ON vagas(local_id, numero);

-- Garantir que um barco esteja em apenas uma vaga
CREATE UNIQUE INDEX IF NOT EXISTS idx_unq_vagas_barco
ON vagas(barco_id)
WHERE barco_id IS NOT NULL;

-- Índices de FK e busca por desempenho
CREATE INDEX IF NOT EXISTS idx_vagas_local ON vagas(local_id);
CREATE INDEX IF NOT EXISTS idx_vagas_numero ON vagas(numero);
CREATE INDEX IF NOT EXISTS idx_vagas_barco ON vagas(barco_id);

-- Índice removido para permitir números de série duplicados
-- CREATE INDEX IF NOT EXISTS idx_barcos_numero_serie ON barcos(numero_serie);
CREATE INDEX IF NOT EXISTS idx_barcos_cliente ON barcos(cliente_nome);
CREATE INDEX IF NOT EXISTS idx_barcos_modelo ON barcos(modelo);

CREATE INDEX IF NOT EXISTS idx_informacoes_barco ON informacoes(barco_id);
CREATE INDEX IF NOT EXISTS idx_informacoes_extras_barco ON informacoes_extras(barco_id);
CREATE INDEX IF NOT EXISTS idx_opcionais_barco ON opcionais(barco_id);
CREATE INDEX IF NOT EXISTS idx_inventario_barco_barco ON inventario_barco(barco_id);
CREATE INDEX IF NOT EXISTS idx_inventario_barco_item ON inventario_barco(item_id);
CREATE INDEX IF NOT EXISTS idx_servicos_barco ON servicos(barco_id);
CREATE INDEX IF NOT EXISTS idx_documentos_barco ON documentos(barco_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_controles_servico ON controles(servico_id);

-- Índices para atividades
CREATE INDEX IF NOT EXISTS idx_atividades_criado_em ON atividades(criado_em);
CREATE INDEX IF NOT EXISTS idx_atividades_barco ON atividades(barco_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_diferenciais_posicao ON diferenciais_globais(posicao);

CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_categoria_servicos_barco ON categoria_servicos(barco_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categoria_servicos_barco_numero ON categoria_servicos(barco_id, numero);

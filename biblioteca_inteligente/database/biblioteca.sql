-- ============================================================
--  BIBLIOTECA GESTÃO INTELIGENTE
--  Script SQL completo – Criação e população do banco de dados
--  Disciplina: Programação II
-- ============================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS biblioteca_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biblioteca_db;

-- ============================================================
-- TABELA: livros
-- ============================================================
CREATE TABLE IF NOT EXISTS livros (
  id                    INT             AUTO_INCREMENT PRIMARY KEY,
  titulo                VARCHAR(255)    NOT NULL,
  autor                 VARCHAR(255)    NOT NULL,
  categoria             VARCHAR(100)    DEFAULT NULL,
  editora               VARCHAR(100)    DEFAULT NULL,
  ano_publicacao        INT             DEFAULT NULL,
  isbn                  VARCHAR(20)     DEFAULT NULL,
  quantidade_disponivel INT             NOT NULL DEFAULT 1,
  idioma                VARCHAR(50)     DEFAULT 'Português',
  sinopse               TEXT            DEFAULT NULL,
  status                ENUM('disponivel','indisponivel') NOT NULL DEFAULT 'disponivel',
  capa_url              VARCHAR(500)    DEFAULT NULL,
  criado_em             TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha       VARCHAR(255) DEFAULT NULL,
  tipo        ENUM('admin','recepcionista','leitor') NOT NULL DEFAULT 'leitor',
  telefone    VARCHAR(20)  DEFAULT NULL,
  cpf         VARCHAR(14)  DEFAULT NULL,
  status      ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: emprestimos
-- ============================================================
CREATE TABLE IF NOT EXISTS emprestimos (
  id                      INT  AUTO_INCREMENT PRIMARY KEY,
  livro_id                INT  NOT NULL,
  usuario_id              INT  NOT NULL,
  data_emprestimo         DATE NOT NULL,
  data_devolucao_prevista DATE NOT NULL,
  data_devolucao_real     DATE DEFAULT NULL,
  status                  ENUM('ativo','devolvido','atrasado') NOT NULL DEFAULT 'ativo',
  observacoes             TEXT DEFAULT NULL,
  criado_em               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_livro    FOREIGN KEY (livro_id)   REFERENCES livros(id)    ON DELETE RESTRICT,
  CONSTRAINT fk_emp_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: reservas
-- ============================================================
CREATE TABLE IF NOT EXISTS reservas (
  id             INT  AUTO_INCREMENT PRIMARY KEY,
  livro_id       INT  NOT NULL,
  usuario_id     INT  NOT NULL,
  data_reserva   DATE NOT NULL,
  data_expiracao DATE NOT NULL,
  status         ENUM('ativa','cancelada','concluida') NOT NULL DEFAULT 'ativa',
  criado_em      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_livro   FOREIGN KEY (livro_id)   REFERENCES livros(id)   ON DELETE RESTRICT,
  CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- SEED: Livros iniciais
-- ============================================================
INSERT INTO livros (titulo, autor, categoria, editora, ano_publicacao, isbn, quantidade_disponivel, idioma, sinopse, status) VALUES
('Dom Casmurro',
 'Machado de Assis',
 'Romance',
 'Editora Ática',
 1899,
 '978-85-08-01234-5',
 5,
 'Português',
 'Narrado por Bentinho, o Dom Casmurro, é a história de um amor e de uma obsessão que atravessa gerações. Obra máxima do Realismo brasileiro, considerada um dos maiores romances da língua portuguesa.',
 'disponivel'),

('1984',
 'George Orwell',
 'Ficção Científica',
 'Companhia das Letras',
 1949,
 '978-85-359-0277-1',
 3,
 'Português',
 'Uma distopia sombria sobre um regime totalitário que controla todos os aspectos da vida humana através da vigilância constante, manipulação da verdade e supressão do pensamento livre.',
 'disponivel'),

('O Pequeno Príncipe',
 'Antoine de Saint-Exupéry',
 'Literatura Infantil',
 'Editora Agir',
 1943,
 '978-85-220-0289-2',
 8,
 'Português',
 'A mais famosa obra de Saint-Exupéry conta a história de um principezinho que viaja de planeta em planeta em busca de amigos, encontrando adultos que perderam a capacidade de enxergar o que é essencial.',
 'disponivel'),

('Cem Anos de Solidão',
 'Gabriel García Márquez',
 'Realismo Mágico',
 'Record',
 1967,
 '978-85-01-04094-0',
 4,
 'Português',
 'A épica saga da família Buendía ao longo de sete gerações na cidade fictícia de Macondo. Obra-prima do realismo mágico e um dos romances mais importantes já escritos na língua espanhola.',
 'disponivel'),

('Orgulho e Preconceito',
 'Jane Austen',
 'Romance',
 'Penguin',
 1813,
 '978-85-7448-172-0',
 6,
 'Português',
 'A história do amor entre a inteligente Elizabeth Bennet e o orgulhoso Mr. Darcy é uma das mais queridas da literatura inglesa, unindo crítica social e romance numa narrativa irresistível.',
 'disponivel'),

('O Alquimista',
 'Paulo Coelho',
 'Aventura',
 'HarperCollins Brasil',
 1988,
 '978-85-325-1408-7',
 7,
 'Português',
 'A jornada de Santiago, um jovem pastor andaluz, em busca de seu tesouro e de sua lenda pessoal. Um dos livros brasileiros mais vendidos na história, traduzido para mais de 80 idiomas.',
 'disponivel'),

('Harry Potter e a Pedra Filosofal',
 'J.K. Rowling',
 'Fantasia',
 'Rocco',
 1997,
 '978-85-325-1382-0',
 10,
 'Português',
 'O início da saga do bruxo mais famoso do mundo. Harry Potter descobre, no dia de seu décimo primeiro aniversário, que é um bruxo e é convidado a estudar na Escola de Magia e Bruxaria de Hogwarts.',
 'disponivel'),

('O Senhor dos Anéis – A Sociedade do Anel',
 'J.R.R. Tolkien',
 'Fantasia',
 'Martins Fontes',
 1954,
 '978-85-336-2311-6',
 2,
 'Português',
 'A épica aventura de Frodo Bolseiro e seus companheiros para destruir o Um Anel e salvar a Terra-Média do domínio do Senhor das Trevas Sauron. Obra fundadora da fantasia moderna.',
 'disponivel'),

('A Revolução dos Bichos',
 'George Orwell',
 'Fábula',
 'Companhia das Letras',
 1945,
 '978-85-359-0476-8',
 4,
 'Português',
 'Uma fábula política brilhante sobre animais que se revoltam contra seus donos humanos e estabelecem uma república igualitária que gradualmente se corrompe. Alegoria poderosa sobre o totalitarismo.',
 'disponivel'),

('Sapiens – Uma Breve História da Humanidade',
 'Yuval Noah Harari',
 'História',
 'L&PM',
 2011,
 '978-85-254-3497-1',
 3,
 'Português',
 'Uma visão panorâmica e provocadora da história da humanidade, desde os primeiros humanos na África Subsaariana até a era das descobertas científicas e das grandes revoluções.',
 'disponivel');

-- ============================================================
-- SEED: Usuários iniciais
-- ============================================================
INSERT INTO usuarios (nome, email, senha, tipo, telefone, cpf, status) VALUES
('Admin Sistema',      'admin@biblioteca.com',  NULL, 'admin',          '(35) 1234-5678',  '000.000.000-00', 'ativo'),
('Maria Recepcionista','maria@biblioteca.com',  NULL, 'recepcionista',  '(35) 9876-5432',  '111.111.111-11', 'ativo'),
('João Silva',         'joao@email.com',        NULL, 'leitor',         '(35) 98765-1234', '222.222.222-22', 'ativo'),
('Ana Oliveira',       'ana@email.com',         NULL, 'leitor',         '(35) 91234-5678', '333.333.333-33', 'ativo'),
('Carlos Santos',      'carlos@email.com',      NULL, 'leitor',         '(35) 99876-5432', '444.444.444-44', 'ativo'),
('Fernanda Lima',      'fernanda@email.com',    NULL, 'leitor',         '(35) 97654-3210', '555.555.555-55', 'ativo');

-- ============================================================
-- SEED: Empréstimos de demonstração
-- ============================================================
INSERT INTO emprestimos (livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, status) VALUES
(1, 3, CURDATE() - INTERVAL 5 DAY,  CURDATE() + INTERVAL 9  DAY, 'ativo'),
(2, 4, CURDATE() - INTERVAL 10 DAY, CURDATE() + INTERVAL 4  DAY, 'ativo'),
(3, 5, CURDATE() - INTERVAL 20 DAY, CURDATE() - INTERVAL 6  DAY, 'atrasado'),
(4, 6, CURDATE() - INTERVAL 15 DAY, CURDATE() - INTERVAL 1  DAY, 'devolvido');

-- Marcar devolução real do empréstimo concluído
UPDATE emprestimos SET data_devolucao_real = CURDATE() - INTERVAL 2 DAY WHERE id = 4;

-- ============================================================
-- SEED: Reservas de demonstração
-- ============================================================
INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_expiracao, status) VALUES
(5, 3, CURDATE(), CURDATE() + INTERVAL 3 DAY, 'ativa'),
(6, 4, CURDATE() - INTERVAL 2 DAY, CURDATE() + INTERVAL 5 DAY, 'ativa');

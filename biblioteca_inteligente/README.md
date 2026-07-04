# 📚 Biblioteca – Gestão Inteligente

> Sistema web completo de gerenciamento de biblioteca desenvolvido como trabalho acadêmico da disciplina **Programação II**.

---

## 🧰 Tecnologias Utilizadas

| Camada       | Tecnologia                  |
|--------------|-----------------------------|
| Front-end    | HTML5, CSS3, JavaScript (ES6+) |
| Back-end     | Node.js + Express           |
| Banco de dados | MySQL                     |
| Comunicação  | API REST (JSON)             |
| ORM / Query  | mysql2 (driver nativo)      |

---

## 📁 Estrutura do Projeto

```
biblioteca_inteligente/
│
├── frontend/                  # Interface do usuário
│   ├── index.html             # Dashboard (tela inicial)
│   ├── catalogo.html          # Catálogo de livros (grade visual)
│   ├── cadastro-livros.html   # CRUD de livros
│   ├── cadastro-usuarios.html # CRUD de usuários
│   ├── emprestimos.html       # Gestão de empréstimos
│   ├── reservas.html          # Gestão de reservas
│   ├── perfil.html            # Perfil do usuário
│   ├── relatorios.html        # Relatórios e gráficos
│   ├── css/
│   │   ├── style.css          # Design system global (variáveis, layout, sidebar)
│   │   ├── components.css     # Componentes reutilizáveis (botões, modais, tabelas)
│   │   └── dashboard.css      # Estilos específicos do dashboard
│   ├── js/
│   │   ├── api.js             # Cliente centralizado da API REST
│   │   ├── sidebar.js         # Sidebar, toast notifications e modal global
│   │   ├── dashboard.js       # KPIs, carrossel e frases motivacionais
│   │   ├── livros.js          # CRUD completo de livros
│   │   ├── usuarios.js        # CRUD completo de usuários
│   │   └── emprestimos.js     # Gestão de empréstimos e devoluções
│   └── assets/
│       └── logo.svg           # Logotipo vetorial
│
├── backend/                   # Servidor e API
│   ├── server.js              # Entrada principal do servidor Express
│   ├── .env                   # Variáveis de ambiente (credenciais do banco)
│   ├── package.json           # Dependências do Node.js
│   ├── controllers/
│   │   ├── livrosController.js
│   │   ├── usuariosController.js
│   │   ├── emprestimosController.js
│   │   ├── reservasController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── livroModel.js
│   │   ├── usuarioModel.js
│   │   ├── emprestimoModel.js
│   │   └── reservaModel.js
│   ├── routes/
│   │   ├── livrosRoutes.js
│   │   ├── usuariosRoutes.js
│   │   ├── emprestimosRoutes.js
│   │   ├── reservasRoutes.js
│   │   └── dashboardRoutes.js
│   └── database/
│       └── connection.js      # Pool de conexão MySQL com mysql2
│
└── database/
    └── biblioteca.sql         # Script SQL completo (DDL + seed de dados)
```

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MySQL](https://www.mysql.com/) 8.0 ou superior
- [npm](https://www.npmjs.com/) (incluído com o Node.js)

---

### 1. Configurar o Banco de Dados

Abra o **MySQL Workbench** ou o terminal MySQL e execute o script:

```sql
SOURCE /caminho/para/biblioteca_inteligente/database/biblioteca.sql;
```

Ou pela linha de comando:

```bash
mysql -u root -p < database/biblioteca.sql
```

Isso cria o banco `biblioteca_db` com todas as tabelas e dados iniciais de demonstração.

---

### 2. Configurar as Variáveis de Ambiente

Edite o arquivo `backend/.env` com as suas credenciais MySQL:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=biblioteca_db

NODE_ENV=development
```

---

### 3. Instalar as Dependências do Back-end

```bash
cd backend
npm install
```

---

### 4. Iniciar o Servidor

**Modo desenvolvimento** (com auto-reload via nodemon):
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor iniciará em: **http://localhost:3000**

---

### 5. Acessar o Sistema

Abra o navegador e acesse: **http://localhost:3000**

O back-end serve automaticamente os arquivos do front-end.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `livros`

| Campo                 | Tipo                          | Descrição                          |
|-----------------------|-------------------------------|------------------------------------|
| `id`                  | INT AUTO_INCREMENT PK         | Identificador único                |
| `titulo`              | VARCHAR(255) NOT NULL         | Título do livro                    |
| `autor`               | VARCHAR(255) NOT NULL         | Nome do autor                      |
| `categoria`           | VARCHAR(100)                  | Gênero / categoria                 |
| `editora`             | VARCHAR(100)                  | Editora                            |
| `ano_publicacao`      | INT                           | Ano de publicação                  |
| `isbn`                | VARCHAR(20)                   | Código ISBN                        |
| `quantidade_disponivel` | INT DEFAULT 1               | Quantidade em estoque              |
| `idioma`              | VARCHAR(50) DEFAULT 'Português' | Idioma do livro                  |
| `sinopse`             | TEXT                          | Descrição / sinopse                |
| `status`              | ENUM('disponivel','indisponivel') | Status do livro               |
| `capa_url`            | VARCHAR(500)                  | URL da imagem de capa              |
| `criado_em`           | TIMESTAMP                     | Data de cadastro                   |
| `atualizado_em`       | TIMESTAMP                     | Última atualização                 |

### Tabela `usuarios`

| Campo        | Tipo                                        | Descrição             |
|--------------|---------------------------------------------|-----------------------|
| `id`         | INT AUTO_INCREMENT PK                       | Identificador único   |
| `nome`       | VARCHAR(255) NOT NULL                       | Nome completo         |
| `email`      | VARCHAR(255) UNIQUE NOT NULL                | E-mail de acesso      |
| `senha`      | VARCHAR(255)                                | Senha (hash)          |
| `tipo`       | ENUM('admin','recepcionista','leitor')      | Nível de acesso       |
| `telefone`   | VARCHAR(20)                                 | Telefone              |
| `cpf`        | VARCHAR(14)                                 | CPF                   |
| `status`     | ENUM('ativo','inativo')                     | Status do usuário     |
| `criado_em`  | TIMESTAMP                                   | Data de cadastro      |

### Tabela `emprestimos`

| Campo                    | Tipo                                  | Descrição              |
|--------------------------|---------------------------------------|------------------------|
| `id`                     | INT AUTO_INCREMENT PK                 | Identificador único    |
| `livro_id`               | INT FK → livros(id)                   | Livro emprestado       |
| `usuario_id`             | INT FK → usuarios(id)                 | Usuário responsável    |
| `data_emprestimo`        | DATE NOT NULL                         | Data do empréstimo     |
| `data_devolucao_prevista`| DATE NOT NULL                         | Prazo de devolução     |
| `data_devolucao_real`    | DATE                                  | Data real de devolução |
| `status`                 | ENUM('ativo','devolvido','atrasado')  | Status do empréstimo   |
| `observacoes`            | TEXT                                  | Observações            |
| `criado_em`              | TIMESTAMP                             | Data de registro       |

### Tabela `reservas`

| Campo           | Tipo                                    | Descrição             |
|-----------------|-----------------------------------------|-----------------------|
| `id`            | INT AUTO_INCREMENT PK                   | Identificador único   |
| `livro_id`      | INT FK → livros(id)                     | Livro reservado       |
| `usuario_id`    | INT FK → usuarios(id)                   | Usuário              |
| `data_reserva`  | DATE NOT NULL                           | Data da reserva       |
| `data_expiracao`| DATE NOT NULL                           | Data de expiração     |
| `status`        | ENUM('ativa','cancelada','concluida')   | Status da reserva     |
| `criado_em`     | TIMESTAMP                               | Data de criação       |

---

## 📡 Documentação da API REST

**URL Base:** `http://localhost:3000/api`

Todas as respostas são em **JSON**.

---

### 📚 Livros — `/api/livros`

#### `GET /api/livros`
Lista todos os livros. Suporta filtros via query string.

**Query Parameters (opcionais):**

| Parâmetro   | Tipo   | Descrição                         |
|-------------|--------|-----------------------------------|
| `titulo`    | string | Filtro parcial pelo título        |
| `autor`     | string | Filtro parcial pelo autor         |
| `categoria` | string | Filtro parcial pela categoria     |
| `editora`   | string | Filtro parcial pela editora       |
| `idioma`    | string | Filtro exato pelo idioma          |
| `status`    | string | `disponivel` ou `indisponivel`    |

**Exemplo de requisição:**
```
GET /api/livros?status=disponivel&categoria=Romance
```

**Resposta de sucesso (`200 OK`):**
```json
{
  "success": true,
  "total": 5,
  "data": [
    {
      "id": 1,
      "titulo": "Dom Casmurro",
      "autor": "Machado de Assis",
      "categoria": "Romance",
      "editora": "Editora Ática",
      "ano_publicacao": 1899,
      "isbn": "978-85-08-01234-5",
      "quantidade_disponivel": 5,
      "idioma": "Português",
      "sinopse": "...",
      "status": "disponivel",
      "capa_url": null,
      "criado_em": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/livros/:id`
Retorna um livro pelo ID.

**Exemplo:** `GET /api/livros/1`

**Resposta de sucesso (`200 OK`):**
```json
{
  "success": true,
  "data": { "id": 1, "titulo": "Dom Casmurro", ... }
}
```

**Resposta de erro (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Livro não encontrado"
}
```

---

#### `POST /api/livros`
Cadastra um novo livro.

**Headers:** `Content-Type: application/json`

**Body (campos obrigatórios: `titulo`, `autor`):**
```json
{
  "titulo": "O Alquimista",
  "autor": "Paulo Coelho",
  "categoria": "Aventura",
  "editora": "HarperCollins Brasil",
  "ano_publicacao": 1988,
  "isbn": "978-85-325-1408-7",
  "quantidade_disponivel": 3,
  "idioma": "Português",
  "sinopse": "A jornada de Santiago...",
  "status": "disponivel"
}
```

**Resposta de sucesso (`201 Created`):**
```json
{
  "success": true,
  "message": "Livro cadastrado com sucesso!",
  "id": 11
}
```

**Resposta de erro de validação (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "O título é obrigatório"
}
```

---

#### `PUT /api/livros/:id`
Atualiza os dados de um livro existente.

**Exemplo:** `PUT /api/livros/1`

**Body:** Mesmos campos do `POST`.

**Resposta de sucesso (`200 OK`):**
```json
{
  "success": true,
  "message": "Livro atualizado com sucesso!"
}
```

---

#### `DELETE /api/livros/:id`
Remove um livro do sistema.

**Exemplo:** `DELETE /api/livros/1`

**Resposta de sucesso (`200 OK`):**
```json
{
  "success": true,
  "message": "Livro removido com sucesso!"
}
```

**Resposta de conflito (`409 Conflict`):**
```json
{
  "success": false,
  "message": "Este livro não pode ser removido pois possui empréstimos ou reservas vinculados."
}
```

---

### 👤 Usuários — `/api/usuarios`

#### `GET /api/usuarios`
Lista todos os usuários cadastrados.

**Resposta (`200 OK`):**
```json
{
  "success": true,
  "total": 6,
  "data": [
    {
      "id": 1,
      "nome": "Admin Sistema",
      "email": "admin@biblioteca.com",
      "tipo": "admin",
      "telefone": "(35) 1234-5678",
      "cpf": "000.000.000-00",
      "status": "ativo",
      "criado_em": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `GET /api/usuarios/:id`
Busca um usuário pelo ID.

#### `POST /api/usuarios`
Cadastra um novo usuário.

**Body (campos obrigatórios: `nome`, `email`):**
```json
{
  "nome": "João da Silva",
  "email": "joao@email.com",
  "tipo": "leitor",
  "telefone": "(35) 99999-9999",
  "cpf": "123.456.789-00",
  "status": "ativo"
}
```

**Resposta (`201 Created`):**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso!",
  "id": 7
}
```

> ⚠️ Retorna `409 Conflict` se o e-mail já estiver cadastrado.

#### `PUT /api/usuarios/:id`
Atualiza os dados de um usuário.

#### `DELETE /api/usuarios/:id`
Remove um usuário do sistema.

---

### 🔄 Empréstimos — `/api/emprestimos`

#### `GET /api/emprestimos`
Lista todos os empréstimos (com nome do livro e usuário via JOIN).

**Query Parameters (opcionais):**

| Parâmetro    | Tipo   | Descrição                              |
|--------------|--------|----------------------------------------|
| `status`     | string | `ativo`, `devolvido` ou `atrasado`     |
| `usuario_id` | int    | Filtrar por ID do usuário              |

**Resposta (`200 OK`):**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "livro_id": 1,
      "usuario_id": 3,
      "data_emprestimo": "2024-06-10",
      "data_devolucao_prevista": "2024-06-24",
      "data_devolucao_real": null,
      "status": "ativo",
      "observacoes": null,
      "livro_titulo": "Dom Casmurro",
      "usuario_nome": "João Silva"
    }
  ]
}
```

#### `GET /api/emprestimos/:id`
Busca um empréstimo pelo ID.

#### `POST /api/emprestimos`
Registra um novo empréstimo.

**Body (todos os campos obrigatórios):**
```json
{
  "livro_id": 1,
  "usuario_id": 3,
  "data_emprestimo": "2024-06-15",
  "data_devolucao_prevista": "2024-06-29",
  "observacoes": "Livro retirado pessoalmente"
}
```

**Resposta (`201 Created`):**
```json
{
  "success": true,
  "message": "Empréstimo registrado com sucesso!",
  "id": 5
}
```

#### `PUT /api/emprestimos/:id/devolver`
Registra a devolução de um livro (seta `status = 'devolvido'` e `data_devolucao_real = hoje`).

**Exemplo:** `PUT /api/emprestimos/1/devolver`

**Resposta (`200 OK`):**
```json
{
  "success": true,
  "message": "Devolução registrada com sucesso!"
}
```

#### `DELETE /api/emprestimos/:id`
Remove um registro de empréstimo.

---

### 🔖 Reservas — `/api/reservas`

#### `GET /api/reservas`
Lista todas as reservas (com nome do livro e usuário).

**Query Parameters (opcionais):**

| Parâmetro    | Tipo   | Descrição                                   |
|--------------|--------|---------------------------------------------|
| `status`     | string | `ativa`, `cancelada` ou `concluida`         |
| `usuario_id` | int    | Filtrar por ID do usuário                   |

#### `GET /api/reservas/:id`
Busca uma reserva pelo ID.

#### `POST /api/reservas`
Cria uma nova reserva.

**Body (todos os campos obrigatórios):**
```json
{
  "livro_id": 5,
  "usuario_id": 3,
  "data_reserva": "2024-06-15",
  "data_expiracao": "2024-06-22"
}
```

**Resposta (`201 Created`):**
```json
{
  "success": true,
  "message": "Reserva criada com sucesso!",
  "id": 3
}
```

#### `PUT /api/reservas/:id`
Atualiza o status de uma reserva.

**Body:**
```json
{
  "status": "concluida"
}
```

> Status válidos: `ativa`, `cancelada`, `concluida`

#### `DELETE /api/reservas/:id`
Remove um registro de reserva.

---

### 📊 Dashboard — `/api/dashboard`

#### `GET /api/dashboard/stats`
Retorna as estatísticas consolidadas do sistema.

**Resposta (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "livros": {
      "total": 10,
      "autores": 8,
      "editoras": 7,
      "generos": 6,
      "idiomas": 1
    },
    "usuarios": {
      "total": 6,
      "ativos": 6
    },
    "emprestimos": {
      "total": 4,
      "ativos": 2,
      "atrasados": 1
    },
    "reservas": {
      "total": 2,
      "ativas": 2
    }
  }
}
```

#### `GET /api/dashboard/destaques`
Retorna até 5 livros disponíveis para exibição no carrossel do dashboard.

**Resposta (`200 OK`):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "titulo": "Dom Casmurro", "autor": "Machado de Assis", ... }
  ]
}
```

---

## 🌐 Páginas do Sistema

| Página                  | Arquivo                   | Descrição                              |
|-------------------------|---------------------------|----------------------------------------|
| Dashboard               | `index.html`              | Tela inicial com KPIs e carrossel      |
| Catálogo                | `catalogo.html`           | Grade visual do acervo com filtros     |
| Cadastro de Livros      | `cadastro-livros.html`    | CRUD completo de livros (tabela)       |
| Cadastro de Usuários    | `cadastro-usuarios.html`  | CRUD completo de usuários              |
| Empréstimos             | `emprestimos.html`        | Registro e devolução de empréstimos    |
| Reservas                | `reservas.html`           | Criação e gestão de reservas           |
| Perfil                  | `perfil.html`             | Perfil do usuário logado               |
| Relatórios              | `relatorios.html`         | Gráficos e indicadores consolidados    |

---

## 🎨 Identidade Visual

| Elemento         | Cor        |
|------------------|------------|
| Fundo principal  | `#1F1830`  |
| Cards            | `#2A2140`  |
| Sidebar          | `#43196D`  |
| Menu ativo       | `#D1006C`  |
| Hover            | `#B74090`  |
| Botões primários | `#D1006C`  |
| Indicadores      | `#F36D7D`  |
| Info/destaque    | `#22426C`  |
| Texto principal  | `#F5F5F5`  |

---

## 👥 Usuários de Demonstração

Após executar o SQL, os seguintes usuários estarão disponíveis:

| Nome                | E-mail                   | Tipo           |
|---------------------|--------------------------|----------------|
| Admin Sistema       | admin@biblioteca.com     | admin          |
| Maria Recepcionista | maria@biblioteca.com     | recepcionista  |
| João Silva          | joao@email.com           | leitor         |
| Ana Oliveira        | ana@email.com            | leitor         |
| Carlos Santos       | carlos@email.com         | leitor         |
| Fernanda Lima       | fernanda@email.com       | leitor         |

---

## 📋 Requisitos Atendidos (Disciplina Programação II)

- ✅ **Front-end**: HTML5, CSS3, JavaScript puro
- ✅ **Back-end**: Node.js + Express
- ✅ **Banco de Dados**: MySQL com 4 tabelas relacionadas
- ✅ **API REST**: Endpoints documentados retornando JSON
- ✅ **CRUD Completo**: Create, Read (All + One), Update, Delete
- ✅ **Integração**: Front ↔ API ↔ Banco de dados
- ✅ **Responsividade**: Desktop, Tablet e Mobile
- ✅ **Documentação da API**: Este README

---

## 🚀 Scripts Disponíveis

Execute dentro da pasta `backend/`:

| Comando       | Descrição                                    |
|---------------|----------------------------------------------|
| `npm start`   | Inicia o servidor em modo produção           |
| `npm run dev` | Inicia com nodemon (recarrega automaticamente) |

---

## 📌 Observações

- O servidor Express serve os arquivos estáticos do `frontend/` automaticamente.
- O arquivo `.env` deve ser configurado antes de iniciar o servidor.
- O banco de dados deve ser criado antes de iniciar o servidor.
- As chaves estrangeiras entre tabelas impedem exclusão de livros/usuários com empréstimos ou reservas ativas.

---

*Trabalho acadêmico – Disciplina: Programação II*

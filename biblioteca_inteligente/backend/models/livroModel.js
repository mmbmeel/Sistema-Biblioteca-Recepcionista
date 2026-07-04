// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Model: Livros
//  Responsável por todas as queries SQL relacionadas a livros
// ============================================================

const db = require('../database/connection');

const LivroModel = {

  // ----------------------------------------------------------
  // READ ALL – Listar todos os livros com filtros opcionais
  // ----------------------------------------------------------
  findAll: async (filters = {}) => {
    let query  = 'SELECT * FROM livros WHERE 1=1';
    let countQ = 'SELECT COUNT(*) AS total FROM livros WHERE 1=1';
    const params      = [];
    const countParams = [];

    function addFilter(clause, value) {
      query      += clause;
      countQ     += clause;
      params.push(value);
      countParams.push(value);
    }

    if (filters.titulo) {
      addFilter(' AND titulo LIKE ?', `%${filters.titulo}%`);
    }
    if (filters.autor) {
      addFilter(' AND autor LIKE ?', `%${filters.autor}%`);
    }
    if (filters.categoria) {
      addFilter(' AND categoria LIKE ?', `%${filters.categoria}%`);
    }
    if (filters.editora) {
      addFilter(' AND editora LIKE ?', `%${filters.editora}%`);
    }
    if (filters.idioma) {
      addFilter(' AND idioma = ?', filters.idioma);
    }
    if (filters.status) {
      addFilter(' AND status = ?', filters.status);
    }

    query += ' ORDER BY titulo ASC';

    // Paginação server-side: suporta quantos livros o banco tiver
    const page    = Math.max(1, parseInt(filters.page)  || 1);
    const limit   = Math.min(200, Math.max(1, parseInt(filters.limit) || 0)); // 0 = sem limite
    if (limit > 0) {
      const offset = (page - 1) * limit;
      query  += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [[{ total }]] = await db.execute(countQ, countParams);
    const [rows]        = await db.execute(query, params);
    return { rows, total };
  },

  // ----------------------------------------------------------
  // READ ONE – Buscar livro por ID
  // ----------------------------------------------------------
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT * FROM livros WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // ----------------------------------------------------------
  // CREATE – Inserir novo livro
  // ----------------------------------------------------------
  create: async (livro) => {
    const {
      titulo,
      autor,
      categoria     = null,
      editora       = null,
      ano_publicacao = null,
      isbn          = null,
      quantidade_disponivel = 1,
      idioma        = 'Português',
      sinopse       = null,
      status        = 'disponivel',
      capa_url      = null
    } = livro;

    const [result] = await db.execute(
      `INSERT INTO livros
        (titulo, autor, categoria, editora, ano_publicacao, isbn,
         quantidade_disponivel, idioma, sinopse, status, capa_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, autor, categoria, editora, ano_publicacao, isbn,
       quantidade_disponivel, idioma, sinopse, status, capa_url]
    );
    return result;
  },

  // ----------------------------------------------------------
  // UPDATE – Atualizar livro existente
  // ----------------------------------------------------------
  update: async (id, livro) => {
    const {
      titulo, autor, categoria, editora, ano_publicacao, isbn,
      quantidade_disponivel, idioma, sinopse, status, capa_url
    } = livro;

    const [result] = await db.execute(
      `UPDATE livros
       SET titulo=?, autor=?, categoria=?, editora=?, ano_publicacao=?,
           isbn=?, quantidade_disponivel=?, idioma=?, sinopse=?, status=?, capa_url=?
       WHERE id=?`,
      [titulo, autor, categoria, editora, ano_publicacao, isbn,
       quantidade_disponivel, idioma, sinopse, status, capa_url, id]
    );
    return result;
  },

  // ----------------------------------------------------------
  // DELETE – Remover livro
  // ----------------------------------------------------------
  delete: async (id) => {
    const [result] = await db.execute(
      'DELETE FROM livros WHERE id = ?',
      [id]
    );
    return result;
  },

  // ----------------------------------------------------------
  // STATS – Estatísticas para o dashboard
  // ----------------------------------------------------------
  getStats: async () => {
    const [[{ total }]]     = await db.execute('SELECT COUNT(*) AS total FROM livros');
    const [[{ autores }]]   = await db.execute('SELECT COUNT(DISTINCT autor) AS autores FROM livros');
    const [[{ editoras }]]  = await db.execute('SELECT COUNT(DISTINCT editora) AS editoras FROM livros WHERE editora IS NOT NULL');
    const [[{ generos }]]   = await db.execute('SELECT COUNT(DISTINCT categoria) AS generos FROM livros WHERE categoria IS NOT NULL');
    const [[{ idiomas }]]   = await db.execute('SELECT COUNT(DISTINCT idioma) AS idiomas FROM livros WHERE idioma IS NOT NULL');

    return { total, autores, editoras, generos, idiomas };
  }
};

module.exports = LivroModel;

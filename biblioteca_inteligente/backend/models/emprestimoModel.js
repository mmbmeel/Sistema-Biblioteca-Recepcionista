// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Model: Empréstimos
// ============================================================

const db = require('../database/connection');

const EmprestimoModel = {

  // READ ALL – com JOIN para nomes de livro e usuário
  findAll: async (filters = {}) => {
    let query = `
      SELECT e.*,
             l.titulo AS livro_titulo,
             u.nome   AS usuario_nome
      FROM emprestimos e
      LEFT JOIN livros   l ON e.livro_id   = l.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND e.status = ?';
      params.push(filters.status);
    }
    if (filters.usuario_id) {
      query += ' AND e.usuario_id = ?';
      params.push(filters.usuario_id);
    }

    query += ' ORDER BY e.criado_em DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // READ ONE
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT e.*, l.titulo AS livro_titulo, u.nome AS usuario_nome
       FROM emprestimos e
       LEFT JOIN livros   l ON e.livro_id   = l.id
       LEFT JOIN usuarios u ON e.usuario_id = u.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // CREATE
  create: async (emprestimo) => {
    const {
      livro_id,
      usuario_id,
      data_emprestimo,
      data_devolucao_prevista,
      observacoes = null
    } = emprestimo;

    const [result] = await db.execute(
      `INSERT INTO emprestimos
         (livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, observacoes)
       VALUES (?, ?, ?, ?, ?)`,
      [livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, observacoes]
    );
    return result;
  },

  // Registrar devolução
  devolver: async (id) => {
    const hoje = new Date().toISOString().split('T')[0];
    const [result] = await db.execute(
      "UPDATE emprestimos SET data_devolucao_real=?, status='devolvido' WHERE id=?",
      [hoje, id]
    );
    return result;
  },

  // UPDATE status
  updateStatus: async (id, status) => {
    const [result] = await db.execute(
      'UPDATE emprestimos SET status=? WHERE id=?',
      [status, id]
    );
    return result;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM emprestimos WHERE id = ?', [id]);
    return result;
  },

  // STATS
  getStats: async () => {
    const [[{ ativos }]]   = await db.execute("SELECT COUNT(*) AS ativos FROM emprestimos WHERE status='ativo'");
    const [[{ atrasados }]] = await db.execute("SELECT COUNT(*) AS atrasados FROM emprestimos WHERE status='atrasado'");
    const [[{ total }]]    = await db.execute('SELECT COUNT(*) AS total FROM emprestimos');
    return { total, ativos, atrasados };
  }
};

module.exports = EmprestimoModel;

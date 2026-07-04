// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Model: Reservas
// ============================================================

const db = require('../database/connection');

const ReservaModel = {

  // READ ALL – com JOIN
  findAll: async (filters = {}) => {
    let query = `
      SELECT r.*,
             l.titulo AS livro_titulo,
             u.nome   AS usuario_nome
      FROM reservas r
      LEFT JOIN livros   l ON r.livro_id   = l.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }
    if (filters.usuario_id) {
      query += ' AND r.usuario_id = ?';
      params.push(filters.usuario_id);
    }

    query += ' ORDER BY r.criado_em DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  },

  // READ ONE
  findById: async (id) => {
    const [rows] = await db.execute(
      `SELECT r.*, l.titulo AS livro_titulo, u.nome AS usuario_nome
       FROM reservas r
       LEFT JOIN livros   l ON r.livro_id   = l.id
       LEFT JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // CREATE
  create: async (reserva) => {
    const { livro_id, usuario_id, data_reserva, data_expiracao } = reserva;
    const [result] = await db.execute(
      'INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_expiracao) VALUES (?, ?, ?, ?)',
      [livro_id, usuario_id, data_reserva, data_expiracao]
    );
    return result;
  },

  // UPDATE status
  updateStatus: async (id, status) => {
    const [result] = await db.execute(
      'UPDATE reservas SET status=? WHERE id=?',
      [status, id]
    );
    return result;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM reservas WHERE id = ?', [id]);
    return result;
  },

  // STATS
  getStats: async () => {
    const [[{ ativas }]] = await db.execute("SELECT COUNT(*) AS ativas FROM reservas WHERE status='ativa'");
    const [[{ total }]]  = await db.execute('SELECT COUNT(*) AS total FROM reservas');
    return { total, ativas };
  }
};

module.exports = ReservaModel;

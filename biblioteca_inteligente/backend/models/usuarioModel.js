// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Model: Usuários
// ============================================================

const db = require('../database/connection');

const UsuarioModel = {

  // READ ALL
  findAll: async () => {
    const [rows] = await db.execute(
      'SELECT id, nome, email, tipo, telefone, cpf, status, criado_em FROM usuarios ORDER BY nome ASC'
    );
    return rows;
  },

  // READ ONE
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT id, nome, email, tipo, telefone, cpf, status, criado_em FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Buscar por email (para validação de duplicidade)
  findByEmail: async (email) => {
    const [rows] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // CREATE
  create: async (usuario) => {
    const {
      nome,
      email,
      senha   = null,
      tipo    = 'leitor',
      telefone = null,
      cpf     = null,
      status  = 'ativo'
    } = usuario;

    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha, tipo, telefone, cpf, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, email, senha, tipo, telefone, cpf, status]
    );
    return result;
  },

  // UPDATE
  update: async (id, usuario) => {
    const { nome, email, tipo, telefone, cpf, status } = usuario;
    const [result] = await db.execute(
      'UPDATE usuarios SET nome=?, email=?, tipo=?, telefone=?, cpf=?, status=? WHERE id=?',
      [nome, email, tipo, telefone, cpf, status, id]
    );
    return result;
  },

  // DELETE
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return result;
  },

  // STATS
  getStats: async () => {
    const [[{ total }]]  = await db.execute('SELECT COUNT(*) AS total FROM usuarios');
    const [[{ ativos }]] = await db.execute("SELECT COUNT(*) AS ativos FROM usuarios WHERE status='ativo'");
    return { total, ativos };
  }
};

module.exports = UsuarioModel;

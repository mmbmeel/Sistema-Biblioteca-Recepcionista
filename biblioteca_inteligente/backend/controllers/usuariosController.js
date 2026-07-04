// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Controller: Usuários
// ============================================================

const UsuarioModel = require('../models/usuarioModel');

const UsuariosController = {

  // GET /api/usuarios
  getAll: async (req, res) => {
    try {
      const usuarios = await UsuarioModel.findAll();
      return res.json({ success: true, total: usuarios.length, data: usuarios });
    } catch (error) {
      console.error('Erro ao listar usuários:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao listar usuários' });
    }
  },

  // GET /api/usuarios/:id
  getById: async (req, res) => {
    try {
      const usuario = await UsuarioModel.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }
      return res.json({ success: true, data: usuario });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
    }
  },

  // POST /api/usuarios
  create: async (req, res) => {
    try {
      const { nome, email } = req.body;

      if (!nome || !nome.trim()) {
        return res.status(400).json({ success: false, message: 'O nome é obrigatório' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'O e-mail é obrigatório' });
      }

      // Verificar duplicidade de e-mail
      const existente = await UsuarioModel.findByEmail(email);
      if (existente) {
        return res.status(409).json({ success: false, message: 'E-mail já cadastrado' });
      }

      const result = await UsuarioModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        id     : result.insertId
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
    }
  },

  // PUT /api/usuarios/:id
  update: async (req, res) => {
    try {
      const usuario = await UsuarioModel.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }
      await UsuarioModel.update(req.params.id, req.body);
      return res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
    }
  },

  // DELETE /api/usuarios/:id
  delete: async (req, res) => {
    try {
      const usuario = await UsuarioModel.findById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }
      await UsuarioModel.delete(req.params.id);
      return res.json({ success: true, message: 'Usuário removido com sucesso!' });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Este usuário possui empréstimos ou reservas vinculados e não pode ser removido.'
        });
      }
      return res.status(500).json({ success: false, message: 'Erro ao remover usuário' });
    }
  }
};

module.exports = UsuariosController;

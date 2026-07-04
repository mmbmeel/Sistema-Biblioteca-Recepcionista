// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Controller: Livros
//  Implementa o CRUD completo (Create, Read, Update, Delete)
// ============================================================

const LivroModel = require('../models/livroModel');

const LivrosController = {

  // ----------------------------------------------------------
  // GET /api/livros
  // Query params: ?titulo= &autor= &categoria= &status=
  // ----------------------------------------------------------
  getAll: async (req, res) => {
    try {
      const filters = {
        titulo   : req.query.titulo,
        autor    : req.query.autor,
        categoria: req.query.categoria,
        editora  : req.query.editora,
        idioma   : req.query.idioma,
        status   : req.query.status,
        page     : req.query.page,
        limit    : req.query.limit
      };
      const { rows, total } = await LivroModel.findAll(filters);
      return res.json({
        success: true,
        total,
        data   : rows
      });
    } catch (error) {
      console.error('Erro ao listar livros:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao listar livros' });
    }
  },

  // ----------------------------------------------------------
  // GET /api/livros/:id
  // ----------------------------------------------------------
  getById: async (req, res) => {
    try {
      const livro = await LivroModel.findById(req.params.id);
      if (!livro) {
        return res.status(404).json({ success: false, message: 'Livro não encontrado' });
      }
      return res.json({ success: true, data: livro });
    } catch (error) {
      console.error('Erro ao buscar livro:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao buscar livro' });
    }
  },

  // ----------------------------------------------------------
  // POST /api/livros
  // Body: { titulo, autor, categoria, editora, ... }
  // ----------------------------------------------------------
  create: async (req, res) => {
    try {
      const { titulo, autor } = req.body;

      // Validação mínima
      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ success: false, message: 'O título é obrigatório' });
      }
      if (!autor || !autor.trim()) {
        return res.status(400).json({ success: false, message: 'O autor é obrigatório' });
      }

      const result = await LivroModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Livro cadastrado com sucesso!',
        id     : result.insertId
      });
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao cadastrar livro' });
    }
  },

  // ----------------------------------------------------------
  // PUT /api/livros/:id
  // ----------------------------------------------------------
  update: async (req, res) => {
    try {
      const livro = await LivroModel.findById(req.params.id);
      if (!livro) {
        return res.status(404).json({ success: false, message: 'Livro não encontrado' });
      }

      const { titulo, autor } = req.body;
      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ success: false, message: 'O título é obrigatório' });
      }
      if (!autor || !autor.trim()) {
        return res.status(400).json({ success: false, message: 'O autor é obrigatório' });
      }

      await LivroModel.update(req.params.id, req.body);
      return res.json({ success: true, message: 'Livro atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar livro:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar livro' });
    }
  },

  // ----------------------------------------------------------
  // DELETE /api/livros/:id
  // ----------------------------------------------------------
  delete: async (req, res) => {
    try {
      const livro = await LivroModel.findById(req.params.id);
      if (!livro) {
        return res.status(404).json({ success: false, message: 'Livro não encontrado' });
      }

      await LivroModel.delete(req.params.id);
      return res.json({ success: true, message: 'Livro removido com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover livro:', error.message);
      // Tratar violação de chave estrangeira (livro em empréstimo ativo)
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Este livro não pode ser removido pois possui empréstimos ou reservas vinculados.'
        });
      }
      return res.status(500).json({ success: false, message: 'Erro ao remover livro' });
    }
  }
};

module.exports = LivrosController;

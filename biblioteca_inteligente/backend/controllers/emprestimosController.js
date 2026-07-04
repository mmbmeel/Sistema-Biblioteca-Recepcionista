// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Controller: Empréstimos
// ============================================================

const EmprestimoModel = require('../models/emprestimoModel');

const EmprestimosController = {

  // GET /api/emprestimos  (query: ?status= &usuario_id=)
  getAll: async (req, res) => {
    try {
      const filters = {
        status    : req.query.status,
        usuario_id: req.query.usuario_id
      };
      const emprestimos = await EmprestimoModel.findAll(filters);
      return res.json({ success: true, total: emprestimos.length, data: emprestimos });
    } catch (error) {
      console.error('Erro ao listar empréstimos:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao listar empréstimos' });
    }
  },

  // GET /api/emprestimos/:id
  getById: async (req, res) => {
    try {
      const emprestimo = await EmprestimoModel.findById(req.params.id);
      if (!emprestimo) {
        return res.status(404).json({ success: false, message: 'Empréstimo não encontrado' });
      }
      return res.json({ success: true, data: emprestimo });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar empréstimo' });
    }
  },

  // POST /api/emprestimos
  create: async (req, res) => {
    try {
      const { livro_id, usuario_id, data_emprestimo, data_devolucao_prevista } = req.body;

      if (!livro_id || !usuario_id || !data_emprestimo || !data_devolucao_prevista) {
        return res.status(400).json({
          success: false,
          message: 'livro_id, usuario_id, data_emprestimo e data_devolucao_prevista são obrigatórios'
        });
      }

      const result = await EmprestimoModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Empréstimo registrado com sucesso!',
        id     : result.insertId
      });
    } catch (error) {
      console.error('Erro ao registrar empréstimo:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao registrar empréstimo' });
    }
  },

  // PUT /api/emprestimos/:id/devolver
  devolver: async (req, res) => {
    try {
      const emprestimo = await EmprestimoModel.findById(req.params.id);
      if (!emprestimo) {
        return res.status(404).json({ success: false, message: 'Empréstimo não encontrado' });
      }
      if (emprestimo.status === 'devolvido') {
        return res.status(400).json({ success: false, message: 'Este empréstimo já foi devolvido' });
      }
      await EmprestimoModel.devolver(req.params.id);
      return res.json({ success: true, message: 'Devolução registrada com sucesso!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao registrar devolução' });
    }
  },

  // DELETE /api/emprestimos/:id
  delete: async (req, res) => {
    try {
      const emprestimo = await EmprestimoModel.findById(req.params.id);
      if (!emprestimo) {
        return res.status(404).json({ success: false, message: 'Empréstimo não encontrado' });
      }
      await EmprestimoModel.delete(req.params.id);
      return res.json({ success: true, message: 'Empréstimo removido com sucesso!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao remover empréstimo' });
    }
  }
};

module.exports = EmprestimosController;

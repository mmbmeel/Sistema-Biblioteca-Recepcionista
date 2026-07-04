// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Controller: Dashboard
//  Retorna estatísticas consolidadas para a tela inicial
// ============================================================

const LivroModel      = require('../models/livroModel');
const UsuarioModel    = require('../models/usuarioModel');
const EmprestimoModel = require('../models/emprestimoModel');
const ReservaModel    = require('../models/reservaModel');

const DashboardController = {

  // GET /api/dashboard/stats
  getStats: async (req, res) => {
    try {
      // Buscar todas as estatísticas em paralelo
      const [livroStats, usuarioStats, emprestimoStats, reservaStats] = await Promise.all([
        LivroModel.getStats(),
        UsuarioModel.getStats(),
        EmprestimoModel.getStats(),
        ReservaModel.getStats()
      ]);

      return res.json({
        success: true,
        data: {
          livros: {
            total   : livroStats.total,
            autores : livroStats.autores,
            editoras: livroStats.editoras,
            generos : livroStats.generos,
            idiomas : livroStats.idiomas
          },
          usuarios: {
            total : usuarioStats.total,
            ativos: usuarioStats.ativos
          },
          emprestimos: {
            total   : emprestimoStats.total,
            ativos  : emprestimoStats.ativos,
            atrasados: emprestimoStats.atrasados
          },
          reservas: {
            total : reservaStats.total,
            ativas: reservaStats.ativas
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error.message);
      return res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
  },

  // GET /api/dashboard/destaques
  // Retorna os primeiros 5 livros em destaque
  getDestaques: async (req, res) => {
    try {
      const { rows } = await LivroModel.findAll({ status: 'disponivel', limit: 5 });
      return res.json({
        success: true,
        data   : rows
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar destaques' });
    }
  }
};

module.exports = DashboardController;

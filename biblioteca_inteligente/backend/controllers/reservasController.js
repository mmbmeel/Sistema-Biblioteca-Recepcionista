// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Controller: Reservas
// ============================================================

const ReservaModel = require('../models/reservaModel');

const ReservasController = {

  // GET /api/reservas
  getAll: async (req, res) => {
    try {
      const filters = {
        status    : req.query.status,
        usuario_id: req.query.usuario_id
      };
      const reservas = await ReservaModel.findAll(filters);
      return res.json({ success: true, total: reservas.length, data: reservas });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar reservas' });
    }
  },

  // GET /api/reservas/:id
  getById: async (req, res) => {
    try {
      const reserva = await ReservaModel.findById(req.params.id);
      if (!reserva) {
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }
      return res.json({ success: true, data: reserva });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao buscar reserva' });
    }
  },

  // POST /api/reservas
  create: async (req, res) => {
    try {
      const { livro_id, usuario_id, data_reserva, data_expiracao } = req.body;

      if (!livro_id || !usuario_id || !data_reserva || !data_expiracao) {
        return res.status(400).json({
          success: false,
          message: 'livro_id, usuario_id, data_reserva e data_expiracao são obrigatórios'
        });
      }

      const result = await ReservaModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Reserva criada com sucesso!',
        id     : result.insertId
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao criar reserva' });
    }
  },

  // PUT /api/reservas/:id  – Atualizar status
  updateStatus: async (req, res) => {
    try {
      const reserva = await ReservaModel.findById(req.params.id);
      if (!reserva) {
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }
      const { status } = req.body;
      if (!['ativa', 'cancelada', 'concluida'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status inválido' });
      }
      await ReservaModel.updateStatus(req.params.id, status);
      return res.json({ success: true, message: 'Reserva atualizada com sucesso!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao atualizar reserva' });
    }
  },

  // DELETE /api/reservas/:id
  delete: async (req, res) => {
    try {
      const reserva = await ReservaModel.findById(req.params.id);
      if (!reserva) {
        return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
      }
      await ReservaModel.delete(req.params.id);
      return res.json({ success: true, message: 'Reserva removida com sucesso!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao remover reserva' });
    }
  }
};

module.exports = ReservasController;

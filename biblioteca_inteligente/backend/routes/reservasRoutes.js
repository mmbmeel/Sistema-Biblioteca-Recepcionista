// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Rotas: Reservas
//  Base: /api/reservas
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reservasController');

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.updateStatus);  // Atualizar status
router.delete('/:id', ctrl.delete);

module.exports = router;

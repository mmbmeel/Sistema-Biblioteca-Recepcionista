// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Rotas: Empréstimos
//  Base: /api/emprestimos
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/emprestimosController');

router.get('/',               ctrl.getAll);
router.get('/:id',            ctrl.getById);
router.post('/',              ctrl.create);
router.put('/:id/devolver',   ctrl.devolver);   // Registrar devolução
router.delete('/:id',         ctrl.delete);

module.exports = router;

// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Rotas: Livros
//  Base: /api/livros
// ============================================================

const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/livrosController');

// GET    /api/livros          → Listar todos (com filtros)
router.get('/',    ctrl.getAll);

// GET    /api/livros/:id      → Buscar por ID
router.get('/:id', ctrl.getById);

// POST   /api/livros          → Criar novo livro
router.post('/',   ctrl.create);

// PUT    /api/livros/:id      → Atualizar livro
router.put('/:id', ctrl.update);

// DELETE /api/livros/:id      → Remover livro
router.delete('/:id', ctrl.delete);

module.exports = router;

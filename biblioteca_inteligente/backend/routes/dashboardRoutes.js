// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Rotas: Dashboard
//  Base: /api/dashboard
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboardController');

// GET /api/dashboard/stats      → Estatísticas gerais
router.get('/stats',     ctrl.getStats);

// GET /api/dashboard/destaques  → Livros em destaque
router.get('/destaques', ctrl.getDestaques);

module.exports = router;

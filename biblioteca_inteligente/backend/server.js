// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Servidor Principal
//  Node.js + Express – API REST
// ============================================================

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

// Carregar variáveis de ambiente
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ===== ROTAS DA API =====
const livrosRoutes      = require('./routes/livrosRoutes');
const usuariosRoutes    = require('./routes/usuariosRoutes');
const emprestimosRoutes = require('./routes/emprestimosRoutes');
const reservasRoutes    = require('./routes/reservasRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');

app.use('/api/livros',      livrosRoutes);
app.use('/api/usuarios',    usuariosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);
app.use('/api/reservas',    reservasRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// ===== ROTA RAIZ – Servir o frontend =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Fallback: redirecionar páginas HTML do frontend
app.get('*.html', (req, res) => {
  const page = path.basename(req.path);
  res.sendFile(path.join(__dirname, '..', 'frontend', page));
});

// ===== TRATAMENTO DE ERROS – 404 =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// ===== TRATAMENTO DE ERROS – Genérico =====
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
  console.log('');
  console.log('📚 ============================================');
  console.log('   BIBLIOTECA – GESTÃO INTELIGENTE');
  console.log('   API REST – Node.js + Express');
  console.log('============================================');
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌐 Frontend:   http://localhost:${PORT}`);
  console.log(`📡 API Base:   http://localhost:${PORT}/api`);
  console.log('============================================');
});

module.exports = app;

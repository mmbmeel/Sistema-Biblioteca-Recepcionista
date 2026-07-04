// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – Conexão com MySQL
//  Pool de conexões com mysql2/promise
// ============================================================

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Criar pool de conexões para melhor performance
const pool = mysql.createPool({
  host              : process.env.DB_HOST     || 'localhost',
  port              : process.env.DB_PORT     || 3306,
  user              : process.env.DB_USER     || 'root',
  password          : process.env.DB_PASSWORD || '',
  database          : process.env.DB_NAME     || 'biblioteca_db',
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
  charset           : 'utf8mb4',
  timezone          : '-03:00'
});

// Testar conexão ao iniciar o servidor
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    console.error('   Verifique as credenciais no arquivo .env');
    return;
  }
  console.log('✅ Conexão com MySQL estabelecida com sucesso!');
  connection.release();
});

// Exportar pool com suporte a Promises
module.exports = pool.promise();

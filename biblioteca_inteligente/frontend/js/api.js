// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – api.js
//  Módulo centralizado de comunicação com a API REST
//  Fallback automático para LocalStorage quando offline
// ============================================================

const API_BASE = 'http://localhost:3000/api';

// ============================================================
//  LOCALSTORAGEDB – Banco de dados local para testes offline
// ============================================================
const LocalStorageDB = {
  KEYS: {
    livros    : 'bgi_livros',
    usuarios  : 'bgi_usuarios',
    emprestimos: 'bgi_emprestimos',
    reservas  : 'bgi_reservas'
  },

  _initialized: false,

  // Salva no localStorage com tratamento de cota excedida
  _safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22 ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        // Tenta liberar espaço removendo dados antigos de outras entidades
        const allKeys = Object.values(this.KEYS);
        const otherKeys = allKeys.filter(k => k !== key);
        let freed = false;
        for (const k of otherKeys) {
          try {
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            const arr = JSON.parse(raw);
            // Mantém apenas os últimos 50 registros de entidades secundárias
            if (arr.length > 50) {
              localStorage.setItem(k, JSON.stringify(arr.slice(-50)));
              freed = true;
              break;
            }
          } catch (_) {}
        }
        if (freed) {
          try { localStorage.setItem(key, value); return; } catch(_) {}
        }
        // Sem espaço mesmo após tentar liberar
        console.error('[LocalStorageDB] Cota de armazenamento excedida.');
        if (typeof Toast !== 'undefined') {
          Toast.error(
            'Armazenamento local cheio',
            'O espaço do navegador está esgotado. Conecte-se ao servidor ou limpe dados antigos.'
          );
        }
        throw new Error('STORAGE_QUOTA_EXCEEDED');
      }
      throw e;
    }
  },

  // Dados de demonstração iniciais
  DEMO_DATA: {
    livros: [
      { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis', categoria: 'Romance', editora: 'Garnier', ano_publicacao: 1899, isbn: '978-85-359-0277-5', quantidade_disponivel: 3, status: 'disponivel', idioma: 'Português', sinopse: 'Clássico da literatura brasileira sobre ciúme e traição.' },
      { id: 2, titulo: '1984', autor: 'George Orwell', categoria: 'Ficção Científica', editora: 'Companhia das Letras', ano_publicacao: 1949, isbn: '978-85-359-0277-6', quantidade_disponivel: 2, status: 'disponivel', idioma: 'Português', sinopse: 'Distopia sobre vigilância e totalitarismo.' },
      { id: 3, titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', categoria: 'Literatura Infantil', editora: 'Agir', ano_publicacao: 1943, isbn: '978-85-220-0482-1', quantidade_disponivel: 5, status: 'disponivel', idioma: 'Português', sinopse: 'Fábula poética sobre a essência da vida e amizade.' },
      { id: 4, titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', categoria: 'Realismo Mágico', editora: 'Record', ano_publicacao: 1967, isbn: '978-85-01-03152-8', quantidade_disponivel: 1, status: 'disponivel', idioma: 'Português', sinopse: 'A saga da família Buendía ao longo de sete gerações em Macondo.' },
      { id: 5, titulo: 'Orgulho e Preconceito', autor: 'Jane Austen', categoria: 'Romance', editora: 'Martin Claret', ano_publicacao: 1813, isbn: '978-85-7232-534-4', quantidade_disponivel: 4, status: 'disponivel', idioma: 'Português', sinopse: 'Romance inglês clássico sobre amor, classe social e preconceito.' },
      { id: 6, titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', categoria: 'Fantasia', editora: 'Martins Fontes', ano_publicacao: 1954, isbn: '978-85-336-2319-6', quantidade_disponivel: 0, status: 'indisponivel', idioma: 'Português', sinopse: 'Épica fantasia sobre a destruição do Um Anel.' },
      { id: 7, titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', categoria: 'Fantasia', editora: 'Rocco', ano_publicacao: 1997, isbn: '978-85-325-0522-9', quantidade_disponivel: 6, status: 'disponivel', idioma: 'Português', sinopse: 'O início da saga do bruxo Harry Potter em Hogwarts.' },
      { id: 8, titulo: 'A Revolução dos Bichos', autor: 'George Orwell', categoria: 'Fábula', editora: 'Companhia das Letras', ano_publicacao: 1945, isbn: '978-85-359-0271-3', quantidade_disponivel: 3, status: 'disponivel', idioma: 'Português', sinopse: 'Sátira política contada por animais em uma fazenda.' },
      { id: 9, titulo: 'O Alquimista', autor: 'Paulo Coelho', categoria: 'Aventura', editora: 'HarperCollins', ano_publicacao: 1988, isbn: '978-85-02-11575-0', quantidade_disponivel: 7, status: 'disponivel', idioma: 'Português', sinopse: 'Jornada de autodescoberta de um pastor andaluz.' },
      { id: 10, titulo: 'Sapiens: Uma Breve História da Humanidade', autor: 'Yuval Noah Harari', categoria: 'História', editora: 'Companhia das Letras', ano_publicacao: 2011, isbn: '978-85-359-2483-8', quantidade_disponivel: 2, status: 'disponivel', idioma: 'Português', sinopse: 'Panorama da história humana desde a pré-história até hoje.' }
    ],
    usuarios: [
      { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', telefone: '(11) 98765-4321', tipo: 'aluno', status: 'ativo', data_cadastro: '2024-01-15' },
      { id: 2, nome: 'João Santos', email: 'joao.santos@email.com', telefone: '(11) 97654-3210', tipo: 'professor', status: 'ativo', data_cadastro: '2024-02-10' },
      { id: 3, nome: 'Ana Oliveira', email: 'ana.oliveira@email.com', telefone: '(11) 96543-2109', tipo: 'aluno', status: 'ativo', data_cadastro: '2024-03-05' },
      { id: 4, nome: 'Carlos Ferreira', email: 'carlos.ferreira@email.com', telefone: '(11) 95432-1098', tipo: 'funcionario', status: 'ativo', data_cadastro: '2024-01-20' },
      { id: 5, nome: 'Beatriz Costa', email: 'beatriz.costa@email.com', telefone: '(11) 94321-0987', tipo: 'aluno', status: 'inativo', data_cadastro: '2024-04-12' }
    ],
    emprestimos: [
      { id: 1, livro_id: 6, usuario_id: 1, livro_titulo: 'O Senhor dos Anéis', usuario_nome: 'Maria Silva', data_emprestimo: '2024-06-01', data_devolucao_prevista: '2024-06-15', data_devolucao_real: null, status: 'ativo' },
      { id: 2, livro_id: 2, usuario_id: 3, livro_titulo: '1984', usuario_nome: 'Ana Oliveira', data_emprestimo: '2024-05-20', data_devolucao_prevista: '2024-06-03', data_devolucao_real: null, status: 'atrasado' },
      { id: 3, livro_id: 1, usuario_id: 2, livro_titulo: 'Dom Casmurro', usuario_nome: 'João Santos', data_emprestimo: '2024-05-10', data_devolucao_prevista: '2024-05-24', data_devolucao_real: '2024-05-23', status: 'devolvido' }
    ],
    reservas: [
      { id: 1, livro_id: 6, usuario_id: 4, livro_titulo: 'O Senhor dos Anéis', usuario_nome: 'Carlos Ferreira', data_reserva: '2024-06-05', data_expiracao: '2024-06-12', status: 'ativa' },
      { id: 2, livro_id: 2, usuario_id: 5, livro_titulo: '1984', usuario_nome: 'Beatriz Costa', data_reserva: '2024-06-08', data_expiracao: '2024-06-15', status: 'ativa' }
    ]
  },

  // Inicializa o banco se ainda não existir (executa apenas uma vez por sessão)
  init() {
    if (this._initialized) return;
    Object.entries(this.KEYS).forEach(([entity, key]) => {
      if (!localStorage.getItem(key)) {
        try {
          this._safeSet(key, JSON.stringify(this.DEMO_DATA[entity] || []));
        } catch (_) { /* Se não couber, começa com lista vazia */ }
      }
    });
    this._initialized = true;
  },

  // Lê lista completa de uma entidade
  getAll(entity) {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS[entity]) || '[]');
    } catch { return []; }
  },

  // Lê um registro por id
  getById(entity, id) {
    const list = this.getAll(entity);
    const item = list.find(r => r.id === Number(id));
    if (!item) throw new Error(`Registro #${id} não encontrado.`);
    return item;
  },

  // Cria um novo registro (suporta quantos registros o storage comportar)
  create(entity, data) {
    const list = this.getAll(entity);
    // Gera ID único garantindo que não haja colisão mesmo após exclusões
    const newId = list.length > 0 ? Math.max(...list.map(r => r.id)) + 1 : 1;
    const record = { ...data, id: newId };
    list.push(record);
    this._safeSet(this.KEYS[entity], JSON.stringify(list));
    return record;
  },

  // Atualiza um registro
  update(entity, id, data) {
    const list = this.getAll(entity);
    const idx = list.findIndex(r => r.id === Number(id));
    if (idx === -1) throw new Error(`Registro #${id} não encontrado.`);
    list[idx] = { ...list[idx], ...data, id: Number(id) };
    this._safeSet(this.KEYS[entity], JSON.stringify(list));
    return list[idx];
  },

  // Remove um registro
  delete(entity, id) {
    let list = this.getAll(entity);
    const idx = list.findIndex(r => r.id === Number(id));
    if (idx === -1) throw new Error(`Registro #${id} não encontrado.`);
    list.splice(idx, 1);
    this._safeSet(this.KEYS[entity], JSON.stringify(list));
    return true;
  },

  // Limpa todos os dados e reinicia com os dados de demonstração
  reset() {
    this._initialized = false;
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    this.init();
  },

  // Retorna o uso atual do localStorage em KB
  getStorageInfo() {
    let totalBytes = 0;
    Object.values(this.KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) totalBytes += item.length * 2; // UTF-16: 2 bytes por char
    });
    return {
      usedKB: Math.round(totalBytes / 1024),
      totalKB: 5120, // ~5MB típico
      percentUsed: Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100))
    };
  },

  // Conta registros por entidade sem carregar tudo na memória
  count(entity) {
    const list = this.getAll(entity);
    return list.length;
  }
};

// ===== MODO OFFLINE: detecta se o backend está disponível =====
let _backendOnline = null; // null = não testado ainda

async function checkBackend() {
  if (_backendOnline !== null) return _backendOnline;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 2000);
    await fetch(`${API_BASE}/livros?_limit=1`, { signal: ctrl.signal });
    clearTimeout(tid);
    _backendOnline = true;
  } catch {
    _backendOnline = false;
    console.info('[API] Backend offline – usando LocalStorage como fallback.');
  }
  return _backendOnline;
}

// ===== UTILITÁRIO DE FETCH =====
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP ${response.status}`);
    }

    _backendOnline = true;
    return data;
  } catch (error) {
    if (error.name === 'TypeError' || error.name === 'AbortError' ||
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('failed')) {
      _backendOnline = false;
      throw new Error('__OFFLINE__');
    }
    throw error;
  }
}

// Wrapper que tenta API e recai para LocalStorage automaticamente
async function apiOrLocal(endpoint, options = {}, localFallback) {
  const online = await checkBackend();
  if (!online) return localFallback();

  try {
    return await apiFetch(endpoint, options);
  } catch (err) {
    if (err.message === '__OFFLINE__') {
      _backendOnline = false;
      console.info('[API] Fallback automático para LocalStorage.');
      return localFallback();
    }
    throw err;
  }
}

// ============================================================
//  LIVROS
// ============================================================
const livrosAPI = {
  // GET /api/livros
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiOrLocal(`/livros${query}`, {}, () => {
      let list = LocalStorageDB.getAll('livros');
      const total = list.length;
      // Aplicar filtros localmente
      if (filters.titulo || filters.autor) {
        const q = (filters.titulo || filters.autor || '').toLowerCase();
        list = list.filter(l =>
          l.titulo?.toLowerCase().includes(q) || l.autor?.toLowerCase().includes(q)
        );
      }
      if (filters.status)    list = list.filter(l => l.status    === filters.status);
      if (filters.categoria) list = list.filter(l => l.categoria === filters.categoria);
      if (filters.editora)   list = list.filter(l => l.editora   === filters.editora);
      if (filters.idioma)    list = list.filter(l => l.idioma    === filters.idioma);

      // Paginação local (espelha o comportamento do backend)
      const filteredTotal = list.length;
      const limit = parseInt(filters.limit) || 0;
      if (limit > 0) {
        const page   = Math.max(1, parseInt(filters.page) || 1);
        const offset = (page - 1) * limit;
        list = list.slice(offset, offset + limit);
      }

      return { success: true, total: filteredTotal, data: list };
    });
  },

  // GET /api/livros/:id
  getById: (id) => apiOrLocal(`/livros/${id}`, {}, () => {
    const item = LocalStorageDB.getById('livros', id);
    return { success: true, data: item };
  }),

  // POST /api/livros
  create: (data) => apiOrLocal('/livros', { method: 'POST', body: JSON.stringify(data) }, () => {
    const item = LocalStorageDB.create('livros', data);
    return { success: true, data: item, message: 'Livro cadastrado com sucesso.' };
  }),

  // PUT /api/livros/:id
  update: (id, data) => apiOrLocal(`/livros/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => {
    const item = LocalStorageDB.update('livros', id, data);
    return { success: true, data: item, message: 'Livro atualizado com sucesso.' };
  }),

  // DELETE /api/livros/:id
  delete: (id) => apiOrLocal(`/livros/${id}`, { method: 'DELETE' }, () => {
    LocalStorageDB.delete('livros', id);
    return { success: true, message: 'Livro excluído com sucesso.' };
  })
};

// ============================================================
//  USUÁRIOS
// ============================================================
const usuariosAPI = {
  getAll  : ()      => apiOrLocal('/usuarios', {}, () => ({ success: true, data: LocalStorageDB.getAll('usuarios') })),
  getById : (id)    => apiOrLocal(`/usuarios/${id}`, {}, () => ({ success: true, data: LocalStorageDB.getById('usuarios', id) })),
  create  : (data)  => apiOrLocal('/usuarios', { method: 'POST', body: JSON.stringify(data) }, () => {
    const item = LocalStorageDB.create('usuarios', data);
    return { success: true, data: item, message: 'Usuário cadastrado com sucesso.' };
  }),
  update  : (id, d) => apiOrLocal(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(d) }, () => {
    const item = LocalStorageDB.update('usuarios', id, d);
    return { success: true, data: item, message: 'Usuário atualizado com sucesso.' };
  }),
  delete  : (id)    => apiOrLocal(`/usuarios/${id}`, { method: 'DELETE' }, () => {
    LocalStorageDB.delete('usuarios', id);
    return { success: true, message: 'Usuário excluído com sucesso.' };
  })
};

// ============================================================
//  EMPRÉSTIMOS
// ============================================================
const emprestimosAPI = {
  getAll  : (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiOrLocal(`/emprestimos${query}`, {}, () => {
      let list = LocalStorageDB.getAll('emprestimos');
      if (filters.status) list = list.filter(e => e.status === filters.status);
      if (filters.usuario_id) list = list.filter(e => e.usuario_id === Number(filters.usuario_id));
      return { success: true, data: list };
    });
  },
  getById : (id)   => apiOrLocal(`/emprestimos/${id}`, {}, () => ({ success: true, data: LocalStorageDB.getById('emprestimos', id) })),
  create  : (data) => apiOrLocal('/emprestimos', { method: 'POST', body: JSON.stringify(data) }, () => {
    // Buscar nome do livro e do usuário para exibição na tabela
    let livro_titulo = data.livro_titulo || '';
    let usuario_nome = data.usuario_nome || '';
    try { if (!livro_titulo)   livro_titulo = LocalStorageDB.getById('livros', data.livro_id)?.titulo || ''; } catch(_) {}
    try { if (!usuario_nome)  usuario_nome = LocalStorageDB.getById('usuarios', data.usuario_id)?.nome || ''; } catch(_) {}
    const item = LocalStorageDB.create('emprestimos', {
      ...data,
      livro_titulo,
      usuario_nome,
      status: 'ativo',
      data_devolucao_real: null
    });
    return { success: true, data: item, message: 'Empréstimo registrado com sucesso.' };
  }),
  update  : (id, data) => apiOrLocal(`/emprestimos/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => {
    const item = LocalStorageDB.update('emprestimos', id, data);
    return { success: true, data: item, message: 'Empréstimo atualizado com sucesso.' };
  }),
  devolver: (id)   => apiOrLocal(`/emprestimos/${id}/devolver`, { method: 'PUT' }, () => {
    const item = LocalStorageDB.update('emprestimos', id, { status: 'devolvido', data_devolucao_real: new Date().toISOString().slice(0,10) });
    return { success: true, data: item, message: 'Devolução registrada com sucesso.' };
  }),
  delete  : (id)   => apiOrLocal(`/emprestimos/${id}`, { method: 'DELETE' }, () => {
    LocalStorageDB.delete('emprestimos', id);
    return { success: true, message: 'Empréstimo excluído com sucesso.' };
  })
};

// ============================================================
//  RESERVAS
// ============================================================
const reservasAPI = {
  getAll       : (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiOrLocal(`/reservas${query}`, {}, () => {
      let list = LocalStorageDB.getAll('reservas');
      if (filters.status) list = list.filter(r => r.status === filters.status);
      return { success: true, data: list };
    });
  },
  getById      : (id)         => apiOrLocal(`/reservas/${id}`, {}, () => ({ success: true, data: LocalStorageDB.getById('reservas', id) })),
  create       : (data)       => apiOrLocal('/reservas', { method: 'POST', body: JSON.stringify(data) }, () => {
    const item = LocalStorageDB.create('reservas', { ...data, status: 'ativa', data_reserva: new Date().toISOString().slice(0,10) });
    return { success: true, data: item, message: 'Reserva criada com sucesso.' };
  }),
  updateStatus : (id, status) => apiOrLocal(`/reservas/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }, () => {
    const item = LocalStorageDB.update('reservas', id, { status });
    return { success: true, data: item, message: 'Status da reserva atualizado.' };
  }),
  // Conclui a reserva e cria automaticamente um empréstimo
  concluirParaEmprestimo: async (reservaId) => {
    const online = await checkBackend();
    if (online) {
      try {
        // Tenta endpoint dedicado se existir
        return await apiFetch(`/reservas/${reservaId}/concluir`, { method: 'PUT' });
      } catch(err) {
        if (err.message === '__OFFLINE__') { /* cai no local */ }
        else {
          // Se o backend não tem endpoint /concluir, usa o fluxo manual
          const res = await apiFetch(`/reservas/${reservaId}`, {});
          const reserva = res.data;
          await apiFetch(`/reservas/${reservaId}`, { method: 'PUT', body: JSON.stringify({ status: 'concluida' }) });
          const today = new Date().toISOString().split('T')[0];
          const devDate = new Date(); devDate.setDate(devDate.getDate() + 14);
          await apiFetch('/emprestimos', { method: 'POST', body: JSON.stringify({
            livro_id: reserva.livro_id,
            usuario_id: reserva.usuario_id,
            data_emprestimo: today,
            data_devolucao_prevista: devDate.toISOString().split('T')[0],
            observacoes: 'Gerado a partir de reserva #' + reservaId
          })});
          return { success: true, message: 'Reserva concluída e empréstimo criado!' };
        }
      }
    }
    // Fallback local
    const reserva = LocalStorageDB.getById('reservas', reservaId);
    LocalStorageDB.update('reservas', reservaId, { status: 'concluida' });
    const today = new Date().toISOString().split('T')[0];
    const devDate = new Date(); devDate.setDate(devDate.getDate() + 14);
    const livro = LocalStorageDB.getById('livros', reserva.livro_id);
    const usuario = LocalStorageDB.getById('usuarios', reserva.usuario_id);
    LocalStorageDB.create('emprestimos', {
      livro_id: reserva.livro_id,
      usuario_id: reserva.usuario_id,
      livro_titulo: livro?.titulo || '',
      usuario_nome: usuario?.nome || '',
      data_emprestimo: today,
      data_devolucao_prevista: devDate.toISOString().split('T')[0],
      data_devolucao_real: null,
      status: 'ativo',
      observacoes: 'Gerado a partir de reserva #' + reservaId
    });
    return { success: true, message: 'Reserva concluída e empréstimo criado!' };
  },
  delete       : (id)         => apiOrLocal(`/reservas/${id}`, { method: 'DELETE' }, () => {
    LocalStorageDB.delete('reservas', id);
    return { success: true, message: 'Reserva cancelada com sucesso.' };
  })
};

// ============================================================
//  DASHBOARD
// ============================================================
const dashboardAPI = {
  getStats: () => apiOrLocal('/dashboard/stats', {}, () => {
    const livros     = LocalStorageDB.getAll('livros');
    const usuarios   = LocalStorageDB.getAll('usuarios');
    const emprestimos = LocalStorageDB.getAll('emprestimos');
    const reservas   = LocalStorageDB.getAll('reservas');
    return {
      success: true,
      data: {
        livros: {
          total    : livros.length,
          autores  : new Set(livros.map(l => l.autor)).size,
          editoras : new Set(livros.map(l => l.editora).filter(Boolean)).size,
          generos  : new Set(livros.map(l => l.categoria).filter(Boolean)).size,
          idiomas  : new Set(livros.map(l => l.idioma).filter(Boolean)).size
        },
        usuarios    : { total: usuarios.length, ativos: usuarios.filter(u => u.status === 'ativo').length },
        emprestimos : { total: emprestimos.length, ativos: emprestimos.filter(e => e.status === 'ativo').length, atrasados: emprestimos.filter(e => e.status === 'atrasado').length },
        reservas    : { total: reservas.length, ativas: reservas.filter(r => r.status === 'ativa').length }
      }
    };
  }),
  getDestaques: () => apiOrLocal('/dashboard/destaques', {}, () => {
    const livros = LocalStorageDB.getAll('livros').slice(0, 5);
    return { success: true, data: livros };
  })
};

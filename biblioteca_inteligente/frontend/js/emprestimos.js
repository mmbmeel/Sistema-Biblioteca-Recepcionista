// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – emprestimos.js
//  Gestão de empréstimos: registrar, editar, devolver, excluir
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  let emprestimos = [];
  let editingId   = null;
  let livrosData  = [];
  let usuariosData= [];
  let livroSelect, usuarioSelect;

  const tbodyEl     = document.getElementById('emprestimos-tbody');
  const formEl      = document.getElementById('form-emprestimo');
  const modalEl     = document.getElementById('modal-emprestimo');
  const modalTitulo = document.getElementById('modal-emp-titulo');
  const filterStatus= document.getElementById('filter-emp-status');
  const totalEl     = document.getElementById('total-emprestimos');
  const btnSubmit   = document.getElementById('btn-submit-emp');

  // ===== CARREGAR =====
  async function load(filters = {}) {
    if (!tbodyEl) return;
    showLoading();
    try {
      const res   = await emprestimosAPI.getAll(filters);
      emprestimos = res.data || [];
      if (totalEl) totalEl.textContent = emprestimos.length;
      render();
    } catch (err) {
      Toast.error('Erro ao carregar empréstimos', err.message);
    }
  }

  // ===== RENDERIZAR =====
  function render() {
    if (!tbodyEl) return;
    if (emprestimos.length === 0) {
      tbodyEl.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">Nenhum empréstimo encontrado</div>
        </div>
      </td></tr>`;
      return;
    }

    tbodyEl.innerHTML = emprestimos.map(e => {
      const atrasado = e.status === 'ativo' && new Date(e.data_devolucao_prevista) < new Date();
      const displayStatus = atrasado ? 'atrasado' : e.status;

      return `
        <tr>
          <td class="td-title">${escHtml(e.livro_titulo || '—')}</td>
          <td>${escHtml(e.usuario_nome || '—')}</td>
          <td>${Format.date(e.data_emprestimo)}</td>
          <td style="color: ${atrasado ? 'var(--color-danger)' : 'inherit'}">${Format.date(e.data_devolucao_prevista)}</td>
          <td>${e.data_devolucao_real ? Format.date(e.data_devolucao_real) : '—'}</td>
          <td>${empStatusBadge(displayStatus)}</td>
          <td>${escHtml(e.observacoes || '—')}</td>
          <td>
            <div class="td-actions">
              ${e.status !== 'devolvido'
                ? `<button class="btn btn-success btn-sm" onclick="devolverEmprestimo(${e.id})">↩ Devolver</button>`
                : '<span class="badge badge-success">Devolvido</span>'
              }
              <button class="btn btn-ghost btn-sm btn-icon" data-tooltip="Editar" onclick="editarEmprestimo(${e.id})">✏️</button>
              <button class="btn btn-danger btn-sm btn-icon" data-tooltip="Excluir" onclick="excluirEmprestimo(${e.id})">🗑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ===== CARREGAR LIVROS E USUÁRIOS PARA OS SELECTS =====
  async function carregarDados() {
    try {
      const [livrosRes, usuariosRes] = await Promise.all([livrosAPI.getAll(), usuariosAPI.getAll()]);
      livrosData   = (livrosRes.data || []).filter(l => l.status === 'disponivel');
      usuariosData = (usuariosRes.data || []).filter(u => u.status === 'ativo');
    } catch (err) {
      Toast.error('Erro', 'Não foi possível carregar livros e usuários.');
    }
  }

  // ===== INICIALIZAR SELECTS PESQUISÁVEIS =====
  function initSelects() {
    if (!document.getElementById('emp-livro-display')) return;

    livroSelect = criarSearchableSelect({
      displayId : 'emp-livro-display',
      dropdownId: 'emp-livro-dropdown',
      searchId  : 'emp-livro-search',
      optionsId : 'emp-livro-options',
      hiddenId  : 'emp-livro-id-hidden',
      data      : livrosData,
      labelFn   : l => `${l.titulo} — ${l.autor}`
    });

    usuarioSelect = criarSearchableSelect({
      displayId : 'emp-usuario-display',
      dropdownId: 'emp-usuario-dropdown',
      searchId  : 'emp-usuario-search',
      optionsId : 'emp-usuario-options',
      hiddenId  : 'emp-usuario-id-hidden',
      data      : usuariosData,
      labelFn   : u => u.nome
    });
  }

  // ===== MODAL NOVO =====
  document.getElementById('btn-novo-emprestimo')?.addEventListener('click', async () => {
    editingId = null;
    if (modalTitulo) modalTitulo.textContent = '➕ Registrar Empréstimo';
    if (btnSubmit)   btnSubmit.textContent = '📋 Registrar';
    formEl?.reset();

    await carregarDados();

    if (!livroSelect) {
      initSelects();
    } else {
      livroSelect.setData(livrosData);
      usuarioSelect.setData(usuariosData);
      livroSelect.clear();
      usuarioSelect.clear();
    }

    // Preencher datas padrão
    const today = new Date().toISOString().split('T')[0];
    const devDate = new Date();
    devDate.setDate(devDate.getDate() + 14);
    const dtEmp = document.getElementById('emp-data-emprestimo');
    const dtDev = document.getElementById('emp-data-devolucao');
    if (dtEmp) dtEmp.value = today;
    if (dtDev) dtDev.value = devDate.toISOString().split('T')[0];

    modalEl?.classList.add('open');
  });

  // ===== EDITAR EMPRÉSTIMO =====
  window.editarEmprestimo = async (id) => {
    try {
      const res = await emprestimosAPI.getById(id);
      const emp = res.data;
      editingId = id;

      if (modalTitulo) modalTitulo.textContent = '✏️ Editar Empréstimo';
      if (btnSubmit)   btnSubmit.textContent = '💾 Salvar Alterações';
      formEl?.reset();

      await carregarDados();

      // Incluir o livro do empréstimo mesmo se indisponível (já está emprestado)
      const livroAtual = (await livrosAPI.getById(emp.livro_id)).data;
      const livrosParaSelect = livrosData.find(l => l.id == emp.livro_id)
        ? livrosData
        : [...livrosData, livroAtual];

      // Incluir o usuário do empréstimo mesmo se inativo
      const usuarioAtual = (await usuariosAPI.getById(emp.usuario_id)).data;
      const usuariosParaSelect = usuariosData.find(u => u.id == emp.usuario_id)
        ? usuariosData
        : [...usuariosData, usuarioAtual];

      if (!livroSelect) {
        initSelects();
      }

      livroSelect.setData(livrosParaSelect);
      usuarioSelect.setData(usuariosParaSelect);

      livroSelect.setValue(emp.livro_id, `${livroAtual.titulo} — ${livroAtual.autor}`);
      usuarioSelect.setValue(emp.usuario_id, usuarioAtual.nome);

      // Preencher campos do formulário
      const dtEmp = document.getElementById('emp-data-emprestimo');
      const dtDev = document.getElementById('emp-data-devolucao');
      if (dtEmp && emp.data_emprestimo)          dtEmp.value = emp.data_emprestimo.split('T')[0];
      if (dtDev && emp.data_devolucao_prevista)  dtDev.value = emp.data_devolucao_prevista.split('T')[0];

      const obsEl = formEl?.querySelector('[name="observacoes"]');
      if (obsEl) obsEl.value = emp.observacoes || '';

      modalEl?.classList.add('open');
    } catch (err) {
      Toast.error('Erro', 'Não foi possível carregar os dados do empréstimo.');
    }
  };

  function closeModal() {
    modalEl?.classList.remove('open');
    formEl?.reset();
    editingId = null;
    if (livroSelect)   livroSelect.clear();
    if (usuarioSelect) usuarioSelect.clear();
  }

  document.getElementById('btn-fechar-modal-emp')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancelar-emp')?.addEventListener('click', closeModal);
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });

  // ===== SUBMIT =====
  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = editingId ? 'Salvando...' : 'Registrando...'; }

    const data = Object.fromEntries(new FormData(formEl));
    data.livro_id   = parseInt(data.livro_id);
    data.usuario_id = parseInt(data.usuario_id);

    if (!data.livro_id || isNaN(data.livro_id)) {
      Toast.error('Atenção', 'Selecione um livro.');
      if (btn) { btn.disabled = false; btn.textContent = editingId ? '💾 Salvar Alterações' : '📋 Registrar'; }
      return;
    }
    if (!data.usuario_id || isNaN(data.usuario_id)) {
      Toast.error('Atenção', 'Selecione um usuário.');
      if (btn) { btn.disabled = false; btn.textContent = editingId ? '💾 Salvar Alterações' : '📋 Registrar'; }
      return;
    }

    try {
      if (editingId) {
        await emprestimosAPI.update(editingId, data);
        Toast.success('Empréstimo atualizado!', 'Os dados foram salvos com sucesso.');
      } else {
        await emprestimosAPI.create(data);
        Toast.success('Empréstimo registrado!', 'O empréstimo foi registrado com sucesso.');
      }
      closeModal();
      load();
    } catch (err) {
      Toast.error('Erro ao salvar', err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = editingId ? '💾 Salvar Alterações' : '📋 Registrar'; }
    }
  });

  // ===== DEVOLVER =====
  window.devolverEmprestimo = (id) => {
    Modal.confirm(
      'Registrar Devolução',
      'Confirmar a devolução deste livro hoje?',
      async () => {
        try {
          await emprestimosAPI.devolver(id);
          Toast.success('Devolução registrada!', 'O livro foi devolvido com sucesso.');
          load();
        } catch (err) { Toast.error('Erro', err.message); }
      },
      'primary'
    );
  };

  // ===== EXCLUIR =====
  window.excluirEmprestimo = (id) => {
    Modal.confirm(
      'Excluir Empréstimo',
      'Deseja excluir este registro de empréstimo?',
      async () => {
        try {
          await emprestimosAPI.delete(id);
          Toast.success('Empréstimo excluído!');
          load();
        } catch (err) { Toast.error('Erro', err.message); }
      }
    );
  };

  // ===== FILTRO =====
  filterStatus?.addEventListener('change', () => {
    const v = filterStatus.value;
    load(v ? { status: v } : {});
  });

  // ===== UTILITÁRIOS =====
  function empStatusBadge(s) {
    const map = { ativo: 'primary', devolvido: 'success', atrasado: 'danger' };
    const txt = { ativo: 'Ativo', devolvido: 'Devolvido', atrasado: 'Atrasado' };
    return `<span class="badge badge-${map[s]||'info'}">${txt[s]||s}</span>`;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showLoading() {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = `<tr><td colspan="8">
      <div class="loading-overlay"><div class="spinner"></div><div class="loading-text">Carregando empréstimos...</div></div>
    </td></tr>`;
  }

  load();
});

// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – usuarios.js
//  CRUD completo de usuários
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  let usuarios   = [];
  let editingId  = null;

  const tbodyEl     = document.getElementById('usuarios-tbody');
  const formEl      = document.getElementById('form-usuario');
  const modalEl     = document.getElementById('modal-usuario');
  const modalTitle  = document.getElementById('modal-usuario-titulo');
  const searchInput = document.getElementById('search-usuarios');
  const filterTipo  = document.getElementById('filter-tipo');
  const totalEl     = document.getElementById('total-usuarios');

  // ===== CARREGAR =====
  async function load() {
    if (!tbodyEl) return;
    showLoading();
    try {
      const res = await usuariosAPI.getAll();
      usuarios  = res.data || [];
      if (totalEl) totalEl.textContent = usuarios.length;
      render(usuarios);
    } catch (err) {
      Toast.error('Erro ao carregar usuários', err.message);
    }
  }

  // ===== RENDERIZAR =====
  function render(data) {
    if (!tbodyEl) return;
    if (data.length === 0) {
      tbodyEl.innerHTML = `<tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">👤</div>
          <div class="empty-title">Nenhum usuário encontrado</div>
        </div>
      </td></tr>`;
      return;
    }

    tbodyEl.innerHTML = data.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar avatar-sm" style="background:var(--gradient-primary)">${initials(u.nome)}</div>
            <span class="td-title">${escHtml(u.nome)}</span>
          </div>
        </td>
        <td>${escHtml(u.email)}</td>
        <td>${tipoBadge(u.tipo)}</td>
        <td>${escHtml(u.telefone || '—')}</td>
        <td>${escHtml(u.cpf || '—')}</td>
        <td>${statusBadge(u.status)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-ghost btn-sm btn-icon" data-tooltip="Editar" onclick="editarUsuario(${u.id})">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" data-tooltip="Excluir" onclick="excluirUsuario(${u.id}, '${escHtml(u.nome)}')">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ===== MODAL =====
  document.getElementById('btn-novo-usuario')?.addEventListener('click', () => openModal());

  function openModal(u = null) {
    editingId = u ? u.id : null;
    if (modalTitle) modalTitle.textContent = u ? '✏️ Editar Usuário' : '➕ Cadastrar Usuário';
    if (formEl) formEl.reset();

    if (u) {
      Object.keys(u).forEach(k => {
        const el = formEl?.querySelector(`[name="${k}"]`);
        if (el) el.value = u[k] ?? '';
      });
    }

    modalEl?.classList.add('open');
  }

  function closeModal() {
    modalEl?.classList.remove('open');
    formEl?.reset();
    editingId = null;
  }

  document.getElementById('btn-fechar-modal-usuario')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancelar-usuario')?.addEventListener('click', closeModal);
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });

  // ===== SUBMIT =====
  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    const data = Object.fromEntries(new FormData(formEl));

    // Validar CPF se preenchido
    if (data.cpf) {
      const cpfDigits = data.cpf.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        Toast.error('CPF inválido', 'O CPF deve ter exatamente 11 dígitos.');
        if (btn) { btn.disabled = false; btn.textContent = 'Salvar'; }
        return;
      }
      if (window._validarCPF && !window._validarCPF(cpfDigits)) {
        Toast.error('CPF inválido', 'O CPF informado não é válido. Verifique os dígitos.');
        if (btn) { btn.disabled = false; btn.textContent = 'Salvar'; }
        return;
      }
    }

    // Validar telefone se preenchido
    if (data.telefone) {
      const telDigits = data.telefone.replace(/\D/g, '');
      if (telDigits.length !== 11) {
        Toast.error('Telefone inválido', 'O telefone deve ter exatamente 11 dígitos no formato (##) # ####-####.');
        if (btn) { btn.disabled = false; btn.textContent = 'Salvar'; }
        return;
      }
    }

    try {
      if (editingId) {
        await usuariosAPI.update(editingId, data);
        Toast.success('Usuário atualizado!', `${data.nome} foi atualizado com sucesso.`);
      } else {
        await usuariosAPI.create(data);
        Toast.success('Usuário cadastrado!', `${data.nome} foi adicionado ao sistema.`);
      }
      closeModal();
      load();
    } catch (err) {
      Toast.error('Erro ao salvar', err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Salvar'; }
    }
  });

  // ===== AÇÕES GLOBAIS =====
  window.editarUsuario = async (id) => {
    try {
      const res = await usuariosAPI.getById(id);
      openModal(res.data);
    } catch (err) { Toast.error('Erro', 'Não foi possível carregar o usuário.'); }
  };

  window.excluirUsuario = (id, nome) => {
    Modal.confirm(
      'Excluir Usuário',
      `Deseja excluir o usuário "<strong>${nome}</strong>"?`,
      async () => {
        try {
          await usuariosAPI.delete(id);
          Toast.success('Usuário excluído!', `${nome} foi removido do sistema.`);
          load();
        } catch (err) { Toast.error('Erro ao excluir', err.message); }
      }
    );
  };

  // ===== FILTROS =====
  searchInput?.addEventListener('input', filterList);
  filterTipo?.addEventListener('change', filterList);

  function filterList() {
    const q = searchInput?.value?.toLowerCase() || '';
    const t = filterTipo?.value || '';
    const filtered = usuarios.filter(u => {
      const matchQ = !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchT = !t || u.tipo === t;
      return matchQ && matchT;
    });
    if (totalEl) totalEl.textContent = filtered.length;
    render(filtered);
  }

  // ===== UTILITÁRIOS =====
  function initials(nome) {
    return (nome || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function tipoBadge(tipo) {
    const map = { admin: 'primary', recepcionista: 'secondary', leitor: 'info' };
    const txt = { admin: 'Admin', recepcionista: 'Recepcionista', leitor: 'Leitor' };
    return `<span class="badge badge-${map[tipo] || 'info'}">${txt[tipo] || tipo}</span>`;
  }

  function statusBadge(s) {
    return s === 'ativo'
      ? `<span class="badge badge-success">Ativo</span>`
      : `<span class="badge badge-danger">Inativo</span>`;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showLoading() {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = `<tr><td colspan="7">
      <div class="loading-overlay"><div class="spinner"></div><div class="loading-text">Carregando usuários...</div></div>
    </td></tr>`;
  }

  load();
});

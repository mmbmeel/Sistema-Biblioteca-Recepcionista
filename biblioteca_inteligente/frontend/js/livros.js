// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – livros.js
//  CRUD completo de livros: listar, cadastrar, editar, excluir
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== ESTADO =====
  let livros        = [];  // página atual
  let totalLivros   = 0;  // total no servidor/localStorage
  let editingId     = null;
  let currentPage   = 1;
  const perPage     = 20;

  // ===== ELEMENTOS DO DOM =====
  const tbodyEl     = document.getElementById('livros-tbody');
  const formEl      = document.getElementById('form-livro');
  const modalEl     = document.getElementById('modal-livro');
  const modalTitle  = document.getElementById('modal-titulo');
  const searchInput = document.getElementById('search-livros');
  const filterStatus= document.getElementById('filter-status');
  const totalEl     = document.getElementById('total-livros');
  const btnNovo     = document.getElementById('btn-novo-livro');

  // ===== CARREGAR LIVROS =====
  async function load(filters = {}, page = 1) {
    if (!tbodyEl) return;
    showLoading();
    currentPage = page;

    try {
      const res  = await livrosAPI.getAll({ ...filters, page, limit: perPage });
      livros     = res.data || [];
      totalLivros = res.total ?? livros.length;
      render();
    } catch (err) {
      Toast.error('Erro ao carregar livros', err.message);
      tbodyEl.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Erro ao conectar ao servidor</div>
          <div class="empty-desc">${err.message}</div>
        </div>
      </td></tr>`;
    }
  }

  // ===== RENDERIZAR TABELA =====
  function render() {
    if (!tbodyEl) return;

    // A página já veio paginada do servidor, exibe diretamente
    if (totalEl) totalEl.textContent = totalLivros;

    if (livros.length === 0) {
      tbodyEl.innerHTML = `<tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <div class="empty-title">Nenhum livro encontrado</div>
          <div class="empty-desc">Tente outro filtro ou cadastre um novo livro.</div>
        </div>
      </td></tr>`;
      renderPagination();
      return;
    }

    tbodyEl.innerHTML = livros.map(l => `
      <tr>
        <td>
          <img
            src="${l.capa_url ? escHtml(l.capa_url) : 'assets/book-cover-placeholder.png'}"
            alt="Capa de ${escHtml(l.titulo)}"
            style="width:40px;height:56px;object-fit:cover;border-radius:4px;border:1px solid var(--border-color);box-shadow:0 2px 6px rgba(0,0,0,0.25);"
            onerror="this.src='assets/book-cover-placeholder.png'"
          />
        </td>
        <td class="td-title">${escHtml(l.titulo)}</td>
        <td>${escHtml(l.autor)}</td>
        <td>${escHtml(l.categoria || '—')}</td>
        <td>${escHtml(l.editora || '—')}</td>
        <td>${l.ano_publicacao || '—'}</td>
        <td><span class="badge badge-${l.quantidade_disponivel > 0 ? 'success' : 'danger'}">${l.quantidade_disponivel}</span></td>
        <td>${statusBadge(l.status)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-secondary btn-sm btn-icon" data-tooltip="Ver detalhes" onclick="verDetalhes(${l.id})">👁</button>
            <button class="btn btn-ghost btn-sm btn-icon" data-tooltip="Editar" onclick="editarLivro(${l.id})">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" data-tooltip="Excluir" onclick="excluirLivro(${l.id}, '${escHtml(l.titulo)}')">🗑</button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(totalLivros / perPage);
    const paginEl    = document.getElementById('pagination-livros');
    if (!paginEl) return;

    if (totalPages <= 1) {
      paginEl.innerHTML = '';
      return;
    }

    // Gera o conjunto de páginas a exibir com elipses
    function getPageRange(current, total, delta = 2) {
      const range   = [];
      const rangeSet = new Set();

      // Sempre inclui primeira e última
      [1, total].forEach(p => rangeSet.add(p));
      // Janela ao redor da página atual
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        rangeSet.add(i);
      }

      const sorted = [...rangeSet].sort((a, b) => a - b);
      let prev = 0;
      for (const p of sorted) {
        if (p - prev > 1) range.push('...');
        range.push(p);
        prev = p;
      }
      return range;
    }

    const pageRange    = getPageRange(currentPage, totalPages);
    const startVisible = (currentPage - 1) * perPage + 1;
    const endVisible   = Math.min(currentPage * perPage, totalLivros);

    const btns = pageRange.map((p, i) => {
      if (p === '...') return `<span class="page-ellipsis" key="${i}">…</span>`;
      return `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="changePage(${p})">${p}</button>`;
    }).join('');

    paginEl.innerHTML = `
      <span style="color: var(--text-muted); font-size:13px;">
        Mostrando ${startVisible}–${endVisible} de ${totalLivros}
      </span>
      <div class="pagination-controls">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹</button>
        ${btns}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">›</button>
      </div>
    `;
  }

  // changePage agora recarrega do servidor com a nova página
  window.changePage = (p) => { load(_currentFilters, p); };

  // Guarda os filtros ativos para reusar na troca de página
  let _currentFilters = {};

  // ===== MODAL – NOVO LIVRO =====
  btnNovo?.addEventListener('click', () => openModal());

  function openModal(livro = null) {
    editingId = livro ? livro.id : null;
    if (modalTitle) modalTitle.textContent = livro ? '✏️ Editar Livro' : '➕ Cadastrar Livro';
    if (formEl) formEl.reset();

    // Limpar preview de capa e seleção de gêneros
    if (window._coverPreview) window._coverPreview.clearPreview();
    if (window._genreCheckbox) window._genreCheckbox.clear();

    if (livro) {
      Object.keys(livro).forEach(k => {
        // Gênero é tratado pelo _genreCheckbox — não atribuir direto ao hidden
        if (k === 'categoria') {
          if (window._genreCheckbox) window._genreCheckbox.setValue(livro[k]);
          return;
        }
        const el = formEl?.querySelector(`[name="${k}"]`);
        if (!el) return;
        // Aplicar máscara de ISBN ao popular o campo de edição
        if (k === 'isbn' && window._isbnMask) {
          el.value = window._isbnMask.apply(String(livro[k] ?? ''));
        } else {
          el.value = livro[k] ?? '';
        }
      });
      // Restaurar preview da capa se existir
      if (livro.capa_url && window._coverPreview) {
        window._coverPreview.showPreview(livro.capa_url);
      }
    }

    modalEl?.classList.add('open');
  }

  // Fechar modal
  document.getElementById('btn-fechar-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancelar')?.addEventListener('click', closeModal);
  modalEl?.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

  function closeModal() {
    modalEl?.classList.remove('open');
    formEl?.reset();
    if (window._genreCheckbox) window._genreCheckbox.clear();
    editingId = null;
  }

  // ===== SUBMIT DO FORMULÁRIO =====
  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    const data = Object.fromEntries(new FormData(formEl));

    // Converter tipos
    if (data.ano_publicacao) data.ano_publicacao = parseInt(data.ano_publicacao);
    if (data.quantidade_disponivel) data.quantidade_disponivel = parseInt(data.quantidade_disponivel);

    try {
      if (editingId) {
        await livrosAPI.update(editingId, data);
        Toast.success('Livro atualizado!', `"${data.titulo}" foi atualizado com sucesso.`);
      } else {
        await livrosAPI.create(data);
        Toast.success('Livro cadastrado!', `"${data.titulo}" foi adicionado ao acervo.`);
      }
      closeModal();
      load();
    } catch (err) {
      Toast.error('Erro ao salvar', err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Salvar Livro'; }
    }
  });

  // ===== AÇÕES GLOBAIS =====
  window.editarLivro = async (id) => {
    try {
      const res = await livrosAPI.getById(id);
      openModal(res.data);
    } catch (err) {
      Toast.error('Erro', 'Não foi possível carregar os dados do livro.');
    }
  };

  window.excluirLivro = (id, titulo) => {
    Modal.confirm(
      'Excluir Livro',
      `Tem certeza que deseja excluir o livro "<strong>${titulo}</strong>"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          await livrosAPI.delete(id);
          Toast.success('Livro excluído!', `"${titulo}" foi removido do acervo.`);
          load();
        } catch (err) {
          Toast.error('Erro ao excluir', err.message);
        }
      }
    );
  };

  window.verDetalhes = async (id) => {
    try {
      const res  = await livrosAPI.getById(id);
      const livro = res.data;

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay open';
      overlay.innerHTML = `
        <div class="modal modal-lg">
          <div class="modal-header">
            <span class="modal-title">📖 Detalhes do Livro</span>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
          </div>
          <div class="modal-body">
            <div style="display:flex;gap:20px;margin-bottom:20px;align-items:flex-start;">
              <div style="flex-shrink:0;">
                <img src="${livro.capa_url ? escHtml(livro.capa_url) : 'assets/book-cover-placeholder.png'}"
                  alt="Capa de ${escHtml(livro.titulo)}"
                  onerror="this.src='assets/book-cover-placeholder.png'"
                  style="width:120px;height:170px;object-fit:cover;border-radius:8px;border:2px solid var(--border-color);box-shadow:0 4px 16px rgba(0,0,0,0.3);"/>
              </div>
              <div style="flex:1;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                  <div><label class="form-label">Título</label><p style="color:var(--text-primary);font-weight:600">${escHtml(livro.titulo)}</p></div>
                  <div><label class="form-label">Autor</label><p style="color:var(--text-secondary)">${escHtml(livro.autor)}</p></div>
                  <div><label class="form-label">Categoria</label><p style="color:var(--text-secondary)">${escHtml(livro.categoria || '—')}</p></div>
                  <div><label class="form-label">Editora</label><p style="color:var(--text-secondary)">${escHtml(livro.editora || '—')}</p></div>
                  <div><label class="form-label">Ano</label><p style="color:var(--text-secondary)">${livro.ano_publicacao || '—'}</p></div>
                  <div><label class="form-label">ISBN</label><p style="color:var(--text-secondary)">${escHtml(livro.isbn || '—')}</p></div>
                  <div><label class="form-label">Quantidade</label><p style="color:var(--text-secondary)">${livro.quantidade_disponivel}</p></div>
                  <div><label class="form-label">Idioma</label><p style="color:var(--text-secondary)">${escHtml(livro.idioma || '—')}</p></div>
                  <div><label class="form-label">Status</label>${statusBadge(livro.status)}</div>
                </div>
              </div>
            </div>
            ${livro.sinopse ? `
              <div style="margin-top:16px">
                <label class="form-label">Sinopse</label>
                <p style="color:var(--text-secondary);font-size:13px;line-height:1.7">${escHtml(livro.sinopse)}</p>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); editarLivro(${livro.id})">Editar Livro</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    } catch (err) {
      Toast.error('Erro', 'Não foi possível carregar os detalhes.');
    }
  };

  // ===== BUSCA EM TEMPO REAL =====
  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => applyFilters(), 400);
  });

  filterStatus?.addEventListener('change', applyFilters);

  function applyFilters() {
    _currentFilters = {};
    if (searchInput?.value) {
      _currentFilters.titulo = searchInput.value;
      _currentFilters.autor  = searchInput.value;
    }
    if (filterStatus?.value) _currentFilters.status = filterStatus.value;
    load(_currentFilters, 1);
  }

  // ===== UTILITÁRIOS =====
  function statusBadge(s) {
    const map = { disponivel: 'success', indisponivel: 'danger' };
    const txt = { disponivel: 'Disponível', indisponivel: 'Indisponível' };
    return `<span class="badge badge-${map[s] || 'info'}">${txt[s] || s}</span>`;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showLoading() {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = `<tr><td colspan="8">
      <div class="loading-overlay">
        <div class="spinner"></div>
        <div class="loading-text">Carregando livros...</div>
      </div>
    </td></tr>`;
  }

  // ===== INIT =====
  load();
});

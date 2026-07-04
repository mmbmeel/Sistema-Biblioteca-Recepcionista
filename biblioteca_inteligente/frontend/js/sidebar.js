// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – sidebar.js
//  Controle da sidebar: responsividade, navegação ativa, toggle
// ============================================================

(function () {
  'use strict';

  const sidebar       = document.querySelector('.sidebar');
  const overlay       = document.querySelector('.sidebar-overlay');
  const toggleBtn     = document.querySelector('.sidebar-toggle');
  const navItems      = document.querySelectorAll('.sidebar-nav .nav-item');

  // ===== MARCAR ITEM ATIVO COM BASE NA URL ATUAL =====
  function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navItems.forEach(item => {
      const href = item.getAttribute('href') || '';
      const itemPage = href.split('/').pop();

      item.classList.remove('active');

      if (itemPage === currentPage) {
        item.classList.add('active');
      }
      // Dashboard: página raiz
      if ((currentPage === '' || currentPage === 'index.html') && itemPage === 'index.html') {
        item.classList.add('active');
      }
    });
  }

  // ===== ABRIR SIDEBAR (mobile) =====
  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // ===== FECHAR SIDEBAR (mobile) =====
  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ===== EVENT LISTENERS =====
  toggleBtn?.addEventListener('click', () => {
    sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay?.addEventListener('click', closeSidebar);

  // Fechar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Fechar ao navegar em mobile
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // ===== TOOLTIP PARA SIDEBAR RECOLHIDA =====
  // (reservado para implementações futuras de sidebar mini)

  // ===== INIT =====
  setActiveNavItem();

})();

// ============================================================
//  TOAST NOTIFICATIONS GLOBAL
// ============================================================
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(type, title, message, duration = 4000) {
    this.init();

    const icons = {
      success: '✓',
      error  : '✕',
      warning: '⚠',
      info   : 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-dismiss" onclick="this.parentElement.remove()">×</button>
    `;

    this.container.appendChild(toast);

    // Auto-remover após a duração definida
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (title, msg)  => Toast.show('success', title, msg),
  error  : (title, msg)  => Toast.show('error',   title, msg),
  warning: (title, msg)  => Toast.show('warning', title, msg),
  info   : (title, msg)  => Toast.show('info',    title, msg)
};

// ============================================================
//  MODAL UTILITÁRIO GLOBAL
// ============================================================
const Modal = {
  // Abrir modal de confirmação
  confirm(title, message, onConfirm, type = 'danger') {
    const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
    const btnText  = type === 'danger' ? 'Confirmar exclusão' : 'Confirmar';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <span class="modal-title">
            <span>${type === 'danger' ? '🗑️' : '❓'}</span>
            ${title}
          </span>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn ${btnClass}" id="modal-confirm-btn">${btnText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => {
      onConfirm();
      overlay.remove();
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
};

// ============================================================
//  FORMATAÇÃO DE DATAS E VALORES
// ============================================================
const Format = {
  date(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  },

  dateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR');
  },

  number(n) {
    return Number(n || 0).toLocaleString('pt-BR');
  }
};

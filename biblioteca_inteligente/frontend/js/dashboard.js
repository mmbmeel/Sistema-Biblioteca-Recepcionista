// ============================================================
//  BIBLIOTECA GESTÃO INTELIGENTE – dashboard.js
//  Lógica da tela inicial: KPIs, carrossel, frases motivacionais
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== FRASES MOTIVACIONAIS =====
  const quotes = [
    { text: 'Um livro é um presente que você pode abrir repetidamente.', author: '— Garrison Keillor' },
    { text: 'Não existe amigo tão companheiro quanto um bom livro.', author: '— Charles Dickens' },
    { text: 'A leitura é para a mente o que o exercício é para o corpo.', author: '— Joseph Addison' },
    { text: 'Um leitor vive mil vidas antes de morrer. O não-leitor, apenas uma.', author: '— George R.R. Martin' },
    { text: 'Os livros são espelhos: vemos neles apenas o que já temos dentro de nós.', author: '— Carlos Ruiz Zafón' },
    { text: 'Ler é sonhar com os olhos abertos.', author: '— Clarice Lispector' }
  ];

  let currentQuote = 0;
  const quoteText   = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const quoteDots   = document.querySelectorAll('.quote-dot');

  function updateQuote(index) {
    if (!quoteText || !quoteAuthor) return;
    currentQuote = index;

    quoteText.style.opacity   = '0';
    quoteAuthor.style.opacity = '0';

    setTimeout(() => {
      quoteText.textContent   = `"${quotes[index].text}"`;
      quoteAuthor.textContent = quotes[index].author;
      quoteText.style.opacity   = '1';
      quoteAuthor.style.opacity = '1';
    }, 300);

    quoteDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Clique nos dots
  quoteDots.forEach((dot, i) => {
    dot.addEventListener('click', () => updateQuote(i));
  });

  // Troca automática a cada 5s
  setInterval(() => {
    updateQuote((currentQuote + 1) % quotes.length);
  }, 5000);

  // ===== CARREGAMENTO DE KPIs DA API =====
  async function loadStats() {
    try {
      const res  = await dashboardAPI.getStats();
      const data = res.data;

      setKPI('kpi-livros',    data.livros.total);
      setKPI('kpi-autores',   data.livros.autores);
      setKPI('kpi-editoras',  data.livros.editoras);
      setKPI('kpi-generos',   data.livros.generos);
      setKPI('kpi-idiomas',   data.livros.idiomas);
    } catch (err) {
      console.warn('Não foi possível carregar estatísticas da API:', err.message);
      // Exibir valores padrão de demonstração
      setKPI('kpi-livros',   '—');
      setKPI('kpi-autores',  '—');
      setKPI('kpi-editoras', '—');
      setKPI('kpi-generos',  '—');
      setKPI('kpi-idiomas',  '—');
    }
  }

  function setKPI(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    animateCounter(el, typeof value === 'number' ? value : 0, value === '—');
  }

  // Animação de contagem dos números
  function animateCounter(el, target, isNA = false) {
    if (isNA) { el.textContent = '—'; return; }
    let start    = 0;
    const duration = 1200;
    const step   = Math.ceil(target / (duration / 16));
    const timer  = setInterval(() => {
      start += step;
      if (start >= target) {
        clearInterval(timer);
        el.textContent = Format.number(target);
      } else {
        el.textContent = Format.number(start);
      }
    }, 16);
  }

  // ===== CARROSSEL DE DESTAQUES =====
  const livrosDestaque = [
    { titulo: 'Dom Casmurro',       autor: 'Machado de Assis',        emoji: '📖', cor: '#2D1B4E' },
    { titulo: '1984',                autor: 'George Orwell',           emoji: '👁️', cor: '#1A1A2E' },
    { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry',emoji: '🌹', cor: '#1B3A4B' },
    { titulo: 'Cem Anos de Solidão',autor: 'Gabriel García Márquez',  emoji: '🌿', cor: '#1A3025' },
    { titulo: 'Orgulho e Preconceito', autor: 'Jane Austen',          emoji: '🌸', cor: '#3D1A35' }
  ];

  const CARDS_VISIBLE  = 4;
  let currentSlide     = 0;
  const track          = document.getElementById('carousel-track');
  const dots           = document.querySelectorAll('.carousel-dot');

  async function loadCarouselBooks() {
    if (!track) return;

    let books = livrosDestaque; // Fallback com dados estáticos

    try {
      const res = await dashboardAPI.getDestaques();
      if (res.data && res.data.length > 0) {
        books = res.data.slice(0, 5).map((b, i) => ({
          titulo: b.titulo,
          autor : b.autor,
          emoji : livrosDestaque[i]?.emoji || '📚',
          cor   : livrosDestaque[i]?.cor || '#2A2140'
        }));
      }
    } catch (e) {
      console.warn('Usando dados de fallback para o carrossel.');
    }

    renderCarousel(books);
  }

  function renderCarousel(books) {
    if (!track) return;
    track.innerHTML = books.map((b, i) => `
      <div class="book-card" style="animation-delay: ${i * 0.1}s; animation: fadeInUp 0.5s ease forwards; opacity: 0;">
        <div class="book-cover" style="background: ${b.cor};">
          <div class="book-cover-placeholder">
            <span style="font-size: 44px;">${b.emoji}</span>
          </div>
        </div>
        <div class="book-info">
          <div class="book-title">${b.titulo}</div>
          <div class="book-author">${b.autor}</div>
        </div>
      </div>
    `).join('');
  }

  function slideCarousel(direction) {
    const cards = track?.querySelectorAll('.book-card');
    if (!cards || cards.length === 0) return;

    const maxSlide = Math.max(0, cards.length - CARDS_VISIBLE);
    currentSlide   = Math.max(0, Math.min(currentSlide + direction, maxSlide));

    const cardWidth = 130 + 16; // width + gap
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

    // Atualizar dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  document.getElementById('carousel-prev')?.addEventListener('click', () => slideCarousel(-1));
  document.getElementById('carousel-next')?.addEventListener('click', () => slideCarousel(1));

  // Auto-play do carrossel a cada 4s
  let autoPlay = setInterval(() => slideCarousel(1), 4000);

  track?.closest('.carousel-container')?.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track?.closest('.carousel-container')?.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => slideCarousel(1), 4000);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentSlide = i - 1;
      slideCarousel(1);
    });
  });

  // ===== INIT =====
  loadStats();
  loadCarouselBooks();
  updateQuote(0);

});

import { H as Hls } from './hls-module.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHeroCarousel();
  setupImageFallbacks();
  setupCardFilters();
  setupSearchPage();
  setupPlayers();
});

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const nav = $('[data-site-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const root = $('[data-hero-carousel]');

  if (!root) {
    return;
  }

  const slides = $$('[data-hero-slide]', root);
  const dots = $$('[data-hero-dot]', root);
  let current = 0;

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => show(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(current + 1), 6500);
  }
}

function setupImageFallbacks() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
      const fallback = image.parentElement ? image.parentElement.querySelector('.poster-fallback') : null;

      if (fallback) {
        fallback.classList.add('is-visible');
      }
    }, { once: true });
  });
}

function setupCardFilters() {
  const roots = $$('[data-filter-root]');

  roots.forEach((root) => {
    const cards = $$('.movie-card', root.parentElement || document);
    const searchInput = $('[data-card-search]', root);
    const selects = $$('[data-card-filter]', root);
    const count = $('[data-result-count]', root.parentElement || document);

    const applyFilters = () => {
      const query = normalize(searchInput ? searchInput.value : '');
      const activeFilters = selects.map((select) => ({
        key: select.dataset.cardFilter,
        value: select.value
      })).filter((item) => item.value);
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category
        ].join(' '));
        const matchesQuery = !query || text.includes(query);
        const matchesFilters = activeFilters.every((item) => card.dataset[item.key] === item.value);
        const show = matchesQuery && matchesFilters;

        card.hidden = !show;

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    selects.forEach((select) => {
      select.addEventListener('change', applyFilters);
    });
  });
}

function setupSearchPage() {
  const root = $('[data-search-app]');

  if (!root || !window.MOVIES) {
    return;
  }

  const input = $('[data-global-search]', root);
  const sort = $('[data-sort-mode]', root);
  const results = $('[data-search-results]', root);
  const count = $('[data-search-count]', root);
  const params = new URLSearchParams(window.location.search);

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  const render = () => {
    const query = normalize(input ? input.value : '');
    const sortMode = sort ? sort.value : 'default';
    let movies = window.MOVIES.filter((movie) => {
      if (!query) {
        return true;
      }

      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.tags.join(' '),
        movie.oneLine,
        movie.summary
      ].join(' ')).includes(query);
    });

    movies = sortMovies(movies, sortMode).slice(0, 160);

    if (count) {
      count.textContent = `找到 ${movies.length} 条结果，最多展示前 160 条`;
    }

    if (results) {
      results.innerHTML = movies.map(renderSearchCard).join('');
      setupImageFallbacks();
    }
  };

  if (input) {
    input.addEventListener('input', render);
  }

  if (sort) {
    sort.addEventListener('change', render);
  }

  render();
}

function sortMovies(movies, sortMode) {
  const copy = [...movies];

  if (sortMode === 'rating') {
    return copy.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  if (sortMode === 'views') {
    return copy.sort((a, b) => Number(b.views) - Number(a.views));
  }

  if (sortMode === 'year') {
    return copy.sort((a, b) => Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10));
  }

  return copy;
}

function renderSearchCard(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
      <article class="movie-card">
        <a class="poster-wrap" href="${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
          <img class="poster" src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="poster-fallback">${escapeHtml(movie.title)}</span>
          <span class="play-badge">播放</span>
        </a>
        <div class="movie-card-body">
          <div class="card-meta-line">
            <a class="card-category" href="category-${movie.categorySlug}.html">${escapeHtml(movie.category)}</a>
            <span>${escapeHtml(movie.year)}</span>
          </div>
          <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="tag-row">${tags}</div>
          <div class="card-stats">
            <span>★ ${escapeHtml(movie.rating)}</span>
            <span>${formatViews(movie.views)}次观看</span>
          </div>
        </div>
      </article>
  `;
}

function setupPlayers() {
  $$('.video-hls').forEach((video) => {
    const source = video.dataset.src;

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    }
  });
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function formatViews(value) {
  const number = Number(value) || 0;

  if (number >= 10000) {
    return `${(number / 10000).toFixed(1)}万`;
  }

  return String(number);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

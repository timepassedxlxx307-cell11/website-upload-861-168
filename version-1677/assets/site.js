(function () {
    function toggleMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isOpen));
            panel.hidden = isOpen;
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var activeIndex = 0;
        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.dataset.heroDot || 0));
            });
        });
        window.setInterval(function () {
            activate(activeIndex + 1);
        }, 5200);
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initLocalFilter() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        if (!inputs.length || !cards.length) {
            return;
        }
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var keyword = normalizeText(input.value);
                cards.forEach(function (card) {
                    var haystack = normalizeText(card.textContent + ' ' + Object.values(card.dataset).join(' '));
                    card.hidden = Boolean(keyword) && haystack.indexOf(keyword) === -1;
                });
            });
        });
    }

    function movieCardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-category="' + escapeHtml(item.category) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-genre="' + escapeHtml(item.genre) + '">',
            '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-chip">观看视频</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.getElementById('search-results');
        var title = document.getElementById('search-title');
        var summary = document.getElementById('search-summary');
        var input = document.getElementById('search-page-input');
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';
        if (input) {
            input.value = keyword;
        }
        if (!keyword.trim()) {
            return;
        }
        var normalized = normalizeText(keyword);
        var matches = window.SEARCH_INDEX.filter(function (item) {
            var haystack = normalizeText([item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(' ')].join(' '));
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 200);
        if (title) {
            title.textContent = '搜索结果：' + keyword;
        }
        if (summary) {
            summary.textContent = matches.length ? '已为你匹配相关影片，可直接进入详情页观看。' : '没有匹配结果，可尝试更换关键词。';
        }
        results.innerHTML = matches.length ? matches.map(movieCardTemplate).join('') : '<div class="empty-state">没有匹配结果</div>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });
}());

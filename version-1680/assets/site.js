const menuButton = document.querySelector(".menu-toggle");
const mobilePanel = document.querySelector(".mobile-panel");

if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
        mobilePanel.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const nextButton = hero.querySelector("[data-hero-next]");
    const prevButton = hero.querySelector("[data-hero-prev]");
    let index = 0;

    const showSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });
        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === index;
            dot.classList.toggle("is-active", active);
            dot.setAttribute("aria-pressed", String(active));
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (nextButton) {
        nextButton.addEventListener("click", () => showSlide(index + 1));
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => showSlide(index - 1));
    }

    window.setInterval(() => showSlide(index + 1), 5200);
}

const filterScopes = Array.from(document.querySelectorAll("[data-filter-scope]")).map((bar) => {
    const section = bar.closest(".section") || document;
    return {
        bar,
        section,
        cards: Array.from(section.querySelectorAll(".movie-card")),
        input: bar.querySelector("[data-filter-input]"),
        selects: Array.from(bar.querySelectorAll("[data-filter-select]"))
    };
});

const normalizeText = (value) => String(value || "").trim().toLowerCase();

filterScopes.forEach((scope) => {
    const runFilter = () => {
        const keyword = normalizeText(scope.input ? scope.input.value : "");
        const filters = {};
        scope.selects.forEach((select) => {
            filters[select.getAttribute("data-filter-select")] = normalizeText(select.value);
        });
        scope.cards.forEach((card) => {
            const haystack = normalizeText([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type
            ].join(" "));
            const keywordMatched = !keyword || haystack.includes(keyword);
            const typeMatched = !filters.type || normalizeText(card.dataset.type).includes(filters.type);
            const regionMatched = !filters.region || normalizeText(card.dataset.region).includes(filters.region);
            card.classList.toggle("is-hidden", !(keywordMatched && typeMatched && regionMatched));
        });
    };

    if (scope.input) {
        scope.input.addEventListener("input", runFilter);
    }

    scope.selects.forEach((select) => {
        select.addEventListener("change", runFilter);
    });
});

const searchInput = document.querySelector("[data-search-page-input]");
const searchResults = document.getElementById("search-results");

if (searchInput && searchResults && Array.isArray(window.SEARCH_ITEMS)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    const makeCard = (item) => {
        const tags = item.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("");
        return `
            <article class="movie-card is-compact" data-title="${item.title}" data-genre="${item.genre}" data-region="${item.region}" data-year="${item.year}" data-type="${item.type}">
                <a class="poster-link" href="${item.url}" aria-label="${item.title}">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <span class="duration">${item.duration}</span>
                </a>
                <div class="card-body">
                    <a class="card-title" href="${item.url}">${item.title}</a>
                    <p>${item.text}</p>
                    <div class="card-meta">
                        <span>${item.year}</span>
                        <span>${item.region}</span>
                        <span>${item.type}</span>
                    </div>
                    <div class="tag-row">${tags}</div>
                </div>
            </article>`;
    };

    const renderResults = (query) => {
        const keyword = normalizeText(query);
        const selected = window.SEARCH_ITEMS.filter((item) => {
            if (!keyword) {
                return true;
            }
            return normalizeText(`${item.title} ${item.genre} ${item.region} ${item.year} ${item.type} ${item.tags.join(" ")} ${item.text}`).includes(keyword);
        }).slice(0, 120);
        searchResults.innerHTML = selected.map(makeCard).join("");
    };

    renderResults(initialQuery);

    searchInput.addEventListener("input", () => {
        renderResults(searchInput.value);
    });
}

(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("open");
            mobilePanel.hidden = !isOpen;
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterList = document.querySelector(".filter-list");

    if (filterList) {
        var keywordInput = document.querySelector("[data-filter-keyword]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

        function applyFilters() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(" ").toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || card.dataset.year === year;
                var matchedType = !type || card.dataset.type === type;
                card.hidden = !(matchedKeyword && matchedYear && matchedType);
            });
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    var searchResults = document.querySelector("[data-search-results]");

    if (searchResults && window.SEARCH_INDEX) {
        var searchForm = document.querySelector("[data-search-form]");
        var searchInput = document.querySelector("[data-search-input]");
        var typeSelectSearch = document.querySelector("[data-search-type]");
        var regionSelectSearch = document.querySelector("[data-search-region]");
        var yearSelectSearch = document.querySelector("[data-search-year]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function fillSelect(select, values) {
            if (!select) {
                return;
            }

            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function unique(field) {
            var set = new Set();
            window.SEARCH_INDEX.forEach(function (movie) {
                if (movie[field]) {
                    set.add(movie[field]);
                }
            });
            return Array.from(set).sort().slice(0, 80);
        }

        fillSelect(typeSelectSearch, unique("type"));
        fillSelect(regionSelectSearch, unique("region"));
        fillSelect(yearSelectSearch, unique("year").sort().reverse());

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function renderSearch() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var selectedType = typeSelectSearch ? typeSelectSearch.value : "";
            var selectedRegion = regionSelectSearch ? regionSelectSearch.value : "";
            var selectedYear = yearSelectSearch ? yearSelectSearch.value : "";
            var results = window.SEARCH_INDEX.filter(function (movie) {
                var pool = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(" ").toLowerCase();
                return (!query || pool.indexOf(query) !== -1) &&
                    (!selectedType || movie.type === selectedType) &&
                    (!selectedRegion || movie.region === selectedRegion) &&
                    (!selectedYear || movie.year === selectedYear);
            }).slice(0, 240);

            if (!results.length) {
                searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
                return;
            }

            searchResults.innerHTML = results.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a class="poster" href="./' + movie.file + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="play-hover">▶</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '<h2><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join("");
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>"']/g, function (char) {
                if (char === "&") {
                    return "&amp;";
                }
                if (char === "<") {
                    return "&lt;";
                }
                if (char === ">") {
                    return "&gt;";
                }
                if (char === '"') {
                    return "&quot;";
                }
                return "&#039;";
            });
        }

        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                renderSearch();
            });
        }

        [searchInput, typeSelectSearch, regionSelectSearch, yearSelectSearch].forEach(function (control) {
            if (control) {
                control.addEventListener("input", renderSearch);
                control.addEventListener("change", renderSearch);
            }
        });

        renderSearch();
    }
}());

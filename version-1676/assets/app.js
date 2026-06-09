(function () {
    var heroIndex = 0;
    var heroTimer = null;

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function showHero(index) {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === heroIndex);
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        if (slides.length < 2) {
            return;
        }
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        selectAll("[data-hero-dot]", hero).forEach(function (dot) {
            dot.addEventListener("click", function () {
                showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartHeroTimer();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                showHero(heroIndex - 1);
                restartHeroTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showHero(heroIndex + 1);
                restartHeroTimer();
            });
        }
        restartHeroTimer();
    }

    function restartHeroTimer() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function getSearchIndex() {
        return Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
    }

    function createSearchItem(movie) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = movie.url;
        link.innerHTML = [
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + " 封面\">",
            "<span><strong>" + escapeHtml(movie.title) + "</strong><span>" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) + "</span></span>"
        ].join("");
        return link;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function bindSearch(input, results) {
        if (!input || !results) {
            return;
        }
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            results.innerHTML = "";
            if (!query) {
                results.classList.remove("is-open");
                return;
            }
            var matched = getSearchIndex().filter(function (movie) {
                return movie.keywords.indexOf(query) !== -1;
            }).slice(0, 14);
            if (!matched.length) {
                var empty = document.createElement("div");
                empty.className = "search-result-item";
                empty.innerHTML = "<span><strong>未找到匹配影片</strong><span>换一个关键词继续搜索</span></span>";
                results.appendChild(empty);
            } else {
                matched.forEach(function (movie) {
                    results.appendChild(createSearchItem(movie));
                });
            }
            results.classList.add("is-open");
        });
        document.addEventListener("click", function (event) {
            if (!input.contains(event.target) && !results.contains(event.target)) {
                results.classList.remove("is-open");
            }
        });
    }

    function initSearch() {
        bindSearch(document.getElementById("site-search"), document.getElementById("search-results"));
        bindSearch(document.getElementById("home-search"), document.getElementById("home-search-results"));
    }

    function initCardFilters() {
        selectAll("[data-card-filter]").forEach(function (input) {
            var section = input.closest("section");
            var cards = section ? selectAll("[data-movie-card]", section) : [];
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
                });
            });
        });
    }

    window.setupPlayer = function (containerId, source, poster, title) {
        var root = document.getElementById(containerId);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var started = false;
        var hls = null;
        if (!video || !cover) {
            return;
        }
        if (poster) {
            video.setAttribute("poster", poster);
        }
        if (title) {
            video.setAttribute("aria-label", title + " 播放器");
        }
        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            root.classList.add("is-playing");
            video.play().catch(function () {});
        }
        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initSearch();
        initCardFilters();
    });
})();

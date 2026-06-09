(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var menu = document.querySelector("#mobileMenu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-carousel");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        panels.forEach(function (scope) {
            var input = scope.querySelector(".search-input");
            var year = scope.querySelector(".year-filter");
            var region = scope.querySelector(".region-filter");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".no-result");

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            if (!video) {
                return;
            }
            var source = video.querySelector("source");
            var streamUrl = source ? source.getAttribute("src") : video.getAttribute("src");
            var initialized = false;
            var hlsPlayer = null;

            function prepare() {
                if (initialized || !streamUrl) {
                    return Promise.resolve();
                }
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                    video.src = streamUrl;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsPlayer = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsPlayer.loadSource(streamUrl);
                    hlsPlayer.attachMedia(video);
                    return new Promise(function (resolve) {
                        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                        window.setTimeout(resolve, 1600);
                    });
                }
                video.src = streamUrl;
                return Promise.resolve();
            }

            function start() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                prepare().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            if (overlay) {
                                overlay.classList.remove("is-hidden");
                            }
                        });
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("play", prepare);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();

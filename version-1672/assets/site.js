(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('[data-menu-toggle]');

    if (header && menuToggle) {
        menuToggle.addEventListener('click', function () {
            header.classList.toggle('nav-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
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

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupSearchAndFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));

        scopes.forEach(function (scope) {
            var searchInput = scope.querySelector('[data-search-input]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-field]'));
            var state = {
                query: '',
                field: '',
                value: ''
            };

            function apply() {
                cards.forEach(function (card) {
                    var blob = (card.getAttribute('data-search') || '').toLowerCase();
                    var passQuery = !state.query || blob.indexOf(state.query) !== -1;
                    var passFilter = true;

                    if (state.field && state.value) {
                        passFilter = (card.getAttribute('data-' + state.field) || '') === state.value;
                    }

                    card.classList.toggle('is-hidden', !(passQuery && passFilter));
                });
            }

            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    state.query = searchInput.value.trim().toLowerCase();
                    apply();
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var field = button.getAttribute('data-filter-field') || '';
                    var value = button.getAttribute('data-filter-value') || '';

                    state.field = field;
                    state.value = value;

                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });

                    apply();
                });
            });
        });
    }

    function setupPlayer() {
        var player = document.querySelector('[data-player]');

        if (!player) {
            return;
        }

        var video = player.querySelector('video[data-hls]');
        var trigger = player.querySelector('.player-trigger');
        var message = player.querySelector('[data-player-message]');
        var prepared = false;
        var hls = null;

        function showMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text;
            message.classList.add('show');
        }

        function hideMessage() {
            if (message) {
                message.textContent = '';
                message.classList.remove('show');
            }
        }

        function startVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        function prepare() {
            if (!video) {
                return;
            }

            hideMessage();
            player.classList.add('is-ready');

            if (prepared) {
                startVideo();
                return;
            }

            prepared = true;
            var url = video.getAttribute('data-hls');

            if (!url) {
                showMessage('播放暂时不可用，请稍后重试');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(url);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    startVideo();
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR && hls) {
                        hls.startLoad();
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR && hls) {
                        hls.recoverMediaError();
                        return;
                    }

                    showMessage('播放暂时不可用，请稍后重试');
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', startVideo, { once: true });
                video.load();
            } else {
                showMessage('播放暂时不可用，请稍后重试');
            }
        }

        if (trigger) {
            trigger.addEventListener('click', prepare);
        }

        video.addEventListener('click', function () {
            if (!prepared) {
                prepare();
            }
        });

        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    setupHero();
    setupSearchAndFilters();
    setupPlayer();
})();

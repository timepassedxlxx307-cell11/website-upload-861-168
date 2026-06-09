(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function filterCards(scope) {
        var root = scope || document;
        var input = root.querySelector('[data-filter-input]') || document.querySelector('[data-filter-input]');
        var region = root.querySelector('[data-filter-region]') || document.querySelector('[data-filter-region]');
        var type = root.querySelector('[data-filter-type]') || document.querySelector('[data-filter-type]');
        var year = root.querySelector('[data-filter-year]') || document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var q = input ? input.value.trim().toLowerCase() : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        cards.forEach(function (card) {
            var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
            var ok = true;
            if (q && hay.indexOf(q) === -1) ok = false;
            if (r && card.dataset.region !== r) ok = false;
            if (t && card.dataset.type !== t) ok = false;
            if (y && card.dataset.year !== y) ok = false;
            card.classList.toggle('hidden-card', !ok);
        });
    }
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input], [data-filter-region], [data-filter-type], [data-filter-year]')).forEach(function (el) {
        el.addEventListener('input', function () {
            filterCards(document);
        });
        el.addEventListener('change', function () {
            filterCards(document);
        });
    });

    function startPlayer(box) {
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var stream = video ? video.getAttribute('data-stream') : '';
        if (!video || !stream) {
            return;
        }
        box.classList.add('playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = stream;
            }
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsPlayer) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hlsPlayer = hls;
            }
            video.play().catch(function () {});
            return;
        }
        video.src = stream;
        video.play().catch(function () {});
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (box) {
        var overlay = box.querySelector('.player-overlay');
        var button = box.querySelector('.play-button');
        var video = box.querySelector('video');
        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayer(box);
            });
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                startPlayer(box);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(box);
                } else {
                    video.pause();
                }
            });
        }
    });
})();

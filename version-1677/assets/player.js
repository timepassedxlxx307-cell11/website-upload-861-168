import { H as Hls } from './hls-vendor.js';

function initPlayer() {
    const shell = document.querySelector('[data-video-url]');
    if (!shell) {
        return;
    }
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('.play-overlay');
    const source = shell.dataset.videoUrl;
    if (!video || !source) {
        return;
    }
    let hlsInstance = null;
    function bindSource() {
        if (video.dataset.bound === 'true') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
        video.dataset.bound = 'true';
    }
    function startPlayback() {
        bindSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }
    bindSource();
    if (overlay) {
        overlay.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });
    }
    shell.addEventListener('click', function (event) {
        if (event.target === video) {
            return;
        }
        startPlayback();
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', initPlayer);

(function () {
    function setupPlayer(streamUrl) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        var shell = document.getElementById("player-shell");
        var prepared = false;
        var instance = null;

        if (!video || !button || !shell || !streamUrl) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    autoStartLoad: true,
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(streamUrl);
                instance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            prepared = true;
        }

        function start() {
            prepare();
            shell.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", start);
        shell.addEventListener("click", function (event) {
            if (event.target === video && video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        window.addEventListener("pagehide", function () {
            if (instance && typeof instance.destroy === "function") {
                instance.destroy();
            }
        });
    }

    window.setupPlayer = setupPlayer;
}());

import { H as Hls } from "./hls-dru42stk.js";

const players = document.querySelectorAll("[data-player]");

players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector(".player-start");
    const stream = player.getAttribute("data-stream");
    let loaded = false;
    let hls = null;

    const attachStream = () => {
        if (loaded || !video || !stream) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }

        loaded = true;
    };

    const startPlayback = () => {
        attachStream();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        const playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(() => {});
        }
    };

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("ended", () => {
            player.classList.remove("is-playing");
        });
    }

    window.addEventListener("beforeunload", () => {
        if (hls) {
            hls.destroy();
        }
    });
});

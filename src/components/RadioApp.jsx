import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import "./RadioApp.css";
import logo from "../assets/radio-george.png"

const stations = [
  {
    name: "99.9",
    url: "https://24373.live.streamtheworld.com/FM999_56AAC.aac",
    image: "https://www.enlaradio.com.ar/wp-content/uploads/2023/02/elr_la100.jpg",
    isHLS: false
  },
  {
    name: "100.7",
    url: "https://26593.live.streamtheworld.com/BLUE_FM_100_7AAC.aac",
    image: "https://myradioenvivo.ar/public/uploads/radio_img/blue-fm-100-7/play_250_250.webp",
    isHLS: false
  },
  {
    name: "102.3",
    url: "https://24253.live.streamtheworld.com/ASPEN.mp3",
    image: "https://myradioenvivo.ar/public/uploads/radio_img/aspen-102-3/fb_cover.jpg",
    isHLS: false
  },
  {
    name: "101.5",
    url: "https://popradio.stweb.tv/popradio/live/chunks.m3u8",
    image: "https://static.mytuner.mobi/media/tvos_radios/836/pop-1015-fm.f58421ff.png",
    isHLS: true
  }
];

function RadioApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentStation = stations[currentIndex];
  const hlsInstance = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    setIsPlaying(false);

    if (currentStation.isHLS) {
      if (Hls.isSupported()) {
        if (hlsInstance.current) {
          hlsInstance.current.destroy();
        }

        const hls = new Hls();
        hlsInstance.current = hls;

        hls.loadSource(currentStation.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = currentStation.url;
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }

    return () => {
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }
      setIsPlaying(false);
    };
  }, [currentStation]);

  const togglePlay = () => {
    const media = currentStation.isHLS ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play().catch(() => alert("Could not play audio."));
    }

    setIsPlaying(!isPlaying);
  };

  const changeStation = (direction) => {
    let nextIndex;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % stations.length;
    } else {
      nextIndex = (currentIndex - 1 + stations.length) % stations.length;
    }
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="radio-card">
      {deferredPrompt && (
        <button
          className="install-button"
          onClick={() => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
          }}
        >
          Install App
        </button>
      )}

      <div className={`disc-container ${isPlaying ? "spin" : ""}`}>
        <img src={currentStation.image} alt="cover" className="cover-image" />
      </div>

      <div className="station-info">
        <h2>{currentStation.name}</h2>
        <img src={logo} alt="logo" className="logo" />
      </div>

      {!currentStation.isHLS ? (
        <audio ref={audioRef} src={currentStation.url} hidden />
      ) : (
        <video ref={videoRef} hidden />
      )}

      <div className="controls">
        <button onClick={() => changeStation("prev")} className="nav-button">⏮</button>
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button onClick={() => changeStation("next")} className="nav-button">⏭</button>
      </div>
    </div>
  );
}

export default RadioApp;

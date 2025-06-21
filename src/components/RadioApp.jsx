import React, { useRef, useState, useEffect } from "react";
import "./RadioApp.css";

const stations = [
  {
    name: "99.9",
    url: "https://24373.live.streamtheworld.com/FM999_56AAC.aac",
    image: "https://www.enlaradio.com.ar/wp-content/uploads/2023/02/elr_la100.jpg"
  },
  {
    name: "100.7",
    url: "https://26593.live.streamtheworld.com/BLUE_FM_100_7AAC.aac",
    image: "https://myradioenvivo.ar/public/uploads/radio_img/blue-fm-100-7/play_250_250.webp"
  },
  {
    name: "102.3",
    url: "https://24253.live.streamtheworld.com/ASPEN.mp3",
    image: "https://myradioenvivo.ar/public/uploads/radio_img/aspen-102-3/fb_cover.jpg"
  }
];

function RadioApp() {

  const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  const handler = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };
  window.addEventListener("beforeinstallprompt", handler);
  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);


  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStation = stations[currentIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => alert("Could not play audio."));
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
    setIsPlaying(false);
    setTimeout(() => {
      audioRef.current.play().catch(() => alert("Could not play audio."));
      setIsPlaying(true);
    }, 100);
  };

  return (
   <div className="radio-card">
    {deferredPrompt && (
  <button
    className="install-button"
    onClick={() => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
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
    <h1>RADIO GEORGE</h1>
  </div>

  <audio ref={audioRef} src={currentStation.url} hidden />

  <div className="controls">
    <button onClick={() => changeStation("prev")} className="nav-button">⏮</button>
    <button onClick={togglePlay} className="play-button">{isPlaying ? "❚❚" : "▶"}</button>
    <button onClick={() => changeStation("next")} className="nav-button">⏭</button>
  </div>
</div>

  );
}

export default RadioApp;

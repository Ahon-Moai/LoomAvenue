import React, { useState, useEffect } from 'react';

export default function SharedBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "https://ik.imagekit.io/t1q0n1ovm/image.png";
    img.onload = () => setImageLoaded(true);

    const preloadFallback = setTimeout(() => {
      setVideoLoaded(true);
    }, 4000);

    return () => {
      clearTimeout(preloadFallback);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#1e1a15]">
      {/* 1. Low-res Instant Placeholder Background */}
      <div 
        className="absolute inset-0 bg-[#1e1a15] bg-cover bg-center filter brightness-[0.55] contrast-[1.05] grayscale-[20%] transition-opacity duration-1000 z-0"
        style={{
          backgroundImage: `url('https://ik.imagekit.io/t1q0n1ovm/image.png')`,
          opacity: videoLoaded ? 0 : 1,
        }}
      />

      {/* 2. Full Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-[0.55] contrast-[1.05] grayscale-[20%] transition-all duration-[1200ms] ease-out z-0"
        style={{
          backgroundImage: `url('https://ik.imagekit.io/t1q0n1ovm/image.png')`,
          opacity: (!videoLoaded && imageLoaded) ? 1 : 0,
          transform: imageLoaded ? 'scale(1)' : 'scale(1.03)',
        }}
      />

      {/* Background Video with multiple event triggers for maximum browser compatibility */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://ik.imagekit.io/t1q0n1ovm/image.png"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onCanPlay={() => setVideoLoaded(true)}
        onCanPlayThrough={() => setVideoLoaded(true)}
        onLoadedData={() => setVideoLoaded(true)}
        onLoadedMetadata={() => setVideoLoaded(true)}
        onPlay={() => setVideoLoaded(true)}
        onPlaying={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 filter brightness-[0.6] contrast-[1.05] grayscale-[20%] z-0 ${
          videoLoaded ? 'opacity-80 scale-100' : 'opacity-0 scale-102'
        }`}
      >
        <source src="https://ik.imagekit.io/t1q0n1ovm/the-hidden-ivy-cafe-moewalls-com.mp4" type="video/mp4" />
      </video>

      {/* Earthy Muted Overlay from Design HTML */}
      <div className="absolute inset-0 bg-[#5A5A40]/25 mix-blend-multiply z-1 pointer-events-none" />

      {/* Lofi Grain Effect from Design HTML */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] z-10" />

      {/* Subtle Vignette / Amber Vignette shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.35)] bg-gradient-to-t from-[#13110d]/40 via-transparent to-[#13110d]/40 z-10" />
    </div>
  );
}

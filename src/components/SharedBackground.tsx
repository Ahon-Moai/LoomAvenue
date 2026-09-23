import React, { useState } from 'react';

export const SharedBackground: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0e0f12]">
      {/* Fallback Ambient Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-40 filter blur-sm scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop')`
        }}
      />

      {/* Atmospheric Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-40 scale-100' : 'opacity-0 scale-105'
        }`}
      >
        <source src="https://ik.imagekit.io/g03uyzcgy/the-hidden-ivy-cafe-moewalls-com.mp4" type="video/mp4" />
      </video>

      {/* Earthy Muted Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c0e]/90 via-[#0e0f12]/80 to-[#0b0c0e]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.05)_0%,transparent_70%)]" />
    </div>
  );
};

interface HeroSectionProps {
  currentFrame: number;
  totalFrames: number;
}

export const HeroSection = ({ currentFrame }: HeroSectionProps) => {
  // Fade out the hero text when the background sequence advances past frame 20
  const opacity = Math.max(0, 1 - (currentFrame / 20));
  const translateY = currentFrame * 2; // Smooth parallax push up

  return (
    <section className="hero-section relative w-full h-[100dvh] flex flex-col items-center justify-center px-6">
      
      {/* Dark gradient for mobile legibility against the background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0 pointer-events-none"></div>

      {/* Main Premium Hero Content */}
      <div 
        className="relative z-10 flex flex-col items-center text-center mt-12 w-full max-w-4xl"
        style={{ 
          opacity: opacity,
          transform: `translateY(-${translateY}px)`,
          willChange: 'opacity, transform'
        }}
      >
        <div className="inline-block px-5 py-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 backdrop-blur-md mb-6 animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <span className="text-[9px] md:text-[11px] font-bold tracking-[0.3em] text-[#d4af37] uppercase">
            Elite Performance Sanctuary
          </span>
        </div>
        
        <h1 className="hero-heading font-heading text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white uppercase leading-[1.05] mb-6 drop-shadow-2xl">
          Your Strongest <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d4af37] to-gray-400">
            Version
          </span>
        </h1>
        
        <p className="text-gray-300 font-medium tracking-[0.2em] text-[10px] md:text-sm uppercase max-w-xl leading-relaxed mb-10 drop-shadow-md">
          Premium equipment. Purpose-built zones. <br className="hidden md:block" />
          Everything you need to train harder.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-20">
          <button 
            onClick={() => document.querySelector('#membership')?.scrollIntoView({ behavior: 'smooth' })}
            className="hero-cta w-full sm:w-auto px-10 md:px-12 py-4 bg-[#d4af37] text-black font-heading font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer"
          >
            Join The Elite
          </button>
        </div>
      </div>

      {/* Mouse / Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 pointer-events-none"
        style={{ opacity: opacity }}
      >
        <span className="text-[8px] md:text-[10px] text-[#d4af37] uppercase tracking-[0.4em] font-bold">
          Scroll to explore
        </span>
        <div className="w-[1px] h-12 md:h-16 bg-white/20 overflow-hidden relative">
          <div className="w-full h-1/2 bg-[#d4af37] animate-[bounce_2s_infinite]"></div>
        </div>
      </div>
      
    </section>
  );
};

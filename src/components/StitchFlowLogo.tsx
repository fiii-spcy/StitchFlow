import React, { useState, useEffect } from 'react';

interface StitchFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'dark' | 'light' | 'colored';
  showText?: boolean;
  className?: string;
}

type LogoBgType = 'white' | 'transparent' | 'dark' | 'brand-tint';

export default function StitchFlowLogo({
  size = 'md',
  variant = 'colored',
  showText = true,
  className = ''
}: StitchFlowLogoProps) {
  const [logoBg, setLogoBg] = useState<LogoBgType>(() => {
    try {
      return (localStorage.getItem('stitchflow_logo_bg') as LogoBgType) || 'white';
    } catch {
      return 'white';
    }
  });

  // Keep instances synchronized across components
  useEffect(() => {
    const handleBgChange = (e: Event) => {
      try {
        const value = localStorage.getItem('stitchflow_logo_bg') as LogoBgType;
        if (value) setLogoBg(value);
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('stitchflow_logo_bg_change', handleBgChange);
    window.addEventListener('storage', handleBgChange);
    return () => {
      window.removeEventListener('stitchflow_logo_bg_change', handleBgChange);
      window.removeEventListener('storage', handleBgChange);
    };
  }, []);

  const cycleBg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sequence: LogoBgType[] = ['white', 'transparent', 'dark', 'brand-tint'];
    const nextIndex = (sequence.indexOf(logoBg) + 1) % sequence.length;
    const nextBg = sequence[nextIndex];
    
    try {
      localStorage.setItem('stitchflow_logo_bg', nextBg);
      setLogoBg(nextBg);
      // Trigger event for other rendered instances
      window.dispatchEvent(new Event('stitchflow_logo_bg_change'));
    } catch (err) {
      console.error(err);
    }
  };

  // Determine pixel sizes for the icon
  const getIconSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 28;
      case 'lg': return 56;
      case 'md':
      default: return 38;
    }
  };

  const iconSize = getIconSize();

  // Color mappings based on logo design
  const colors = {
    dark: {
      text: 'text-slate-900',
    },
    light: {
      text: 'text-white',
    },
    colored: {
      text: 'text-slate-900',
    }
  };

  const activeColors = colors[variant];

  // Map logo backdrops
  const bgStyles = {
    white: 'bg-white border-slate-100 shadow-[0_2px_8px_rgba(15,29,51,0.06)]',
    transparent: 'bg-transparent border-transparent shadow-none',
    dark: 'bg-slate-950 border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    'brand-tint': 'bg-indigo-50/55 border-indigo-100'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic customizable background logo place to adapt with user uploaded logos */}
      <div 
        onClick={cycleBg}
        title="Klik untuk ubah latar wadah logo (Sesuai background logo Anda)"
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border transform transition-all hover:scale-110 duration-300 cursor-pointer group ${bgStyles[logoBg]}`}
        style={{ 
          width: iconSize, 
          height: iconSize,
        }}
      >
        <img
          src="/stitchflow_logo.png"
          alt="StitchFlow Logo"
          className="w-[90%] h-[90%] object-contain block select-none pointer-events-none"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback gracefully if logo is missing or corrupted
            const imgEl = e.currentTarget;
            imgEl.style.display = 'none';
          }}
        />
        
        {/* Subtle edit-background indicator on hover */}
        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-sm font-bold">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
        </div>
      </div>

      {/* Styled Brand Text with premium tracking */}
      {showText && (
        <span className="flex items-center select-none">
          <span className={`font-display font-extrabold text-lg tracking-tight ${activeColors.text}`}>
            Stitch<span className="text-indigo-650 font-black">Flow</span>
          </span>
        </span>
      )}
    </div>
  );
}



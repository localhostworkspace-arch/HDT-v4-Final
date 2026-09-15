import React from 'react';

interface ControllerSvgProps {
  isBtn: (index: number) => boolean;
  lx: number;
  ly: number;
  rx: number;
  ry: number;
  ltValue: number;
  rtValue: number;
  onButtonPress?: (index: number, isDown: boolean, value?: number) => void;
}

export const Ps5ControllerSvg: React.FC<ControllerSvgProps> = ({
  isBtn,
  lx,
  ly,
  rx,
  ry,
  ltValue,
  rtValue,
  onButtonPress = () => {}
}) => {
  return (
    <svg 
      viewBox="0 0 800 540" 
      className="w-full h-full drop-shadow-2xl select-none"
      style={{ filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.65))' }}
    >
      <defs>
        {/* PS5 White Polymer Outer Shell Gradient */}
        <linearGradient id="ps5WhiteShell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e2e8f0" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* PS5 Dark Core Obsidian Gradient */}
        <linearGradient id="ps5DarkCore" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* DualSense Lightbar Cyan Glow */}
        <linearGradient id="ps5Lightbar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Stick Sockets Radial Depth */}
        <radialGradient id="ps5SocketGrad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="75%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* Stick Cap Surface Radial */}
        <radialGradient id="ps5StickCap" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Glow Filters */}
        <filter id="ps5NeonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ================= TRIGGERS (L2 & R2 - Buttons 6 & 7) ================= */}
      {/* L2 Trigger */}
      <g 
        onMouseDown={() => onButtonPress(6, true, 1.0)} 
        onMouseUp={() => onButtonPress(6, false, 0)}
        className="cursor-pointer"
      >
        <path
          d="M 190 60 C 215 40 265 48 290 75 L 275 105 C 255 85 210 82 195 95 Z"
          fill={isBtn(6) || ltValue > 0.05 ? '#f59e0b' : '#1e293b'}
          stroke={isBtn(6) || ltValue > 0.05 ? '#d97706' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
          style={{ transformOrigin: '240px 80px', transform: `scale(${1 - ltValue * 0.06})` }}
        />
        <text x="240" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
          L2 {ltValue > 0 ? `(${(ltValue * 100).toFixed(0)}%)` : ''}
        </text>
      </g>

      {/* R2 Trigger */}
      <g 
        onMouseDown={() => onButtonPress(7, true, 1.0)} 
        onMouseUp={() => onButtonPress(7, false, 0)}
        className="cursor-pointer"
      >
        <path
          d="M 610 60 C 585 40 535 48 510 75 L 525 105 C 545 85 590 82 605 95 Z"
          fill={isBtn(7) || rtValue > 0.05 ? '#f59e0b' : '#1e293b'}
          stroke={isBtn(7) || rtValue > 0.05 ? '#d97706' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
          style={{ transformOrigin: '560px 80px', transform: `scale(${1 - rtValue * 0.06})` }}
        />
        <text x="560" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">
          R2 {rtValue > 0 ? `(${(rtValue * 100).toFixed(0)}%)` : ''}
        </text>
      </g>

      {/* ================= BUMPERS (L1 & R1 - Buttons 4 & 5) ================= */}
      <g 
        onMouseDown={() => onButtonPress(4, true)} 
        onMouseUp={() => onButtonPress(4, false)}
        className="cursor-pointer"
      >
        <path
          d="M 205 95 C 245 82 295 85 330 102 L 322 128 C 285 116 245 114 212 125 Z"
          fill={isBtn(4) ? '#38bdf8' : '#334155'}
          stroke={isBtn(4) ? '#0284c7' : '#475569'}
          strokeWidth="2.5"
        />
        <text x="268" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">L1</text>
      </g>

      <g 
        onMouseDown={() => onButtonPress(5, true)} 
        onMouseUp={() => onButtonPress(5, false)}
        className="cursor-pointer"
      >
        <path
          d="M 595 95 C 555 82 505 85 470 102 L 478 128 C 515 116 555 114 588 125 Z"
          fill={isBtn(5) ? '#38bdf8' : '#334155'}
          stroke={isBtn(5) ? '#0284c7' : '#475569'}
          strokeWidth="2.5"
        />
        <text x="532" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">R1</text>
      </g>

      {/* ================= DUALSENSE CHASSIS ================= */}
      {/* Outer White Futuristic Curved Wings (Left & Right) */}
      <path
        d="M 240 105 C 190 105 130 140 105 220 C 80 300 95 430 155 490 C 185 520 220 490 240 440 C 265 375 270 280 290 230 C 295 210 290 140 240 105 Z"
        fill="url(#ps5WhiteShell)"
        stroke="#94a3b8"
        strokeWidth="3"
      />
      <path
        d="M 560 105 C 610 105 670 140 695 220 C 720 300 705 430 645 490 C 615 520 580 490 560 440 C 535 375 530 280 510 230 C 505 210 510 140 560 105 Z"
        fill="url(#ps5WhiteShell)"
        stroke="#94a3b8"
        strokeWidth="3"
      />

      {/* Center Black Obsidian Core Housing */}
      <path
        d="M 240 105 C 290 100 510 100 560 105 C 530 220 550 370 510 420 C 470 470 330 470 290 420 C 250 370 270 220 240 105 Z"
        fill="url(#ps5DarkCore)"
        stroke="#1e293b"
        strokeWidth="3"
      />

      {/* ================= TOUCHPAD WITH CYAN LIGHTBAR (Button 17) ================= */}
      <g 
        onMouseDown={() => onButtonPress(17, true)} 
        onMouseUp={() => onButtonPress(17, false)}
        className="cursor-pointer"
      >
        {/* Glowing Dual Lightbar outline */}
        <path
          d="M 285 110 L 305 235 L 495 235 L 515 110 Z"
          fill="none"
          stroke={isBtn(17) ? '#a855f7' : 'url(#ps5Lightbar)'}
          strokeWidth="4"
          filter="url(#ps5NeonGlow)"
          opacity="0.9"
        />
        {/* Touchpad Plate */}
        <path
          d="M 290 112 L 308 230 L 492 230 L 510 112 Z"
          fill={isBtn(17) ? '#4c1d95' : '#1e293b'}
          stroke="#475569"
          strokeWidth="1.5"
        />
        <text x="400" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold" letterSpacing="1.5">
          TOUCHPAD
        </text>
      </g>

      {/* Create (8) and Options (9) Buttons */}
      <g onMouseDown={() => onButtonPress(8, true)} onMouseUp={() => onButtonPress(8, false)} className="cursor-pointer">
        <rect x="250" y="130" width="18" height="28" rx="4" fill={isBtn(8) ? '#38bdf8' : '#0f172a'} stroke="#475569" strokeWidth="2" />
        <path d="M 256 144 L 262 144 M 259 141 L 259 147" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      <g onMouseDown={() => onButtonPress(9, true)} onMouseUp={() => onButtonPress(9, false)} className="cursor-pointer">
        <rect x="532" y="130" width="18" height="28" rx="4" fill={isBtn(9) ? '#38bdf8' : '#0f172a'} stroke="#475569" strokeWidth="2" />
        <path d="M 537 141 L 545 141 M 537 144 L 545 144 M 537 147 L 545 147" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* ================= D-PAD (PS5 Directional Cross) ================= */}
      <g transform="translate(195, 215)">
        {/* Up (12) */}
        <g onMouseDown={() => onButtonPress(12, true)} onMouseUp={() => onButtonPress(12, false)} className="cursor-pointer">
          <path d="M -14 -46 L 14 -46 L 14 -16 L -14 -16 Z" rx="4" fill={isBtn(12) ? '#38bdf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
          <path d="M 0 -38 L -6 -28 L 6 -28 Z" fill={isBtn(12) ? '#ffffff' : '#cbd5e1'} />
        </g>
        {/* Down (13) */}
        <g onMouseDown={() => onButtonPress(13, true)} onMouseUp={() => onButtonPress(13, false)} className="cursor-pointer">
          <path d="M -14 16 L 14 16 L 14 46 L -14 46 Z" rx="4" fill={isBtn(13) ? '#38bdf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
          <path d="M 0 38 L -6 28 L 6 28 Z" fill={isBtn(13) ? '#ffffff' : '#cbd5e1'} />
        </g>
        {/* Left (14) */}
        <g onMouseDown={() => onButtonPress(14, true)} onMouseUp={() => onButtonPress(14, false)} className="cursor-pointer">
          <path d="M -46 -14 L -16 -14 L -16 14 L -46 14 Z" rx="4" fill={isBtn(14) ? '#38bdf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
          <path d="M -38 0 L -28 -6 L -28 6 Z" fill={isBtn(14) ? '#ffffff' : '#cbd5e1'} />
        </g>
        {/* Right (15) */}
        <g onMouseDown={() => onButtonPress(15, true)} onMouseUp={() => onButtonPress(15, false)} className="cursor-pointer">
          <path d="M 16 -14 L 46 -14 L 46 14 L 16 14 Z" rx="4" fill={isBtn(15) ? '#38bdf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
          <path d="M 38 0 L 28 -6 L 28 6 Z" fill={isBtn(15) ? '#ffffff' : '#cbd5e1'} />
        </g>
      </g>

      {/* ================= PLAYSTATION ACTION BUTTONS (△ ○ ✕ □) ================= */}
      <g transform="translate(605, 215)">
        {/* Triangle Top (Button 3) - Green */}
        <g onMouseDown={() => onButtonPress(3, true)} onMouseUp={() => onButtonPress(3, false)} className="cursor-pointer">
          <circle cx="0" cy="-38" r="19" fill={isBtn(3) ? '#15803d' : '#0f172a'} stroke="#22c55e" strokeWidth="2.5" filter={isBtn(3) ? 'url(#ps5NeonGlow)' : undefined} />
          <text x="0" y="-32" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="bold">△</text>
        </g>

        {/* Circle Right (Button 1) - Red */}
        <g onMouseDown={() => onButtonPress(1, true)} onMouseUp={() => onButtonPress(1, false)} className="cursor-pointer">
          <circle cx="38" cy="0" r="19" fill={isBtn(1) ? '#b91c1c' : '#0f172a'} stroke="#ef4444" strokeWidth="2.5" filter={isBtn(1) ? 'url(#ps5NeonGlow)' : undefined} />
          <text x="38" y="6" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">○</text>
        </g>

        {/* Cross Bottom (Button 0) - Blue */}
        <g onMouseDown={() => onButtonPress(0, true)} onMouseUp={() => onButtonPress(0, false)} className="cursor-pointer">
          <circle cx="0" cy="38" r="19" fill={isBtn(0) ? '#1d4ed8' : '#0f172a'} stroke="#3b82f6" strokeWidth="2.5" filter={isBtn(0) ? 'url(#ps5NeonGlow)' : undefined} />
          <text x="0" y="44" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="bold">✕</text>
        </g>

        {/* Square Left (Button 2) - Pink */}
        <g onMouseDown={() => onButtonPress(2, true)} onMouseUp={() => onButtonPress(2, false)} className="cursor-pointer">
          <circle cx="-38" cy="0" r="19" fill={isBtn(2) ? '#be185d' : '#0f172a'} stroke="#ec4899" strokeWidth="2.5" filter={isBtn(2) ? 'url(#ps5NeonGlow)' : undefined} />
          <text x="-38" y="6" textAnchor="middle" fill="#ec4899" fontSize="16" fontWeight="bold">□</text>
        </g>
      </g>

      {/* ================= PS HOME & MIC BUTTON (Button 16) ================= */}
      <g onMouseDown={() => onButtonPress(16, true)} onMouseUp={() => onButtonPress(16, false)} className="cursor-pointer">
        <circle cx="400" cy="285" r="17" fill={isBtn(16) ? '#38bdf8' : '#0b0f19'} stroke="#475569" strokeWidth="2" />
        <text x="400" y="290" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">PS</text>
      </g>
      {/* Mic Mute Indicator */}
      <ellipse cx="400" cy="318" rx="8" ry="4" fill="#f59e0b" opacity="0.8" />

      {/* ================= SYMMETRIC DUAL THUMBSTICKS ================= */}
      {/* Left Stick (L3 - Button 10) */}
      <g transform="translate(315, 350)">
        <circle cx="0" cy="0" r="50" fill="url(#ps5SocketGrad)" stroke="#334155" strokeWidth="3" />
        <g 
          transform={`translate(${lx * 24}, ${ly * 24})`}
          onMouseDown={() => onButtonPress(10, true)}
          onMouseUp={() => onButtonPress(10, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          <circle cx="0" cy="0" r="36" fill={isBtn(10) ? '#4338ca' : 'url(#ps5StickCap)'} stroke={isBtn(10) ? '#a5b4fc' : '#475569'} strokeWidth="3.5" />
          <circle cx="0" cy="0" r="22" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">L3</text>
        </g>
      </g>

      {/* Right Stick (R3 - Button 11) */}
      <g transform="translate(485, 350)">
        <circle cx="0" cy="0" r="50" fill="url(#ps5SocketGrad)" stroke="#334155" strokeWidth="3" />
        <g 
          transform={`translate(${rx * 24}, ${ry * 24})`}
          onMouseDown={() => onButtonPress(11, true)}
          onMouseUp={() => onButtonPress(11, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          <circle cx="0" cy="0" r="36" fill={isBtn(11) ? '#be185d' : 'url(#ps5StickCap)'} stroke={isBtn(11) ? '#f472b6' : '#475569'} strokeWidth="3.5" />
          <circle cx="0" cy="0" r="22" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">R3</text>
        </g>
      </g>
    </svg>
  );
};

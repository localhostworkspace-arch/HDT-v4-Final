import React from 'react';

interface ControllerSvgProps {
  isBtn: (index: number) => boolean;
  lx: number; // -1 to 1
  ly: number; // -1 to 1
  rx: number; // -1 to 1
  ry: number; // -1 to 1
  ltValue: number; // 0 to 1
  rtValue: number; // 0 to 1
  onButtonPress?: (index: number, isDown: boolean, value?: number) => void;
}

export const XboxControllerSvg: React.FC<ControllerSvgProps> = ({
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
        {/* Deep Chassis Linear Gradient */}
        <linearGradient id="xbChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#252f48" />
          <stop offset="35%" stopColor="#1a2236" />
          <stop offset="70%" stopColor="#101726" />
          <stop offset="100%" stopColor="#0a0e1a" />
        </linearGradient>

        {/* Outer Highlight Border Gradient */}
        <linearGradient id="xbBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="40%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Grip Texture Gradient */}
        <linearGradient id="xbGripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#070a12" />
        </linearGradient>

        {/* Stick Sockets Radial Depth */}
        <radialGradient id="xbSocketGrad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#050811" />
          <stop offset="75%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>

        {/* Stick Cap Surface Radial */}
        <radialGradient id="xbStickCap" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* D-Pad Metallic Dish Radial */}
        <radialGradient id="xbDpadDish" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="65%" stopColor="#151d30" />
          <stop offset="90%" stopColor="#2e3c5a" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>

        {/* Xbox Guide Jewel Button Glow */}
        <radialGradient id="xbGuideActive" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#4ade80" />
          <stop offset="70%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>

        <radialGradient id="xbGuideIdle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>

        {/* ABXY Button Gradients */}
        <radialGradient id="btnA_idle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1e3a2f" />
          <stop offset="70%" stopColor="#0f241c" />
          <stop offset="100%" stopColor="#06120e" />
        </radialGradient>
        <radialGradient id="btnA_active" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="40%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>

        <radialGradient id="btnB_idle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3b1d1d" />
          <stop offset="70%" stopColor="#241010" />
          <stop offset="100%" stopColor="#120505" />
        </radialGradient>
        <radialGradient id="btnB_active" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fecaca" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        <radialGradient id="btnX_idle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1d2d4a" />
          <stop offset="70%" stopColor="#0f1b30" />
          <stop offset="100%" stopColor="#060c17" />
        </radialGradient>
        <radialGradient id="btnX_active" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>

        <radialGradient id="btnY_idle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3d3319" />
          <stop offset="70%" stopColor="#261f0d" />
          <stop offset="100%" stopColor="#140f04" />
        </radialGradient>
        <radialGradient id="btnY_active" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#713f12" />
        </radialGradient>

        {/* Glow Filters */}
        <filter id="xbGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ================= TRIGGERS (LT & RT) - Mounted behind shoulders ================= */}
      {/* Left Trigger (LT - Button 6) */}
      <g 
        onMouseDown={() => onButtonPress(6, true, 1.0)} 
        onMouseUp={() => onButtonPress(6, false, 0)}
        className="cursor-pointer"
      >
        <path
          d="M 180 60 C 205 38 260 48 285 75 L 270 105 C 250 85 205 80 185 95 Z"
          fill={isBtn(6) || ltValue > 0.05 ? '#f59e0b' : '#1e293b'}
          stroke={isBtn(6) || ltValue > 0.05 ? '#d97706' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
          style={{ transformOrigin: '230px 80px', transform: `scale(${1 - ltValue * 0.06})` }}
        />
        <text x="230" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" opacity="0.9">
          LT {ltValue > 0 ? `(${(ltValue * 100).toFixed(0)}%)` : ''}
        </text>
      </g>

      {/* Right Trigger (RT - Button 7) */}
      <g 
        onMouseDown={() => onButtonPress(7, true, 1.0)} 
        onMouseUp={() => onButtonPress(7, false, 0)}
        className="cursor-pointer"
      >
        <path
          d="M 620 60 C 595 38 540 48 515 75 L 530 105 C 550 85 595 80 615 95 Z"
          fill={isBtn(7) || rtValue > 0.05 ? '#f59e0b' : '#1e293b'}
          stroke={isBtn(7) || rtValue > 0.05 ? '#d97706' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
          style={{ transformOrigin: '570px 80px', transform: `scale(${1 - rtValue * 0.06})` }}
        />
        <text x="570" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" opacity="0.9">
          RT {rtValue > 0 ? `(${(rtValue * 100).toFixed(0)}%)` : ''}
        </text>
      </g>

      {/* ================= BUMPERS (LB & RB) ================= */}
      {/* Left Bumper (LB - Button 4) */}
      <g 
        onMouseDown={() => onButtonPress(4, true)} 
        onMouseUp={() => onButtonPress(4, false)}
        className="cursor-pointer"
      >
        <path
          d="M 195 95 C 235 82 290 85 330 102 L 322 128 C 285 116 235 114 202 125 Z"
          fill={isBtn(4) ? '#38bdf8' : '#27354f'}
          stroke={isBtn(4) ? '#0284c7' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
        />
        <text x="260" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">LB</text>
      </g>

      {/* Right Bumper (RB - Button 5) */}
      <g 
        onMouseDown={() => onButtonPress(5, true)} 
        onMouseUp={() => onButtonPress(5, false)}
        className="cursor-pointer"
      >
        <path
          d="M 605 95 C 565 82 510 85 470 102 L 478 128 C 515 116 565 114 598 125 Z"
          fill={isBtn(5) ? '#38bdf8' : '#27354f'}
          stroke={isBtn(5) ? '#0284c7' : '#475569'}
          strokeWidth="2.5"
          className="transition-colors duration-100"
        />
        <text x="540" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">RB</text>
      </g>

      {/* ================= MAIN CHASSIS BODY ================= */}
      {/* Drop Shadow Outer Base Path */}
      <path
        d="M 330 100 Q 400 95 470 100 C 540 102 610 115 650 160 C 695 210 735 320 715 425 C 700 480 655 510 610 480 C 560 440 515 365 475 335 Q 400 365 325 335 C 285 365 240 440 190 480 C 145 510 100 480 85 425 C 65 320 105 210 150 160 C 190 115 260 102 330 100 Z"
        fill="url(#xbChassisGrad)"
        stroke="url(#xbBorderGrad)"
        strokeWidth="3.5"
      />

      {/* Palm Grip Accent Seams (Left & Right) */}
      <path
        d="M 120 280 C 145 370 185 440 190 480 C 145 510 100 480 85 425 C 75 370 85 315 120 280 Z"
        fill="url(#xbGripGrad)"
        opacity="0.8"
        stroke="#1e293b"
        strokeWidth="1.5"
      />
      <path
        d="M 680 280 C 655 370 615 440 610 480 C 655 510 700 480 715 425 C 725 370 715 315 680 280 Z"
        fill="url(#xbGripGrad)"
        opacity="0.8"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* Center Top Shield Contour Accent */}
      <path
        d="M 320 110 C 360 105 440 105 480 110 C 495 130 500 170 480 200 C 445 225 355 225 320 200 C 300 170 305 130 320 110 Z"
        fill="#121a2a"
        stroke="#27354f"
        strokeWidth="1.5"
        opacity="0.75"
      />

      {/* ================= CENTER XBOX GUIDE BUTTON (Button 16) ================= */}
      <g 
        onMouseDown={() => onButtonPress(16, true)} 
        onMouseUp={() => onButtonPress(16, false)}
        className="cursor-pointer"
      >
        {/* Outer Chrome Ring Bezel */}
        <circle cx="400" cy="148" r="28" fill="#0b0f19" stroke="#475569" strokeWidth="2.5" />
        <circle cx="400" cy="148" r="24" fill={isBtn(16) ? 'url(#xbGuideActive)' : 'url(#xbGuideIdle)'} stroke={isBtn(16) ? '#86efac' : '#334155'} strokeWidth="2" />
        {/* Center Glowing Xbox Cross Icon */}
        <path
          d="M 389 137 C 397 146 403 156 411 159 M 411 137 C 403 146 397 156 389 159"
          stroke={isBtn(16) ? '#ffffff' : '#e2e8f0'}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter={isBtn(16) ? 'url(#xbGlow)' : undefined}
        />
      </g>

      {/* ================= VIEW (8), SHARE (17), MENU (9) BUTTONS ================= */}
      {/* View Button (Back - Button 8) */}
      <g 
        onMouseDown={() => onButtonPress(8, true)} 
        onMouseUp={() => onButtonPress(8, false)}
        className="cursor-pointer"
      >
        <circle cx="340" cy="188" r="14" fill={isBtn(8) ? '#818cf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
        {/* Two overlapping rectangles icon */}
        <rect x="333" y="181" width="9" height="9" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="337" y="185" width="9" height="9" rx="1.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      </g>

      {/* Share Button (Center - Button 17) */}
      <g 
        onMouseDown={() => onButtonPress(17, true)} 
        onMouseUp={() => onButtonPress(17, false)}
        className="cursor-pointer"
      >
        <circle cx="400" cy="215" r="11" fill={isBtn(17) ? '#818cf8' : '#1e293b'} stroke="#475569" strokeWidth="1.5" />
        <path d="M 396 215 L 404 215 M 400 211 L 400 219" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Menu Button (Start - Button 9) */}
      <g 
        onMouseDown={() => onButtonPress(9, true)} 
        onMouseUp={() => onButtonPress(9, false)}
        className="cursor-pointer"
      >
        <circle cx="460" cy="188" r="14" fill={isBtn(9) ? '#818cf8' : '#1e293b'} stroke="#475569" strokeWidth="2" />
        {/* Hamburger lines icon */}
        <path d="M 334 184 L 346 184 M 334 188 L 346 188 M 334 192 L 346 192" transform="translate(120, 0)" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* ================= LEFT ANALOG STICK (Asymmetric Top-Left - Button 10) ================= */}
      <g transform="translate(255, 220)">
        {/* Recessed Socket Well */}
        <circle cx="0" cy="0" r="54" fill="url(#xbSocketGrad)" stroke="#334155" strokeWidth="3" />
        <circle cx="0" cy="0" r="48" fill="none" stroke="#1e293b" strokeWidth="2" />

        {/* Dynamic Moving Stick Head */}
        <g 
          transform={`translate(${lx * 26}, ${ly * 26})`}
          onMouseDown={() => onButtonPress(10, true)}
          onMouseUp={() => onButtonPress(10, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          {/* Outer rubberized knurled grip rim */}
          <circle 
            cx="0" 
            cy="0" 
            r="38" 
            fill={isBtn(10) ? '#4338ca' : 'url(#xbStickCap)'} 
            stroke={isBtn(10) ? '#a5b4fc' : '#475569'} 
            strokeWidth="3.5" 
            filter={isBtn(10) ? 'url(#xbGlow)' : undefined}
          />
          {/* Inner textured concave bowl */}
          <circle cx="0" cy="0" r="26" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="12" fill="#1e293b" opacity="0.6" />
          <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="0.5">LS</text>
        </g>
      </g>

      {/* ================= RIGHT ANALOG STICK (Asymmetric Bottom-Right - Button 11) ================= */}
      <g transform="translate(490, 335)">
        {/* Recessed Socket Well */}
        <circle cx="0" cy="0" r="54" fill="url(#xbSocketGrad)" stroke="#334155" strokeWidth="3" />
        <circle cx="0" cy="0" r="48" fill="none" stroke="#1e293b" strokeWidth="2" />

        {/* Dynamic Moving Stick Head */}
        <g 
          transform={`translate(${rx * 26}, ${ry * 26})`}
          onMouseDown={() => onButtonPress(11, true)}
          onMouseUp={() => onButtonPress(11, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          {/* Outer rubberized knurled grip rim */}
          <circle 
            cx="0" 
            cy="0" 
            r="38" 
            fill={isBtn(11) ? '#be185d' : 'url(#xbStickCap)'} 
            stroke={isBtn(11) ? '#f472b6' : '#475569'} 
            strokeWidth="3.5" 
            filter={isBtn(11) ? 'url(#xbGlow)' : undefined}
          />
          {/* Inner textured concave bowl */}
          <circle cx="0" cy="0" r="26" fill="#090d16" stroke="#334155" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="12" fill="#1e293b" opacity="0.6" />
          <text x="0" y="4" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold" letterSpacing="0.5">RS</text>
        </g>
      </g>

      {/* ================= METALLIC FACETTED D-PAD DISH (Asymmetric Bottom-Left) ================= */}
      <g transform="translate(325, 335)">
        {/* Recessed outer socket */}
        <circle cx="0" cy="0" r="50" fill="#070a12" stroke="#334155" strokeWidth="3" />
        
        {/* 8-Way Facetted Metallic Dish */}
        <circle cx="0" cy="0" r="44" fill="url(#xbDpadDish)" stroke="#475569" strokeWidth="2" />
        
        {/* Facet lines */}
        <line x1="-31" y1="-31" x2="31" y2="31" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="-31" y1="31" x2="31" y2="-31" stroke="#1e293b" strokeWidth="1.5" />

        {/* Up Arrow (Button 12) */}
        <g onMouseDown={() => onButtonPress(12, true)} onMouseUp={() => onButtonPress(12, false)} className="cursor-pointer">
          <path
            d="M -13 -40 L 13 -40 L 13 -14 L -13 -14 Z"
            rx="3"
            fill={isBtn(12) ? '#38bdf8' : '#1e293b'}
            stroke={isBtn(12) ? '#0284c7' : '#475569'}
            strokeWidth="2"
          />
          <path d="M 0 -34 L -6 -24 L 6 -24 Z" fill={isBtn(12) ? '#ffffff' : '#cbd5e1'} />
        </g>

        {/* Down Arrow (Button 13) */}
        <g onMouseDown={() => onButtonPress(13, true)} onMouseUp={() => onButtonPress(13, false)} className="cursor-pointer">
          <path
            d="M -13 14 L 13 14 L 13 40 L -13 40 Z"
            rx="3"
            fill={isBtn(13) ? '#38bdf8' : '#1e293b'}
            stroke={isBtn(13) ? '#0284c7' : '#475569'}
            strokeWidth="2"
          />
          <path d="M 0 34 L -6 24 L 6 24 Z" fill={isBtn(13) ? '#ffffff' : '#cbd5e1'} />
        </g>

        {/* Left Arrow (Button 14) */}
        <g onMouseDown={() => onButtonPress(14, true)} onMouseUp={() => onButtonPress(14, false)} className="cursor-pointer">
          <path
            d="M -40 -13 L -14 -13 L -14 13 L -40 13 Z"
            rx="3"
            fill={isBtn(14) ? '#38bdf8' : '#1e293b'}
            stroke={isBtn(14) ? '#0284c7' : '#475569'}
            strokeWidth="2"
          />
          <path d="M -34 0 L -24 -6 L -24 6 Z" fill={isBtn(14) ? '#ffffff' : '#cbd5e1'} />
        </g>

        {/* Right Arrow (Button 15) */}
        <g onMouseDown={() => onButtonPress(15, true)} onMouseUp={() => onButtonPress(15, false)} className="cursor-pointer">
          <path
            d="M 14 -13 L 40 -13 L 40 13 L 14 13 Z"
            rx="3"
            fill={isBtn(15) ? '#38bdf8' : '#1e293b'}
            stroke={isBtn(15) ? '#0284c7' : '#475569'}
            strokeWidth="2"
          />
          <path d="M 34 0 L 24 -6 L 24 6 Z" fill={isBtn(15) ? '#ffffff' : '#cbd5e1'} />
        </g>
      </g>

      {/* ================= ABXY DIAMOND BUTTON CLUSTER (Top-Right) ================= */}
      <g transform="translate(580, 220)">
        {/* Subtle Recessed Mounting Plate */}
        <circle cx="0" cy="0" r="62" fill="#0d1424" stroke="#1e293b" strokeWidth="2" opacity="0.6" />

        {/* Y Button - Yellow Top (Button 3) */}
        <g 
          onMouseDown={() => onButtonPress(3, true)} 
          onMouseUp={() => onButtonPress(3, false)}
          className="cursor-pointer"
        >
          <circle 
            cx="0" 
            cy="-38" 
            r="19" 
            fill={isBtn(3) ? 'url(#btnY_active)' : 'url(#btnY_idle)'} 
            stroke="#eab308" 
            strokeWidth="2.5" 
            filter={isBtn(3) ? 'url(#xbGlow)' : undefined}
          />
          <text x="0" y="-31" textAnchor="middle" fill={isBtn(3) ? '#000000' : '#eab308'} fontSize="16" fontWeight="900" fontFamily="sans-serif">Y</text>
        </g>

        {/* B Button - Red Right (Button 1) */}
        <g 
          onMouseDown={() => onButtonPress(1, true)} 
          onMouseUp={() => onButtonPress(1, false)}
          className="cursor-pointer"
        >
          <circle 
            cx="38" 
            cy="0" 
            r="19" 
            fill={isBtn(1) ? 'url(#btnB_active)' : 'url(#btnB_idle)'} 
            stroke="#ef4444" 
            strokeWidth="2.5" 
            filter={isBtn(1) ? 'url(#xbGlow)' : undefined}
          />
          <text x="38" y="6" textAnchor="middle" fill={isBtn(1) ? '#ffffff' : '#ef4444'} fontSize="16" fontWeight="900" fontFamily="sans-serif">B</text>
        </g>

        {/* A Button - Green Bottom (Button 0) */}
        <g 
          onMouseDown={() => onButtonPress(0, true)} 
          onMouseUp={() => onButtonPress(0, false)}
          className="cursor-pointer"
        >
          <circle 
            cx="0" 
            cy="38" 
            r="19" 
            fill={isBtn(0) ? 'url(#btnA_active)' : 'url(#btnA_idle)'} 
            stroke="#22c55e" 
            strokeWidth="2.5" 
            filter={isBtn(0) ? 'url(#xbGlow)' : undefined}
          />
          <text x="0" y="44" textAnchor="middle" fill={isBtn(0) ? '#000000' : '#22c55e'} fontSize="16" fontWeight="900" fontFamily="sans-serif">A</text>
        </g>

        {/* X Button - Blue Left (Button 2) */}
        <g 
          onMouseDown={() => onButtonPress(2, true)} 
          onMouseUp={() => onButtonPress(2, false)}
          className="cursor-pointer"
        >
          <circle 
            cx="-38" 
            cy="0" 
            r="19" 
            fill={isBtn(2) ? 'url(#btnX_active)' : 'url(#btnX_idle)'} 
            stroke="#3b82f6" 
            strokeWidth="2.5" 
            filter={isBtn(2) ? 'url(#xbGlow)' : undefined}
          />
          <text x="-38" y="6" textAnchor="middle" fill={isBtn(2) ? '#ffffff' : '#3b82f6'} fontSize="16" fontWeight="900" fontFamily="sans-serif">X</text>
        </g>
      </g>
    </svg>
  );
};

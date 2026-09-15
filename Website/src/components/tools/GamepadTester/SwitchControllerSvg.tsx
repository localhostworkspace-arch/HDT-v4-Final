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

export const SwitchControllerSvg: React.FC<ControllerSvgProps> = ({
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
        <linearGradient id="switchChassis" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="50%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <radialGradient id="switchSocket" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#09090b" />
          <stop offset="80%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#3f3f46" />
        </radialGradient>
      </defs>

      {/* ZL & ZR Triggers (6 & 7) */}
      <g onMouseDown={() => onButtonPress(6, true, 1.0)} onMouseUp={() => onButtonPress(6, false, 0)} className="cursor-pointer">
        <path
          d="M 180 60 C 205 38 260 48 285 75 L 270 105 C 250 85 205 80 185 95 Z"
          fill={isBtn(6) || ltValue > 0.05 ? '#ef4444' : '#18181b'}
          stroke={isBtn(6) || ltValue > 0.05 ? '#dc2626' : '#3f3f46'}
          strokeWidth="2.5"
        />
        <text x="230" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">ZL</text>
      </g>

      <g onMouseDown={() => onButtonPress(7, true, 1.0)} onMouseUp={() => onButtonPress(7, false, 0)} className="cursor-pointer">
        <path
          d="M 620 60 C 595 38 540 48 515 75 L 530 105 C 550 85 595 80 615 95 Z"
          fill={isBtn(7) || rtValue > 0.05 ? '#ef4444' : '#18181b'}
          stroke={isBtn(7) || rtValue > 0.05 ? '#dc2626' : '#3f3f46'}
          strokeWidth="2.5"
        />
        <text x="570" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">ZR</text>
      </g>

      {/* L & R Bumpers (4 & 5) */}
      <g onMouseDown={() => onButtonPress(4, true)} onMouseUp={() => onButtonPress(4, false)} className="cursor-pointer">
        <path d="M 195 95 C 235 82 290 85 330 102 L 322 128 C 285 116 235 114 202 125 Z" fill={isBtn(4) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
        <text x="260" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">L</text>
      </g>

      <g onMouseDown={() => onButtonPress(5, true)} onMouseUp={() => onButtonPress(5, false)} className="cursor-pointer">
        <path d="M 605 95 C 565 82 510 85 470 102 L 478 128 C 515 116 565 114 598 125 Z" fill={isBtn(5) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
        <text x="540" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">R</text>
      </g>

      {/* Main Switch Chassis Body */}
      <path
        d="M 330 100 Q 400 95 470 100 C 540 102 610 115 650 160 C 695 210 735 320 715 425 C 700 480 655 510 610 480 C 560 440 515 365 475 335 Q 400 365 325 335 C 285 365 240 440 190 480 C 145 510 100 480 85 425 C 65 320 105 210 150 160 C 190 115 260 102 330 100 Z"
        fill="url(#switchChassis)"
        stroke="#3f3f46"
        strokeWidth="3.5"
      />

      {/* Minus (8) & Plus (9) Buttons */}
      <g onMouseDown={() => onButtonPress(8, true)} onMouseUp={() => onButtonPress(8, false)} className="cursor-pointer">
        <circle cx="340" cy="180" r="14" fill={isBtn(8) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
        <text x="340" y="185" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">-</text>
      </g>

      <g onMouseDown={() => onButtonPress(9, true)} onMouseUp={() => onButtonPress(9, false)} className="cursor-pointer">
        <circle cx="460" cy="180" r="14" fill={isBtn(9) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
        <text x="460" y="185" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">+</text>
      </g>

      {/* Capture (17) & Home (16) Buttons */}
      <g onMouseDown={() => onButtonPress(17, true)} onMouseUp={() => onButtonPress(17, false)} className="cursor-pointer">
        <rect x="355" y="220" width="22" height="22" rx="4" fill={isBtn(17) ? '#38bdf8' : '#27272a'} stroke="#52525b" strokeWidth="2" />
        <circle cx="366" cy="231" r="5" fill="#09090b" />
      </g>

      <g onMouseDown={() => onButtonPress(16, true)} onMouseUp={() => onButtonPress(16, false)} className="cursor-pointer">
        <circle cx="435" cy="231" r="14" fill={isBtn(16) ? '#0284c7' : '#27272a'} stroke={isBtn(16) ? '#38bdf8' : '#52525b'} strokeWidth="2" />
        <text x="435" y="235" textAnchor="middle" fill="#FFFFFF" fontSize="11">🏠</text>
      </g>

      {/* Left Stick (Button 10 - Asymmetric Top Left) */}
      <g transform="translate(255, 220)">
        <circle cx="0" cy="0" r="54" fill="url(#switchSocket)" stroke="#3f3f46" strokeWidth="3" />
        <g 
          transform={`translate(${lx * 26}, ${ly * 26})`}
          onMouseDown={() => onButtonPress(10, true)}
          onMouseUp={() => onButtonPress(10, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          <circle cx="0" cy="0" r="38" fill={isBtn(10) ? '#b91c1c' : '#27272a'} stroke={isBtn(10) ? '#fca5a5' : '#52525b'} strokeWidth="3.5" />
          <circle cx="0" cy="0" r="26" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="bold">L3</text>
        </g>
      </g>

      {/* D-Pad (Button 12-15) */}
      <g transform="translate(325, 335)">
        <circle cx="0" cy="0" r="50" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />
        {/* Up */}
        <g onMouseDown={() => onButtonPress(12, true)} onMouseUp={() => onButtonPress(12, false)} className="cursor-pointer">
          <path d="M -13 -40 L 13 -40 L 13 -14 L -13 -14 Z" rx="3" fill={isBtn(12) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
          <path d="M 0 -34 L -6 -24 L 6 -24 Z" fill="#FFFFFF" />
        </g>
        {/* Down */}
        <g onMouseDown={() => onButtonPress(13, true)} onMouseUp={() => onButtonPress(13, false)} className="cursor-pointer">
          <path d="M -13 14 L 13 14 L 13 40 L -13 40 Z" rx="3" fill={isBtn(13) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
          <path d="M 0 34 L -6 24 L 6 24 Z" fill="#FFFFFF" />
        </g>
        {/* Left */}
        <g onMouseDown={() => onButtonPress(14, true)} onMouseUp={() => onButtonPress(14, false)} className="cursor-pointer">
          <path d="M -40 -13 L -14 -13 L -14 13 L -40 13 Z" rx="3" fill={isBtn(14) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
          <path d="M -34 0 L -24 -6 L -24 6 Z" fill="#FFFFFF" />
        </g>
        {/* Right */}
        <g onMouseDown={() => onButtonPress(15, true)} onMouseUp={() => onButtonPress(15, false)} className="cursor-pointer">
          <path d="M 14 -13 L 40 -13 L 40 13 L 14 13 Z" rx="3" fill={isBtn(15) ? '#ef4444' : '#27272a'} stroke="#52525b" strokeWidth="2" />
          <path d="M 34 0 L 24 -6 L 24 6 Z" fill="#FFFFFF" />
        </g>
      </g>

      {/* Switch Buttons (X Top, A Right, B Bottom, Y Left) */}
      <g transform="translate(580, 220)">
        <circle cx="0" cy="0" r="62" fill="#18181b" stroke="#27272a" strokeWidth="2" opacity="0.6" />
        {/* X Top (3) */}
        <g onMouseDown={() => onButtonPress(3, true)} onMouseUp={() => onButtonPress(3, false)} className="cursor-pointer">
          <circle cx="0" cy="-38" r="19" fill={isBtn(3) ? '#b91c1c' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
          <text x="0" y="-31" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">X</text>
        </g>
        {/* A Right (1) */}
        <g onMouseDown={() => onButtonPress(1, true)} onMouseUp={() => onButtonPress(1, false)} className="cursor-pointer">
          <circle cx="38" cy="0" r="19" fill={isBtn(1) ? '#b91c1c' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
          <text x="38" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">A</text>
        </g>
        {/* B Bottom (0) */}
        <g onMouseDown={() => onButtonPress(0, true)} onMouseUp={() => onButtonPress(0, false)} className="cursor-pointer">
          <circle cx="0" cy="38" r="19" fill={isBtn(0) ? '#b91c1c' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
          <text x="0" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">B</text>
        </g>
        {/* Y Left (2) */}
        <g onMouseDown={() => onButtonPress(2, true)} onMouseUp={() => onButtonPress(2, false)} className="cursor-pointer">
          <circle cx="-38" cy="0" r="19" fill={isBtn(2) ? '#b91c1c' : '#27272a'} stroke="#52525b" strokeWidth="2.5" />
          <text x="-38" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold">Y</text>
        </g>
      </g>

      {/* Right Stick (Button 11 - Asymmetric Bottom Right) */}
      <g transform="translate(490, 335)">
        <circle cx="0" cy="0" r="54" fill="url(#switchSocket)" stroke="#3f3f46" strokeWidth="3" />
        <g 
          transform={`translate(${rx * 26}, ${ry * 26})`}
          onMouseDown={() => onButtonPress(11, true)}
          onMouseUp={() => onButtonPress(11, false)}
          className="cursor-pointer transition-transform duration-75"
        >
          <circle cx="0" cy="0" r="38" fill={isBtn(11) ? '#b91c1c' : '#27272a'} stroke={isBtn(11) ? '#fca5a5' : '#52525b'} strokeWidth="3.5" />
          <circle cx="0" cy="0" r="26" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <text x="0" y="4" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="bold">RS</text>
        </g>
      </g>
    </svg>
  );
};

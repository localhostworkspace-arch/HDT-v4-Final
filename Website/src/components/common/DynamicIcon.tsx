import React from 'react';
import { 
  Keyboard, 
  Mouse, 
  Gamepad2, 
  Disc, 
  Volume2, 
  Mic, 
  Monitor, 
  Zap, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Camera, 
  Activity,
  Crosshair,
  Compass,
  Glasses,
  Headset
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Keyboard,
  Mouse,
  Gamepad2,
  Disc,
  Volume2,
  Mic,
  Monitor,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Camera,
  Activity,
  Crosshair,
  Compass,
  Glasses,
  Headset,
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || Activity;
  return <IconComponent {...props} />;
};

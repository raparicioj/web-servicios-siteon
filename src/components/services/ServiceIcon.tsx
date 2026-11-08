import React from 'react';
import {
  Activity,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Globe,
  Layers,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

export function ServiceIcon({
  name,
  className = 'w-6 h-6',
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case 'Activity':
      return <Activity className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Code2':
      return <Code2 className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'TrendingDown':
      return <TrendingDown className={className} />;
    case 'Server':
      return <Server className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    default:
      return <Cpu className={className} />;
  }
}


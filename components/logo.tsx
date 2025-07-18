import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number; // height in px
  className?: string;
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <img
      src="/img/mainlogo.png"
      alt="Thinkedin logo"
      height={size}
      style={{ height: size, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}

// Icon-only variant for favicon/tab
export function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'variant'>) {
  return <Logo size={size} variant="icon-only" className={className} />;
} 
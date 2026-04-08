import type { CSSProperties, ReactNode } from 'react';

export function Skel({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <span className={`skel ${className}`.trim()} style={style} aria-hidden />;
}

export function SkelStack({ children }: { children: ReactNode }) {
  return <div className="skel-stack" aria-hidden>{children}</div>;
}


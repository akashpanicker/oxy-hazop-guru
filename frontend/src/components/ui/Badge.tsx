import React from 'react';

interface BadgeProps {
  variant: 'paf' | 'pdlor' | 'ecr' | 'neutral' | 'success';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    paf: 'bg-red-100 text-red-800',           // People
    pdlor: 'bg-amber-100 text-amber-800',     // Production
    ecr: 'bg-green-100 text-green-800',       // Environment
    neutral: 'bg-slate-100 text-slate-800',
    success: 'bg-oxy-green text-white',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

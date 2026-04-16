import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[14px] font-medium text-oxy-grayText">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-[44px] px-3 py-2 bg-white border border-oxy-border rounded-md text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-oxy-blue focus:border-oxy-blue disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {helperText && (
          <span className="text-[12px] text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function Checkbox({ label, description, className = '', ...props }: CheckboxProps) {
  const isChecked = props.checked === true;
  
  return (
    <label className={`flex items-center p-[18px_20px] min-h-[60px] rounded-lg border-2 cursor-pointer transition-all duration-150 ease-in-out ${
      isChecked 
        ? 'bg-[#EBF5FF] border-oxy-blue' 
        : 'bg-white border-[#E5E7EB] hover:border-oxy-blue hover:bg-slate-50 hover:translate-x-1'
    } ${className}`}>
      <input
        type="checkbox"
        className="w-5 h-5 mr-[14px] text-oxy-blue bg-white border-oxy-border cursor-pointer accent-oxy-blue disabled:opacity-50"
        {...props}
      />
      <div className="flex flex-col flex-1 select-none">
        <span className={`text-[16px] font-medium ${isChecked ? 'text-oxy-blue font-semibold' : 'text-oxy-dark'}`}>{label}</span>
        {description && <span className="text-sm text-oxy-grayText mt-1">{description}</span>}
      </div>
    </label>
  );
}

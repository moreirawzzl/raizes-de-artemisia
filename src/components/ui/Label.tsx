import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`mb-1.5 block text-[11px] uppercase tracking-[1.5px] text-verde-secundario font-body ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

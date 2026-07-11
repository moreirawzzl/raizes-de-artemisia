import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-xl border border-bege-claro bg-fundo px-4 py-3 text-sm text-verde-principal outline-none transition-colors focus:border-verde-secundario font-body",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

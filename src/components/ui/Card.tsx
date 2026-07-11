import clsx from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl2 border border-bege-claro bg-white p-6 shadow-soft", className)}>
      {children}
    </div>
  );
}

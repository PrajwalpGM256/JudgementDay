import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

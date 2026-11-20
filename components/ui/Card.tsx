// components/ui/Card.tsx
import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  className = "",
  hover = false,
  glow = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-slate-900/60 backdrop-blur-md border-slate-800/80 p-5 ${
        hover
          ? "transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80 hover:-translate-y-0.5"
          : ""
      } ${
        glow
          ? "shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

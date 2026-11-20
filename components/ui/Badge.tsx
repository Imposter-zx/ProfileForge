// components/ui/Badge.tsx
import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "emerald"
    | "indigo"
    | "cyan"
    | "amber"
    | "rose"
    | "purple"
    | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border border-slate-700/60",
    indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    outline: "bg-transparent text-slate-400 border border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

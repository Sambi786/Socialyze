import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const containerSize = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-12 h-12 rounded-2xl drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    lg: "w-24 h-24 rounded-3xl drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]"
  }[size];

  const textSize = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-6xl"
  }[size];

  return (
    <div className={`relative bg-slate-900 border border-slate-700/50 flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
      <span className={`font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent transform ${textSize}`}>
        S
      </span>
    </div>
  );
}

import React from "react";

interface MmutaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function MmutaLogo({ className = "h-12 w-12", showText = false }: MmutaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${showText ? "" : "justify-center"}`}>
      <img
        src="/logo.png"
        alt="Mmuta"
        className={`${className} shrink-0 select-none object-contain`}
      />
      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-black tracking-wider text-slate-950 dark:text-white font-display uppercase leading-tight">
            Mmuta
          </span>
          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold leading-none">
            Teach. Test. Trust.
          </span>
        </div>
      )}
    </div>
  );
}

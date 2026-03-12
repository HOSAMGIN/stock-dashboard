import React from "react";
import { cn } from "@/lib/utils";

interface RsiGaugeProps {
  value: number;
}

export function RsiGauge({ value }: RsiGaugeProps) {
  // Constrain value between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Calculate position (0% to 100%)
  const position = `${normalizedValue}%`;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span>0</span>
        <span>30</span>
        <span>70</span>
        <span>100</span>
      </div>
      
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden flex">
        {/* Buy Zone (< 30) */}
        <div className="h-full w-[30%] bg-[var(--color-success)]/30 border-r border-background/50" />
        {/* Neutral Zone (30 - 70) */}
        <div className="h-full w-[40%] bg-muted/50 border-r border-background/50" />
        {/* Sell Zone (> 70) */}
        <div className="h-full w-[30%] bg-[var(--color-destructive)]/30" />
        
        {/* Current Value Marker */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-1000 ease-out"
          style={{ left: `calc(${position} - 2px)` }}
        />
      </div>
    </div>
  );
}

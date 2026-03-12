import React from "react";
import type { PricePoint } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface BodyPositionGaugeProps {
  historicalPrices: PricePoint[];
  currentPrice: number;
  rsi14: number;
}

const ZONES = [
  { id: "bottom", label: "바닥", from: 0,  to: 20,  color: "#22c55e",  desc: "매수 적기" },
  { id: "knee",   label: "무릎", from: 20, to: 40,  color: "#86efac",  desc: "저점 구간" },
  { id: "waist",  label: "허리", from: 40, to: 60,  color: "#94a3b8",  desc: "중립 구간" },
  { id: "shoulder",label: "어깨",from: 60, to: 80,  color: "#fca5a5",  desc: "고점 주의" },
  { id: "ceiling", label: "천장", from: 80, to: 100, color: "#ef4444",  desc: "매도 검토" },
] as const;

function getZone(pct: number) {
  return ZONES.find((z) => pct >= z.from && pct < z.to) ?? ZONES[ZONES.length - 1];
}

export function BodyPositionGauge({ historicalPrices, currentPrice, rsi14 }: BodyPositionGaugeProps) {
  const closes = historicalPrices.map((p) => p.close);
  if (closes.length === 0) return null;

  const periodLow  = Math.min(...closes);
  const periodHigh = Math.max(...closes);
  const range = periodHigh - periodLow;

  // Blend: 60% price position + 40% RSI position for a more holistic signal
  const pricePos = range > 0 ? ((currentPrice - periodLow) / range) * 100 : 50;
  const rsiPos   = Math.min(100, Math.max(0, rsi14));
  const blended  = pricePos * 0.6 + rsiPos * 0.4;

  const pct   = Math.min(100, Math.max(0, blended));
  const zone  = getZone(pct);

  // Clamp pointer so it stays visible
  const pointerLeft = Math.min(96, Math.max(2, pct));

  return (
    <div className="mt-5 space-y-2">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">현재 위치 분석</span>
        <span
          className="text-xs font-bold font-mono px-2 py-0.5 rounded"
          style={{ color: zone.color, background: `${zone.color}18`, border: `1px solid ${zone.color}40` }}
        >
          {zone.label} — {zone.desc}
        </span>
      </div>

      {/* Gradient bar */}
      <div className="relative h-5">
        {/* Track */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #22c55e 0%, #86efac 20%, #94a3b8 40%, #94a3b8 60%, #fca5a5 80%, #ef4444 100%)",
          }}
        >
          {/* Zone dividers */}
          {[20, 40, 60, 80].map((x) => (
            <div
              key={x}
              className="absolute top-0 bottom-0 w-px bg-black/20"
              style={{ left: `${x}%` }}
            />
          ))}
        </div>

        {/* Pointer */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-700 ease-out"
          style={{ left: `${pointerLeft}%` }}
        >
          {/* Outer ring */}
          <div
            className="w-5 h-5 rounded-full border-2 border-white/90 shadow-lg flex items-center justify-center"
            style={{ background: zone.color, boxShadow: `0 0 10px ${zone.color}80` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          </div>
          {/* Tooltip bubble */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-7 text-[10px] font-bold font-mono whitespace-nowrap px-1.5 py-0.5 rounded pointer-events-none"
            style={{ color: zone.color, background: `${zone.color}20`, border: `1px solid ${zone.color}50` }}
          >
            {pct.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/70 px-0.5">
        {ZONES.map((z) => (
          <span
            key={z.id}
            className={cn(
              "transition-colors",
              zone.id === z.id && "font-bold"
            )}
            style={zone.id === z.id ? { color: z.color } : undefined}
          >
            {z.label}
          </span>
        ))}
      </div>

      {/* Sub info */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50 pt-0.5">
        <span>기간 저점 기준</span>
        <span className="text-muted-foreground/40">RSI + 가격 포지션 혼합</span>
      </div>
    </div>
  );
}

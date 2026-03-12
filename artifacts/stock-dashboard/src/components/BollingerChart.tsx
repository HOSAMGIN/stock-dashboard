import React from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import type { PricePoint } from "@workspace/api-client-react";

interface BollingerChartProps {
  data: PricePoint[];
  currentPrice: number;
  currency: string;
  isTouchingLowerBand: boolean;
}

function fmtPrice(v: number, currency: string) {
  if (currency === "KRW") return v.toLocaleString("ko-KR");
  return v.toFixed(2);
}

export function BollingerChart({ data, currentPrice, currency, isTouchingLowerBand }: BollingerChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "MM/dd"),
    close: d.close,
    bbUpper: d.bbUpper,
    bbMiddle: d.bbMiddle,
    bbLower: d.bbLower,
    bandWidth: d.bbUpper - d.bbLower,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs font-mono space-y-1">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-foreground">종가: <span className="text-primary">{fmtPrice(d.close, currency)}</span></p>
        <p className="text-red-400">상단: {fmtPrice(d.bbUpper, currency)}</p>
        <p className="text-slate-400">중심: {fmtPrice(d.bbMiddle, currency)}</p>
        <p className="text-green-400">하단: {fmtPrice(d.bbLower, currency)}</p>
      </div>
    );
  };

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">볼린저 밴드 (20,2)</span>
        {isTouchingLowerBand && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
            ⚡ 하단 터치
          </span>
        )}
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bbBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} opacity={0.4} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickMargin={6} minTickGap={20} fontFamily="monospace" />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => fmtPrice(v, currency)} width={currency === "KRW" ? 55 : 45} fontFamily="monospace" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }} />

            {/* Band fill between upper and lower */}
            <Area
              dataKey="bbUpper"
              stroke="#818cf8"
              strokeWidth={1}
              fill="url(#bbBand)"
              dot={false}
              activeDot={false}
            />
            <Area
              dataKey="bbLower"
              stroke="#4ade80"
              strokeWidth={1}
              fill="white"
              fillOpacity={0}
              dot={false}
              activeDot={false}
            />

            {/* Middle band */}
            <Line
              dataKey="bbMiddle"
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 2"
              dot={false}
              activeDot={false}
            />

            {/* Price line */}
            <Line
              dataKey="close"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#38bdf8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground/70">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-sky-400" />종가</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-indigo-400" />상단</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-slate-400 opacity-60" style={{backgroundImage:'repeating-linear-gradient(to right, #94a3b8 0, #94a3b8 4px, transparent 4px, transparent 6px)'}} />중심</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-green-400" />하단</span>
      </div>
    </div>
  );
}

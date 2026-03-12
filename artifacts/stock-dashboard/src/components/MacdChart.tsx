import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { format } from "date-fns";
import type { PricePoint } from "@workspace/api-client-react";

interface MacdChartProps {
  data: PricePoint[];
  macdLine: number;
  signalLine: number;
  macdHistogram: number;
}

export function MacdChart({ data, macdLine, signalLine, macdHistogram }: MacdChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "MM/dd"),
    macdLine: d.macdLine,
    signalLine: d.signalLine,
    histogram: d.macdHistogram,
    isBullish: d.macdHistogram >= 0,
    isCrossover: false, // computed below
  }));

  // Mark MACD crossover points (macd crosses above signal)
  for (let i = 1; i < chartData.length; i++) {
    const prev = chartData[i - 1];
    const curr = chartData[i];
    if (prev.macdLine < prev.signalLine && curr.macdLine >= curr.signalLine) {
      curr.isCrossover = true;
    }
  }

  const isBullish = macdLine > signalLine;
  const isCrossoverNow =
    chartData.length >= 2 &&
    chartData[chartData.length - 2].macdLine < chartData[chartData.length - 2].signalLine &&
    macdLine >= signalLine;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs font-mono space-y-1">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-sky-400">MACD: {d.macdLine?.toFixed(4)}</p>
        <p className="text-orange-400">Signal: {d.signalLine?.toFixed(4)}</p>
        <p className={d.histogram >= 0 ? "text-green-400" : "text-red-400"}>
          Histogram: {d.histogram?.toFixed(4)}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">MACD (12, 26, 9)</span>
        <div className="flex items-center gap-2">
          {isCrossoverNow && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
              ⚡ 골든 크로스
            </span>
          )}
          <span className={`text-[10px] font-mono font-bold ${isBullish ? "text-green-400" : "text-red-400"}`}>
            {isBullish ? "▲ 상승 모멘텀" : "▼ 하락 모멘텀"}
          </span>
        </div>
      </div>

      {/* Current values display */}
      <div className="flex gap-4 mb-2 text-[11px] font-mono">
        <span className="text-sky-400">MACD: {(macdLine ?? 0).toFixed(4)}</span>
        <span className="text-orange-400">Signal: {(signalLine ?? 0).toFixed(4)}</span>
        <span className={(macdHistogram ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
          Hist: {(macdHistogram ?? 0) >= 0 ? "+" : ""}{(macdHistogram ?? 0).toFixed(4)}
        </span>
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} opacity={0.4} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickMargin={6} minTickGap={20} fontFamily="monospace" />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => v.toFixed(2)} fontFamily="monospace" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.6} />

            {/* Histogram bars */}
            <Bar dataKey="histogram" radius={[1, 1, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isBullish ? "#4ade80" : "#f87171"}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>

            {/* MACD line */}
            <Line
              dataKey="macdLine"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: "#38bdf8" }}
            />

            {/* Signal line */}
            <Line
              dataKey="signalLine"
              stroke="#fb923c"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3, fill: "#fb923c" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground/70">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-sky-400" />MACD</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-orange-400" style={{backgroundImage:'repeating-linear-gradient(to right, #fb923c 0, #fb923c 4px, transparent 4px, transparent 6px)'}} />Signal</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 bg-green-400 rounded-sm opacity-70" />양 / <span className="inline-block w-3 h-2 bg-red-400 rounded-sm opacity-70 ml-1" />음</span>
      </div>
    </div>
  );
}

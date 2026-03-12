import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from "recharts";
import { format } from "date-fns";
import type { PricePoint } from "@workspace/api-client-react";

interface MaCrossChartProps {
  data: PricePoint[];
  currency: string;
  crossSignal: string;
}

function fmtPrice(v: number, currency: string) {
  if (currency === "KRW") return v.toLocaleString("ko-KR");
  return v.toFixed(2);
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass-panel p-3 rounded-lg border border-white/10 text-xs font-mono space-y-1">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="text-sky-400">종가: {fmtPrice(d.close, currency)}</p>
      <p className="text-yellow-400">MA20: {fmtPrice(d.ma20, currency)}</p>
      <p className="text-purple-400">MA60: {fmtPrice(d.ma60, currency)}</p>
      {d.isGoldenCrossPoint && (
        <p className="text-green-400 font-bold">✦ 골든크로스</p>
      )}
      {d.isDeadCrossPoint && (
        <p className="text-red-400 font-bold">✦ 데드크로스</p>
      )}
    </div>
  );
};

export function MaCrossChart({ data, currency, crossSignal }: MaCrossChartProps) {
  const chartData = data.map((d) => ({
    date: format(new Date(d.date), "MM/dd"),
    close: d.close,
    ma20: d.ma20,
    ma60: d.ma60 ?? null,
    isGoldenCrossPoint: d.isGoldenCrossPoint,
    isDeadCrossPoint: d.isDeadCrossPoint,
  }));

  const goldenPoints = chartData.filter((d) => d.isGoldenCrossPoint);
  const deadPoints = chartData.filter((d) => d.isDeadCrossPoint);

  const isBullish = crossSignal === "golden";
  const isBearish = crossSignal === "dead";

  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">이동평균선 (MA20 / MA60)</span>
        <div className="flex items-center gap-2">
          {isBullish && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
              ✦ 골든크로스 발생
            </span>
          )}
          {isBearish && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              ✦ 데드크로스 발생
            </span>
          )}
          {!isBullish && !isBearish && (
            <span className="text-[10px] font-mono text-muted-foreground/60">신호 없음</span>
          )}
        </div>
      </div>

      {/* MA values */}
      <div className="flex gap-4 mb-2 text-[11px] font-mono">
        <span className="text-yellow-400">
          MA20: {fmtPrice(chartData[chartData.length - 1]?.ma20 ?? 0, currency)}
        </span>
        {chartData[chartData.length - 1]?.ma60 && (
          <span className="text-purple-400">
            MA60: {fmtPrice(chartData[chartData.length - 1].ma60!, currency)}
          </span>
        )}
        {isBullish && (
          <span className="text-green-400 font-bold">MA20 &gt; MA60 ↑</span>
        )}
        {isBearish && (
          <span className="text-red-400 font-bold">MA20 &lt; MA60 ↓</span>
        )}
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} opacity={0.4} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickMargin={6} minTickGap={20} fontFamily="monospace" />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickFormatter={(v) => fmtPrice(v, currency)}
              width={currency === "KRW" ? 55 : 45}
              fontFamily="monospace"
            />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }} />

            {/* Price line */}
            <Line
              dataKey="close"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#38bdf8" }}
              name="종가"
            />

            {/* MA20 */}
            <Line
              dataKey="ma20"
              stroke="#facc15"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: "#facc15" }}
              name="MA20"
            />

            {/* MA60 */}
            <Line
              dataKey="ma60"
              stroke="#a78bfa"
              strokeWidth={1.5}
              strokeDasharray="5 2"
              dot={false}
              activeDot={{ r: 3, fill: "#a78bfa" }}
              name="MA60"
              connectNulls={false}
            />

            {/* Golden cross markers */}
            {goldenPoints.map((p, i) => (
              <ReferenceDot
                key={`golden-${i}`}
                x={p.date}
                y={p.ma20}
                r={8}
                fill="#4ade80"
                fillOpacity={0.85}
                stroke="#16a34a"
                strokeWidth={1.5}
                label={{ value: "G", position: "top", fontSize: 8, fill: "#4ade80", fontWeight: "bold" }}
              />
            ))}

            {/* Dead cross markers */}
            {deadPoints.map((p, i) => (
              <ReferenceDot
                key={`dead-${i}`}
                x={p.date}
                y={p.ma20}
                r={8}
                fill="#f87171"
                fillOpacity={0.85}
                stroke="#dc2626"
                strokeWidth={1.5}
                label={{ value: "D", position: "top", fontSize: 8, fill: "#f87171", fontWeight: "bold" }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-muted-foreground/70">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-sky-400" />종가</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-yellow-400" />MA20</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-purple-400" />MA60</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400/80" />G=골든
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400/80" />D=데드
        </span>
      </div>
    </div>
  );
}

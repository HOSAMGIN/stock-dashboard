import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { format } from "date-fns";
import type { PricePoint } from "@workspace/api-client-react";

interface DeviationChartProps {
  data: PricePoint[];
  symbol: string;
}

export function DeviationChart({ data, symbol }: DeviationChartProps) {
  // Format data for chart
  const chartData = data.map((d) => ({
    ...d,
    dateFormatted: format(new Date(d.date), "MM/dd"),
    isPositive: d.deviationPercent > 0
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isPos = value > 0;
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-sm text-muted-foreground mb-1 font-mono">{label}</p>
          <p className="text-sm font-semibold flex items-center gap-2">
            MA20 이격도: 
            <span className={isPos ? "text-up font-mono" : "text-down font-mono"}>
              {value > 0 ? "+" : ""}{value.toFixed(2)}%
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            종가: ${payload[0].payload.close.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickMargin={10}
            fontFamily="JetBrains Mono"
            minTickGap={20}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickFormatter={(val) => `${val}%`}
            fontFamily="JetBrains Mono"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
          <Bar dataKey="deviationPercent" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

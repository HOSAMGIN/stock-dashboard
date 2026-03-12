import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RsiGauge } from "@/components/RsiGauge";
import { DeviationChart } from "@/components/DeviationChart";
import { formatCurrency, formatPercent, formatVolume } from "@/lib/utils";
import type { StockData } from "@workspace/api-client-react";
import { ArrowUpRight, ArrowDownRight, Activity, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

interface StockCardProps {
  data: StockData;
  index: number;
}

export function StockCard({ data, index }: StockCardProps) {
  const isUp = data.changePercent > 0;
  const ChangeIcon = isUp ? ArrowUpRight : ArrowDownRight;
  
  const getRsiBadgeVariant = (signal: string) => {
    if (signal === "buy") return "success";
    if (signal === "sell") return "destructive";
    return "neutral";
  };

  const getRsiLabel = (signal: string) => {
    if (signal === "buy") return "매수 적기";
    if (signal === "sell") return "매도 검토";
    return "중립";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="glass-panel overflow-hidden border-t-2 border-t-transparent hover:border-t-primary/50 transition-all duration-300 group">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight font-mono text-foreground">{data.symbol}</h2>
                <Badge variant={getRsiBadgeVariant(data.rsiSignal)} className="ml-2 font-sans px-3">
                  {getRsiLabel(data.rsiSignal)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{data.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold">
                {formatCurrency(data.currentPrice)}
              </div>
              <div className={`flex items-center justify-end font-mono text-sm mt-1 ${isUp ? 'text-up' : 'text-down'}`}>
                <ChangeIcon className="w-4 h-4 mr-1" />
                {formatPercent(data.changePercent)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-4 bg-background/50 rounded-lg p-4 border border-white/5">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> RSI (14)
              </div>
              <div className="font-mono text-lg font-medium">{data.rsi14.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> 거래량
              </div>
              <div className="font-mono text-lg font-medium">{formatVolume(data.volume)}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-muted-foreground">RSI 지수 현황</span>
              <span className="text-xs font-mono text-muted-foreground">
                {data.rsi14 < 30 ? '과매도 (Undersold)' : data.rsi14 > 70 ? '과매수 (Overbought)' : '정상 범위'}
              </span>
            </div>
            <RsiGauge value={data.rsi14} />
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">MA20 이격도 (최근 30일)</span>
              <div className="font-mono text-sm">
                현재: <span className={data.ma20DeviationPercent > 0 ? "text-up" : "text-down"}>
                  {formatPercent(data.ma20DeviationPercent)}
                </span>
              </div>
            </div>
            <DeviationChart data={data.historicalPrices} symbol={data.symbol} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

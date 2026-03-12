import React from "react";
import { useGetStocks } from "@workspace/api-client-react";
import { StockCard } from "@/components/StockCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Clock, AlertTriangle, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Fetch data every 60 seconds
  const { data, isLoading, isError, error, isFetching } = useGetStocks({
    query: {
      refetchInterval: 60000,
      refetchOnWindowFocus: true,
    }
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <img src={`${import.meta.env.BASE_URL}images/terminal-bg.png`} alt="Terminal Background" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
        <div className="glass-panel p-8 rounded-xl max-w-md w-full border-destructive/30 relative z-10">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-xl font-mono font-bold">SYSTEM_ERROR</h2>
          </div>
          <p className="text-muted-foreground font-mono text-sm mb-4">
            Failed to connect to data feed. Retrying connection...
          </p>
          <div className="bg-background/80 p-4 rounded font-mono text-xs text-destructive overflow-auto">
            {error?.message || "Unknown API Error"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background pb-20">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/terminal-bg.png`} 
          alt="Grid Background" 
          className="w-full h-full object-cover opacity-15 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TerminalSquare className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                주식 투자 타이밍 현황판
              </h1>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow"></span>
              LIVE MARKET DATA FEED connected
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 text-sm font-mono bg-secondary/50 px-4 py-2 rounded-lg border border-white/5"
          >
            <Clock className={isFetching ? "w-4 h-4 text-primary animate-spin" : "w-4 h-4 text-muted-foreground"} />
            <span className="text-muted-foreground">LAST UPDATED:</span>
            <span className="text-foreground">
              {data?.lastUpdated ? format(new Date(data.lastUpdated), "HH:mm:ss") : "--:--:--"}
            </span>
          </motion.div>
        </header>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {data?.stocks.map((stock, index) => (
              <StockCard key={stock.symbol} data={stock} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

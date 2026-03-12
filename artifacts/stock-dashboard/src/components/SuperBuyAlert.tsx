import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, TrendingDown, AlertTriangle } from "lucide-react";

interface SuperBuyAlertProps {
  symbols: string[];
  onDismiss: () => void;
}

export function SuperBuyAlert({ symbols, onDismiss }: SuperBuyAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [symbols.join(",")]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Alert panel */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative pointer-events-auto max-w-lg w-full"
              initial={{ scale: 0.7, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Glow ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 opacity-70 blur-lg animate-pulse pointer-events-none" />

              {/* Main card */}
              <div className="relative rounded-2xl border border-green-500/60 bg-[#050d0a] overflow-hidden">
                {/* Animated scanline overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(74,222,128,0.3) 2px, rgba(74,222,128,0.3) 4px)",
                  }}
                />

                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-green-600 via-emerald-400 to-green-600" />

                <div className="p-8 text-center relative">
                  {/* Close button */}
                  <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-green-400/60 hover:text-green-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Icon */}
                  <motion.div
                    className="flex justify-center mb-4"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-green-400" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-4xl font-black tracking-tight mb-1"
                    style={{
                      background: "linear-gradient(135deg, #4ade80, #86efac, #22d3ee)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    animate={{ opacity: [0.85, 1, 0.85] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    역대급 매수 기회
                  </motion.h2>

                  {/* Subtitle */}
                  <p className="text-green-400/70 text-sm font-mono mb-6">
                    EXTREME BUY OPPORTUNITY DETECTED
                  </p>

                  {/* Condition badges */}
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-xs font-mono text-green-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      볼린저 하단 터치
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-xs font-mono text-green-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      RSI &lt; 30 (과매도)
                    </div>
                  </div>

                  {/* Symbol chips */}
                  <div className="flex justify-center gap-2 flex-wrap mb-6">
                    {symbols.map((sym) => (
                      <motion.span
                        key={sym}
                        className="inline-block bg-green-500/20 border border-green-400/50 text-green-300 font-mono font-bold text-lg px-4 py-1.5 rounded-xl"
                        animate={{ boxShadow: ["0 0 0px #4ade8080", "0 0 20px #4ade8080", "0 0 0px #4ade8080"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {sym}
                      </motion.span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-6">
                    위 종목이 <span className="text-green-400">볼린저 밴드 하단</span>을 터치하면서
                    <br />
                    <span className="text-green-400">RSI 30 미만</span>의 과매도 구간에 진입했습니다.
                    <br />
                    <span className="text-yellow-400/80 text-[10px]">※ 투자 결정은 본인의 판단 하에 신중하게 하세요.</span>
                  </p>

                  {/* Dismiss button */}
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 font-mono font-bold text-sm hover:bg-green-500/30 transition-colors"
                  >
                    확인 — 닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

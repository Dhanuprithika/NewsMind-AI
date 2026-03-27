import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Terminal } from 'lucide-react';

interface AIProcessingLogsProps {
  logs: string[];
  isDone: boolean;
}

export function AIProcessingLogs({ logs, isDone }: AIProcessingLogsProps) {
  // If no logs yet and not done, it means it's starting
  const currentLogs = logs.length > 0 ? logs : ["Initializing intelligence graph..."];

  return (
    <div className="bg-[#0b0e14] rounded-xl p-5 border border-white/5 shadow-2xl relative overflow-hidden group">
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
      
      <div className="flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#c0392b]" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 font-mono">
            Agentic_Runtime.v1
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/40" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
          <div className="w-2 h-2 rounded-full bg-green-500/40" />
        </div>
      </div>

      <div className="space-y-3 font-mono text-[13px] relative z-20 max-h-[300px] overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {currentLogs.map((log, i) => {
            const isLast = i === currentLogs.length - 1 && !isDone;
            
            return (
              <motion.div
                key={log + i}
                initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3"
              >
                {isLast ? (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className={isLast ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {log}
                    </span>
                  </div>
                  {isLast && (
                    <motion.div 
                      className="h-1 bg-amber-500/20 rounded-full w-24 overflow-hidden mt-1"
                      initial={{ width: 0 }}
                      animate={{ width: 96 }}
                    >
                      <motion.div 
                        className="h-full bg-amber-500"
                        animate={{ x: [-96, 96] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 pt-3 border-t border-white/10 mt-4"
          >
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
              Success
            </div>
            <span className="text-emerald-500/80 text-xs italic">Intelligence retrieval & orchestration complete.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AIProcessingLogsProps {
  logs: string[];
  isDone: boolean;
}

export function AIProcessingLogs({ logs, isDone }: AIProcessingLogsProps) {
  const ALL_STEPS = [
    'Understanding the article...',
    'Identifying key details...',
    'Connecting related news...',
    'Preparing summary...',
  ];

  return (
    <div className="bg-[#0d1117] rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-500 ml-1">analysis.log</span>
      </div>

      <div className="space-y-2 font-mono text-sm">
        <AnimatePresence>
          {ALL_STEPS.map((step, i) => {
            const isCompleted = i < logs.length;
            const isCurrent = i === logs.length && !isDone;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isCompleted || isCurrent ? 1 : 0.25,
                  x: 0,
                }}
                transition={{ duration: 0.3, delay: isCompleted ? i * 0.1 : 0 }}
                className="flex items-center gap-3"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                )}

                <span
                  className={
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-amber-300'
                      : 'text-gray-600'
                  }
                >
                  {isCompleted || isCurrent ? (
                    <>
                      <span className="text-gray-500">$ </span>
                      {step}
                    </>
                  ) : (
                    <span className="opacity-40">{step}</span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 pt-1 border-t border-white/10 mt-2"
          >
            <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-green-300">Analysis complete ✓</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

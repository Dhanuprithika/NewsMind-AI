import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Send, Sparkles, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useUser } from '../../hooks/UserContext';
import { askIntelligence } from '../../services/api';

const QUESTIONS = [
  'How does RBI\'s liquidity injection affect home loan rates?',
  'Which sectors benefit most from India\'s Q3 GDP growth?',
  'What does FII return signal for Indian equities in Q1 FY26?',
];

export function ExploreMore() {
  const { userType } = useUser();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activeQ, setActiveQ] = useState<number | null>(null);

  const handleAsk = async (query: string, index?: number) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);
    if (index !== undefined) setActiveQ(index);
    
    try {
      const answer = await askIntelligence(query, undefined, userType);
      setResponse(answer);
    } catch (err) {
      setResponse("I'm having trouble syncing with my knowledge core right now. Check your connection?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    setActiveQ(null);
    setInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs tracking-widest uppercase text-gray-500 font-bold">Intelligence Assistant</span>
        </div>
        {(response || isLoading) && (
          <button onClick={handleReset} className="text-gray-400 hover:text-[#c0392b] transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {!response && !isLoading && QUESTIONS.map((q, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAsk(q, i)}
            className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
              activeQ === i
                ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className="leading-snug font-medium">{q}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </motion.button>
        ))}

        {/* AI Thinking State */}
        {isLoading && (
          <div className="py-6 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#c0392b] animate-spin" />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
               Synthesizing context for {userType.toUpperCase()} POV...
            </p>
          </div>
        )}

        {/* AI Response Output */}
        {response && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50/50 border border-[#c0392b]/10 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c0392b]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c0392b]">Intelligence Perspective</span>
            </div>
            <div 
              className="text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {response}
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom question input */}
      {!response && !isLoading && (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#c0392b] focus-within:ring-2 focus-within:ring-[#c0392b]/10 transition-all">
          <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
            placeholder="Ask anything about today's news…"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={() => handleAsk(input)}
            className={`p-1 rounded-lg transition-colors ${
              input.trim() ? 'text-[#c0392b] hover:bg-red-50' : 'text-gray-300'
            }`}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {response && (
        <button 
          onClick={handleReset}
          className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#c0392b] hover:bg-red-50 rounded-lg transition-all border border-dashed border-[#c0392b]/20"
        >
          Reset Intelligence Feed
        </button>
      )}
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, ChevronRight, BookOpen, UserCheck, HelpCircle, Loader2 } from 'lucide-react';
import { getLocalizedArticle, type LocalizedNews } from '../../services/api';

interface VernacularLocalizationProps {
  articleId: string;
}

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'];

export function VernacularLocalization({ articleId }: VernacularLocalizationProps) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [localizedData, setLocalizedData] = useState<LocalizedNews | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalize = async (lang: string) => {
    setSelectedLang(lang);
    setLoading(true);
    setError(null);
    try {
      const data = await getLocalizedArticle(articleId, lang);
      setLocalizedData(data);
    } catch (err) {
      setError('Failed to fetch localization. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-gray-900 text-xl">Vernacular Briefing</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Dual-Language Intelligence</p>
          </div>
        </div>
      </div>

      {!selectedLang ? (
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLocalize(lang)}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-bold text-gray-700 transition-all group"
            >
              {lang}
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              {loading ? 'Processing...' : `${selectedLang} Edition`}
            </span>
            <button 
              onClick={() => { setSelectedLang(null); setLocalizedData(null); }}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
            >
              Change Language
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-serif text-gray-500 italic">Adapting financial narratives to {selectedLang} context...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center bg-rose-50 rounded-2xl border border-rose-100">
              <p className="text-sm text-rose-600 font-bold">{error}</p>
            </div>
          ) : localizedData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Localized Title & Summary */}
              <div>
                <h4 className="text-2xl font-serif font-bold text-gray-950 mb-4 leading-snug">
                  {localizedData.translated_title}
                </h4>
                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <p className="text-gray-800 text-sm leading-relaxed font-medium italic">
                    {localizedData.translated_summary}
                  </p>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">मुख्य समाचार (Key Points)</span>
                </div>
                <div className="space-y-3">
                  {localizedData.key_points.map((pt, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Context */}
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-amber-800 mb-3">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Local Context & Impact</span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed font-bold mb-4">
                    {localizedData.local_context}
                  </p>
                  <div className="text-xs text-amber-700/80 leading-relaxed italic">
                    <span className="font-bold underline mr-1">Impact:</span>
                    {localizedData.reader_impact}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full -mr-8 -mt-8" />
              </div>

              {/* Glossary */}
              {localizedData.glossary.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Business Glossary</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {localizedData.glossary.map((item, i) => (
                      <div key={i} className="flex items-baseline gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-black text-gray-900 shrink-0">{item.term}:</span>
                        <span className="text-xs text-gray-600 font-medium">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

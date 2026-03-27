import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  User, 
  ExternalLink,
  Save
} from 'lucide-react';
import { Container } from '../components/layout/Container';
import { getArticle, saveArticle, type Article } from '../services/api';
import { useSSE } from '../hooks/useSSE';
import { AIProcessingLogs } from '../components/ai/AIProcessingLogs';

export function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
  // Custom SSE for single article
  const decodedId = articleId ? decodeURIComponent(articleId) : '';
  const [showLogs, setShowLogs] = useState(false);
  const { logs, isDone } = useSSE('General', 'general', decodedId);

  useEffect(() => {
    if (decodedId) {
      getArticle(decodedId)
        .then(data => {
          setArticle(data);
          setIsSaved(!!data.isBookmarked);
          setLoading(false);
          
          // Trigger SSE if not processed
          if (data.is_processed !== 1) {
            setShowLogs(true);
          }
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [decodedId]);

  // Update article when SSE finishes
  useEffect(() => {
    if (isDone && decodedId) {
      getArticle(decodedId).then(setArticle);
      setTimeout(() => setShowLogs(false), 3000);
    }
  }, [isDone, decodedId]);

  const handleSave = async () => {
    if (!decodedId) return;
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    try {
      await saveArticle(decodedId);
    } catch (err) {
      console.error(err);
      setIsSaved(!nextSavedState); 
    }
  };

  if (loading) {
    return (
      <Container className="py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#c0392b] border-t-transparent rounded-full"
          />
          <p className="text-gray-500 font-serif text-sm">Synchronizing Deep Intelligence Memory...</p>
        </div>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Intelligence Archive Mismatch</h2>
        <p className="text-gray-600 mb-6">The requested report could not be retrieved from active memory.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-[#c0392b] text-white rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          Return to Dashboard
        </button>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <Container className="py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#c0392b] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Terminal</span>
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className={`p-2 rounded-full transition-all ${isSaved ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
              title={isSaved ? "Saved" : "Save Perspective"}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {showLogs && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              className="mb-10 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 rounded-full bg-[#c0392b] animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#c0392b]">
                   {isDone ? 'Report Compiled. Memory Sync in progress...' : 'Agentic Intelligence In-Progress...'}
                </h3>
              </div>
              <AIProcessingLogs logs={logs} isDone={isDone} />
              {isDone && (
                <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                  Finalizing high-fidelity briefing reveal...
                </p>
              )}
            </motion.div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="px-3 py-1 bg-[#c0392b]/10 text-[#c0392b] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#c0392b]/20">
              {article.sector || article.category || 'General'}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime || 5} min read</span>
            </div>
            {article.rank_score && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Relevance: {article.rank_score.toFixed(1)}/10</span>
              </div>
            )}
          </div>

          <h1 
            className="text-4xl md:text-6xl text-gray-950 leading-[1.05] mb-8 font-serif font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-950 font-bold text-sm leading-tight">{article.source}</p>
              <p className="text-gray-400 text-[11px] font-mono mt-0.5">INTEL_ID: {decodedId.substring(0, 15)}... · {new Date(article.timestamp || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {/* AI Brief Section */}
              {article.summary && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-12 p-8 bg-white border border-gray-100 shadow-xl rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#c0392b]" />
                  <div className="flex items-center gap-2 mb-4 text-[#c0392b]">
                    <Layers className="w-4 h-4" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Executive Intelligence Briefing</h3>
                  </div>
                  <p className="text-xl text-gray-900 leading-[1.6] font-serif font-medium">
                    {article.summary}
                  </p>
                </motion.section>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg prose-serif max-w-none text-gray-900 space-y-6"
                style={{ fontFamily: "'Source Serif 4', serif" }}
              >
                <div className="whitespace-pre-wrap leading-[1.7] text-lg text-gray-800">
                  {article.text || "Direct coverage analysis pending deep memory retrieval."}
                </div>
              </div>

              {/* Action */}
              <div className="mt-16 pt-10 border-t border-gray-100">
                <a 
                  href={article.link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#1a1a2e] text-white rounded-2xl hover:bg-[#252545] transition-all shadow-xl hover:shadow-2xl font-bold group"
                >
                  <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View Original Intelligence Stream
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              {/* Sidebar Cards */}
              <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Layers className="w-4 h-4 text-[#c0392b]" />
                  </div>
                  <h3 className="font-serif font-bold text-gray-950 text-lg">Signal Audit</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Sentiment Signal</span>
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${article.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700' : article.sentiment === 'Negative' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${article.sentiment === 'Positive' ? 'bg-emerald-500' : article.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                      {article.sentiment || 'Neutral'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Primary Domain</span>
                    <p className="text-sm text-gray-900 font-bold uppercase tracking-tight">{article.topic || 'General News'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-3">Entities Mapped</span>
                    <div className="flex flex-wrap gap-2">
                      {(article.analysis?.entities || []).map((ent: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-white hover:shadow-sm transition-all cursor-default">
                          {typeof ent === 'string' ? ent : (ent.company || ent.entity)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookmark CTA */}
              <div className="bg-[#c0392b] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-2xl mb-3 leading-tight">Secure Intelligence</h3>
                  <p className="text-white/70 text-sm mb-8 leading-relaxed">Save this reporting to your private encrypted perspective for historical cross-referencing.</p>
                  <button 
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-[#c0392b] rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {isSaved ? "Saved to Profile" : "Sync Perspective"}
                  </button>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

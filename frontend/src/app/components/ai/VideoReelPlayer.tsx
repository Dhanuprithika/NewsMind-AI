import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Video,
  X, 
  Sparkles, 
  Mic, 
  Clapperboard, 
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getReelScript, getBriefingScript, type VideoScript } from '../../services/api';
import { useUser } from '../../hooks/UserContext';

interface VideoReelPlayerProps {
  type: 'reel' | 'briefing';
  id?: string;
  compact?: boolean;
}

export function VideoReelPlayer({ type, id }: VideoReelPlayerProps) {
  const { userType, selectedField } = useUser();
  const [script, setScript] = useState<VideoScript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const isPlayingRef = useRef(false);
  const sceneIdxRef = useRef(0);
  const pexelsKey = (import.meta as any).env?.VITE_PEXELS_API_KEY || "";

  // 1. Pexels fetcher with detailed logging
  const fetchPexelsVideo = async (query: string): Promise<string> => {
    if (!pexelsKey) {
      console.warn("[VideoPlayer] Pexels API Key missing (VITE_PEXELS_API_KEY). Using fallback visuals.");
      return "";
    }
    const safeQuery = query || "business technology news";
    try {
      console.log(`[VideoPlayer] Searching Pexels for: ${safeQuery}`);
      const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(safeQuery)}&per_page=1&orientation=portrait&size=small`, {
        headers: { Authorization: pexelsKey }
      });
      if (!res.ok) {
        console.error(`[VideoPlayer] Pexels API Fail: ${res.status}`);
        return "";
      }
      const data = await res.json();
      const videoFile = data.videos?.[0]?.video_files?.find((f: any) => f.quality === 'sd' || f.quality === 'hd');
      if (videoFile) {
        console.log(`[VideoPlayer] Found Video: ${videoFile.link}`);
      } else {
        console.warn(`[VideoPlayer] No video found for: ${safeQuery}`);
      }
      return videoFile?.link || "";
    } catch (e) {
      console.error("[VideoPlayer] Pexels Error:", e);
      return "";
    }
  };

  // 2. Generate the Script & Media
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentSceneIdx(0);
    try {
      console.log("[VideoPlayer] Initiating Production for:", type, id);
      const data = type === 'reel' && id 
        ? await getReelScript(id, userType) 
        : await getBriefingScript(id || selectedField, userType);
      
      if (!data || !data.scenes) throw new Error("Invalid intelligence signal received.");
      setScript(data);
      
      const visualAssets: Record<number, string> = {};
      data.scenes.forEach((scene: any, idx: number) => {
        if (scene.visual_url) {
          visualAssets[idx] = scene.visual_url;
        } else {
          // If backend didn't fetch it, try frontend Pexels (legacy/fallback) or Unsplash
          visualAssets[idx] = `https://images.unsplash.com/photo-${1600000000000 + idx*500000}?auto=format&fit=crop&q=80&w=1080&h=1920&sig=${idx}_${scene.visual_search_prompt.replace(/\s/g, '_')}`;
        }
      });

      setVideoUrls(visualAssets);
      console.log("[VideoPlayer] All Assets Loaded:", visualAssets);
    } catch (err: any) {
      setError(err.message || "Synthesis Fail: Signal Timeout.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Playback Core
  const stopPlayback = () => {
    if (synth) synth.cancel();
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const playScene = (idx: number) => {
    if (!synth || !script) return;
    synth.cancel();

    sceneIdxRef.current = idx;
    setCurrentSceneIdx(idx);
    const scene = script.scenes[idx];
    
    // We create the utterance locally to avoid sync drift
    const utterance = new SpeechSynthesisUtterance(scene.voiceover_line);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = isMuted ? 0 : 1;
    
    const voices = synth.getVoices();
    // Prefer high quality English voices
    const newsVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Neural') || v.name.includes('David') || v.name.includes('Google'))) || voices[0];
    if (newsVoice) utterance.voice = newsVoice;

    utterance.onboundary = (e) => {
       if (e.name === 'word') {
         const word = scene.voiceover_line.substring(e.charIndex).split(" ")[0];
         setCurrentWord(word.replace(/[^a-zA-Z]/g, ""));
       }
    };

    utterance.onend = () => {
      const next = idx + 1;
      if (next < script.scenes.length && isPlayingRef.current) {
        playScene(next);
      } else {
        stopPlayback();
      }
    };

    utterance.onerror = () => stopPlayback();

    synth.speak(utterance);
    setIsPlaying(true);
    isPlayingRef.current = true;
  };

  useEffect(() => {
    return () => synth?.cancel();
  }, []);

  // 4. Component View
  if (!script && !isGenerating) {
    return (
      <div className="w-full aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden relative group">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#312e81,transparent)] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Clapperboard className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full border-4 border-zinc-950 animate-pulse" />
          </div>

          <div className="max-w-md">
            <h3 className="text-3xl font-serif font-black text-white mb-2 tracking-tight">Generate Intelligence Explainer</h3>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] leading-relaxed">
              Synthesizing Stock Cinematics & Neural Voiceover Pipeline
            </p>
          </div>

          <button 
            onClick={handleGenerate}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Produce Report
          </button>
        </div>

        {/* Decorative HUD elements */}
        <div className="absolute bottom-6 left-8 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">System Ready</span>
        </div>
        <div className="absolute bottom-6 right-8 flex items-center gap-2">
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">16:9 Landscape Optimized</span>
          <Video className="w-3 h-3 text-zinc-600" />
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full aspect-video bg-zinc-950 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
        <div className="relative">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-white font-serif text-2xl font-black tracking-tight mb-2">Synthesizing Intelligence Explainer</p>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Mapping 16:9 Landscape Assets...</p>
        </div>
      </div>
    );
  }

  const activeAsset = videoUrls[currentSceneIdx];
  const isVideo = activeAsset?.includes('.mp4') || activeAsset?.includes('pexels');

  return (
    <div className="space-y-6">
      <div className="bg-black rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col">
          {/* VISUALS SIDE - Now 16:9 Landscape */}
          <div className="aspect-video bg-zinc-900 relative overflow-hidden flex items-center justify-center">
             <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSceneIdx}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {activeAsset ? (
                    isVideo ? (
                      <video 
                        src={activeAsset} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <img src={activeAsset} className="w-full h-full object-cover" alt="visuals" />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600">
                      <Video className="w-12 h-12 opacity-20" />
                      <span className="text-[10px] uppercase font-mono tracking-widest">Asset Sync Pending...</span>
                    </div>
                  )}
                </motion.div>
             </AnimatePresence>

             {/* NEWSROOM OVERLAYS */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

             {/* HUD */}
             <div className="absolute top-6 inset-x-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1.5 bg-indigo-600 rounded-md border border-white/10 flex items-center gap-2">
                     <span className="text-[10px] font-bold text-white tracking-widest uppercase">Intelligence</span>
                   </div>
                   <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-md border border-white/5 flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
                     <span className="text-[9px] font-mono text-white/80 tracking-widest uppercase">{isPlaying ? 'TRANSMITTING' : 'STATIONARY'}</span>
                   </div>
                </div>
                <button onClick={() => { synth?.cancel(); setScript(null); }} className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white/50 transition-colors"><X className="w-4 h-4" /></button>
             </div>

             {/* LOWER THIRD CAPTION - Professional News Style */}
             <div className="absolute inset-x-0 bottom-0 z-30 p-8 pb-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSceneIdx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="max-w-2xl"
                  >
                    <div className="inline-block bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 mb-2 rounded-sm shadow-lg">
                      {script?.video_type?.replace('_', ' ') || 'NEWS UPDATE'}
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-serif font-black text-white drop-shadow-2xl leading-[1.1] tracking-tight">
                      {script?.scenes[currentSceneIdx]?.caption_text}
                    </h2>
                  </motion.div>
                </AnimatePresence>
             </div>

             {/* VIDEO CONTROLS */}
             <div className="absolute bottom-8 right-8 z-40 flex items-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button 
                   onClick={() => isPlaying ? stopPlayback() : playScene(currentSceneIdx)}
                   className="w-14 h-14 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
             </div>
          </div>

          {/* SCRIPT FEED - Now below the video or on side depending on width */}
          <div className="p-8 lg:p-10 space-y-8 bg-zinc-950 border-t border-zinc-800/50 overflow-y-auto max-h-[300px] custom-scrollbar">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-white font-mono font-bold text-[10px] uppercase tracking-[0.3em]">Operational Production Feed</h3>
               </div>
               <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {currentSceneIdx + 1} / {script?.scenes.length} Segments
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {script?.scenes.map((scene, i) => (
                <button 
                  key={i} 
                  onClick={() => playScene(i)}
                  className={`group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${i === currentSceneIdx ? 'bg-indigo-600/10 border-indigo-500/50 text-white ring-1 ring-indigo-500/20' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">Segment {i + 1}</span>
                    {i === currentSceneIdx && isPlaying && <div className="w-1 h-1 rounded-full bg-red-500" />}
                  </div>
                  <p className="text-xs leading-relaxed font-serif italic">"{scene.voiceover_line}"</p>
                  
                  {/* Progress indicator for current segment */}
                  {i === currentSceneIdx && isPlaying && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-0.5 bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: scene.duration_seconds, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/10 text-red-400 text-xs border border-red-500/20 rounded-2xl flex gap-2 items-center"><AlertTriangle className="w-4 h-4"/>{error}</div>}
    </div>
  );
}

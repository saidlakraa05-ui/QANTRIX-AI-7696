import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Share2, 
  Sparkles, 
  Film, 
  Sliders, 
  Clock, 
  Check, 
  Layers, 
  Volume2, 
  Lock, 
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { VideoProject, VideoScene, UserSession } from '../types';
import { novaVoice } from '../utils/speech';

interface VideoStudioViewProps {
  user: UserSession;
  videos: VideoProject[];
  onSaveVideo: (video: VideoProject) => void;
  onOpenSubscription: () => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  user,
  videos,
  onSaveVideo,
  onOpenSubscription,
}) => {
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [style, setStyle] = useState('سينمائي فاخر');
  const [aspect, setAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [soundtrack, setSoundtrack] = useState('موسيقى تصويرية ملحمية مع تعليق صوتي فخم');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoProject | null>(videos[0] || null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const timerRef = useRef<any>(null);

  // Auto clean audio on unmount
  useEffect(() => {
    return () => {
      novaVoice.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle video generation
  const handleGenerateVideo = async () => {
    if (!idea.trim() || isGenerating) return;

    if (user.plan === 'free' && user.videosRemaining <= 0) {
      onOpenSubscription();
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/nova/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          duration,
          style,
          aspect,
          music: soundtrack,
        }),
      });

      const data = await res.json();
      if (data.storyboard) {
        const now = new Date();
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1); // 1 month validity as requested

        const newProject: VideoProject = {
          id: `vid_${Date.now()}`,
          title: data.storyboard.title || 'مشروع Cantrix Video الجديد',
          logline: data.storyboard.logline || idea,
          idea,
          duration,
          style,
          aspect,
          scenes: data.storyboard.scenes || [],
          soundtrackAdvice: data.storyboard.soundtrackAdvice,
          creativeTip: data.storyboard.creativeTip,
          createdAt: now.toISOString(),
          expiresAt: expiry.toISOString(),
          isLocked: false,
        };

        onSaveVideo(newProject);
        setActiveVideo(newProject);
        setCurrentSceneIndex(0);
        setSceneProgress(0);
      }
    } catch (e) {
      console.error('Video generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Scene-by-scene playback simulation with voiceover reading
  useEffect(() => {
    if (!isPlaying || !activeVideo || activeVideo.scenes.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentScene = activeVideo.scenes[currentSceneIndex];
    if (currentScene && currentScene.voiceover) {
      // Speak the scene voiceover
      novaVoice.speak(currentScene.voiceover);
    }

    const sceneDurationMs = (activeVideo.duration / activeVideo.scenes.length) * 1000;
    const intervalStep = 50;

    timerRef.current = setInterval(() => {
      setSceneProgress((prev) => {
        const next = prev + (intervalStep / sceneDurationMs) * 100;
        if (next >= 100) {
          // Advance to next scene
          if (currentSceneIndex < activeVideo.scenes.length - 1) {
            setCurrentSceneIndex((idx) => idx + 1);
            return 0;
          } else {
            // Reached end of video
            setIsPlaying(false);
            novaVoice.stop();
            return 100;
          }
        }
        return next;
      });
    }, intervalStep);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, activeVideo]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      novaVoice.stop();
    } else {
      if (currentSceneIndex >= (activeVideo?.scenes.length || 0) - 1 && sceneProgress >= 100) {
        setCurrentSceneIndex(0);
        setSceneProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    novaVoice.stop();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
  };

  const handleDownloadScript = () => {
    if (!activeVideo) return;
    const content = `=== ${activeVideo.title} ===\n\nفكرة العمل: ${activeVideo.idea}\nالمدة: ${activeVideo.duration} ثوانٍ | النمط: ${activeVideo.style} | الأبعاد: ${activeVideo.aspect}\n\nالمشاهد والسيناريو الإخراجي:\n` +
      activeVideo.scenes.map((s) => `\nالمشهد ${s.sceneNumber} (${s.timeframe}):\n- الوصف البصري: ${s.visualDescription}\n- حركة الكاميرا: ${s.cameraMovement}\n- التعليق الصوتي: ${s.voiceover}\n- المؤثر الصوتي: ${s.soundEffects}\n`).join('\n') +
      `\n\nنصيحة إخراجية: ${activeVideo.creativeTip || 'لا توجد'}\nالموسيقى: ${activeVideo.soundtrackAdvice || ''}\n\nصُنع عبر استوديو Cantrix Video · Rayan`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeVideo.title.replace(/\s+/g, '_')}_Cantrix_Script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full p-3 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-indigo-500" />
            <span>استوديو Cantrix Video</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              ذكاء اصطناعي إخراجي
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            أنشئ سيناريو وإخراج فيديوهات احترافية مع مشاهد بصرية، أصوات، وأبعاد قابلة للتصدير.
          </p>
        </div>

        {user.plan === 'free' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>الفيديوهات غير محدودة لمشتركي Cantrix Pro (200 د.م)</span>
            <button
              onClick={onOpenSubscription}
              className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 mr-auto shrink-0"
            >
              ترقية
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Generator Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>إعدادات وتفاصيل الفيديو</span>
          </h2>

          {/* Idea Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              فكرة أو موضوع الفيديو:
            </label>
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثال: إعلان سينمائي فاخر لسيارة كهربائية تسير وسط جبال الأطلس المغربية مع شروق الشمس وألوان ذهبية..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              المدة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                    duration === d
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{d} ثوانٍ</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              النمط البصري:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['سينمائي', 'إعلاني', 'تعليمي', 'واقعي', 'أنيميشن', 'فاخر'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStyle(st)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                    style.includes(st)
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              أبعاد الفيديو:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '9:16', label: '9:16 عمودي', desc: 'Reels / TikTok' },
                { id: '16:9', label: '16:9 أفقي', desc: 'YouTube' },
                { id: '1:1', label: '1:1 مربع', desc: 'Instagram' },
              ].map((asp) => (
                <button
                  key={asp.id}
                  onClick={() => setAspect(asp.id as any)}
                  className={`p-2 rounded-xl text-center border transition-colors ${
                    aspect === asp.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{asp.id}</div>
                  <div className="text-[10px] opacity-80">{asp.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Soundtrack / Voice style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              الصوت والموسيقى التصويرية:
            </label>
            <input
              type="text"
              value={soundtrack}
              onChange={(e) => setSoundtrack(e.target.value)}
              placeholder="مثال: موسيقى وثائقية هادئة مع صوت رخيم وعميق..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={!idea.trim() || isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>محرك Nova يُخرج المشاهد والسيناريو...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد سيناريو وإخراج الفيديو</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Video Player & Storyboard (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {activeVideo ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between shadow-xs">
              <div>
                {/* Title & Validity Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {activeVideo.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {activeVideo.logline}
                    </p>
                  </div>

                  {/* Monthly validity reminder */}
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-500 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>متاح حتى نهاية الشهر المدفوع</span>
                  </div>
                </div>

                {/* Cinematic Player Canvas Frame */}
                <div className="flex justify-center bg-slate-950 rounded-2xl p-4 mb-4 relative overflow-hidden min-h-[280px]">
                  <div
                    className={`relative rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-2xl transition-all duration-500 ${
                      activeVideo.aspect === '9:16'
                        ? 'w-60 h-96'
                        : activeVideo.aspect === '16:9'
                        ? 'w-full max-w-md h-64'
                        : 'w-72 h-72'
                    }`}
                  >
                    {/* Real Cinematic Background Image with Ken Burns Motion Animation */}
                    {activeVideo.scenes[currentSceneIndex]?.imageUrl ? (
                      <div className="absolute inset-0 overflow-hidden">
                        <img
                          src={activeVideo.scenes[currentSceneIndex].imageUrl}
                          alt={activeVideo.scenes[currentSceneIndex].visualDescription}
                          className={`w-full h-full object-cover transition-transform duration-[4000ms] ease-out ${
                            isPlaying ? 'scale-110 translate-y-1' : 'scale-100'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />
                      </div>
                    ) : (
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(circle at center, #1e1b4b 0%, #09090b 100%)',
                        }}
                      />
                    )}

                    {/* Scene Number & Timeframe Badge */}
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white/90">
                      <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 font-bold">
                        مشهد {activeVideo.scenes[currentSceneIndex]?.sceneNumber || 1} / {activeVideo.scenes.length}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-600/90 font-bold shadow-md shadow-indigo-600/30">
                        {activeVideo.scenes[currentSceneIndex]?.timeframe || '0:00'}
                      </span>
                    </div>

                    {/* Visual Description & Cinematic Movement Badge */}
                    <div className="relative z-10 my-auto text-center px-2 animate-in fade-in duration-300">
                      <div className="inline-block px-2.5 py-1 rounded-full bg-indigo-500/30 backdrop-blur-md text-indigo-200 text-[10px] font-black mb-2 border border-indigo-400/40 shadow-sm">
                        🎥 {activeVideo.scenes[currentSceneIndex]?.cameraMovement || 'Cinematic shot'}
                      </div>
                      <p className="text-xs text-slate-100 font-bold leading-relaxed drop-shadow-lg max-w-xs mx-auto">
                        {activeVideo.scenes[currentSceneIndex]?.visualDescription}
                      </p>
                    </div>

                    {/* Subtitle / Voiceover text in real-time */}
                    <div className="relative z-10 bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-white/15 text-center shadow-xl">
                      <div className="flex items-center justify-center gap-2 text-[10px] text-amber-400 mb-0.5 font-bold">
                        <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        <span>التعليق الصوتي المسموع (Audio + Visual Sync):</span>
                        {isPlaying && (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                            <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
                            <span className="w-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
                            <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:450ms] h-1/2" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white font-extrabold leading-normal">
                        "{activeVideo.scenes[currentSceneIndex]?.voiceover}"
                      </p>
                    </div>

                    {/* Scene Progress Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-20">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-cyan-400 transition-all duration-75"
                        style={{ width: `${sceneProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل المشاهد بالصوت'}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
                      title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل المشاهد بالصوت'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <button
                      onClick={handleRestart}
                      aria-label="إعادة من المشهد الأول"
                      className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="إعادة من المشهد الأول"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-slate-500 ml-2">
                      {Math.round((currentSceneIndex / activeVideo.scenes.length) * activeVideo.duration)}s / {activeVideo.duration}s
                    </span>
                  </div>

                  {/* Actions: Download & Share */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleDownloadScript}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                      title="تحميل السيناريو والتوجيه الإخراجي كاملاً"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل السيناريو</span>
                    </button>

                    <button
                      onClick={handleShare}
                      aria-label="مشاركة المشروع"
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="مشاركة المشروع"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Storyboard Scenes List */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>تفاصيل المشاهد السينمائية ({activeVideo.scenes.length} مشاهد):</span>
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeVideo.scenes.map((scene, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentSceneIndex(idx);
                          setSceneProgress(0);
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          currentSceneIndex === idx
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                          <span>المشهد {scene.sceneNumber}</span>
                          <span className="font-mono text-[11px] text-indigo-500">{scene.timeframe}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1 leading-relaxed">
                          {scene.visualDescription}
                        </p>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          الصوت: "{scene.voiceover}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Film className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-1">
                استوديو Nova Video جاهز لإنتاج فكرتك
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                اكتب فكرة الفيديو وحدد المدة والنمط في القائمة الجانبية، وسيقوم محرك الذكاء الاصطناعي ببناء السيناريو والمشاهد فوراً.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

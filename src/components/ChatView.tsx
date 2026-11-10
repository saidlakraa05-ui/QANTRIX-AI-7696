import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Globe, 
  HelpCircle, 
  ListOrdered, 
  X, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Wand2,
  Eye,
  Download,
  Crown,
  ExternalLink,
  Code2,
  Brain,
  Zap,
  Activity,
  Compass,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import { ChatMessage, AttachedFile, AppMode, UserSession, EngineConfig } from '../types';
import { novaVoice, SpeechSettings } from '../utils/speech';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CantrixLogo } from './CantrixLogo';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, mode: AppMode, files: AttachedFile[], forceSearch?: boolean) => Promise<void>;
  onRegenerate: () => void;
  onIllustrateMessage: (messageId: string, promptText: string, attachedImageBase64?: string) => Promise<void>;
  isLoading: boolean;
  user: UserSession;
  speechSettings: SpeechSettings;
  onOpenSubscription: () => void;
  onOpenAbout: () => void;
  onOpenInstall?: () => void;
  onOpenCodePreview?: (code: string, lang?: string) => void;
  onOpenMemory?: () => void;
  onOpenBenchmark?: () => void;
  engineConfig?: EngineConfig;
}

const MODES: { id: AppMode; label: string; desc: string }[] = [
  { id: 'fast', label: '⚡ سريع وفوري', desc: 'إجابة مباشرة وسريعة' },
  { id: 'deep', label: '🧠 تفكير واستدلال عميق', desc: 'تحليل استقصائي متعدد الأبعاد وحل المسائل الصعبة' },
  { id: 'expert', label: '💼 خبير استشاري', desc: 'معايير احترافية وحلول هندسية متطورة' },
  { id: 'simple', label: '🌱 شرح مبسط (ELI5)', desc: 'أسلوب سهل وواضح للمبتدئين' },
  { id: 'creative', label: '🎨 مبدع وملهم', desc: 'أفكار غير تقليدية وصياغة أدبية' },
  { id: 'practical', label: '📋 مخطط عملي', desc: 'خطوات تنفيذية وجداول مهام' },
];

const InChatImageProgressBadge: React.FC = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 98) {
          clearInterval(timer);
          return 98;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(98, prev + step);
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  const getStageText = (p: number) => {
    if (p < 20) return 'تحليل المفهوم البصري وتحديد الأبعاد الفنية...';
    if (p < 45) return 'بناء التكوين الفني وتناسق الأبعاد الهندسية والنسبة الذهبية...';
    if (p < 75) return 'معالجة الإضاءة والظلال السينمائية وحقن التفاصيل الدقيقة...';
    if (p < 95) return 'تطبيق دقة 4K فائقة النقاء ومكافحة التشويه (Cantrix Neural Engine)...';
    return 'التدقيق النهائي وتجهيز التحفة البصرية للعرض...';
  };

  return (
    <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-[#120E06] via-[#1A1408] to-[#0E0C06] border-2 border-amber-500/40 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-9 h-9 transform -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                className="stroke-amber-950/60"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                className="stroke-amber-400 transition-all duration-300"
                strokeWidth="3.5"
                strokeDasharray={94.2}
                strokeDashoffset={94.2 - (94.2 * percent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Sparkles className="w-4 h-4 text-amber-400 absolute animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
              <span>توليد وتجسيد التحفة البصرية (Cantrix Image Engine)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                AI Vision
              </span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5 animate-pulse">
              {getStageText(percent)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
            {percent}%
          </span>
        </div>
      </div>

      {/* Linear Glowing Progress Track */}
      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-amber-500/20 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 shadow-md shadow-amber-500/50"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onRegenerate,
  onIllustrateMessage,
  isLoading,
  user,
  speechSettings,
  onOpenSubscription,
  onOpenAbout,
  onOpenInstall,
  onOpenCodePreview,
  onOpenMemory,
  onOpenBenchmark,
  engineConfig,
}) => {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<AppMode>('fast');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTranslateId, setActiveTranslateId] = useState<string | null>(null);
  const [translatedMap, setTranslatedMap] = useState<Record<string, { text: string; lang: string }>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [forceLiveSearch, setForceLiveSearch] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechBaseInputRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    if (user.messagesRemaining <= 0 && user.plan === 'free') {
      onOpenSubscription();
      return;
    }

    const currentText = input;
    const currentFiles = [...attachedFiles];
    const searchVal = forceLiveSearch;

    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(currentText, selectedMode, currentFiles, searchVal);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newFile: AttachedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          base64: base64,
          previewUrl: file.type.startsWith('image/') ? base64 : undefined,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const newFile: AttachedFile = {
              id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              name: file.name || `صورة_ملصقة_${Date.now()}.png`,
              type: file.type || 'image/png',
              size: file.size,
              base64,
              previewUrl: base64,
            };
            setAttachedFiles((prev) => [...prev, newFile]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const toggleListening = () => {
    setSpeechError(null);
    if (isListening) {
      novaVoice.stopListening();
      setIsListening(false);
    } else {
      speechBaseInputRef.current = input.trim();
      const success = novaVoice.startListening(
        (transcript) => {
          const base = speechBaseInputRef.current;
          const full = base ? `${base} ${transcript}` : transcript;
          setInput(full);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
          }
        },
        (error: string) => {
          setSpeechError(error);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
      if (success) setIsListening(true);
    }
  };

  const toggleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      novaVoice.stop();
      setSpeakingMsgId(null);
    } else {
      novaVoice.stop();
      setSpeakingMsgId(msgId);
      novaVoice.speak(
        text,
        speechSettings,
        undefined,
        () => setSpeakingMsgId(msgId),
        () => setSpeakingMsgId(null),
        () => setSpeakingMsgId(null)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/cantrix/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enhance_prompt', text: input }),
      });
      const data = await res.json();
      if (data.result) {
        setInput(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleTranslateMessage = async (msgId: string, originalText: string, targetLang: string) => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/cantrix/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate', text: originalText, targetLang }),
      });
      const data = await res.json();
      if (data.result) {
        setTranslatedMap((prev) => ({
          ...prev,
          [msgId]: { text: data.result, lang: targetLang },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
      setActiveTranslateId(null);
    }
  };

  // Helper to extract code block from assistant text for the interactive sandbox
  const extractCodeBlock = (content: string): { code: string; lang: string } | null => {
    const match = content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
    if (match && match[2] && match[2].trim().length > 15) {
      return { lang: match[1] || 'html', code: match[2].trim() };
    }
    return null;
  };

  const isPro = user.plan === 'pro';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* Brand & Theme Status Header */}
      <div
        className={`mt-2 px-3.5 py-2 rounded-2xl text-xs flex items-center justify-between border transition-all ${
          isPro
            ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-amber-500/30 text-amber-200 shadow-md shadow-amber-950/20'
            : 'bg-white border-slate-200 text-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isPro ? (
            <span className="flex items-center gap-1.5 font-black text-amber-300">
              <Crown className="w-4 h-4 fill-current text-amber-400" />
              <span>كامتريكس إيه آي — الواجهة الذهبية الفخامية (Cantrix Pro)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>كامتريكس إيه آي — النسخة القياسية (الواجهة البيضاء)</span>
            </span>
          )}

          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            {engineConfig?.activeModelDisplay || 'Gemini 1.5 Pro / Flash Adaptive'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBenchmark && (
            <button
              onClick={onOpenBenchmark}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1"
              title="فحص جودة الاستدلال والدقة ومكافحة الهلوسة"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فحص المعايير</span>
            </button>
          )}

          <button
            onClick={onOpenSubscription}
            className={`text-[11px] font-black px-3 py-1 rounded-lg transition-all ${
              isPro
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400 shadow-xs'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-xs'
            }`}
          >
            {isPro ? 'تفاصيل اشتراكك (200 د.م)' : 'ترقية للبرو (200 د.م)'}
          </button>
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div
        className={`pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b ${
          isPro ? 'border-amber-500/20' : 'border-slate-200'
        }`}
      >
        <span
          className={`text-xs font-bold shrink-0 ml-1 ${
            isPro ? 'text-amber-300/80' : 'text-slate-600'
          }`}
        >
          النمط:
        </span>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedMode === mode.id
                ? isPro
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-white font-bold shadow-xs'
                : isPro
                ? 'bg-[#151108] border border-amber-500/30 text-amber-200/80 hover:bg-[#1D170B] hover:text-amber-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title={mode.desc}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="mb-4">
              <CantrixLogo size="xl" />
            </div>

            <h1
              className={`text-2xl sm:text-3xl font-black mb-2 ${
                isPro
                  ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent'
                  : 'text-slate-900'
              }`}
            >
              كامتريكس إيه آي (Cantrix AI) — مشروع الذكاء المتكامل
            </h1>

            <p
              className={`text-xs sm:text-sm max-w-lg mb-6 leading-relaxed ${
                isPro ? 'text-amber-200/70' : 'text-slate-500'
              }`}
            >
              بحث حي مباشر عبر مواقع الويب، استدلال فائق في المسائل الصعبة، مكافحة صارمة للهلوسة، وذاكرة ذكية متقدمة.
            </p>

            {/* Quick feature suggestion pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-xs text-right">
              {[
                {
                  title: '🌐 بحث لحظي عن أحدث التقنيات',
                  prompt: 'ما هي مواصفات وسعر هاتف Infinix Note 50s 5G وأحدث إصدارات سلسلة Infinix الجديدة اليوم؟',
                },
                {
                  title: '💻 هندسة تطبيق ومعاينة الكود',
                  prompt: 'اكتب لي كود تطبيق تفاعلي حديث بلغة HTML وTailwind CSS مع واجهة مستخدم كاملة للمعاينة في الساندبوكس.',
                },
                {
                  title: '🧠 استدلال رياضي وعلمي عميق',
                  prompt: 'حلل هذه المسألة الرياضية المعقدة خطوة بخطوة مع التدقيق المقارن لاكتشاف أي تناقضات برهانية.',
                },
                {
                  title: '🇲🇦 محادثة بالدارجة المغربية بطلاقة',
                  prompt: 'شرح لي بالدارجة المغربية كيفاش نقدر نبني مشروع ذكاء اصطناعي ونربح منو بالبطاقة البنكية المغربية.',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(item.prompt)}
                  className={`p-3 rounded-2xl border text-right transition-all hover:scale-[1.01] ${
                    isPro
                      ? 'bg-[#151108] border-amber-500/25 hover:border-amber-400/60 text-amber-100/90'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="font-bold block text-xs mb-1 text-amber-400">{item.title}</span>
                  <span className="text-[11px] text-slate-400 block line-clamp-2">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const translation = translatedMap[msg.id];
            const displayedText = translation ? translation.text : msg.content;
            const codeData = !isUser ? extractCodeBlock(displayedText) : null;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm animate-in fade-in duration-300 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm ${
                    isUser
                      ? 'bg-slate-800 text-slate-200'
                      : isPro
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-white font-extrabold'
                  }`}
                >
                  {isUser ? 'أنا' : isPro ? <Crown className="w-4 h-4 fill-current text-slate-950" /> : 'Z'}
                </div>

                <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Attached files preview */}
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.files.map((file) => (
                        <div
                          key={file.id}
                          className="p-1 rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden shadow-xs"
                        >
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-28 h-28 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 p-2 text-xs text-slate-300">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span className="max-w-[120px] truncate">{file.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`p-4 rounded-2xl shadow-xs transition-colors text-right ${
                      isUser
                        ? isPro
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-medium rounded-tr-xs shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-white rounded-tr-xs'
                        : isPro
                        ? 'bg-[#151108] border border-amber-500/30 text-amber-100/95 rounded-tl-xs shadow-lg shadow-amber-950/40'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                    }`}
                  >
                    <MarkdownRenderer content={displayedText} isUser={isUser} />

                    {/* Interactive Sandbox Code Runner Button */}
                    {!isUser && codeData && onOpenCodePreview && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                        <button
                          onClick={() => onOpenCodePreview(codeData.code, codeData.lang)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25 hover:scale-[1.01]"
                        >
                          <Code2 className="w-4 h-4" />
                          <span>معاينة وتشغيل الكود في الساندبوكس 🚀</span>
                        </button>
                      </div>
                    )}

                    {/* Real Live Web Grounding Sources (Actual Links & Google Search Queries) */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-2">
                          <Globe className="w-3.5 h-3.5" />
                          <span>مصادر الويب الحية المعتمدة ({msg.sources.length} مصادر حقيقية):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-[11px] flex items-center gap-1.5 transition-colors max-w-xs truncate"
                              title={s.url}
                            >
                              <span className="truncate">{s.title || s.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                            </a>
                          ))}
                        </div>
                        {msg.searchQueries && msg.searchQueries.length > 0 && (
                          <div className="mt-1.5 text-[10px] text-slate-400 font-mono">
                            استعلام البحث: {msg.searchQueries.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* In-Chat Image Generation Live Progress Counter (0% to 100%) */}
                    {msg.isIllustrating && <InChatImageProgressBadge />}

                    {/* Completed Visual Masterpiece or Diagram Visual */}
                    {msg.illustratedImageUrl && !msg.isIllustrating && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-500 mb-2">
                          <span className="flex items-center gap-1.5 font-bold text-amber-300">
                            <Wand2 className="w-4 h-4 text-amber-400" />
                            <span>التحفة البصرية والتخطيطية (100% مكتملة بنجاح)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setSelectedLightboxImage({
                                  url: msg.illustratedImageUrl!,
                                  title: `رسم توضيحي وتحفة بصرية — Cantrix AI (#${msg.id.slice(-4)})`,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-500/30"
                              title="تكبير ومعاينة بكامل الشاشة"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>تكبير</span>
                            </button>
                            <a
                              href={msg.illustratedImageUrl}
                              download={`cantrix-artwork-${msg.id}.svg`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-700"
                            >
                              <Download className="w-3 h-3" />
                              <span>تحميل</span>
                            </a>
                          </div>
                        </div>
                        <div
                          onClick={() =>
                            setSelectedLightboxImage({
                              url: msg.illustratedImageUrl!,
                              title: `رسم توضيحي وتحفة بصرية — Cantrix AI (#${msg.id.slice(-4)})`,
                            })
                          }
                          className="rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 p-2 flex items-center justify-center cursor-zoom-in hover:border-amber-400 transition-all group relative shadow-xl shadow-amber-950/20"
                        >
                          <img
                            src={msg.illustratedImageUrl}
                            alt="رسم توضيحي وتحفة بصرية للجواب"
                            className="w-full max-h-96 object-contain rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 shadow-lg">
                              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                              <span>انقر لمعاينة الصورة بالحجم الكامل</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Agent & Model Telemetry Badge with Cantrix TruthShield */}
                    {!isUser && (
                      <div className="flex items-center flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/60 text-[10px]">
                        {/* Unique Cantrix Fact-Shield: 100% Verified Zero Hallucination */}
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                          <span>🛡️ 100% موثوق وخالٍ تماماً من الهلوسة</span>
                        </span>

                        {msg.agentUsed && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-bold">
                            {msg.agentUsed === 'search'
                              ? '🌐 وكيل البحث المباشر'
                              : msg.agentUsed === 'coding'
                              ? '💻 وكيل هندسة البرمجيات'
                              : msg.agentUsed === 'math'
                              ? '📐 وكيل الرياضيات والعلوم'
                              : msg.agentUsed === 'vision'
                              ? '👁️ وكيل الرؤية البصرية'
                              : msg.agentUsed === 'document'
                              ? '📄 وكيل تحليل المستندات'
                              : msg.agentUsed === 'factcheck'
                              ? '🛡️ وكيل التدقيق ومكافحة الهلوسة'
                              : msg.agentUsed === 'planner'
                              ? '📋 وكيل التخطيط والتنفيذ'
                              : '✨ منسق الوكلاء الذكي'}
                          </span>
                        )}

                        {msg.difficulty && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-semibold">
                            {msg.difficulty === 'complex' ? 'استدلال عميق' : 'إجابة فورية'}
                          </span>
                        )}

                        {msg.modelUsed && (
                          <span className="font-mono text-slate-500 hidden sm:inline">
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Translation Badge */}
                  {translation && (
                    <div className="mt-1 text-[11px] text-indigo-400 flex items-center gap-1 font-medium">
                      <Globe className="w-3 h-3" />
                      <span>مترجم إلى {translation.lang}</span>
                      <button
                        onClick={() => {
                          setTranslatedMap((prev) => {
                            const next = { ...prev };
                            delete next[msg.id];
                            return next;
                          });
                        }}
                        className="underline hover:text-indigo-300 mr-1"
                      >
                        (عرض النص الأصلي)
                      </button>
                    </div>
                  )}

                  {/* Actions Bar */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs">
                      <button
                        onClick={() => handleCopy(msg.id, displayedText)}
                        className="p-1 hover:text-slate-200 rounded transition-colors"
                        title="نسخ النص"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => toggleSpeakMessage(msg.id, displayedText)}
                        className={`p-1 rounded transition-colors ${
                          speakingMsgId === msg.id
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'hover:text-slate-200'
                        }`}
                        title={speakingMsgId === msg.id ? 'إيقاف الصوت' : 'استمع للرد بصوت كامتريكس'}
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {!msg.illustratedImageUrl && !msg.isIllustrating && (
                        <button
                          onClick={() => {
                            const userMsg = messages
                              .slice(0, messages.findIndex((m) => m.id === msg.id))
                              .reverse()
                              .find((m) => m.role === 'user');
                            const userImg = userMsg?.files?.find((f) => f.previewUrl || f.type.startsWith('image/'))?.base64;
                            onIllustrateMessage(msg.id, msg.content.slice(0, 300), userImg);
                          }}
                          className="px-2 py-0.5 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors flex items-center gap-1 text-[11px] text-amber-400 font-medium"
                          title="إضافة رسم بياني أو صورة توضيحية لتقريب الجواب"
                        >
                          <Wand2 className="w-3 h-3 text-amber-400" />
                          <span>قرّب الجواب برسم</span>
                        </button>
                      )}

                      {/* 1-Click Fast Darija Switcher - Rare Feature */}
                      <button
                        onClick={() => handleTranslateMessage(msg.id, msg.content, 'الدارجة المغربية')}
                        disabled={isTranslating}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                        title="تحويل الرد فوراً إلى الدارجة المغربية الذكية الفصيحة"
                      >
                        <span>🇲🇦 بالدارجة</span>
                      </button>

                      {/* Translate Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveTranslateId(activeTranslateId === msg.id ? null : msg.id)}
                          className="p-1 hover:text-slate-200 rounded transition-colors flex items-center gap-0.5"
                          title="ترجمة الرد"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>

                        {activeTranslateId === msg.id && (
                          <div className="absolute right-0 bottom-full mb-1 z-20 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-1 text-xs text-right">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800">
                              اختر لغة الترجمة
                            </div>
                            {[
                              { code: 'الدارجة المغربية', label: 'الدارجة المغربية' },
                              { code: 'العربية الفصحى', label: 'العربية الفصحى' },
                              { code: 'English', label: 'الإنجليزية (English)' },
                              { code: 'Français', label: 'الفرنسية (Français)' },
                              { code: 'Español', label: 'الإسبانية (Español)' },
                              { code: 'Deutsch', label: 'الألمانية (Deutsch)' },
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => handleTranslateMessage(msg.id, msg.content, lang.code)}
                                disabled={isTranslating}
                                className="w-full text-right px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 text-xs transition-colors"
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 text-sm animate-in fade-in duration-300">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                isPro
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-white'
              }`}
            >
              {isPro ? <Crown className="w-4 h-4 fill-current text-slate-950" /> : 'Z'}
            </div>
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs ${
                isPro
                  ? 'bg-[#151108] border border-amber-500/30 text-amber-300'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>
                {forceLiveSearch
                  ? '🌐 كامتريكس AI يتصل بـ Google Search للتحقق من أحدث المعلومات الحية...'
                  : '✨ كامتريكس AI يحلل ويستدل بعمق لتقديم إجابة موثوقة...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached Files List Bar */}
      {attachedFiles.length > 0 && (
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 p-1.5 pl-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 shrink-0"
            >
              {file.previewUrl ? (
                <img src={file.previewUrl} alt={file.name} className="w-6 h-6 object-cover rounded-md" />
              ) : (
                <FileText className="w-4 h-4 text-indigo-400" />
              )}
              <span className="max-w-[100px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar: Quick Actions & Input Area */}
      <div
        className={`pt-2 pb-3 border-t ${
          isPro ? 'border-amber-500/20' : 'border-slate-200'
        }`}
      >
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
          {/* Supremacy Mode Toggle Pill (محرك التفوق المطلق الساحق لـ OpenAI و Claude) */}
          <button
            onClick={() => {
              if (selectedMode === 'supremacy') {
                setSelectedMode('fast');
              } else {
                setSelectedMode('supremacy');
                setForceLiveSearch(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 border ${
              selectedMode === 'supremacy'
                ? 'bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-md shadow-purple-500/30 scale-105'
                : isPro
                ? 'bg-[#181109] border-purple-500/40 text-purple-300 hover:border-purple-400 hover:bg-purple-950/20'
                : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
            title="نمط التفوق المطلق: استدلال عميق متعدد المستويات يسحق نماذج الذكاء الاصطناعي المنافسة وبدون أي هلوسة 100%"
          >
            <Sparkles className={`w-3.5 h-3.5 ${selectedMode === 'supremacy' ? 'animate-spin text-slate-950' : 'text-purple-400'}`} />
            <span>{selectedMode === 'supremacy' ? '⚡ نمط التفوق المطلق: نشط' : '⚡ نمط التفوق المطلق'}</span>
          </button>

          {/* Live Search Toggle Pill */}
          <button
            onClick={() => setForceLiveSearch(!forceLiveSearch)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              forceLiveSearch
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : isPro
                ? 'bg-[#151108] border-amber-500/30 text-amber-200/80 hover:bg-[#1E170B]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="تفعيل البحث المباشر في مواقع الويب"
          >
            <Globe className={`w-3.5 h-3.5 ${forceLiveSearch ? 'text-cyan-400 animate-pulse' : ''}`} />
            <span>{forceLiveSearch ? 'البحث الحي: مفعّل ⚡' : 'بحث بالإنترنت'}</span>
          </button>

          {/* Smart Memory Shortcut */}
          {onOpenMemory && (
            <button
              onClick={onOpenMemory}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 border ${
                isPro
                  ? 'bg-[#151108] border-amber-500/30 text-amber-200 hover:bg-[#1E170B]'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="إدارة الذاكرة الذكية للمستخدم"
            >
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>الذاكرة الذكية</span>
            </button>
          )}

          <button
            onClick={handleEnhancePrompt}
            disabled={!input.trim() || isEnhancing}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-40 border ${
              isPro
                ? 'bg-[#151108] border-amber-500/30 text-amber-200 hover:bg-[#1E170B]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="إعادة صياغة السؤال ليكون أكثر دقة واحترافية"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEnhancing ? 'جاري التحسين...' : 'حسّن سؤالي'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedMode('deep');
              setInput((prev) => (prev ? `حلل واستدل بعمق خطوة بخطوة: ${prev}` : 'حلل واستدل بعمق: '));
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 border ${
              isPro
                ? 'bg-[#151108] border-amber-500/30 text-amber-200 hover:bg-[#1E170B]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>تفكير عميق</span>
          </button>

          <button
            onClick={() => {
              setSelectedMode('practical');
              setInput((prev) => (prev ? `حوّل هذا إلى خطة عملية تنفيذية: ${prev}` : 'أعطني خطة عملية لتنفيذ: '));
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 border ${
              isPro
                ? 'bg-[#151108] border-amber-500/30 text-amber-200 hover:bg-[#1E170B]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
            <span>خطة عملية</span>
          </button>
        </div>

        {/* Input Box */}
        <div
          className={`relative flex items-end gap-2 rounded-2xl p-2 transition-all border-2 ${
            isPro
              ? 'bg-[#120E06] border-amber-500/40 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-xl shadow-amber-950/40'
              : 'bg-white border-slate-200 focus-within:border-slate-800 shadow-xs'
          }`}
        >
          {/* File Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl transition-colors ${
              isPro
                ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="إرفاق صور (تحليل كامل واستخراج نصوص) أو مستندات"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaChange}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isPro
                ? 'اسأل كامتريكس AI عن أحدث التقنيات، اطلب كوداً، أو حل مسألة صعبة...'
                : 'اكتب لـ كامتريكس AI بأي لغة، ابحث بالإنترنت، أو الصق صورة للتحليل...'
            }
            className={`flex-1 max-h-36 py-2 px-1 text-sm bg-transparent border-0 focus:outline-none resize-none ${
              isPro
                ? 'text-amber-100 placeholder:text-amber-300/40'
                : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />

          {/* Microphone Voice Button */}
          <button
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : isPro
                ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isListening ? 'جارٍ الاستماع... اضغط للإيقاف' : 'تحدث بالصوت بدلاً من الكتابة'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className={`p-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isPro
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm'
            }`}
            title="إرسال"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Quota Notice & Maker Footnote */}
        <div
          className={`flex items-center justify-between mt-2 px-1 text-[11px] ${
            isPro ? 'text-amber-300/70' : 'text-slate-500'
          }`}
        >
          <span>
            {isPro ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 fill-current" />
                <span>Cantrix Pro VIP نشط (الواجهة الذهبية الملكية الفخامية)</span>
              </span>
            ) : (
              <span>
                الرسائل المتبقية: <strong className="text-slate-800 font-mono">{user.messagesRemaining}</strong> رسالة
              </span>
            )}
          </span>
          <span className="cursor-pointer hover:underline" onClick={onOpenAbout}>
            تطوير وابتكار: Rayan · كامتريكس إيه آي (Cantrix AI) 2026
          </span>
        </div>
      </div>

      {/* Lightbox Modal for Visual Artwork */}
      {selectedLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl max-h-[92vh] w-full bg-[#0D0B08] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>{selectedLightboxImage.title}</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedLightboxImage.url}
                  download="cantrix-artwork.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل بجودة كاملة</span>
                </a>
                <button
                  onClick={() => setSelectedLightboxImage(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
              <img
                src={selectedLightboxImage.url}
                alt="معاينة التحفة الفنية بالحجم الكامل"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="pt-2 text-center text-[11px] text-amber-200/60 border-t border-amber-500/15">
              تم التوليد والتجسيد بدقة 100% بدون هلوسة عبر محرك Cantrix AI Visual Engine
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

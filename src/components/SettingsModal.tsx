import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Cpu, 
  Volume2, 
  DollarSign, 
  Trash2, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Sliders,
  Globe,
  Brain,
  ShieldCheck,
  Zap,
  BarChart2
} from 'lucide-react';
import { EngineStatus, UserSession, EngineConfig } from '../types';
import { SpeechSettings, VoicePersona } from '../utils/speech';
import { PriceSettings } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineStatus: EngineStatus | null;
  onRefreshHealth: () => void;
  user: UserSession;
  speechSettings: SpeechSettings;
  onUpdateSpeechSettings: (settings: SpeechSettings) => void;
  priceSettings: PriceSettings;
  onUpdatePriceSettings: (settings: PriceSettings) => void;
  onClearAllData: () => void;
  engineConfig: EngineConfig;
  onUpdateEngineConfig: (config: EngineConfig) => void;
  onOpenBenchmark?: () => void;
  onOpenMemory?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  engineStatus,
  onRefreshHealth,
  user,
  speechSettings,
  onUpdateSpeechSettings,
  priceSettings,
  onUpdatePriceSettings,
  onClearAllData,
  engineConfig,
  onUpdateEngineConfig,
  onOpenBenchmark,
  onOpenMemory,
}) => {
  const [activeTab, setActiveTab] = useState<'engine' | 'intelligence' | 'voice' | 'pricing' | 'account'>('engine');
  const [customPrice, setCustomPrice] = useState(priceSettings.amount);
  const [customCurrency, setCustomCurrency] = useState(priceSettings.currency);
  const [customSymbol, setCustomSymbol] = useState(priceSettings.currencySymbol);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [engineFeedback, setEngineFeedback] = useState(false);

  // Local engine state
  const [selectedMode, setSelectedMode] = useState<'auto' | 'pro' | 'flash' | 'custom'>(engineConfig.mode);
  const [customModel, setCustomModel] = useState(engineConfig.customModelName || '');
  const [liveSearch, setLiveSearch] = useState(engineConfig.enableLiveSearch);
  const [deepThinking, setDeepThinking] = useState(engineConfig.deepThinking);
  const [strictFacts, setStrictFacts] = useState(engineConfig.strictFactChecking);

  useEffect(() => {
    setSelectedMode(engineConfig.mode);
    setCustomModel(engineConfig.customModelName || '');
    setLiveSearch(engineConfig.enableLiveSearch);
    setDeepThinking(engineConfig.deepThinking);
    setStrictFacts(engineConfig.strictFactChecking);
  }, [engineConfig]);

  if (!isOpen) return null;

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePriceSettings({
      ...priceSettings,
      amount: Number(customPrice),
      currency: customCurrency,
      currencySymbol: customSymbol,
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleSaveEngineSettings = async () => {
    const updated: EngineConfig = {
      ...engineConfig,
      mode: selectedMode,
      customModelName: customModel.trim(),
      enableLiveSearch: liveSearch,
      deepThinking,
      strictFactChecking: strictFacts,
      activeModelDisplay:
        selectedMode === 'auto'
          ? 'الذكي التلقائي (Gemini 1.5 Pro / Flash Adaptive)'
          : selectedMode === 'pro'
          ? 'Gemini Pro / Argon (استدلال متقدم)'
          : selectedMode === 'flash'
          ? 'Gemini Flash (الاستجابة الفائقة)'
          : `مخصص: ${customModel || 'Gemini'}`,
    };

    onUpdateEngineConfig(updated);

    try {
      await fetch('/api/cantrix/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineMode: selectedMode,
          customModelName: customModel.trim(),
          enableLiveSearch: liveSearch,
          deepThinking,
          strictFactChecking: strictFacts,
        }),
      });
    } catch (e) {
      console.warn('Failed to post engine config to server:', e);
    }

    setEngineFeedback(true);
    setTimeout(() => setEngineFeedback(false), 2000);
    onRefreshHealth();
  };

  const isEngineOnline = engineStatus?.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative text-right flex flex-col max-h-[92vh]">
        <button
          onClick={onClose}
          aria-label="إغلاق الإعدادات"
          className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <span>إعدادات كامتريكس إيه آي (Cantrix AI) والمحرك</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            التحكم الديناميكي بالمحركات، البحث المباشر، الذاكرة، والتسعير دون إعادة بناء التطبيق
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold overflow-x-auto gap-1">
          {[
            { id: 'engine', label: 'المحرك والنماذج', icon: Cpu },
            { id: 'intelligence', label: 'الذكاء والبحث الحي', icon: Brain },
            { id: 'voice', label: 'إعدادات الصوت', icon: Volume2 },
            { id: 'pricing', label: 'الاشتراك والتسعير', icon: DollarSign },
            { id: 'account', label: 'الحساب والأمان', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {/* Tab 1: Engine & Model Switching */}
          {activeTab === 'engine' && (
            <div className="space-y-4 text-xs">
              {/* Online status badge */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isEngineOnline
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-800 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isEngineOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <span className="font-bold block text-sm">
                      {isEngineOnline ? 'محرك كامتريكس AI متصل وجاهز' : 'محرك كامتريكس AI غير متصل'}
                    </span>
                    <span className="text-[11px] opacity-80 font-mono">
                      النموذج النشط: {engineStatus?.model || 'gemini-2.5-flash'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onRefreshHealth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="تحديث الحالة"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Engine Selector */}
              <div>
                <label className="block font-bold text-slate-200 mb-2">
                  اختر استراتيجية المحرك (بدون إعادة بناء التطبيق):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'auto',
                      title: '⚡ الذكي التلقائي (Auto Adaptive)',
                      desc: 'يحلل صعوبة السؤال: المسائل الصعبة تذهب لـ Pro/Argon والأسئلة السريعة لـ Flash.',
                    },
                    {
                      id: 'pro',
                      title: '🧠 Gemini 1.5 Pro / Argon',
                      desc: 'تفضيل المحرك الأقوى في التفكير العميق والاستدلال وحل المسائل البرمجية المعقدة.',
                    },
                    {
                      id: 'flash',
                      title: '🚀 Gemini Flash الفائق',
                      desc: 'استجابة فائقة السرعة مع كفاءة قصوى في البحث المباشر والمهام اليومية.',
                    },
                    {
                      id: 'custom',
                      title: '⚙️ محرك مخصص (Custom Model)',
                      desc: 'أدخل أي معرف نموذج مستقبلي لـ Gemini دون الحاجة لتحديث الكود.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMode(item.id as any)}
                      className={`p-3 rounded-2xl text-right border transition-all ${
                        selectedMode === item.id
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold block text-xs text-amber-400 mb-1">{item.title}</span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Model Input if 'custom' is picked */}
              {selectedMode === 'custom' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1.5 animate-in fade-in">
                  <label className="block font-bold text-amber-400">
                    معرّف النموذج المخصص (Model Identifier):
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. gemini-2.5-flash-preview or gemini-1.5-pro"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 dir-ltr text-left"
                  />
                  <p className="text-[10px] text-slate-500">
                    سيقوم الخادم بمحاولة الاتصال بالنموذج المدخل أولاً، ثم الانتقال للفال باك التلقائي عند أي عطل.
                  </p>
                </div>
              )}

              {/* Action Buttons for Engine */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveEngineSettings}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {engineFeedback ? <Check className="w-4 h-4 text-emerald-950" /> : <Zap className="w-4 h-4" />}
                  <span>{engineFeedback ? 'تم حفظ وتفعيل المحرك بنجاح' : 'تطبيق إعدادات المحرك فوراً'}</span>
                </button>

                {onOpenBenchmark && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBenchmark();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>فحص المعايير</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Intelligence, Live Web Search & Anti-Hallucination */}
          {activeTab === 'intelligence' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span>البحث المباشر عبر مواقع الويب (Google Search Grounding)</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      تحديث المعلومات في الوقت الحقيقي لكل ثانية، جلب أحدث الأجهزة والتكنولوجيات مع روابط المصادر الحقيقية.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveSearch}
                    onChange={(e) => setLiveSearch(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <span>الاستدلال المتقدم ومراجعة الإجابة (Deep Thinking)</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      تفكيك الأسئلة متعددة الخطوات، اكتشاف التناقضات، ومراجعة النتيجة ذاتياً قبل إرسالها.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={deepThinking}
                    onChange={(e) => setDeepThinking(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>مكافحة الهلوسة الصارمة والدقة الحسابية</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      عدم اختراع إجابات أو مراجع، والاعتراف بعدم اليقين عند غياب المعلومات.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictFacts}
                    onChange={(e) => setStrictFacts(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Memory Access Shortcut */}
              {onOpenMemory && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300">الذاكرة الذكية المتقدمة</span>
                    <p className="text-[11px] text-slate-400">
                      إدارة الحقائق والمعلومات التي يسمح المستخدم بحفظها وسياق المشاريع.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMemory();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
                  >
                    فتح الذاكرة
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveEngineSettings}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
              >
                {engineFeedback ? 'تم الحفظ' : 'حفظ إعدادات الذكاء'}
              </button>
            </div>
          )}

          {/* Tab 3: Voice Settings */}
          {activeTab === 'voice' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  النبرة الصوتية الافتراضية:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'صوت امرأة واثق' },
                    { id: 'male', label: 'صوت رجل عميق' },
                    { id: 'calm', label: 'صوت هادئ ومريح' },
                    { id: 'energetic', label: 'صوت حماسي' },
                    { id: 'narrative', label: 'صوت سردي وثائقي' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        onUpdateSpeechSettings({
                          ...speechSettings,
                          persona: item.id as VoicePersona,
                        })
                      }
                      className={`p-2.5 rounded-xl text-center border transition-colors ${
                        speechSettings.persona === item.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  سرعة القراءة الافتراضية:
                </label>
                <div className="flex items-center gap-2">
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() =>
                        onUpdateSpeechSettings({
                          ...speechSettings,
                          rate: speed,
                        })
                      }
                      className={`flex-1 py-2 rounded-xl text-center font-mono font-bold border transition-colors ${
                        speechSettings.rate === speed
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Pricing Settings */}
          {activeTab === 'pricing' && (
            <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                تخصيص قيمة الاشتراك الشهري لباقة Cantrix Pro VIP المعتمدة (الافتراضي 200 درهم مغربي لكافة البطاقات البنكية والتحويلات).
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">المبلغ:</label>
                  <input
                    type="number"
                    min={1}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رمز العملة:</label>
                  <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder="د.م"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">رمز ISO:</label>
                  <input
                    type="text"
                    value={customCurrency}
                    onChange={(e) => setCustomCurrency(e.target.value)}
                    placeholder="MAD"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {saveFeedback ? <Check className="w-4 h-4 text-emerald-950" /> : null}
                <span>{saveFeedback ? 'تم حفظ إعدادات التسعير' : 'حفظ تعديلات السعر'}</span>
              </button>
            </form>
          )}

          {/* Tab 5: Account & Privacy */}
          {activeTab === 'account' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">الاسم:</span>
                  <span className="font-semibold text-slate-200">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">البريد الإلكتروني:</span>
                  <span className="font-mono text-slate-200">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">نوع الباقة:</span>
                  <span className="font-bold text-amber-400 uppercase">{user.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المطور وصانع المنصة:</span>
                  <span className="font-bold text-amber-400">Rayan</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-rose-400 mb-1">منطقة الخطر:</h4>
                <p className="text-slate-400 mb-3 text-[11px]">
                  حذف كافة المحادثات والذكريات المحفوظة واستعادة إعدادات المصنع للتطبيق.
                </p>

                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف جميع بياناتك ومحادثاتك نهائياً؟')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الحساب والبيانات بالكامل</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

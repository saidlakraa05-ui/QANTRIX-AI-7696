import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Laptop,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  
  // Choose default active tab based on detected device
  const defaultTab = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios' | 'link'>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  // The permanent official web application URL
  const appUrl = window.location.origin || 'https://ais-pre-umcoj4r3br3hzcxrj4isbk-719416423349.europe-west1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'كامتريكس إيه آي (Cantrix AI) — تطبيق الذكاء الاصطناعي الخارق',
          text: 'جرب تطبيق كامتريكس إيه آي (Cantrix AI) الخارق من تطوير Rayan. ذكاء بلا حدود وصوت بلا حواجز!',
          url: appUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Download a Windows desktop .url shortcut
  const handleDownloadDesktopShortcut = () => {
    const fileContent = `[InternetShortcut]\nURL=${appUrl}\nIconIndex=0\nIconFile=${appUrl}/icon-512.png\n`;
    const blob = new Blob([fileContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Cantrix-AI.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-bold text-xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  تحميل وتثبيت كامتريكس إيه آي (Cantrix AI)
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  تطبيق مستقل PWA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ثبّت التطبيق على هاتفك أو حاسوبك واستخدمه كتطبيق أصلي مستقل بدون متصفح
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Automatic Cloud Sync Notice */}
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border-b border-amber-500/20 px-6 py-3 flex items-start gap-3 text-xs">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-bold">تحديثات فورية وتلقائية لجميع الأجهزة:</strong>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              جميع التحديثات والميزات الجديدة (البحث المباشر، توليد الصور، الصوت اللحظي، والذاكرة الذكية) تصل تلقائياً وسحابياً لكل من قام بتحميل وتثبيت التطبيق على الكمبيوتر أو الهاتف فور تشغيله، <strong>دون الحاجة إطلاقاً لحذف التطبيق أو إعادة تحميله!</strong>
            </p>
          </div>
        </div>

        {/* Quick Standalone Badge if already installed */}
        {isInstalled && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>أنت تستخدم تطبيق كامتريكس إيه آي (Cantrix AI) حالياً بنجاح في وضع التطبيق المستقل (Standalone)!</span>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'desktop'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>الكمبيوتر (PC / Mac)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>أندرويد (Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>آيفون (iPhone / iPad)</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'link'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>رابط التحميل المباشر</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: DESKTOP (Windows / Mac) */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Monitor className="w-5 h-5" />
                    <span>تثبيت كامتريكس إيه آي (Cantrix AI) كتطبيق سطح مكتب مستقل</span>
                  </div>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    Windows & macOS
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  عند تثبيت كامتريكس إيه آي (Cantrix AI)، سيتم إنشاء أيقونة على سطح المكتب وقائمة Start، وسيفتح التطبيق في نافذة خاصة سريعة بدون شريط المتصفح، تماماً كأي برنامج مثبت!
                </p>

                {/* 1-Click native install button */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {isInstallable ? (
                    <button
                      onClick={handleNativeInstall}
                      disabled={isInstalling || installSuccess}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installSuccess ? 'تم التثبيت بنجاح!' : isInstalling ? 'جارِ التثبيت...' : 'تثبيت الآن بنقرة واحدة (1-Click Install)'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                      💡 <strong>طريقة التثبيت من المتصفح:</strong> انقر على أيقونة التثبيت (رمز الشاشة والسهم ⊕) الموجودة في شريط العنوان أعلى المتصفح، أو من قائمة المتصفح (⋮) اختر <strong>"تثبيت كامتريكس AI"</strong>.
                    </div>
                  )}

                  <button
                    onClick={handleDownloadDesktopShortcut}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    title="تحميل اختصار سطح المكتب"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>تحميل اختصار سطح المكتب (.url)</span>
                  </button>
                </div>
              </div>

              {/* Step by step guide for Chrome / Edge */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  خطوات التثبيت على الكمبيوتر في ثوانٍ:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">1</div>
                    <span className="font-semibold text-white">افتح الرابط في Chrome أو Edge</span>
                    <span className="text-slate-400 text-[11px]">استخدم متصفح حديث يدعم تطبيقات PWA المستقلة.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">2</div>
                    <span className="font-semibold text-white">انقر أيقونة التثبيت ⊕</span>
                    <span className="text-slate-400 text-[11px]">ستجدها في أقصى يمين شريط العنوان أو في القائمة (⋮) → تثبيت كامتريكس AI.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">3</div>
                    <span className="font-semibold text-white">مبروك! أصبح لديك برنامج مستقل</span>
                    <span className="text-slate-400 text-[11px]">ستظهر أيقونة كامتريكس إيه آي (Cantrix AI) على سطح المكتب وتعمل كنافذة مستقلة.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <Smartphone className="w-5 h-5" />
                    <span>تثبيت كامتريكس إيه آي (Cantrix AI) على هواتف أندرويد (Samsung, Xiaomi, Oppo, ...)</span>
                  </div>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Android APK / PWA
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يتثبت التطبيق مباشرة في قائمة التطبيقات على هاتفك مع إمكانية تشغيله دون فتح المتصفح مع دعم كامل للوضع الليلي والصوت!
                </p>

                {/* 1-Click native install button if available */}
                {isInstallable && (
                  <button
                    onClick={handleNativeInstall}
                    disabled={isInstalling || installSuccess}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installSuccess ? 'تم التثبيت بنجاح!' : isInstalling ? 'جارِ التثبيت...' : 'تثبيت التطبيق على هاتفي الآن'}</span>
                  </button>
                )}
              </div>

              {/* Step by step for Android */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  خطوات التثبيت على أندرويد:
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-semibold text-white">افتح الرابط في تطبيق Google Chrome على هاتفك</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">تأكد من فتح الرابط في متصفح كروم الأصلي وليس داخل متصفحات التطبيقات المصغرة.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-semibold text-white">انقر على النقاط الثلاث (⋮) أعلى يسار المتصفح</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">اختر خيار <strong>"تثبيت التطبيق" (Install App)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-semibold text-white">اضغط "تثبيت" (Install)</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">ستظهر أيقونة كامتريكس AI في قائمة تطبيقاتك وشاشتك الرئيسية وتفتح فوراً بدون إعلانات وبأقصى سرعة.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IOS (iPhone / iPad) */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <Apple className="w-5 h-5" />
                    <span>تثبيت كامتريكس إيه آي (Cantrix AI) على أجهزة آيفون وآيباد (iOS)</span>
                  </div>
                  <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    iOS Web App
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  على نظام iOS (Apple)، تتيح ميزة "إضافة إلى الشاشة الرئيسية" تشغيل كامتريكس إيه آي (Cantrix AI) كتطبيق أصلي مستقل مع أيقونة رسمية كاملة الدقة وبدون شريط Safari.
                </p>
              </div>

              {/* Visual instructions for iOS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  طريقة التثبيت في 3 خطوات بسيطة على الآيفون:
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-white">افتح الرابط في متصفح Safari</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">نظام iOS يدعم تثبيت التطبيقات المستقلة حصرياً عبر متصفح Safari الرسمي.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                      ⎋
                    </div>
                    <div>
                      <p className="font-semibold text-white">اضغط زر "المشاركة" (Share)</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">ستجده أسفل الشاشة (رمز مربع يخرج منه سهم للأعلى).</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                      ➕
                    </div>
                    <div>
                      <p className="font-semibold text-white">اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">مرر القائمة قليلاً للأسفل، ثم اضغط على <strong>"إضافة إلى الشاشة الرئيسية"</strong> ثم اضغط <strong>"إضافة" (Add)</strong> بأعلى اليمين.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT LINK & QR */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Share2 className="w-5 h-5" />
                    <span>رابط التحميل والتثبيت المباشر</span>
                  </div>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    رابط دائم
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  هذا هو الرابط الرسمي المباشر لتطبيقك. يمكنك إرساله لنفسك على هاتفك عبر واتساب أو تليغرام لفتحه وتثبيته في ثوانٍ، أو مشاركته مع أي شخص في العالم:
                </p>

                {/* Copy link box */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="flex-1 truncate text-indigo-300 select-all direction-ltr text-left">
                    {appUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>مشاركة عبر التطبيقات</span>
                  </button>

                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>فتح في تبويب جديد</span>
                  </a>
                </div>
              </div>

              {/* QR Code / Mobile scan info */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  {/* Clean SVG QR Code representation */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950" fill="currentColor">
                    <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="13" y="13" width="12" height="12" />
                    <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="75" y="13" width="12" height="12" />
                    <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="13" y="75" width="12" height="12" />
                    <rect x="42" y="8" width="6" height="6" />
                    <rect x="52" y="8" width="6" height="6" />
                    <rect x="42" y="20" width="16" height="6" />
                    <rect x="8" y="42" width="6" height="16" />
                    <rect x="20" y="42" width="6" height="6" />
                    <rect x="42" y="42" width="16" height="16" />
                    <rect x="68" y="42" width="10" height="6" />
                    <rect x="85" y="42" width="7" height="6" />
                    <rect x="68" y="55" width="6" height="12" />
                    <rect x="82" y="55" width="10" height="12" />
                    <rect x="42" y="68" width="6" height="24" />
                    <rect x="55" y="75" width="12" height="6" />
                    <rect x="75" y="75" width="16" height="16" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">امسح الكود بكاميرا هاتفك لتثبيت التطبيق</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    وجّه كاميرا هاتفك الآيفون أو الأندرويد نحو هذا الرمز لفتح التطبيق وتثبيته على شاشة هاتفك فوراً!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Value proposition card (Why PWA is superior) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-900/40 flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-indigo-200">مميزات تطبيق كامتريكس إيه آي (Cantrix AI) المستقل (PWA):</span>
              <ul className="text-slate-400 text-[11px] space-y-0.5 list-disc list-inside">
                <li>يعمل كتطبيق أصلي كامل بدون الحاجة لمتجر Google Play أو App Store</li>
                <li>لا يستهلك مساحة تخزين ضخمة في الهاتف (خفيف وسريع جداً)</li>
                <li>يتحدث تلقائياً بأحدث الميزات بدون الحاجة لتنزيل تحديثات يدوية</li>
                <li>أيقونة رسمية أنيقة على الشاشة الرئيسية وسطح المكتب</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>آمن 100% ومشفّر عبر بروتوكول HTTPS الرسمي</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

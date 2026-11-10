import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  Moon, 
  Sun, 
  Crown, 
  Menu, 
  Activity, 
  Download,
  Volume2,
  ShieldAlert,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { UserSession, EngineStatus } from '../types';
import { CantrixLogo } from './CantrixLogo';

interface TopBarProps {
  currentTab: string;
  user: UserSession;
  engineStatus: EngineStatus | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLiveVoice: () => void;
  onOpenSubscription: () => void;
  onOpenMySubscription?: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenInstall: () => void;
  onOpenAdmin?: () => void;
  onTriggerAdminPasscode?: () => void;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  engineStatus,
  darkMode,
  onToggleDarkMode,
  onOpenLiveVoice,
  onOpenSubscription,
  onOpenMySubscription,
  onOpenSettings,
  onOpenAbout,
  onOpenInstall,
  onOpenAdmin,
  onTriggerAdminPasscode,
  onToggleSidebar,
}) => {
  const isEngineOnline = engineStatus?.status === 'connected';
  const isPro = user.plan === 'pro';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [lastLogoClickTime, setLastLogoClickTime] = useState(0);

  const handleLogoMultiClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTime < 2500) {
      const newCount = logoClickCount + 1;
      setLogoClickCount(newCount);
      if (newCount >= 5) {
        setLogoClickCount(0);
        if (onTriggerAdminPasscode) {
          onTriggerAdminPasscode();
        }
        return;
      }
    } else {
      setLogoClickCount(1);
    }
    setLastLogoClickTime(now);
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('Cache purge error:', e);
    }
    window.location.href = window.location.origin + '?cloud_update=' + Date.now();
  };

  return (
    <header
      className={`h-16 px-3 sm:px-6 border-b flex items-center justify-between gap-3 sticky top-0 z-30 transition-colors duration-300 ${
        isPro
          ? 'bg-[#0E0C07]/95 border-amber-500/30 text-amber-100 backdrop-blur-md shadow-md shadow-amber-950/20'
          : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md shadow-xs'
      }`}
    >
      {/* Zone 1: Sidebar Toggle & Cantrix Brand Wordmark */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors focus:outline-none md:hidden ${
            isPro
              ? 'text-amber-300 hover:bg-amber-500/10'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          className="flex items-center gap-2 cursor-pointer select-none relative group" 
          onClick={handleLogoMultiClick} 
          title="Cantrix AI · انقر 5 مرات متتالية"
        >
          <CantrixLogo size="md" showText={true} />
          {logoClickCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black animate-bounce shadow-xs">
              {logoClickCount}/5
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Engine Status & Fast Voice Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine status pill */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors border ${
            isPro
              ? isEngineOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
              : isEngineOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={engineStatus?.message || 'حالة محرك كامتريكس AI'}
        >
          <span className={`w-2 h-2 rounded-full ${isEngineOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline">{isEngineOnline ? 'المحرك متصل' : 'تنبيه'}</span>
          <Activity className="w-3.5 h-3.5 opacity-70" />
        </button>

        {/* Live Voice mode trigger */}
        <button
          onClick={onOpenLiveVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isPro
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden xs:inline">تحدث صوتياً</span>
        </button>
      </div>

      {/* Zone 3: Actions & Subscription Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Install / Download Standalone App button */}
        <button
          onClick={onOpenInstall}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border ${
            isPro
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
          title="تحميل وتثبيت التطبيق على الهاتف والكمبيوتر (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">تحميل التطبيق</span>
        </button>

        {/* Admin Console Shortcut for Rayan */}
        {onOpenAdmin && user.isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
            title="لوحة الإدارة والتحكم الخارقة الخاصة بالمطور والمالك Rayan"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="hidden sm:inline">لوحة الأدمن (Master)</span>
          </button>
        )}

        {/* My Subscription Portal Button */}
        {onOpenMySubscription && (
          <button
            onClick={onOpenMySubscription}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isPro
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
            title="صفحة اشتراكي واستعادة المشتريات (My Subscription)"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">اشتراكي</span>
          </button>
        )}

        {/* Plan status & Upgrade Badge */}
        {isPro ? (
          <button
            onClick={onOpenSubscription}
            aria-label="حالة اشتراك Cantrix Pro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-400 transition-all"
            title="باقة Cantrix Pro نشطة"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>VIP نشط</span>
          </button>
        ) : (
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-sm transition-all"
            title="الترقية إلى Cantrix Pro VIP (200 درهم مغربي)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ترقية بـ 200 د.م</span>
          </button>
        )}

        {/* Quick Theme Switcher Button */}
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-lg transition-colors border ${
            isPro
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          aria-label="تبديل الواجهة"
          title={isPro ? 'التبديل إلى الواجهة البيضاء العادية' : 'التبديل إلى الواجهة الذهبية الفخامية (Cantrix Pro)'}
        >
          {isPro ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Crown className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Force Cloud Sync / Refresh Button */}
        <button
          onClick={handleForceRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg transition-colors border ${
            isPro
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          aria-label="تحديث التطبيق فوراً"
          title="تحديث التطبيق وسحب أحدث الميزات من السحابة فوراً (تفريغ الكاش القديم)"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
};

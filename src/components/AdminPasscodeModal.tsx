import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, X } from 'lucide-react';
import { CantrixLogo } from './CantrixLogo';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const validMasterCodes = [
    'ريان 2014',
    'ريان2014',
    'rayan 2014',
    'rayan2014',
    'rayan_master_2026',
    'rayan2026',
    '2014',
  ];

  const validFriendCodes = [
    'rayan_friend_2026',
    'friend2026',
    'صديق ريان',
    'صديق العمر',
  ];

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = code.trim().toLowerCase();
    const isMasterMatch = validMasterCodes.some((vc) => vc.toLowerCase() === clean);
    const isFriendMatch = validFriendCodes.some((vc) => vc.toLowerCase() === clean);

    if (isMasterMatch) {
      localStorage.setItem('cantrix_admin_unlocked', 'true');
      localStorage.setItem('cantrix_admin_role', 'master_owner');
      setError(false);
      onSuccess();
      onClose();
    } else if (isFriendMatch) {
      localStorage.setItem('cantrix_admin_unlocked', 'true');
      localStorage.setItem('cantrix_admin_role', 'co_admin');
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0D0B08] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/20 text-right font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Cybernetic Logo */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative">
            <CantrixLogo size="lg" showText={false} />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-200 tracking-wide flex items-center justify-center gap-2">
              <span>بوابة الأدمن والمفوضين (Master Key)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Rayan & Co-Admin
              </span>
            </h2>
            <p className="text-xs text-amber-200/70 mt-1 max-w-xs mx-auto">
              أهلاً بك! استخدم كود المطور Rayan أو كود تفويض صديق العمر لدخول لوحة التحكم المتقدمة.
            </p>
          </div>
        </div>

        {/* Secure Clearance Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
          <div className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام المصادقة والتشفير الإداري</span>
          </div>
          <p className="text-[11px] text-amber-200/70">
            أدخل كود المرور السري المخصص لك كمطور أو مفوض معتمد للوصول إلى لوحة التحكم.
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-200/90 mb-1.5">
              رمز المرور الإداري المشفر (Passcode):
            </label>
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل رمز المرور السري..."
                className={`w-full py-3 px-10 rounded-2xl bg-slate-950/80 border text-center font-mono text-sm tracking-widest text-amber-100 placeholder:text-slate-600 focus:outline-none transition-all ${
                  error
                    ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'border-amber-500/40 focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20'
                }`}
              />
              <Lock className="w-4 h-4 text-amber-400/60 absolute right-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute left-3.5 top-3.5 text-slate-400 hover:text-amber-300 text-xs transition-colors"
                title={showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
              >
                {showCode ? 'إخفاء' : 'عرض'}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-400 font-bold mt-2 text-center animate-in shake">
                رمز المرور غير صحيح! يرجى التأكد من الرمز والمحاولة مرة أخرى.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>التحقق والدخول للوحة التحكم</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-amber-500/20 text-center text-[10px] text-amber-200/50">
          Cantrix AI Quantum Architecture · محمية بنظام تشفير عالي الكفاءة © المطور Rayan
        </div>
      </div>
    </div>
  );
};

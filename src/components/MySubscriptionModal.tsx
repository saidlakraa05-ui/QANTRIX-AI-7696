import React, { useState, useEffect } from 'react';
import {
  Crown,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { UserSession, UserSubscriptionDetails } from '../types';
import { storage } from '../utils/storage';

interface MySubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession;
  onUpdateUser: (updated: UserSession) => void;
  onOpenUpgrade: () => void;
}

export const MySubscriptionModal: React.FC<MySubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenUpgrade,
}) => {
  const [subDetails, setSubDetails] = useState<UserSubscriptionDetails>(() => storage.getSubscriptionDetails());
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubDetails(storage.getSubscriptionDetails());
      setRestoreMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPro = user.plan === 'pro';

  // Calculate days remaining if active
  let daysRemaining = 30;
  if (user.subscriptionRenewalDate) {
    const diff = new Date(user.subscriptionRenewalDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Restore Purchases Handler: Server-side check
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setRestoreMessage(null);

    try {
      const res = await storage.restorePurchases(user.email, user.id);
      setIsRestoring(false);

      if (res.hasActivePro && res.subscription) {
        setRestoreSuccess(true);
        setRestoreMessage(res.message || 'تم العثور على اشتراكك المؤكد وتفعيله بنجاح!');

        const updated: UserSession = {
          ...user,
          plan: 'pro',
          messagesRemaining: 99999,
          maxMessages: 99999,
          videosRemaining: 99,
          maxVideos: 99,
          subscriptionRenewalDate: res.subscription.expiryDate,
        };

        storage.saveSubscriptionDetails({
          plan: 'pro',
          amountMAD: 200,
          startDate: res.subscription.startDate,
          expiryDate: res.subscription.expiryDate,
          orderId: res.subscription.orderId,
          transferReference: res.subscription.transferReference,
        });

        onUpdateUser(updated);
      } else {
        setRestoreSuccess(false);
        setRestoreMessage(res.message || 'لم يتم العثور على أي تحويل بنكي مؤكد مرتبط بهذا البريد الإلكتروني.');
      }
    } catch {
      setIsRestoring(false);
      setRestoreSuccess(false);
      setRestoreMessage('حدث خطأ أثناء الاتصال بالخادم السحابي. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-[#100D06] border-2 border-amber-500/40 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative text-amber-50 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-xl text-amber-400/70 hover:text-white hover:bg-amber-500/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
              <span>صفحة اشتراكي (My Subscription)</span>
              {isPro && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  نشط ومؤكد
                </span>
              )}
            </h2>
            <p className="text-xs text-amber-200/70 mt-0.5">
              متابعة حالة اشتراكك، تاريخ التجديد، واستعادة المدفوعات السابقة.
            </p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#181309] border border-amber-500/30 space-y-4 mb-5">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div>
              <span className="text-xs text-amber-400/80 block font-medium">الباقة الحالية:</span>
              <span className="text-lg font-black text-amber-100 flex items-center gap-1.5 mt-0.5">
                <Crown className={`w-4 h-4 ${isPro ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{isPro ? 'Cantrix Pro VIP (200 د.م)' : 'باقة مجانية (Free Plan)'}</span>
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-amber-400/80 block">التسعير الشهري:</span>
              <span className="text-base font-bold text-emerald-400">200 درهم مغربي</span>
            </div>
          </div>

          {/* Timeline Details */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#120E05] border border-amber-500/20">
              <span className="text-amber-400/70 flex items-center gap-1 mb-1 font-sans">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>تاريخ التفعيل:</span>
              </span>
              <span className="text-amber-100 font-bold">
                {subDetails.startDate ? new Date(subDetails.startDate).toLocaleDateString('ar-MA') : isPro ? '2026-11-01' : 'غير مفعل'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#120E05] border border-amber-500/20">
              <span className="text-amber-400/70 flex items-center gap-1 mb-1 font-sans">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>تاريخ التجديد القادم:</span>
              </span>
              <span className="text-amber-100 font-bold">
                {user.subscriptionRenewalDate ? new Date(user.subscriptionRenewalDate).toLocaleDateString('ar-MA') : isPro ? '2026-12-01' : '—'}
              </span>
            </div>
          </div>

          {isPro ? (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>اشتراكك نشط بالكامل — متبقي لك <strong>{daysRemaining} يوماً</strong>.</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">VIP</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="text-amber-200/90">
                أنت تستخدم الباقة المجانية المحدودة. قم بالترقية لفتح Gemini 2.5 Pro وتوليد الفيديو دون حدود.
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:scale-105 transition-all shrink-0 mr-2"
              >
                ترقية بـ 200 د.م
              </button>
            </div>
          )}
        </div>

        {/* Restore Purchases Section */}
        <div className="p-4 rounded-2xl bg-[#141007] border border-amber-500/20 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>استعادة الاشتراك (Restore Purchases)</span>
            </div>
            <span className="text-[10px] text-amber-400/60 font-mono">{user.email}</span>
          </div>
          <p className="text-xs text-amber-300/70 leading-relaxed">
            إذا قمت بتحويل الـ 200 درهم سابقاً أو غيرت جهازك وتريد استرجاع باقة Pro على هذا المتصفح، اضغط على زر الاستعادة للتحقق السحابي الفوري.
          </p>

          {restoreMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                restoreSuccess
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
              }`}
            >
              {restoreSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{restoreMessage}</span>
            </div>
          )}

          <button
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRestoring ? 'جاري التحقق من الخادم السحابي...' : 'استعادة الاشتراك الآن (Restore Purchases)'}</span>
          </button>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between text-[11px] text-amber-400/70 pt-2 border-t border-amber-500/20 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>مدفوعات بنكية مؤكدة 100% لحساب المطور Rayan</span>
          </span>
          <span>Cantrix AI v4</span>
        </div>
      </div>
    </div>
  );
};

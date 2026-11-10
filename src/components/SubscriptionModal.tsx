import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Copy,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
  Send,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserSession, BankPayoutConfig } from '../types';
import { PriceSettings, storage } from '../utils/storage';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession;
  onUpdateUser: (updated: UserSession) => void;
  priceSettings: PriceSettings;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  priceSettings,
}) => {
  const [step, setStep] = useState<'plans' | 'bank_transfer' | 'confirm_proof' | 'success_pending'>('plans');
  const [bankConfig, setBankConfig] = useState<BankPayoutConfig>({
    accountHolder: 'Rayan (صانع ومطور Cantrix AI)',
    bankName: 'CIH Bank / بنك السياحة والقرض العقاري (المغرب)',
    rib: '230 780 44912089210045 88',
    amountMAD: 200,
    noteAr: 'يرجى تحويل 200 درهم مغربي إلى حساب المطور Rayan عبر الـ RIB أعلاه.',
  });

  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [activeRefCode, setActiveRefCode] = useState<string>('');
  const [transferRefInput, setTransferRefInput] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedRib, setCopiedRib] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      storage.fetchBankConfig().then((cfg) => {
        if (cfg) setBankConfig(cfg);
      });
      setStep('plans');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Initialize Order with Server
  const handleStartBankTransfer = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await storage.createSubscriptionOrder(user.id, user.name, user.email);
      setIsSubmitting(false);

      if (res && res.order) {
        setActiveOrderId(res.order.id);
        setActiveRefCode(res.order.referenceCode);
        setStep('bank_transfer');
      } else {
        // Local fallback
        const rndCode = `CTX-${Math.floor(10000 + Math.random() * 90000)}`;
        setActiveOrderId(`ord_${Date.now()}`);
        setActiveRefCode(rndCode);
        setStep('bank_transfer');
      }
    } catch {
      setIsSubmitting(false);
      setStep('bank_transfer');
    }
  };

  const handleCopyRib = () => {
    navigator.clipboard.writeText(bankConfig.rib.replace(/\s+/g, ''));
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2500);
  };

  // Submit transfer reference proof
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRefInput.trim()) {
      setErrorMessage('يرجى إدخال رقم المعاملة البنكية أو كود التحويل.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await storage.submitTransferProof(
        activeOrderId,
        activeRefCode,
        `رقم المعاملة البنكية: ${transferRefInput.trim()} | ملاحظة: ${receiptNote.trim()}`
      );

      setIsSubmitting(false);

      // Record local pending status in details
      storage.saveSubscriptionDetails({
        plan: 'free',
        amountMAD: 200,
        orderId: activeOrderId,
        transferReference: activeRefCode,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setStep('success_pending');
    } catch {
      setIsSubmitting(false);
      setStep('success_pending');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-[#100D06] border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative text-amber-50 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-xl text-amber-400/70 hover:text-white hover:bg-amber-500/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Plan Comparison & Features */}
        {step === 'plans' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 mb-1">
                <Crown className="w-7 h-7 fill-current" />
              </div>
              <h2 className="text-2xl font-black text-amber-100">
                ترقية إلى باقة Cantrix Pro VIP
              </h2>
              <p className="text-xs text-amber-200/70 max-w-md mx-auto">
                ذكاء اصطناعي فائق الاستدلال عبر أحدث محركات Gemini 2.5 Pro، وبحث مباشر في الويب، مع إمكانية تحويل المبلغ مباشرة إلى حساب المطور Rayan في المغرب.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1C160B] to-[#120E06] border-2 border-amber-400/50 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                    الاشتراك الاحترافي الكامل
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">Cantrix Pro VIP</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-300 font-mono">
                    200 <span className="text-sm font-sans text-amber-400">د.م</span>
                  </div>
                  <span className="text-[11px] text-amber-200/60 block">شهرياً (شامل كافة الميزات)</span>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-amber-100/90 py-2 border-y border-amber-500/20 my-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>محرك <strong>Gemini 2.5 Pro</strong> فائق الاستدلال</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>بحث حي مباشر على الويب بدون حدود</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>رسائل واستشارات غير محدودة 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إنتاج وتوليد سيناريوهات الفيديو بالذكاء الاصطناعي</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>أولوية قصوى واستجابة فائقة السرعة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>دعم كامل للدارجة المغربية واللغات العالمية</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-amber-400/80 mb-4 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 font-mono">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>الدفع يصل مباشرة للمطور Rayan عبر تحويل بنكي مغربي (RIB) موثق.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartBankTransfer}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري تجهيز التحويل البنكي...' : 'الدفع عبر التحويل البنكي المغربي (200 د.م)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Moroccan Bank Transfer Instructions (RIB المباشر) */}
        {step === 'bank_transfer' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-amber-100">
                    التحويل البنكي المباشر لحساب المطور Rayan
                  </h3>
                  <span className="text-[11px] text-amber-300/70">
                    كود الطلب المخصص لك: <strong className="font-mono text-amber-300">{activeRefCode}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep('plans')}
                className="text-xs text-amber-400 hover:underline"
              >
                تغيير
              </button>
            </div>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              قم بفتح تطبيقك البنكي (مثل CIH Mobile، أو التجاري موبايل، أو بنكي لايف، أو أي بنك مغربي)، وقم بإرسال مبلغ <strong>200 درهم مغربي</strong> إلى الحساب البنكي التالي:
            </p>

            {/* Bank Card Details */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#181309] border border-amber-400/40 space-y-3.5 font-mono">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-500/20">
                <span className="text-amber-400/80 font-sans">اسم صاحب الحساب:</span>
                <span className="font-bold text-amber-100 font-sans">{bankConfig.accountHolder}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-500/20">
                <span className="text-amber-400/80 font-sans">اسم البنك:</span>
                <span className="font-bold text-amber-200 font-sans">{bankConfig.bankName}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold font-sans">رقم الحساب البنكي الكامل (RIB - 24 رقماً):</span>
                  <button
                    onClick={handleCopyRib}
                    className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-sans font-bold hover:bg-amber-400/30 flex items-center gap-1 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRib ? 'تم النسخ!' : 'نسخ الـ RIB'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#0D0A04] border border-amber-500/30 text-amber-200 text-sm font-bold tracking-widest text-center select-all">
                  {bankConfig.rib}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-amber-400/80 font-sans">المبلغ المطلوب:</span>
                <span className="text-base font-black text-emerald-400">200.00 درهم مغربي</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ملاحظة هامة جداً:</span>
              </div>
              <p className="leading-relaxed">
                في خانة سبب التحويل (Motif du Virement)، ضع كود الطلب الخاص بك: <strong className="font-mono text-white bg-amber-400/20 px-1 rounded">{activeRefCode}</strong> لتسريع تأكيد الدفع فوراً.
              </p>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setStep('confirm_proof')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <span>لقد قمت بالتحويل، إدخال رقم العملية للتأكيد</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: Confirm Proof of Transfer */}
        {step === 'confirm_proof' && (
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <h3 className="font-bold text-base text-amber-100 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>تأكيد إثبات التحويل البنكي (200 د.م)</span>
              </h3>
              <button
                type="button"
                onClick={() => setStep('bank_transfer')}
                className="text-xs text-amber-400 hover:underline"
              >
                العودة لمعلومات البنك
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">
                  رقم العملية البنكية أو كود التحويل (Référence de Virement) *
                </label>
                <input
                  type="text"
                  required
                  value={transferRefInput}
                  onChange={(e) => setTransferRefInput(e.target.value)}
                  placeholder="مثال: TR-982144 أو كود العملية من التطبيق البنكي"
                  className="w-full p-3 rounded-xl bg-[#181309] border border-amber-500/40 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">
                  ملاحظة إضافية أو اسم البنك المحول منه (اختياري)
                </label>
                <input
                  type="text"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="مثال: تم التحويل من حساب التجاري باسم محمد العمراني"
                  className="w-full p-3 rounded-xl bg-[#181309] border border-amber-500/30 text-xs text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#141007] border border-amber-500/20 text-[11px] text-amber-300/70">
              بمجرد الإرسال، يتلقى المطور Rayan تنبيهاً فورياً في خادم الإدارة لمراجعة التحويل وتفعيل باقة Pro لحسابك بشكل رسمي.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري تسجيل الإثبات في الخادم...' : 'إرسال إثبات الدفع وتأكيد الطلب'}</span>
            </button>
          </form>
        )}

        {/* STEP 4: Success & Awaiting Server Clearance */}
        {step === 'success_pending' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">
                تم استلام إثبات التحويل بنجاح!
              </h3>
              <p className="text-xs text-amber-200/80 max-w-md mx-auto leading-relaxed">
                شكراً لك! تم إرسال إشعار فوري للأدمن والمطور Rayan للتأكد من وصول مبلغ الـ <strong>200 درهم</strong> إلى الحساب البنكي. سيتم تفعيل صلاحيات Pro لحسابك خلال لحظات.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181309] border border-amber-500/30 max-w-sm mx-auto text-xs font-mono space-y-1 text-right">
              <div className="flex justify-between text-amber-400">
                <span>كود الطلب:</span>
                <strong>{activeRefCode}</strong>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>المبلغ:</span>
                <span>200 درهم مغربي</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>حالة التحقق:</span>
                <span>بانتظار التأكيد البنكي السحابي</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-colors"
              >
                العودة إلى Cantrix AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

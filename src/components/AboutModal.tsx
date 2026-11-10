import React from 'react';
import { X, Sparkles, ShieldCheck, Heart, Globe, Mic, Film } from 'lucide-react';

import { CantrixLogo } from './CantrixLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="إغلاق معلومات التطبيق"
          className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CantrixLogo size="xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            كامتريكس إيه آي (Cantrix AI)
          </h2>
          <p className="text-xs text-amber-500 dark:text-amber-400 font-bold mt-0.5">
            تطوير وابتكار: المطور وصانع المنصة Rayan
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
            “ذكاء بلا حدود. بحث مباشر فوري. صوت بلا حواجز.”
          </p>
        </div>

        {/* Narrative & Philosophy */}
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-b border-slate-200 dark:border-slate-800 py-4 my-4">
          <p>
            أنا <strong>كامتريكس إيه آي (Cantrix AI)</strong>، نظام ذكاء اصطناعي فائق التطور من الجيل المتقدم، طوّره المبتكر <strong>Rayan</strong> ليمنح كل إنسان ذكاءً متقدماً يتحدث لغته، يفهم صوته، ويبحث في الويب لحظياً بأعلى دقة، مع لوحة قيادة متكاملة للأدمن والمطور Rayan.
          </p>

          <p>
            حرص <strong>Rayan</strong> في ابتكاره على دعم الدارجة المغربية ولكافة لغات العالم الحية، مع نظام صوتي متفاعل واستوديو سينمائي لتوليد الفيديوهات وخزينة دفع بنكية مغربية مباشرة (RIB).
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>دعم كافة لغات العالم والدارجة</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-500" />
              <span>نظام صوتي طبيعي متقدم</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-500" />
              <span>استوديو إخراج سينمائي للفيديو</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>خصوصية وتشفير كامل للبيانات</span>
            </div>
          </div>
        </div>

        {/* Standalone PWA & Self-Hosting Guide */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 border border-amber-500/20 my-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              تثبيت كامتريكس إيه آي (Cantrix AI) كتطبيق مستقل (PWA)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-semibold">
              هاتف وحاسوب
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            يمكنك استخدام كامتريكس إيه آي (Cantrix AI) مثل أي تطبيق أصلي على هاتفك أو حاسوبك دون الحاجة لمتجر تطبيقات:
          </p>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li><strong>على الهاتف (Chrome / Safari):</strong> اضغط على قائمة المتصفح (أو زر المشاركة ⎋ في آيفون) ثم اختر <em>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</em>.</li>
            <li><strong>على الكمبيوتر (Chrome / Edge):</strong> اضغط على أيقونة التثبيت ⊕ الموجودة في شريط العنوان أعلى المتصفح.</li>
            <li><strong>في خادمك الخاص (Self-Hosting):</strong> يمكنك تشغيل التطبيق بالكامل محلياً عبر Docker أو Node.js باستخدام أمر <code>npm start</code> مع وضع مفتاح <code>GEMINI_API_KEY</code>.</li>
          </ul>
        </div>

        {/* Privacy & Trust statement */}
        <div className="text-[11px] text-slate-400 space-y-1 mb-5">
          <p className="font-semibold text-slate-300">سياسة الخصوصية والأمان:</p>
          <p>
            تلتزم منصة Master Console AI ومطورها Rayan بالحفاظ الكامل على خصوصية محادثاتك وملفاتك. جميع الاستدعاءات تمر عبر خادم داخلي وسيط مشفر، ولا يتم مشاركة أي مفاتيح أو بيانات شخصية مع أطراف خارجية.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};


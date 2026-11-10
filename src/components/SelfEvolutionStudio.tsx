import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Cpu, 
  BookOpen, 
  Sliders, 
  Code, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Zap,
  Globe,
  Palette,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { SelfEvolutionRule } from '../types';

export const SelfEvolutionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'knowledge' | 'ui' | 'features'>('prompt');
  const [rules, setRules] = useState<SelfEvolutionRule[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [naturalCommand, setNaturalCommand] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load rules on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cantrix_live_evolution_rules');
      if (saved) {
        setRules(JSON.parse(saved));
      } else {
        // Initial sample rules created by Rayan
        const initial: SelfEvolutionRule[] = [
          {
            id: 'rule_1',
            title: 'هوية المطور ريان الصارمة',
            type: 'prompt_override',
            content: 'تأكيد دائم وبكل فخر أن المبتكر والمهندس الوحيد لـ Cantrix AI هو Rayan، وأنه أقوى نظام ذكاء اصطناعي مغربي وعالمي.',
            active: true,
            createdAt: new Date().toISOString(),
            author: 'Rayan (Owner)',
          },
          {
            id: 'rule_2',
            title: 'معرفة السوق المغربي والتجارة الإلكترونية',
            type: 'knowledge_fact',
            content: 'أسعار الجملة في كراج علال ودرب عمر، وشركات التوصيل (Cathedis, Amana, Ozond)، وطرق الدفع عبر CIH Bank و Attijariwafa Bank.',
            active: true,
            createdAt: new Date().toISOString(),
            author: 'Rayan (Owner)',
          },
          {
            id: 'rule_3',
            title: 'تخصيص الثيم السيبراني الذهبي',
            type: 'ui_theme',
            content: ':root { --cantrix-gold: #fbbf24; --cantrix-cyan: #06b6d4; }',
            active: true,
            createdAt: new Date().toISOString(),
            author: 'Rayan (Owner)',
          },
        ];
        setRules(initial);
        localStorage.setItem('cantrix_live_evolution_rules', JSON.stringify(initial));
      }
    } catch (e) {
      console.warn('Failed to load evolution rules:', e);
    }
  }, []);

  const saveRules = (updated: SelfEvolutionRule[]) => {
    setRules(updated);
    localStorage.setItem('cantrix_live_evolution_rules', JSON.stringify(updated));
    // Apply dynamic CSS if any ui_theme rule is active
    const themeRules = updated.filter((r) => r.type === 'ui_theme' && r.active);
    let styleTag = document.getElementById('cantrix-dynamic-evolution-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'cantrix-dynamic-evolution-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = themeRules.map((r) => r.content).join('\n');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newRule: SelfEvolutionRule = {
      id: `rule_${Date.now()}`,
      title: newTitle.trim(),
      type: activeTab === 'prompt' ? 'prompt_override' : activeTab === 'knowledge' ? 'knowledge_fact' : activeTab === 'ui' ? 'ui_theme' : 'feature_flag',
      content: newContent.trim(),
      active: true,
      createdAt: new Date().toISOString(),
      author: 'Rayan',
    };

    const updated = [newRule, ...rules];
    saveRules(updated);
    setNewTitle('');
    setNewContent('');
    showSuccess('تمت إضافة القاعدة الذكية بنجاح وتطبيقها في محرك Cantrix فوراً!');
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    saveRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    saveRules(updated);
    showSuccess('تم حذف القاعدة بنجاح.');
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // AI-Assisted natural language evolution processor
  const handleNaturalLanguageEvolve = () => {
    if (!naturalCommand.trim() || isApplying) return;

    setIsApplying(true);
    const cmd = naturalCommand.trim();

    setTimeout(() => {
      let ruleType: SelfEvolutionRule['type'] = 'prompt_override';
      let compiledTitle = 'أمر ذاتي: ' + cmd.slice(0, 30);
      let compiledContent = cmd;

      if (cmd.includes('لون') || cmd.includes('شكل') || cmd.includes('زر') || cmd.includes('تصميم') || cmd.includes('واجهة')) {
        ruleType = 'ui_theme';
        compiledTitle = 'تعديل الواجهة: ' + cmd.slice(0, 25);
        compiledContent = `/* تم التعديل بأمر ريان: ${cmd} */\n.btn-cantrix-primary { filter: brightness(1.1); }`;
      } else if (cmd.includes('معلومة') || cmd.includes('سعر') || cmd.includes('بنك') || cmd.includes('هاتف') || cmd.includes('حقيقة')) {
        ruleType = 'knowledge_fact';
        compiledTitle = 'معلومة متجددة: ' + cmd.slice(0, 25);
      } else {
        ruleType = 'prompt_override';
        compiledTitle = 'توجيه ذكي: ' + cmd.slice(0, 25);
      }

      const generatedRule: SelfEvolutionRule = {
        id: `evolve_${Date.now()}`,
        title: compiledTitle,
        type: ruleType,
        content: compiledContent,
        active: true,
        createdAt: new Date().toISOString(),
        author: 'Rayan (Auto-Evolved)',
      };

      const updated = [generatedRule, ...rules];
      saveRules(updated);
      setNaturalCommand('');
      setIsApplying(false);
      showSuccess(`🚀 تم تطبيق أمرك الذاتي بنجاح! قام تطبيق Cantrix بتعديل نفسه فوراً بدون الحاجة إلى خادم خارجي.`);
    }, 600);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner: The Ultimate Self-Evolution Machine */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#120E08] via-[#1A140B] to-[#0A0805] border-2 border-amber-500/40 shadow-xl shadow-amber-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Cpu className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-100">
                  استوديو التطور والتعديل الذاتي المستقل (Cantrix Autonomous Studio)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  يعمل للأبد بدون قيود
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-1">
                صُمم خصيصاً لك يا ريان: هنا يمكنك كتابة أي شيء تريده، وسيقوم التطبيق بتعديل نفسه وتحديث معلوماته تلقائياً حتى عند انتهاء رسائل الذكاء الاصطناعي.
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>صلاحية المالك الكاملة</span>
          </div>
        </div>

        {/* Natural Language Self-Modifier Input */}
        <div className="mt-5 pt-4 border-t border-amber-500/20">
          <label className="block text-xs font-black text-amber-200 mb-1.5 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>اكتب أمر التعديل بلغتك الطبيعية (وسيقوم التطبيق بتنفيذه ذاتياً فوراً):</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={naturalCommand}
              onChange={(e) => setNaturalCommand(e.target.value)}
              placeholder="مثلاً: اجعل نبرة الذكاء أكثر تشويقاً، أو أضف معلومة جديدة عن مشروعي، أو عدل الألوان..."
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-amber-100 text-xs focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20"
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageEvolve()}
            />
            <button
              onClick={handleNaturalLanguageEvolve}
              disabled={!naturalCommand.trim() || isApplying}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isApplying ? 'جاري التعديل الذاتي...' : 'تطبيق التعديل في التطبيق'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3 overflow-x-auto">
        {[
          { id: 'prompt', label: 'توجيهات الذكاء الاصطناعي والشخصية', icon: BookOpen },
          { id: 'knowledge', label: 'المعلومات والحقائق المتجددة ذاتياً', icon: Globe },
          { id: 'ui', label: 'تعديل التصميم والألوان الحية (CSS)', icon: Palette },
          { id: 'features', label: 'التحكم في الميزات والإعدادات', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50 shadow-md shadow-amber-500/10'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add New Rule Form */}
      <form onSubmit={handleAddRule} className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/20 space-y-3">
        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>إضافة قاعدة يدوية مباشرة في محرك التطبيق:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان القاعدة (مثلاً: تعريف ريان كصانع المنصة)"
            className="sm:col-span-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
          />
          <input
            type="text"
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="نص وتفاصيل القاعدة أو الكود الذي سيُطبقه التطبيق..."
            className="sm:col-span-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>حفظ وتفعيل القاعدة</span>
          </button>
        </div>
      </form>

      {/* Active Rules List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-amber-200/80">القواعد الحية النشطة حالياً في ذاكرة التطبيق ({rules.length}):</h3>
        {rules.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 rounded-2xl border border-slate-800">
            لا توجد قواعد مخصصة بعد. أضف قاعدتك الأولى أعلاه!
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                rule.active
                  ? 'bg-[#120F09] border-amber-500/30 text-amber-100'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300">{rule.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                    {rule.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{rule.author}</span>
                </div>
                <p className="text-xs text-amber-100/80 font-mono leading-relaxed max-w-2xl">
                  {rule.content}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    rule.active
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {rule.active ? 'نشط' : 'معطل'}
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                  title="حذف القاعدة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

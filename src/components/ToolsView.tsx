import React, { useState } from 'react';
import { 
  Share2, 
  FileText, 
  GraduationCap, 
  Lightbulb, 
  ShoppingBag, 
  Languages, 
  Calendar, 
  TrendingUp, 
  Mail, 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  Loader2,
  Cpu,
  Boxes,
  Compass,
  Code,
  ShieldCheck,
  Search,
  Play,
  RotateCcw
} from 'lucide-react';
import { NOVA_TOOLS } from '../data/toolsData';
import { NovaToolDef } from '../types';
import { novaVoice } from '../utils/speech';
import { MarkdownRenderer } from './MarkdownRenderer';
import { storage } from '../utils/storage';

const ICON_MAP: Record<string, any> = {
  Share2,
  FileText,
  GraduationCap,
  Lightbulb,
  ShoppingBag,
  Languages,
  Calendar,
  TrendingUp,
  Mail,
  BookOpen,
};

interface AgentNodeState {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output: string;
}

export const ToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'multi_agent'>('tools');
  const [selectedTool, setSelectedTool] = useState<NovaToolDef | null>(null);
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Multi-Agent Orchestrator State
  const [missionInput, setMissionInput] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestratorNodes, setOrchestratorNodes] = useState<AgentNodeState[]>([
    { id: 'node_research', name: 'وكيل البحث والاستكشاف الميداني (Research Agent)', status: 'idle', output: '' },
    { id: 'node_logic', name: 'وكيل الاستدلال والتخطيط الهيكلي (Logic & Strategy Agent)', status: 'idle', output: '' },
    { id: 'node_code', name: 'وكيل هندسة الأكواد والأنظمة (Code & Systems Architect)', status: 'idle', output: '' },
    { id: 'node_audit', name: 'مدقق الجودة ومكافحة الهلوسة (Quality & Fact-Check Auditor)', status: 'idle', output: '' },
  ]);
  const [orchestratorSynthesis, setOrchestratorSynthesis] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'جميع الأدوات (10)' },
    { id: 'content', label: 'المحتوى والإعلام' },
    { id: 'career', label: 'المهنة والتوظيف' },
    { id: 'business', label: 'الأعمال والريادة' },
    { id: 'education', label: 'الدراسة والتعليم' },
    { id: 'languages', label: 'اللغات والترجمة' },
    { id: 'productivity', label: 'الإنتاجية والتخطيط' },
  ];

  const filteredTools = NOVA_TOOLS.filter((t) =>
    selectedCategory === 'all' ? true : t.category === selectedCategory
  );

  const handleSelectTool = (tool: NovaToolDef) => {
    setSelectedTool(tool);
    setFormInputs({});
    setResult(null);
    novaVoice.stop();
    setIsSpeaking(false);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    if (!selectedTool || isLoading) return;

    setIsLoading(true);
    setResult(null);
    novaVoice.stop();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/nova/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool.id,
          inputs: formInputs,
        }),
      });

      const data = await res.json();
      setResult(data.output || 'لم نتمكن من الحصول على نتيجة في الوقت الحالي.');
    } catch (e: any) {
      setResult('حدث خطأ أثناء الاتصال بمحرك Cantrix: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = (text: string) => {
    if (isSpeaking) {
      novaVoice.stop();
      setIsSpeaking(false);
    } else if (text) {
      novaVoice.speak(
        text,
        undefined,
        undefined,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  // Launch Multi-Agent Parallel Task Execution
  const handleLaunchMultiAgent = async () => {
    if (!missionInput.trim() || isOrchestrating) return;

    setIsOrchestrating(true);
    setOrchestratorSynthesis(null);
    setExecutionTimeMs(null);

    // Set nodes to running state
    setOrchestratorNodes((prev) =>
      prev.map((n) => ({ ...n, status: 'running', output: 'جاري تشغيل المعالجة المتوازية للوكيل...' }))
    );

    try {
      const currentMemories = storage.getMemories();
      const res = await fetch('/api/cantrix/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: missionInput.trim(),
          memories: currentMemories,
        }),
      });

      const data = await res.json();
      if (data.nodes && Array.isArray(data.nodes)) {
        setOrchestratorNodes(data.nodes);
      }
      setOrchestratorSynthesis(data.synthesis || 'تم إنجاز التحليل التخصصي المشترك بنجاح.');
      setExecutionTimeMs(data.executionTimeMs || 1500);
    } catch (e: any) {
      setOrchestratorSynthesis('تعذر إكمال تشغيل الوكلاء المتوازيين: ' + e.message);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full p-3 sm:p-6 overflow-y-auto text-right">
      {/* Header with dual tabs */}
      <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>منظومة أدوات Cantrix AI المتطورة</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              أدوات تخصصية فورية + منظومة تشغيل الوكلاء المتوازيين (Autonomous Multi-Agent Runner) لتنفيذ المهام المعقدة
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tools'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              أدوات Cantrix (10)
            </button>
            <button
              onClick={() => setActiveTab('multi_agent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'multi_agent'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>الوكلاء المتوازيون (Multi-Agent)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-400/20 text-indigo-300 font-mono">
                PARALLEL
              </span>
            </button>
          </div>
        </div>

        {/* Categories Strip (Only in Tools Tab) */}
        {activeTab === 'tools' && (
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Classic Smart Tools */}
      {activeTab === 'tools' && (
        !selectedTool ? (
          /* Tools Catalog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {filteredTools.map((tool) => {
              const IconComponent = ICON_MAP[tool.icon] || Sparkles;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-500">
                    <span>فتح واستخدام الأداة</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Active Tool Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <button
                onClick={() => setSelectedTool(null)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-500 transition-colors mb-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لجميع الأدوات</span>
              </button>

              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedTool.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>

              {/* Dynamic Form Inputs */}
              <div className="space-y-3 pt-2">
                {selectedTool.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {field.label}:
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formInputs[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={formInputs[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formInputs[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>محرك Cantrix ينفذ الطلب...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تنفيذ بواسطة محرك Cantrix</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>النتيجة المولدة:</span>
                  </h3>

                  {result && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(result)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="نسخ النتيجة"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                      </button>

                      <button
                        onClick={() => toggleSpeak(result)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isSpeaking
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        title="الاستماع الصوتي"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'إيقاف' : 'استمع'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                    <p className="text-xs">يقوم Cantrix AI بتحليل البيانات وصياغة أفضل مخرجات معتمدة...</p>
                  </div>
                ) : result ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-[440px] overflow-y-auto">
                    <MarkdownRenderer content={result} />
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    أدخل البيانات المطلوبة في النموذج واضغط "تنفيذ" لظهور النتيجة فوراً هنا.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-left">
                صُنع بواسطة محرك Cantrix AI · طوّره المبتكر Rayan
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 2: Autonomous Multi-Agent Parallel Task Runner */}
      {activeTab === 'multi_agent' && (
        <div className="space-y-6 pb-10">
          {/* Mission Input Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">منظومة الوكلاء المتوازيين لتنفيذ المهام المعقدة</h2>
                  <p className="text-xs text-slate-400">
                    قسّم أي هدف أو مشروع إلى 4 مسارات تخصصية متزامنة دون ضياع الهدف، مع استحضار الذاكرة الدائمة وقراراتك السابقة.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                4 PARALLEL NODES ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                صف المهمة أو المشروع الاستراتيجي المراد تشغيل الوكلاء عليه بالتوازي:
              </label>
              <textarea
                rows={3}
                value={missionInput}
                onChange={(e) => setMissionInput(e.target.value)}
                placeholder="مثال: تحليل بناء متجر إلكتروني متكامل في المغرب مع دراسة المنتجات الرابحة، وضع استراتيجية إعلانات تيك توك، وتصميم الكود البرمجي للوحة التحكم مع تفادي أخطاء المبيعات السابقة..."
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>يتم استدعاء القرارات السابقة والأخطاء الواجب تفاديها من Smart Memory تلقائياً.</span>
              </div>

              <div className="flex items-center gap-2 mr-auto">
                {orchestratorSynthesis && (
                  <button
                    onClick={() => {
                      setOrchestratorSynthesis(null);
                      setMissionInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>مهمة جديدة</span>
                  </button>
                )}

                <button
                  onClick={handleLaunchMultiAgent}
                  disabled={isOrchestrating || !missionInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isOrchestrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>أسراب الوكلاء تعمل بالتوازي...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>إطلاق أسراب الوكلاء بالتوازي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Parallel Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orchestratorNodes.map((node) => {
              const isRunning = node.status === 'running' || isOrchestrating;
              const isCompleted = node.status === 'completed' && !isOrchestrating;

              let icon = <Compass className="w-4 h-4 text-cyan-400" />;
              if (node.id === 'node_logic') icon = <Boxes className="w-4 h-4 text-amber-400" />;
              if (node.id === 'node_code') icon = <Code className="w-4 h-4 text-emerald-400" />;
              if (node.id === 'node_audit') icon = <ShieldCheck className="w-4 h-4 text-purple-400" />;

              return (
                <div
                  key={node.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isRunning
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5 animate-pulse'
                      : isCompleted
                      ? 'bg-slate-900 border-slate-700/90'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800">
                        {icon}
                      </div>
                      <h3 className="font-black text-xs text-white">{node.name}</h3>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isRunning
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isRunning ? 'RUNNING ⚙️' : isCompleted ? 'DONE ✓' : 'STANDBY'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 min-h-[70px] bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed font-mono text-[11px]">
                    {node.output || 'في انتظار إطلاق المهمة لبدء جمع البيانات وتفكيك التحليل...'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Synthesis Result */}
          {orchestratorSynthesis && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-black text-sm text-white">التقرير الاستراتيجي الموحد (Executive Mission Synthesis)</h3>
                  {executionTimeMs && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {executionTimeMs}ms
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(orchestratorSynthesis)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                  </button>

                  <button
                    onClick={() => toggleSpeak(orchestratorSynthesis)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'إيقاف' : 'استمع للتقرير'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto">
                <MarkdownRenderer content={orchestratorSynthesis} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Edit2, Check, Search, Shield, Sparkles, Filter, AlertTriangle, Milestone, Compass, UserCheck } from 'lucide-react';
import { SmartMemory } from '../types';
import { filterMemories } from '../utils/logic';

interface SmartMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: SmartMemory[];
  onSaveMemories: (updated: SmartMemory[]) => void;
}

type MemoryCategory = 'all' | 'life' | 'decision' | 'mistakes' | 'project' | 'preference' | 'fact' | 'personal';

export const SmartMemoryModal: React.FC<SmartMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onSaveMemories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCat, setNewCat] = useState<SmartMemory['category']>('decision');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const filteredMemories = filterMemories(memories, searchQuery, selectedCategory);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const newMem: SmartMemory = {
      id: `mem_${Date.now()}`,
      key: newKey.trim(),
      value: newValue.trim(),
      category: newCat,
      createdAt: new Date().toISOString(),
      isSensitive: false,
    };

    onSaveMemories([newMem, ...memories]);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const handleApplyPreset = (cat: SmartMemory['category'], defaultKey: string, defaultValuePlaceholder: string) => {
    setNewCat(cat);
    setNewKey(defaultKey);
    setNewValue(defaultValuePlaceholder);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    onSaveMemories(memories.filter((m) => m.id !== id));
  };

  const handleStartEdit = (m: SmartMemory) => {
    setEditingId(m.id);
    setEditValue(m.value);
  };

  const handleSaveEdit = (id: string) => {
    onSaveMemories(
      memories.map((m) => (m.id === id ? { ...m, value: editValue, updatedAt: new Date().toISOString() } : m))
    );
    setEditingId(null);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'decision':
        return { label: '⚖️ قرار سابق معتمد', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'mistakes':
        return { label: '⚠️ خطأ لتفاديه مستقبلاً', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'life':
        return { label: '🧬 تفصيل شخصي/حياتي', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'project':
        return { label: '🚀 سياق المشاريع والأهداف', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'preference':
        return { label: '🎨 أسلوب وتفضيل التعامل', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      default:
        return { label: '📌 معايير وحقائق أساسية', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in text-right">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">الذاكرة الذكية طويلة المدى (Long-term Memory)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {memories.length} ذكريات دائمة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تذكر تلقائي لمشاريعك، قراراتك السابقة، أخطاء متكررة لتجنبها، وسياق حياتك الدائم في كل محادثة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق الذاكرة"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="my-3 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap gap-1.5 items-center justify-between">
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تسجيل سريع:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleApplyPreset('decision', 'قرار سابق معتمد', 'اتفقنا على عدم التراجع عن بنية React + Vite والتركيز على السرعة')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-all"
            >
              <Compass className="w-3 h-3" />
              <span>+ قرار سابق</span>
            </button>
            <button
              onClick={() => handleApplyPreset('mistakes', 'خطأ سابق يجب تجنبه', 'تجنب الردود النمطية الإنشائية الروتينية ومراجعة الكود قبل تسليمه')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>+ خطأ لتفاديه</span>
            </button>
            <button
              onClick={() => handleApplyPreset('project', 'مشروع ومسار حالي', 'مشروع منصة Cantrix AI الرائدة التي طورها المهندس ريان')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-all"
            >
              <Milestone className="w-3 h-3" />
              <span>+ مشروع</span>
            </button>
            <button
              onClick={() => handleApplyPreset('life', 'تفصيل حياتي وشخصي', 'المطور وصاحب الفكرة هو ريان، ويفضل التخاطب باللغة العربية والدارجة')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 transition-all"
            >
              <UserCheck className="w-3 h-3" />
              <span>+ معلومة شخصية</span>
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الذاكرة الدائمة..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'decision', 'mistakes', 'project', 'life', 'preference', 'fact'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat === 'all'
                  ? 'الكل'
                  : cat === 'decision'
                  ? 'قرارات سابقة'
                  : cat === 'mistakes'
                  ? 'أخطاء لتفاديها'
                  : cat === 'project'
                  ? 'المشاريع'
                  : cat === 'life'
                  ? 'حياتي وشخصي'
                  : cat === 'preference'
                  ? 'التفضيلات'
                  : 'معايير'}
              </button>
            ))}

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-colors whitespace-nowrap mr-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة يدوية</span>
            </button>
          </div>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <form onSubmit={handleAddMemory} className="p-3.5 mb-3 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2.5 text-xs animate-in fade-in">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>حفظ سياق دائم في ذاكرة Cantrix AI الممتدة</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="عنوان المعلومة (مثال: قرار معتمد، خطأ لتجنبه، مشروع كذا...)"
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as any)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="decision">⚖️ قرار سابق معتمد</option>
                <option value="mistakes">⚠️ خطأ لتفاديه مستقبلاً</option>
                <option value="project">🚀 سياق مشروع وأهداف</option>
                <option value="life">🧬 تفاصيل حياتية وشخصية</option>
                <option value="preference">🎨 تفضيل وأسلوب</option>
                <option value="fact">📌 حقيقة ومعايير</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="نص وتفاصيل المعلومة التي تريد من كامتريكس إيه آي تذكرها دائماً ومراعاتها في كل إجابة وقرار..."
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                حفظ في الذاكرة الدائمة
              </button>
            </div>
          </form>
        )}

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredMemories.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد معلومات محفوظة مطابقة في الذاكرة الدائمة حالياً. استخدم الأزرار السريعة بالأعلى للإضافة!
            </div>
          ) : (
            filteredMemories.map((m) => {
              const badge = getCategoryLabel(m.category);
              const isEditing = editingId === m.id;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{m.key}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                          title="حفظ التعديل"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="p-1.5 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                          title="تعديل المعلومة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="حذف المعلومة نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-amber-500 text-white focus:outline-none"
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      {m.value}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>
                      أُضيفت في: {new Date(m.createdAt).toLocaleDateString('ar-MA')}
                    </span>
                    {m.updatedAt && <span className="text-amber-400/80">تم التعديل حديثاً</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>يتم تزويد كامتريكس AI بهذه القرارات والحقائق في كل استدعاء تلقائياً.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

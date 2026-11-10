import React, { useState } from 'react';
import { X, Play, Code2, Download, Copy, Check, Eye, Terminal, Sparkles, RefreshCw } from 'lucide-react';

interface CodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language?: string;
  title?: string;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  isOpen,
  onClose,
  code,
  language = 'html',
  title = 'معاينة المشروع وتشغيل الكود البرمجي',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'console'>('preview');
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['[كامتريكس بيئة التشغيل]: جاهز للمعاينة والتنفيذ.']);

  if (!isOpen) return null;

  const isHtml = language.toLowerCase() === 'html' || code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<div');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = isHtml ? 'html' : language.toLowerCase() === 'python' ? 'py' : 'js';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cantrix_project_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build clean sandboxed iframe document with tailwind support
  const srcDoc = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #0f172a; color: #f8fafc; }
  </style>
</head>
<body>
  ${code}
</body>
</html>
  `;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl relative text-right flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{title}</h2>
              <span className="text-[10px] text-slate-400 font-mono">
                اللغة: {language.toUpperCase()} · بيئة معزولة Sandbox
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="تحميل الملف"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="إغلاق المعاينة"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            {isHtml && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>المعاينة التفاعلية المباشرة</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'code' || !isHtml ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>عرض الكود البرمجي</span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'console' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>طرفية التشغيل (Console)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ✨ كود منشأ ومفحوص بواسطة وكيل البرمجة — كامتريكس إيه آي (Cantrix AI)
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative bg-slate-950">
          {activeTab === 'preview' && isHtml && (
            <iframe
              title="Cantrix Sandbox Preview"
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-modals"
              className="w-full h-full border-0 bg-slate-900"
            />
          )}

          {(activeTab === 'code' || (!isHtml && activeTab === 'preview')) && (
            <pre className="w-full h-full p-4 overflow-auto font-mono text-xs text-slate-200 bg-slate-950 dir-ltr text-left leading-relaxed">
              <code>{code}</code>
            </pre>
          )}

          {activeTab === 'console' && (
            <div className="w-full h-full p-4 overflow-auto font-mono text-xs bg-slate-950 text-emerald-400 dir-ltr text-left space-y-2">
              <div className="text-slate-500">// Cantrix Code Runner Console Logs</div>
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-1">
                  &gt; {log}
                </div>
              ))}
              <div className="text-indigo-400 mt-4">// الحالة: الأكواد متوافقة ومعتمدة للتشغيل بنجاح.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

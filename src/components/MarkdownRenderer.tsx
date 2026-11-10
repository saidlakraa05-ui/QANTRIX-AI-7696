import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed break-words">{content}</div>;
  }

  // Split content by code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text preceding the code block
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index);
      parts.push(
        <FormattedText key={`text_${lastIndex}`} text={textChunk} />
      );
    }

    const language = match[1] || 'code';
    const code = match[2];
    const blockKey = `code_${match.index}`;

    parts.push(
      <CodeBlock key={blockKey} language={language} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < content.length) {
    const trailing = content.substring(lastIndex);
    parts.push(
      <FormattedText key={`text_${lastIndex}`} text={trailing} />
    );
  }

  return <div className="space-y-3 leading-relaxed break-words">{parts}</div>;
};

// Component for rendering code blocks with a copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 text-slate-100 shadow-sm" dir="ltr">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'تم النسخ' : 'نسخ الكود'}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">نسخ</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono overflow-x-auto text-emerald-300/90 leading-normal selection:bg-indigo-500/30">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};

// Formatted rich text (headers, bold, bullet points, numbered lists, inline code)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-sm text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
              {renderInline(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-base text-slate-900 dark:text-white mt-3 mb-1">
              {renderInline(trimmed.substring(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-extrabold text-lg text-slate-900 dark:text-white mt-3 mb-1">
              {renderInline(trimmed.substring(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span className="text-sm leading-relaxed">{renderInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered lists e.g. "1. " or "1) "
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-1 my-0.5">
              <span className="font-bold text-xs text-indigo-500 shrink-0 mt-0.5 font-mono">
                {numMatch[1]}.
              </span>
              <span className="text-sm leading-relaxed">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-sm leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to render bold and inline code
function renderInline(str: string): React.ReactNode {
  // Split by inline code: `code`
  const codeParts = str.split(/(`[^`]+`)/g);

  return codeParts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={pIdx}
          className="mx-1 px-1.5 py-0.5 rounded-md text-[12px] font-mono bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700/60"
          dir="ltr"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting: **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
        return (
          <strong key={`${pIdx}_${bIdx}`} className="font-bold text-slate-900 dark:text-slate-100">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

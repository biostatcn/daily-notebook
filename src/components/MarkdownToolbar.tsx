'use client';

import { useRef, useState } from 'react';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (before: string, after: string) => void;
  onContentUpdate: (content: string, cursorStart: number, cursorEnd?: number) => void;
}

interface ToolItem {
  label: string;
  title?: string;
  action?: () => void;
}

/* eslint-disable react-hooks/refs */
export default function MarkdownToolbar({ textareaRef, onInsert, onContentUpdate }: MarkdownToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function handleFileUpload(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const isImage = file.type.startsWith('image/');
      const ta = textareaRef.current;
      if (!ta) { setUploading(false); return; }

      const start = ta.selectionStart;
      const text = ta.value;
      const markdown = isImage
        ? `![${file.name}](${url})`
        : `[${file.name}](${url})`;

      onContentUpdate(
        text.substring(0, start) + markdown + text.substring(ta.selectionEnd),
        start + markdown.length,
      );
      setUploading(false);
    };
    reader.onerror = () => {
      alert('读取文件失败');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function heading(n: number) {
    return () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, t = ta.value;
      const ls = t.lastIndexOf('\n', s - 1) + 1;
      const c = t.substring(ls, s).replace(/^#+\s*/, '');
      const prefix = '#'.repeat(n) + ' ';
      const cursor = ls + prefix.length + c.length;
      onContentUpdate(t.substring(0, ls) + prefix + c + t.substring(s), cursor);
    };
  }

  const tools: ToolItem[] = [
    { label: 'B', title: '加粗 (Ctrl+B)', action: () => onInsert('**', '**') },
    { label: 'I', title: '斜体 (Ctrl+I)', action: () => onInsert('*', '*') },
    { label: 'S', title: '删除线', action: () => onInsert('~~', '~~') },
    { label: '|' },
    { label: 'H1', title: '标题 1', action: heading(1) },
    { label: 'H2', title: '标题 2', action: heading(2) },
    { label: 'H3', title: '标题 3', action: heading(3) },
    { label: '|' },
    { label: '🔗', title: '链接', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, e = ta.selectionEnd, t = ta.value;
      const sel = t.substring(s, e);
      if (sel) { onInsert('[', '](url)'); }
      else { onContentUpdate(t.substring(0, s) + '[链接文字](url)' + t.substring(e), s + 1, s + 5); }
    }},
    { label: '📎', title: '图片', action: () => onInsert('![', '](url)') },
    { label: '📁', title: '上传文件', action: () => fileInputRef.current?.click() },
    { label: '|' },
    { label: '`', title: '行内代码', action: () => onInsert('`', '`') },
    { label: '</>', title: '代码块', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, e = ta.selectionEnd, t = ta.value;
      const sel = t.substring(s, e) || 'code';
      const b = '```\n' + sel + '\n```';
      onContentUpdate(t.substring(0, s) + b + t.substring(e), s + b.length);
    }},
    { label: '|' },
    { label: '•', title: '无序列表', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, t = ta.value;
      const ls = t.lastIndexOf('\n', s - 1) + 1;
      onContentUpdate(t.substring(0, ls) + '- ' + t.substring(ls), s + 2);
    }},
    { label: '1.', title: '有序列表', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, t = ta.value;
      const ls = t.lastIndexOf('\n', s - 1) + 1;
      onContentUpdate(t.substring(0, ls) + '1. ' + t.substring(ls), s + 3);
    }},
    { label: '❝', title: '引用', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, t = ta.value;
      const ls = t.lastIndexOf('\n', s - 1) + 1;
      onContentUpdate(t.substring(0, ls) + '> ' + t.substring(ls), s + 2);
    }},
    { label: '🎨', title: '文字颜色', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, e = ta.selectionEnd, t = ta.value;
      const sel = t.substring(s, e) || '文字';
      const h = `<span style="color:red">${sel}</span>`;
      onContentUpdate(t.substring(0, s) + h + t.substring(e), s + h.length);
    }},
    { label: '🏷️', title: '背景高亮', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, e = ta.selectionEnd, t = ta.value;
      const sel = t.substring(s, e) || '文字';
      const h = `<span style="background:yellow;color:black">${sel}</span>`;
      onContentUpdate(t.substring(0, s) + h + t.substring(e), s + h.length);
    }},
    { label: '—', title: '分割线', action: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const s = ta.selectionStart, t = ta.value;
      onContentUpdate(t.substring(0, s) + '\n---\n' + t.substring(s), s + 5);
    }},
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />
      {tools.map((tool, i) =>
        tool.label === '|' ? (
          <div key={i} className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        ) : (
          <button
            key={i}
            type="button"
            title={tool.title}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!uploading) tool.action?.();
            }}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              tool.label === '📁' && uploading
                ? 'text-blue-500 animate-pulse'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tool.label === '📁' && uploading ? '⏳' : tool.label}
          </button>
        )
      )}
    </div>
  );
}

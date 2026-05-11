'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Note, NoteCategory } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import TagInput from './TagInput';
import MarkdownViewer from './MarkdownViewer';
import MarkdownToolbar from './MarkdownToolbar';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (data: {
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    source?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('other');
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags);
      setSource(note.source || '');
    } else {
      setTitle('');
      setContent('');
      setCategory('other');
      setTags([]);
      setSource('');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [note]);

  const handleInsert = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const text = ta.value;
      const selected = text.substring(start, end) || '文字';

      const newText = text.substring(0, start) + before + selected + after + text.substring(end);
      setContent(newText);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = start + before.length + selected.length;
      });
    },
    []
  );

  const handleContentUpdate = useCallback((
    newContent: string,
    cursorStart: number,
    cursorEnd?: number,
  ) => {
    setContent(newContent);
    const ta = textareaRef.current;
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.selectionStart = cursorStart;
      ta.selectionEnd = cursorEnd ?? cursorStart;
    });
  }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content,
        category,
        tags,
        source: source.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            取消
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              showPreview
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {showPreview ? '编辑' : '预览'}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title & metadata */}
        <div className="p-4 pb-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="笔记标题"
            className="mb-4 w-full border-none bg-transparent text-xl font-bold outline-none placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />

          <div className="mb-4 flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <input
              type="url"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="来源链接（可选）"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm outline-none placeholder-gray-400"
            />
          </div>

          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Formatting toolbar (only show in edit mode) */}
        {!showPreview && <MarkdownToolbar textareaRef={textareaRef} onInsert={handleInsert} onContentUpdate={handleContentUpdate} />}

        {/* Editor / Preview */}
        <div className="p-4">
          {showPreview ? (
            <div className="min-h-[300px] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              {content ? (
                <MarkdownViewer content={content} />
              ) : (
                <p className="text-sm text-gray-400">暂无内容</p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="支持 Markdown 格式&#10;&#10;## 标题&#10;&#10;正文内容...&#10;&#10;```python&#10;print(&quot;Hello World&quot;)&#10;```"
              className="min-h-[300px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-sm font-mono outline-none resize-y focus:ring-2 focus:ring-blue-500"
              rows={15}
            />
          )}
        </div>
      </div>
    </div>
  );
}

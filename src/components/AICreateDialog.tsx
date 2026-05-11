'use client';

import { useState } from 'react';
import type { AIGeneratedNote, NoteCategory } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import TagInput from './TagInput';
import MarkdownViewer from './MarkdownViewer';

interface AICreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    source?: string;
  }) => void;
}

const API_KEY_STORAGE_KEY = 'daily-notebook-deepseek-key';

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export default function AICreateDialog({ open, onClose, onSave }: AICreateDialogProps) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AIGeneratedNote | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [apiKey, setApiKeyInput] = useState(getApiKey() || '');

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState<NoteCategory>('other');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!description.trim()) return;

    const key = apiKey.trim();
    if (!key) {
      setError('请先输入 DeepSeek API Key');
      return;
    }
    setApiKey(key);

    setGenerating(true);
    setError('');
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 4096,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `你是一个笔记整理助手。用户会用自然语言描述他们想记录的内容（代码、工具、技能、文章等），你需要将其转化为结构化的笔记。

请严格按照 JSON 格式返回，不要包含其他内容：

{
  "title": "简洁明了的标题",
  "content": "Markdown 格式的详细内容，包含必要的标题、列表、代码块等",
  "category": "code|tool|skill|article|other",
  "tags": ["标签1", "标签2"]
}

分类规则：
- code: 代码片段、编程技巧、API 用法等
- tool: 开发工具、软件、命令行工具等
- skill: 方法论、技术技能、最佳实践等
- article: 文章摘要、读书笔记、学习资料等
- file: 文档模板、配置文件、代码片段文件等
- other: 其他内容

注意：
- title 要简洁但有信息量
- content 用 Markdown 格式，结构清晰
- tags 用中文，2-4 个标签
- 如果内容中包含代码，务必用 Markdown 代码块包裹并标明语言`,
            },
            { role: 'user', content: description.trim() },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`DeepSeek API 错误 (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('DeepSeek 返回空响应');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI 返回格式错误，无法解析');

      const parsed = JSON.parse(jsonMatch[0]) as AIGeneratedNote;

      if (!parsed.title || !parsed.content || !parsed.category) {
        throw new Error('AI 返回缺少必要字段');
      }

      const validCategories: NoteCategory[] = ['code', 'tool', 'skill', 'article', 'file', 'other'];
      const note: AIGeneratedNote = {
        title: parsed.title,
        content: parsed.content,
        category: validCategories.includes(parsed.category) ? parsed.category : 'other',
        tags: parsed.tags || [],
        source: parsed.source,
      };

      setResult(note);
      setEditedTitle(note.title);
      setEditedContent(note.content);
      setEditedCategory(note.category);
      setEditedTags(note.tags || []);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      onSave({
        title: editedTitle,
        content: editedContent,
        category: editedCategory,
        tags: editedTags,
      });
      handleReset();
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDescription('');
    setResult(null);
    setError('');
    setStep('input');
    setSaving(false);
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI 创建笔记
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* API Key input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              DeepSeek API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1 text-xs text-gray-400">Key 仅保存在浏览器本地，不会上传到服务器</p>
          </div>

          {step === 'input' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                用自然语言描述你想记录的内容
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：今天学到了 Python 的装饰器模式..."
                className="w-full min-h-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-4 text-sm outline-none resize-y focus:ring-2 focus:ring-blue-500"
                rows={8}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
            </div>
          )}

          {step === 'preview' && result && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类
                </label>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value as NoteCategory)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标签
                </label>
                <TagInput tags={editedTags} onChange={setEditedTags} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  内容预览
                </label>
                <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <MarkdownViewer content={editedContent} />
                </div>
                <button
                  onClick={() => setEditedContent(result.content)}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                >
                  重置为 AI 生成的内容
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          {step === 'input' ? (
            <>
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || generating}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    生成中...
                  </span>
                ) : (
                  '生成笔记'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('input'); setResult(null); }}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                重新描述
              </button>
              <button
                onClick={handleSave}
                disabled={!editedTitle.trim() || saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存笔记'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

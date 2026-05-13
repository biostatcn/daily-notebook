'use client';

import { useState, useEffect } from 'react';
import type { Note } from '@/lib/types';
import { createNote } from '@/lib/supabase-storage';

interface MigrateDialogProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'daily-notebook-notes';

function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function MigrateDialog({ open, onClose }: MigrateDialogProps) {
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [failed, setFailed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalNotes(getLocalNotes());
      setImported(0);
      setFailed(0);
      setDone(false);
    }
  }, [open]);

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let fail = 0;

    for (const note of localNotes) {
      try {
        await createNote({
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          source: note.source,
        });
        success++;
      } catch {
        fail++;
      }
      setImported(success);
      setFailed(fail);
    }

    setDone(true);
    setImporting(false);
  }

  function handleClearLocal() {
    if (typeof window === 'undefined') return;
    if (confirm('确定要清空浏览器本地存储的笔记吗？（此操作不可撤销）')) {
      localStorage.removeItem(STORAGE_KEY);
      setLocalNotes([]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            导入本地数据
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            从浏览器本地存储（localStorage）中导入笔记到 Supabase 数据库。
          </p>

          {localNotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              浏览器中没有找到本地笔记数据
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                发现 <strong>{localNotes.length}</strong> 条本地笔记
              </p>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {localNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2"
                  >
                    <span className="text-xs text-gray-400 truncate flex-1">
                      {note.title || '无标题'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>

              {!done ? (
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing
                    ? `导入中... (${imported + failed}/${localNotes.length})`
                    : `导入 ${localNotes.length} 条笔记到服务器`}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-center space-y-1">
                    <p className="text-green-600 dark:text-green-400">
                      导入完成！
                    </p>
                    <p className="text-gray-500">
                      成功 {imported} 条{failed > 0 ? `，失败 ${failed} 条` : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleClearLocal}
                    className="w-full rounded-lg border border-red-300 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    清空本地存储的旧数据
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full rounded-lg bg-gray-100 dark:bg-gray-700 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    完成
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

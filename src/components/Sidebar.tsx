'use client';

import { CATEGORIES, type NoteCategory } from '@/lib/types';

interface SidebarProps {
  selectedCategory: NoteCategory | null;
  onSelectCategory: (category: NoteCategory | null) => void;
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalCount: number;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  tags,
  selectedTag,
  onSelectTag,
  totalCount,
}: SidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          日常记事本
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          共 {totalCount} 条笔记
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <div className="mb-3">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            分类
          </h3>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selectedCategory === null
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            全部笔记
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  cat.color.split(' ')[0]
                }`}
              />
              {cat.label}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              标签
            </h3>
            <div className="flex flex-wrap gap-1.5 px-2">
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  全部 &times;
                </button>
              )}
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Daily Notebook
        </p>
      </div>
    </aside>
  );
}

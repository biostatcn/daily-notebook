'use client';

import type { Note } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  const category = CATEGORIES.find((c) => c.value === note.category);
  const date = new Date(note.updatedAt).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });

  // Extract first line of content as preview
  const preview = note.content
    .replace(/^#+\s+/gm, '')
    .split('\n')
    .find((line) => line.trim().length > 0)
    ?.slice(0, 120) || '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-3 transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600'
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
          {note.pinned && <span className="mr-1 text-amber-500" title="已置顶">📌</span>}
          {note.title}
        </h3>
        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{date}</span>
      </div>

      {preview && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
          {preview}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {category && (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${category.color}`}>
            {category.label}
          </span>
        )}
        {note.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-md bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
        {note.tags.length > 3 && (
          <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>
        )}
      </div>
    </button>
  );
}

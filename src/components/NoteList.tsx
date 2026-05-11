'use client';

import type { Note } from '@/lib/types';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export default function NoteList({ notes, selectedId, onSelect, loading }: NoteListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="ml-2 text-sm text-gray-500">加载中...</span>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">还没有笔记</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          点击上方按钮创建第一条笔记
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isSelected={selectedId === note.id}
          onClick={() => onSelect(note.id)}
        />
      ))}
    </div>
  );
}

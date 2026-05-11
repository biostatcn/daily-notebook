export type NoteCategory = 'code' | 'tool' | 'skill' | 'article' | 'file' | 'other';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  source?: string;
  pinned?: boolean;
}

export interface NotesData {
  notes: Note[];
}

export interface AIGeneratedNote {
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  source?: string;
}

export const CATEGORIES: { value: NoteCategory; label: string; color: string }[] = [
  { value: 'code', label: '代码', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'tool', label: '工具', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'skill', label: '技能', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'article', label: '文章', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'file', label: '文件', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  { value: 'other', label: '其他', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
];

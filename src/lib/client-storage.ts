import { v4 as uuidv4 } from 'uuid';
import type { Note, NoteCategory } from './types';

const STORAGE_KEY = 'daily-notebook-notes';

function readData(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeData(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getAllNotes(): Note[] {
  return readData().sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getNoteById(id: string): Note | null {
  return readData().find((n) => n.id === id) ?? null;
}

export function createNote(input: {
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  source?: string;
}): Note {
  const notes = readData();
  const now = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  writeData(notes);
  return note;
}

export function updateNote(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    source: string;
    pinned: boolean;
  }>
): Note | null {
  const notes = readData();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  writeData(notes);
  return notes[index];
}

export function deleteNote(id: string): boolean {
  const notes = readData();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  writeData(notes);
  return true;
}

export function searchNotes(query: string): Note[] {
  const q = query.toLowerCase();
  return readData()
    .filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

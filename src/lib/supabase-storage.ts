import { supabase } from './supabase';
import type { Note, NoteCategory } from './types';

function mapRow(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category as NoteCategory,
    tags: row.tags ?? [],
    source: row.source ?? undefined,
    pinned: row.pinned ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createNote(input: {
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  source?: string;
}): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      category: input.category,
      tags: input.tags,
      source: input.source ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateNote(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    source: string;
    pinned: boolean;
  }>
): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...input,
      source: input.source ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function searchNotes(query: string): Promise<Note[]> {
  const q = `%${query.toLowerCase()}%`;
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .or(`title.ilike.${q},content.ilike.${q},tags.cs.{${query}}`)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data ? mapRow(data) : null;
}

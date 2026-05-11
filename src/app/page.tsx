'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Note, NoteCategory } from '@/lib/types';
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
} from '@/lib/client-storage';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import NoteList from '@/components/NoteList';
import NoteEditor from '@/components/NoteEditor';
import MarkdownViewer from '@/components/MarkdownViewer';
import AICreateDialog from '@/components/AICreateDialog';

type ViewState = 'empty' | 'viewing' | 'editing';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState<ViewState>('empty');
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  function refreshNotes(query?: string) {
    const data = query ? searchNotes(query) : getAllNotes();
    setNotes(data);
    setLoading(false);
  }

  useEffect(() => {
    refreshNotes();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = notes.filter((note) => {
    if (selectedCategory && note.category !== selectedCategory) return false;
    if (selectedTag && !note.tags.includes(selectedTag)) return false;
    return true;
  });

  const sidebarTags = selectedCategory || selectedTag
    ? Array.from(new Set(filteredNotes.flatMap((n) => n.tags))).sort()
    : allTags;

  function handleSelectNote(id: string) {
    setSelectedId(id);
    setViewState('viewing');
    setEditingNote(null);
  }

  function handleNewNote() {
    setSelectedId(null);
    setEditingNote(null);
    setViewState('editing');
  }

  function handleEditNote() {
    if (selectedNote) {
      setEditingNote(selectedNote);
      setViewState('editing');
    }
  }

  async function handleSave(data: {
    title: string;
    content: string;
    category: NoteCategory;
    tags: string[];
    source?: string;
  }) {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      createNote(data);
    }
    refreshNotes(searchQuery);
    setViewState('empty');
    setEditingNote(null);
    setSelectedId(null);
  }

  function handleDelete() {
    if (!selectedNote || !confirm('确定删除这条笔记吗？')) return;
    deleteNote(selectedNote.id);
    setSelectedId(null);
    setViewState('empty');
    refreshNotes(searchQuery);
  }

  function handleTogglePin() {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { pinned: !selectedNote.pinned });
    refreshNotes(searchQuery);
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    refreshNotes(query || undefined);
  }

  const categoryColor: Record<string, string> = {
    code: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    tool: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    skill: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    article: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    file: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  const categoryLabel: Record<string, string> = {
    code: '代码', tool: '工具', skill: '技能', article: '文章', file: '文件', other: '其他',
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden md:block w-56 shrink-0">
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedId(null);
            setViewState('empty');
          }}
          tags={sidebarTags}
          selectedTag={selectedTag}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            setSelectedId(null);
            setViewState('empty');
          }}
          totalCount={notes.length}
        />
      </div>

      {/* Middle column - Note list */}
      <div className="flex w-full md:w-72 shrink-0 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 space-y-2">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          <div className="flex gap-2">
            <button
              onClick={handleNewNote}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
            >
              + 新建笔记
            </button>
            <button
              onClick={() => setShowAIDialog(true)}
              className="rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 transition-colors"
              title="AI 创建笔记"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <NoteList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelect={handleSelectNote}
            loading={loading}
          />
        </div>
      </div>

      {/* Right column - Detail / Editor (desktop) */}
      <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-gray-900">
        {viewState === 'empty' && (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">选择一条笔记查看详情</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                或点击「新建笔记」开始记录
              </p>
            </div>
          </div>
        )}

        {viewState === 'viewing' && selectedNote && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${categoryColor[selectedNote.category]}`}>
                  {categoryLabel[selectedNote.category]}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(selectedNote.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleTogglePin}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    selectedNote.pinned
                      ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={selectedNote.pinned ? '取消置顶' : '置顶'}
                >
                  📌
                </button>
                <button
                  onClick={handleEditNote}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  删除
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {selectedNote.pinned && <span className="mr-2 text-amber-500">📌</span>}
                {selectedNote.title}
              </h1>

              {selectedNote.source && (
                <a
                  href={selectedNote.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mb-4 text-sm text-blue-500 hover:text-blue-600"
                >
                  🔗 {selectedNote.source}
                </a>
              )}

              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <MarkdownViewer content={selectedNote.content} />
            </div>
          </div>
        )}

        {viewState === 'editing' && (
          <NoteEditor
            note={editingNote}
            onSave={handleSave}
            onCancel={() => {
              setViewState(editingNote ? 'viewing' : 'empty');
              setEditingNote(null);
            }}
          />
        )}
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden flex-1 flex-col bg-white dark:bg-gray-900">
        {viewState === 'empty' && (
          <div className="flex flex-1 items-center justify-center text-center p-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400">选择一条笔记查看详情</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                或点击「新建笔记」开始记录
              </p>
            </div>
          </div>
        )}

        {viewState === 'viewing' && selectedNote && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <button onClick={() => setViewState('empty')} className="text-sm text-blue-500">
                &larr; 返回
              </button>
              <div className="flex items-center gap-1">
                <button onClick={handleTogglePin} className={`rounded-lg px-3 py-1.5 text-sm ${selectedNote.pinned ? 'text-amber-500' : 'text-gray-400 hover:bg-gray-100'}`}>📌</button>
                <button onClick={handleEditNote} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">编辑</button>
                <button onClick={handleDelete} className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50">删除</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h1 className="text-xl font-bold mb-3">{selectedNote.pinned && <span className="mr-1 text-amber-500">📌</span>}{selectedNote.title}</h1>
              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedNote.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">#{tag}</span>
                  ))}
                </div>
              )}
              <MarkdownViewer content={selectedNote.content} />
            </div>
          </div>
        )}

        {viewState === 'editing' && (
          <NoteEditor
            note={editingNote}
            onSave={handleSave}
            onCancel={() => {
              setViewState(editingNote ? 'viewing' : 'empty');
              setEditingNote(null);
            }}
          />
        )}
      </div>

      {/* AI Create Dialog */}
      <AICreateDialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onSave={handleSave}
      />
    </div>
  );
}

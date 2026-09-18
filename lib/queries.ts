import type { NoteTag } from '../types/note';
import { queryOptions } from '@tanstack/react-query';
import { fetchNoteById, fetchNotes } from './api';

export function notesQueryOptions(search = '', page = 1, tag?: NoteTag) {
  return queryOptions({
    queryKey: ['notes', search, page, tag ?? 'all'],
    queryFn: ({ signal }) => fetchNotes({ page, search, tag, signal }),
  });
}

export function noteQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['note', id],
    queryFn: ({ signal }) => fetchNoteById(id, signal),
  });
}

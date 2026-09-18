import { queryOptions } from '@tanstack/react-query';
import { fetchNoteById, fetchNotes } from './api';

export function notesQueryOptions(search = '', page = 1) {
  return queryOptions({
    queryKey: ['notes', search, page],
    queryFn: ({ signal }) => fetchNotes({ page, search, signal }),
  });
}

export function noteQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['note', id],
    queryFn: ({ signal }) => fetchNoteById(id, signal),
  });
}

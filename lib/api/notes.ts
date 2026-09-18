import axios, { type AxiosResponse } from 'axios';
import type {
  FetchNotesParams,
  FetchNotesResponse,
  NewNote,
  Note,
} from '../../types/note';
import { api } from './client';

export async function fetchNotes({
  page,
  perPage = 12,
  search = '',
  signal,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response: AxiosResponse<FetchNotesResponse> = await api.get('/notes', {
    params: { page, perPage, search },
    signal,
  });
  return response.data;
}

export async function createNote(note: NewNote): Promise<Note> {
  const response: AxiosResponse<Note> = await api.post('/notes', note);
  return response.data;
}

export async function fetchNoteById(
  id: Note['id'],
  signal?: AbortSignal,
): Promise<Note | null> {
  try {
    const response: AxiosResponse<Note | null> = await api.get(
      `/notes/${encodeURIComponent(id)}`,
      { signal },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function deleteNote(id: Note['id']): Promise<Note> {
  const response: AxiosResponse<Note> = await api.delete(
    `/notes/${encodeURIComponent(id)}`,
  );
  return response.data;
}

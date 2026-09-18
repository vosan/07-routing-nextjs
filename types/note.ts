export type NoteTag = 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping';

export interface NewNote {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface Note extends NewNote {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  signal?: AbortSignal;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

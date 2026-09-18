export const NOTE_TAGS = [
  'Todo',
  'Work',
  'Personal',
  'Meeting',
  'Shopping',
] as const;

export type NoteTag = (typeof NOTE_TAGS)[number];

export function isNoteTag(value: string): value is NoteTag {
  return NOTE_TAGS.some((tag) => tag === value);
}

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
  tag?: NoteTag;
  signal?: AbortSignal;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

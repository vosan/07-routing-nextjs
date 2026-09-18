import axios, {
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const note = {
  id: 'note-123',
  title: 'API test',
  content: '',
  tag: 'Todo',
  createdAt: '2026-09-17',
  updatedAt: '2026-09-17',
};
let requests: InternalAxiosRequestConfig[] = [];
const originalAdapter = axios.defaults.adapter;
const adapter: AxiosAdapter = async (config) => {
  requests.push(config);
  return {
    data: config.method === 'get' ? { notes: [note], totalPages: 2 } : note,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_NOTEHUB_TOKEN', 'test-token');
  requests = [];
  axios.defaults.adapter = adapter;
});

afterEach(() => {
  axios.defaults.adapter = originalAdapter;
  vi.unstubAllEnvs();
});

describe('NoteHub API contract', () => {
  it('sends authorization, search, pagination, and a cancellation signal', async () => {
    const { fetchNotes } = await import('../lib/api');
    const signal = new AbortController().signal;
    expect(await fetchNotes({ page: 2, search: 'project', signal })).toEqual({
      notes: [note],
      totalPages: 2,
    });
    expect(requests[0].baseURL).toBe('https://notehub-public.goit.study/api');
    expect(requests[0].headers.Authorization).toBe('Bearer test-token');
    expect(requests[0].params).toEqual({
      page: 2,
      perPage: 12,
      search: 'project',
    });
    expect(requests[0].signal).toBe(signal);
  });

  it('posts new notes and deletes by ID, returning the backend note', async () => {
    const { createNote, deleteNote } = await import('../lib/api');
    const draft = { title: 'API test', content: '', tag: 'Todo' as const };
    expect(await createNote(draft)).toEqual(note);
    expect(requests[0].method).toBe('post');
    expect(requests[0].url).toBe('/notes');
    expect(JSON.parse(requests[0].data)).toEqual(draft);
    expect(await deleteNote('note-123')).toEqual(note);
    expect(requests[1].method).toBe('delete');
    expect(requests[1].url).toBe('/notes/note-123');
  });

  it('does not send a request when the token is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_NOTEHUB_TOKEN', '');
    const { fetchNotes } = await import('../lib/api');
    await expect(fetchNotes({ page: 1 })).rejects.toThrow(
      'NoteHub is not configured',
    );
    expect(requests).toHaveLength(0);
  });
});

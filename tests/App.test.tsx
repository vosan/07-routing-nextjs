import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../app/notes/filter/[...slug]/Notes.client';
import { createNote, deleteNote, fetchNotes } from '../lib/api';
import type { Note } from '../types/note';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  fetchNotes: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
}));

const note: Note = {
  id: 'test-note',
  title: 'Project plan',
  content: 'Build NoteHub',
  tag: 'Work',
  createdAt: '2026-09-17T00:00:00Z',
  updatedAt: '2026-09-17T00:00:00Z',
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
  return { ...view, user: userEvent.setup(), client };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(fetchNotes).mockResolvedValue({ notes: [note], totalPages: 1 });
});

describe('NoteHub workflows', () => {
  it('loads notes and only shows pagination for multiple pages', async () => {
    setup();
    expect(screen.getByRole('status')).toHaveTextContent('Loading notes');
    expect(
      await screen.findByRole('heading', { name: note.title }),
    ).toBeVisible();
    expect(fetchNotes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, search: '' }),
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('paginates and resets to page one after a debounced search', async () => {
    vi.mocked(fetchNotes).mockResolvedValue({ notes: [note], totalPages: 3 });
    const { user } = setup();
    const navigation = await screen.findByRole('navigation', {
      name: 'Notes pages',
    });
    await user.click(
      within(navigation).getByRole('button', { name: 'Page 2' }),
    );
    await waitFor(() =>
      expect(fetchNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, search: '' }),
      ),
    );
    const beforeSearch = vi.mocked(fetchNotes).mock.calls.length;
    await user.type(
      screen.getByRole('textbox', { name: 'Search notes' }),
      'meeting',
    );
    expect(fetchNotes).toHaveBeenCalledTimes(beforeSearch);
    await waitFor(() =>
      expect(fetchNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, search: 'meeting' }),
      ),
    );
    expect(fetchNotes).toHaveBeenCalledTimes(beforeSearch + 1);
  });

  it('shows an empty state without rendering a notes list', async () => {
    vi.mocked(fetchNotes).mockResolvedValue({ notes: [], totalPages: 0 });
    setup();
    expect(
      await screen.findByText('No notes yet. Create your first note.'),
    ).toBeVisible();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('recovers from a fetch error when retried', async () => {
    vi.mocked(fetchNotes).mockRejectedValueOnce(new Error('Offline'));
    const { user } = setup();
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('heading', { name: note.title }),
    ).toBeVisible();
  });

  it('portals the modal, traps focus, closes via Escape, backdrop and Cancel', async () => {
    const { user, container } = setup();
    await screen.findByRole('heading', { name: note.title });
    const opener = screen.getByRole('button', { name: 'Create note +' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(container).not.toContainElement(dialog);
    expect(screen.getByLabelText('Title')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Create note' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Title')).toHaveFocus();
    await user.click(screen.getByLabelText('Content'));
    expect(dialog).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    await user.click(opener);
    await user.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(opener);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates only on submit and keeps invalid drafts open without creating notes', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Create note +' }));
    const dialog = screen.getByRole('dialog');
    const title = screen.getByLabelText('Title');
    const submit = screen.getByRole('button', {
      name: 'Create note',
    });
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Content'));
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    await user.type(title, 'ab');
    await user.tab();
    expect(
      screen.queryByText('Title must be at least 3 characters'),
    ).not.toBeInTheDocument();
    await user.clear(title);
    await user.tab();
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    await user.click(submit);
    expect(await screen.findByText('Title is required')).toBeVisible();
    expect(dialog).toBeVisible();
    expect(createNote).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'ab' },
    });
    await user.click(submit);
    expect(
      await screen.findByText('Title must be at least 3 characters'),
    ).toBeVisible();
    expect(dialog).toBeVisible();
    expect(title).toHaveValue('ab');
    expect(createNote).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'a'.repeat(51) },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'x'.repeat(501) },
    });
    await user.click(submit);
    expect(
      await screen.findByText('Title must be at most 50 characters'),
    ).toBeVisible();
    expect(
      await screen.findByText('Content must be at most 500 characters'),
    ).toBeVisible();
    expect(dialog).toBeVisible();
    expect(createNote).not.toHaveBeenCalled();
  });

  it('creates a note with optional empty content and refreshes the collection', async () => {
    const { user } = setup();
    await screen.findByRole('heading', { name: note.title });
    const created = {
      ...note,
      id: 'new',
      title: 'New note',
      content: '',
      tag: 'Todo' as const,
    };
    vi.mocked(createNote).mockResolvedValue(created);
    vi.mocked(fetchNotes).mockResolvedValue({
      notes: [created, note],
      totalPages: 1,
    });
    await user.click(screen.getByRole('button', { name: 'Create note +' }));
    await user.type(screen.getByLabelText('Title'), 'New note');
    await user.click(screen.getByRole('button', { name: 'Create note' }));
    await waitFor(() =>
      expect(createNote).toHaveBeenCalledWith(
        { title: 'New note', content: '', tag: 'Todo' },
        expect.anything(),
      ),
    );
    expect(
      await screen.findByRole('heading', { name: 'New note' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('keeps the draft when creation fails and allows retry', async () => {
    vi.mocked(createNote)
      .mockRejectedValueOnce(new Error('Creation failed'))
      .mockResolvedValue(note);
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Create note +' }));
    await user.type(screen.getByLabelText('Title'), 'My draft');
    await user.selectOptions(screen.getByLabelText('Tag'), 'Personal');
    await user.click(screen.getByRole('button', { name: 'Create note' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Creation failed',
    );
    expect(screen.getByLabelText('Title')).toHaveValue('My draft');
    await user.click(screen.getByRole('button', { name: 'Create note' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('moves back when the final note on a later page is deleted', async () => {
    vi.mocked(fetchNotes).mockResolvedValue({ notes: [note], totalPages: 2 });
    vi.mocked(deleteNote).mockResolvedValue(note);
    const { user } = setup();
    await user.click(
      within(
        await screen.findByRole('navigation', { name: 'Notes pages' }),
      ).getByRole('button', { name: 'Page 2' }),
    );
    await screen.findByRole('heading', { name: note.title });
    await waitFor(() =>
      expect(fetchNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 }),
      ),
    );
    vi.mocked(fetchNotes).mockResolvedValue({
      notes: [{ ...note, id: 'previous', title: 'Previous page' }],
      totalPages: 1,
    });
    await user.click(
      screen.getByRole('button', { name: `Delete ${note.title}` }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Previous page' }),
    ).toBeVisible();
    expect(deleteNote).toHaveBeenCalledWith(note.id, expect.anything());
    expect(fetchNotes).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 }),
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('retains the note and displays deletion failures', async () => {
    vi.mocked(deleteNote).mockRejectedValue(new Error('Deletion failed'));
    const { user } = setup();
    await user.click(
      await screen.findByRole('button', { name: `Delete ${note.title}` }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Deletion failed',
    );
    expect(screen.getByRole('heading', { name: note.title })).toBeVisible();
  });
});

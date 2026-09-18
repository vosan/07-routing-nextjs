'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { getErrorMessage } from '../../../../lib/api';
import { notesQueryOptions } from '../../../../lib/queries';
import NoteList from '../../../../components/NoteList/NoteList';
import SearchBox from '../../../../components/SearchBox/SearchBox';
import Pagination from '../../../../components/Pagination/Pagination';
import Modal from '../../../../components/Modal/Modal';
import NoteForm from '../../../../components/NoteForm/NoteForm';
import type { NoteTag } from '../../../../types/note';
import css from './NotesPage.module.css';

interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const updateSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, 300);
  const notesQuery = useQuery(notesQueryOptions(search, page, tag));

  function handleSearch(value: string) {
    setSearchInput(value);
    updateSearch(value);
  }

  return (
    <main className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onSearch={handleSearch} />
        {notesQuery.data && notesQuery.data.totalPages > 1 && (
          <Pagination
            totalPages={notesQuery.data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>
      {notesQuery.isPending && <p role="status">Loading notes…</p>}
      {notesQuery.isError && (
        <div role="alert">
          <p>
            Could not fetch the list of notes.{' '}
            {getErrorMessage(notesQuery.error)}
          </p>
          <button type="button" onClick={() => void notesQuery.refetch()}>
            Try again
          </button>
        </div>
      )}
      {notesQuery.data && notesQuery.data.notes.length > 0 && (
        <NoteList
          notes={notesQuery.data.notes}
          onDeleted={() => {
            if (notesQuery.data?.notes.length === 1 && page > 1)
              setPage(page - 1);
          }}
        />
      )}
      {notesQuery.isSuccess && notesQuery.data.notes.length === 0 && (
        <p role="status">
          {search
            ? 'No notes match your search.'
            : tag
              ? `No notes tagged ${tag} yet.`
              : 'No notes yet. Create your first note.'}
        </p>
      )}
      {notesQuery.isFetching && !notesQuery.isPending && (
        <p role="status">Updating notes…</p>
      )}
      {isModalOpen && (
        <Modal label="Create note" onClose={closeModal}>
          <NoteForm onCancel={closeModal} onSuccess={closeModal} />
        </Modal>
      )}
    </main>
  );
}

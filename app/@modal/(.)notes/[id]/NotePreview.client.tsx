'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { noteQueryOptions } from '@/lib/queries';
import type { Note } from '@/types/note';
import Modal from '@/components/Modal/Modal';
import css from './NotePreview.module.css';

interface NotePreviewProps {
  id: Note['id'];
}

export default function NotePreview({ id }: NotePreviewProps) {
  const router = useRouter();
  const closeModal = useCallback(() => router.back(), [router]);
  const {
    data: note,
    isPending,
    error,
    refetch,
  } = useQuery(noteQueryOptions(id));
  const createdDate = note
    ? new Date(note.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  return (
    <Modal
      label={note ? `Note preview: ${note.title}` : 'Note preview'}
      onClose={closeModal}
    >
      <div className={css.container}>
        <div className={css.item}>
          <button type="button" className={css.backBtn} onClick={closeModal}>
            Close
          </button>
          {isPending && <p role="status">Loading, please wait...</p>}
          {error && (
            <div role="alert">
              <p>Could not fetch note details. {getErrorMessage(error)}</p>
              <button
                type="button"
                className={css.backBtn}
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          )}
          {!isPending && !error && !note && (
            <p role="status">Note not found.</p>
          )}
          {note && (
            <>
              <div className={css.header}>
                <h2>{note.title}</h2>
              </div>
              <p className={css.tag}>{note.tag}</p>
              <p className={css.content}>{note.content}</p>
              <p className={css.date}>
                Created: <time dateTime={note.createdAt}>{createdDate}</time>
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

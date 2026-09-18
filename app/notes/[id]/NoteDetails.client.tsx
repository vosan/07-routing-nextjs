'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { noteQueryOptions } from '../../../lib/queries';
import css from './NoteDetails.module.css';

export default function NoteDetailsClient() {
  const { id } = useParams<{ id: string }>();
  const { data: note, isLoading, error } = useQuery(noteQueryOptions(id));

  if (isLoading) return <p>Loading, please wait...</p>;
  if (error || !note) return <p>Something went wrong.</p>;

  const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className={css.container}>
      <div className={css.item}>
        <Link href="/notes/filter/all" className={css.backBtn}>
          Back to notes
        </Link>
        <div className={css.header}>
          <h2>{note.title}</h2>
        </div>
        <p className={css.tag}>{note.tag}</p>
        <p className={css.content}>{note.content}</p>
        <p className={css.date}>
          Created: <time dateTime={note.createdAt}>{createdDate}</time>
        </p>
      </div>
    </div>
  );
}

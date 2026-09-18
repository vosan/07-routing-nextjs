import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getErrorMessage } from '@/lib/api';
import { notesQueryOptions } from '@/lib/queries';
import { isNoteTag } from '@/types/note';
import NotesClient from './Notes.client';

export const dynamic = 'force-dynamic';

interface FilteredNotesProps {
  params: Promise<{ slug: string[] }>;
}

export default async function FilteredNotes({ params }: FilteredNotesProps) {
  const { slug } = await params;
  const filter = slug[0];
  if (slug.length !== 1 || (filter !== 'all' && !isNoteTag(filter))) {
    notFound();
  }
  const tag = isNoteTag(filter) ? filter : undefined;
  const queryClient = new QueryClient();
  const options = notesQueryOptions('', 1, tag);
  await queryClient.prefetchQuery(options);
  const error = queryClient.getQueryState(options.queryKey)?.error;
  if (error) throw new Error(getErrorMessage(error));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={filter} tag={tag} />
    </HydrationBoundary>
  );
}

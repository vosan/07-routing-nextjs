import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getErrorMessage } from '../../../lib/api';
import { noteQueryOptions } from '../../../lib/queries';
import NoteDetailsClient from './NoteDetails.client';
import css from './NoteDetails.module.css';

export const dynamic = 'force-dynamic';

interface NoteDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetails({ params }: NoteDetailsProps) {
  const { id } = await params;
  const queryClient = new QueryClient();
  const options = noteQueryOptions(id);
  await queryClient.prefetchQuery(options);

  // Prefetch stores failures instead of throwing; forward them to error.tsx.
  const error = queryClient.getQueryState(options.queryKey)?.error;
  if (error) throw new Error(getErrorMessage(error));

  return (
    <main className={css.main}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NoteDetailsClient />
      </HydrationBoundary>
    </main>
  );
}

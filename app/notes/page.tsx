import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getErrorMessage } from '../../lib/api';
import { notesQueryOptions } from '../../lib/queries';
import NotesClient from './Notes.client';

export const dynamic = 'force-dynamic';

export default async function Notes() {
  const queryClient = new QueryClient();
  const options = notesQueryOptions();
  await queryClient.prefetchQuery(options);

  // Prefetch stores failures instead of throwing; forward them to error.tsx.
  const error = queryClient.getQueryState(options.queryKey)?.error;
  if (error) throw new Error(getErrorMessage(error));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient />
    </HydrationBoundary>
  );
}

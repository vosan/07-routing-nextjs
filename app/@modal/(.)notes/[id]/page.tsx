import NotePreview from '@/components/NotePreview/NotePreview';

interface NotePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePreviewPage({
  params,
}: NotePreviewPageProps) {
  const { id } = await params;
  return <NotePreview id={id} />;
}

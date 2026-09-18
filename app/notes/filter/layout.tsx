import type { ReactNode } from 'react';
import css from './LayoutNotes.module.css';

interface NotesLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function NotesLayout({ children, sidebar }: NotesLayoutProps) {
  return (
    <div className={css.container}>
      <aside className={css.sidebar}>
        <nav aria-label="Filter notes by tag">{sidebar}</nav>
      </aside>
      <div className={css.notesWrapper}>{children}</div>
    </div>
  );
}

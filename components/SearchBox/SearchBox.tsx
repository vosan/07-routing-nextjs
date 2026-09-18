'use client';

import type { ChangeEvent } from 'react';
import css from './SearchBox.module.css';

interface SearchBoxProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchBox({ value, onSearch }: SearchBoxProps) {
  return (
    <input
      className={css.input}
      type="text"
      placeholder="Search notes"
      aria-label="Search notes"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onSearch(event.target.value)
      }
    />
  );
}

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import Pagination from '../components/Pagination/Pagination';

// Reproduce the nested default export served by Vite's dependency optimizer.
// The App tests separately cover the unwrapped export used by Vitest.
vi.mock('react-paginate', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-paginate')>();
  return { default: { default: module.default } };
});

it('renders and changes pages when the package has a wrapped default export', async () => {
  const onPageChange = vi.fn();
  const user = userEvent.setup();

  render(
    <Pagination totalPages={4} currentPage={1} onPageChange={onPageChange} />,
  );

  await user.click(screen.getByRole('button', { name: 'Page 2' }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

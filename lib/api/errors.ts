import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      return 'Your NoteHub token is invalid. Please check the app configuration.';
    }
    return 'Unable to reach NoteHub. Please try again.';
  }
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}

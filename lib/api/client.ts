import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN?.trim();
  if (!token) {
    throw new Error(
      'NoteHub is not configured. Add NEXT_PUBLIC_NOTEHUB_TOKEN to .env.local and restart the app.',
    );
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

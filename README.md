# NoteHub

A Next.js App Router + React + TypeScript notes app for GoIT homework 06.

## Local setup

1. Use Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local` if you do not already have a local environment file.
3. Obtain your personal demo token from [the NoteHub API documentation](https://notehub-public.goit.study/api/docs/) and set `NEXT_PUBLIC_NOTEHUB_TOKEN` in `.env.local`.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

The previous `VITE_NOTEHUB_TOKEN` variable is now `NEXT_PUBLIC_NOTEHUB_TOKEN`. Restart the development server after changing it. The `.env.local` file is ignored by Git. As required by the assignment, this public variable is included in the browser bundle, so use the NoteHub demo token only.

## Routes and project structure

- `/`: the assignment's introduction to NoteHub.
- `/notes`: paginated notes, debounced search, and a validated create-note modal. Notes can be deleted from their cards.
- `/notes/[id]`: full title, tag, content, and creation date for a note.
- `app/notes/page.tsx` and `app/notes/[id]/page.tsx`: request-time server components that prefetch TanStack Query data and hydrate the client cache.
- `app/notes/Notes.client.tsx` and `app/notes/[id]/NoteDetails.client.tsx`: client query handling and rendering. Detail IDs come from `useParams()`.
- `app/loading.tsx` and the two route-specific `error.tsx` files: loading and route error states.
- `components/`: shared UI, CSS Modules, and the global `TanStackProvider`.
- `types/note.ts`: shared note and API request/response types.
- `lib/api/`: Axios client, note requests, and error handling. `lib/api.ts` re-exports the public API, including `fetchNoteById`, to match the assignment's file path.
- `lib/queries.ts`: matching query keys and functions for server prefetching and client queries.

An absent note (HTTP 404) is represented as `null` and displays the required missing-data message. Other server prefetch failures reach the relevant route error boundary. Creation and deletion refresh the notes cache; deleting a note also clears its cached detail data.

The footer displays Volodymyr Burmitskyi and the assignment's placeholder contact address, `student@notehub.app`.

## Commands

- `npm run dev`: start the Next.js development server.
- `npm run build`: create a production build.
- `npm start`: serve the production build.
- `npm run lint`: run ESLint with Next.js rules.
- `npm run format`: format source files with Prettier.
- `npm run format:check`: check formatting.
- `npm test`: run the existing Vitest suite. Vite and its React plugin are retained only for this test tooling.

The existing tests have updated imports and environment variable names for the migration. Testing and build verification are left to the developer; they were not run during implementation.

## Vercel deployment and submission

1. Push your commits to [vosan/06-notehub-nextjs](https://github.com/vosan/06-notehub-nextjs).
2. Import that repository into Vercel and select the **Next.js** framework preset with the repository root as the project root.
3. Add `NEXT_PUBLIC_NOTEHUB_TOKEN` to the Vercel environments you intend to deploy (Production and, if needed, Preview).
4. The repository's `vercel.json` selects Next.js, runs `npm run build`, and resets the output directory to the framework default. In Vercel's **Settings → Build and Deployment**, also select **Next.js** and turn off the **Output Directory** override if it still contains `dist` from the old Vite setup.
5. Deploy. Changing a public environment variable requires a new deployment.
6. Submit both the repository URL and the live Vercel URL. Wait at least five minutes after pushing changes before submitting the homework, as requested in the assignment.

## Styles

Page and component styles are copied from the [GoIT NoteHub styles, hw-06 branch](https://github.com/goitacademy/react-notehub-styles/tree/hw-06). The app retains keyboard focus and disabled-button styles and adds a footer content container. The renderless query provider has a documented, empty CSS Module. See `LICENSE.styles` for the original license.

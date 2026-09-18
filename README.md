# NoteHub

A Next.js App Router + React + TypeScript notes app for GoIT routing homework (`07-routing-nextjs`).

## Local setup

1. Use Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local` if you do not already have a local environment file.
3. Obtain your personal demo token from [the NoteHub API documentation](https://notehub-public.goit.study/api/docs/) and set `NEXT_PUBLIC_NOTEHUB_TOKEN` in `.env.local`.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

Restart the development server after changing the environment variable. `.env.local` is ignored by Git. This public variable is included in the browser bundle; use the NoteHub demo token only.

## Routes and project structure

- `/`: the NoteHub introduction.
- `/notes` and `/notes/filter`: redirect to `/notes/filter/all`.
- `/notes/filter/all`: all notes with pagination, debounced search, creation, and deletion.
- `/notes/filter/{tag}`: notes filtered by `Todo`, `Work`, `Personal`, `Meeting`, or `Shopping`. The catch-all page at `app/notes/filter/[...slug]/page.tsx` validates the tag and rejects extra path segments with the custom 404 page.
- `app/notes/filter/@sidebar`: the parallel sidebar slot renders `SidebarNotes` alongside the notes. Next.js links update the tag route without a full page reload. Changing tags resets search and pagination.
- `/notes/[id]`: the full details page when opened directly or refreshed. Server-prefetched data hydrates the client query.
- `app/@modal/(.)notes/[id]/page.tsx`: intercepts client navigation to note details and renders `NotePreview` in the shared `Modal`, keeping the current list mounted in the background. Close, Escape, and backdrop clicks call `router.back()` to restore the originating route. Browser Back and Forward also follow the modal history. The modal slot has null default and catch-all pages so it clears on other navigation.
- `app/not-found.tsx`: the assignment's exact 404 heading and description, using the provided home typography styles.
- `app/loading.tsx` and route-specific loading/error files: loading and request failure states.
- `components/`: shared UI, each in its own folder with its CSS Module, including the renderless `TanStackProvider`.
- `types/note.ts`: shared types and the single, hardcoded list of supported tags.
- `lib/api/`: Axios client, note requests, and error handling. `lib/api.ts` re-exports the public API.
- `lib/queries.ts`: query keys and functions shared by server prefetching and client queries. List keys include the search, page, and tag to keep filtered caches separate.

The backend's `GET /notes` receives `tag` only for an actual tag; the `all` filter omits that parameter. Creation and deletion invalidate all notes lists. Deleting a note also clears its cached details. A missing note is represented as `null`; previews handle loading, failure with retry, and missing notes while keeping the Close button available.

The footer displays Volodymyr Burmitskyi and the assignment's placeholder contact address, `student@notehub.app`.

## Commands

- `npm run dev`: start the development server.
- `npm run build`: create a production build.
- `npm start`: serve the production build.
- `npm run lint`: run ESLint with Next.js rules.
- `npm run format`: format source files with Prettier.
- `npm run format:check`: check formatting.
- `npm test`: run the existing Vitest suite.

Implementation files were formatted with Prettier. Tests, lint, type checks, builds, and browser testing were intentionally left to the developer, as requested.

## Vercel deployment and submission

1. After reviewing and testing locally, push the commits to [vosan/07-routing-nextjs](https://github.com/vosan/07-routing-nextjs).
2. Import that repository into Vercel with the **Next.js** preset and the repository root as the project root.
3. Add `NEXT_PUBLIC_NOTEHUB_TOKEN` to the Vercel environments you intend to deploy.
4. The repository's `vercel.json` selects Next.js, runs `npm run build`, and uses the framework's default output directory. Remove any old `dist` output directory override in the Vercel project settings.
5. Deploy. Changing a public environment variable requires a new deployment.
6. Submit the repository URL and live Vercel URL. Wait at least five minutes after pushing changes before submitting, as requested in the assignment.

Deployment and homework submission are not performed by this local implementation.

## Styles

All supplied page and component styles come from the [GoIT NoteHub styles, hw-07 branch](https://github.com/goitacademy/react-notehub-styles/tree/hw-07). Shared modules live beside their components; `LayoutNotes` and `SidebarNotes` styles live under `app/notes/filter`, and the notes, details, and home styles live beside the relevant routes. `NotePreview` uses its own supplied module. The global stylesheet retains the supplied body styles plus keyboard-focus and disabled-button rules. The modal adds a viewport height limit and scrolling for long content. The renderless query provider has a documented, empty CSS Module. See `LICENSE.styles` for the original license.

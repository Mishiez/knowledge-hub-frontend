# Knowledge Hub — Frontend

A React + TypeScript frontend for Knowledge Hub. Implements a searchable, paginated list of posts, user authentication, comments, likes, and post creation/editing/deletion.

**Backend repo:** https://github.com/Mishiez/knowledge-hub

## Tech Stack

- **React 18** + **TypeScript**
- **React Router** — client-side routing and protected routes
- **Vite** — dev server and production build
- **Vitest** + **React Testing Library** — component and interaction testing
- **Playwright** — end-to-end testing against a real running app
- **ESLint** + **Prettier** — linting and formatting
- **Docker** — multi-stage build served via nginx
- Plain CSS (no framework, no external state-management library)

## Running with Docker (recommended)

This repo is built as part of the full Knowledge Hub stack — see the [backend README](https://github.com/Mishiez/knowledge-hub) for the complete `docker compose up` instructions that bring up the frontend, backend, and database together from the backend repo.

To build this image standalone:

```bash
docker build -t knowledgehub-frontend --build-arg VITE_API_BASE_URL=http://localhost:8000/api .
```

`VITE_API_BASE_URL` must be passed as a **build argument**, not a runtime environment variable — Vite bakes environment variables into the JavaScript bundle at build time, so setting it only at container runtime has no effect on the already-built files.

The resulting image is a multi-stage build: a Node stage runs `npm run build`, then only the static `dist/` output is copied into a minimal `nginx:alpine` image — no Node runtime or dev dependencies ship in the final image.

## Getting Started (without Docker)

```bash
npm install
```

Create a `.env` file at the project root:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Then run the dev server (with the Django backend also running separately):

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev            # start the Vite dev server
npm run build           # type-check and produce an optimized production build in dist/
npm run preview          # locally preview the production build
npm run lint              # run ESLint
npm run format            # apply Prettier formatting
npm run format:check      # check formatting without writing changes
npm test                   # run unit/integration tests in watch mode
npm test -- --run           # run unit/integration tests once
npm run test:e2e             # run the Playwright end-to-end test (requires the backend running)
```

## Production Build

`npm run build` runs `tsc -b` (type-checking with no emitted output) followed by `vite build`. The output in `dist/` is a single hashed JS bundle, a single hashed CSS file, and `index.html` — there's no route-based code-splitting since the app has no lazy-loaded routes, so all pages ship in one bundle (~242 KB unminified, ~77 KB gzipped). `npm run preview` serves that build locally to confirm it actually runs, not just compiles.

## Running Tests

**Unit/integration (Vitest + RTL):**
```bash
npm test
```
Covers component rendering, user interactions (search, pagination, form submission), auth-gated routing, and async loading/error timing — all against a mocked API layer via `vi.spyOn`.

**End-to-end (Playwright):**
```bash
npm run test:e2e
```
Drives a real Chromium browser against the real running app and real Django backend — no mocking. Covers the full core journey: register a new user → land logged in → create a post → confirm it renders on its detail page → navigate home → confirm it appears in the post list. Requires the Django backend to be running separately; Playwright auto-starts the Vite dev server if it isn't already running.

## Project Structure

```
Dockerfile
.dockerignore
src/
├── api/
│   ├── posts.ts               # Typed fetch wrapper for post CRUD, likes, surfaces backend validation errors
│   ├── auth.ts                 # Typed fetch wrapper for register/login/logout
│   └── comments.ts             # Typed fetch wrapper for comment list/create/delete
├── context/
│   ├── AuthContext.ts          # Auth context definition + useAuth() hook
│   ├── AuthProvider.tsx        # Auth provider component (state, login/register/logout)
│   ├── ToastContext.ts         # Toast context definition + useToast() hook
│   └── ToastProvider.tsx       # Toast provider component (queue, auto-dismiss, rendering)
├── components/
│   ├── Header/
│   │   └── Header.tsx           # Auth-aware nav
│   ├── SearchBar/
│   │   └── SearchBar.tsx         # Controlled search input
│   ├── PostList/
│   │   └── PostList.tsx           # Maps posts to PostCard
│   ├── PostCard/
│   │   └── PostCard.tsx            # Renders a single post, links to detail page
│   ├── Pagination/
│   │   └── Pagination.tsx           # Boundary-aware page controls
│   ├── Comment/
│   │   └── Comment.tsx               # Single comment display, owner-only delete
│   ├── CommentList/
│   │   └── CommentList.tsx            # Renders comments for a post
│   ├── CommentForm/
│   │   └── CommentForm.tsx             # Protected comment submission form
│   ├── states/
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── ProtectedRoute.tsx                # Redirects unauthenticated users to /login
│   └── ProtectedRoute.test.tsx
├── pages/
│   ├── HomePage.tsx                        # Post list: search, pagination, real API data
│   ├── HomePage.test.tsx
│   ├── PostDetailPage.tsx                   # Single post view, comments, likes, owner-only Edit/Delete
│   ├── PostFormPage.tsx                      # Shared create/edit form, client + backend validation
│   ├── PostFormPage.test.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   ├── post.ts                                # Post data contract (includes like_count)
│   ├── auth.ts                                 # User / AuthResponse contracts
│   └── comment.ts                               # Comment data contract
├── App.tsx                                       # Route definitions
├── main.tsx                                       # AuthProvider + ToastProvider + app entry
└── test-setup.ts                                   # jest-dom setup for Vitest

tests/
└── full-journey.spec.ts                              # Playwright E2E test: register → create post → view listing
```

## Architecture Notes

- **API calls go through one place.** Components never call `fetch` directly — they use typed functions like `getPosts()` from `api/posts.ts`. This kept the switch from mock data to the real backend from requiring any component changes.
- **Some state is calculated, not stored.** `filteredPosts`, `visiblePosts`, and `totalPages` on `HomePage` are recalculated from `posts`, `searchTerm`, and `currentPage` on every render instead of living in their own `useState`. That way they can never drift out of sync with the data they're based on.
- **Contexts are split into two files each** (e.g. `AuthContext.ts` + `AuthProvider.tsx`). Vite's fast-refresh breaks if a file exports both a component and non-component values, so the context/hook and the provider component live separately.
- **Auth is global, everything else is local.** `AuthProvider` holds the logged-in user and token because the header, route guards, and ownership checks all need them. Page-specific things like search term or form fields stay local to the page that owns them.
- **Frontend ownership checks are UI-only, not security.** `PostDetailPage` compares the logged-in username to a post's author to decide whether to show Edit/Delete. The backend is what actually blocks unauthorized changes, with a `403` response — the frontend hiding a button never counts as real protection on its own.
- **Tokens live in `localStorage`.** `AuthProvider` is the only code that writes to it; the API layer only reads from it when attaching the `Authorization` header.
- **Validation happens on both sides.** The frontend catches obvious mistakes (like a too-short title) before sending a request. The backend is the real authority — if it rejects something, `api/posts.ts` reads the actual error message from the response and shows that, instead of a generic failure message.
- **E2E tests use fresh, unique data every run** (a timestamp-suffixed username and post title), so the test can be run repeatedly without hitting duplicate-data errors from a previous run.
- **The API URL must be set at build time, not runtime, in Docker.** Vite bakes `VITE_API_BASE_URL` into the JavaScript bundle when it's built, so it has to be passed in as a Docker build argument — setting it as a container environment variable afterward has no effect.

## Current Scope

**Included:** real-time post fetching from a live Django API, search filtering, pagination, loading/empty/error states, user registration and login, token-based auth persisted across page reloads, protected routes, post creation/editing/deletion restricted to the post's owner, comment viewing/creation/deletion, post likes, client + backend validation with surfaced error messages, a full RTL unit/integration test suite, ESLint + Prettier enforcement, a Playwright end-to-end test of the core user journey, and a Dockerized production build.

**Excluded (deliberately, for now):** Redux/Zustand, React Query, server-side search/ordering.

## Next Steps

Further UI polish, and any adjustments needed if the backend's pagination or filtering contract changes further.
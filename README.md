# Knowledge Hub — Frontend

A React + TypeScript frontend for Knowledge Hub. Implements a searchable, paginated list of posts, user authentication, comments, and post creation/editing/deletion.

**Backend repo:** https://github.com/Mishiez/knowledge-hub

## Tech Stack

- **React 18** + **TypeScript**
- **React Router** — client-side routing and protected routes
- **Vite** — dev server and production build
- **Vitest** + **React Testing Library** — component and interaction testing
- **Playwright** — end-to-end testing against a real running app
- **ESLint** + **Prettier** — linting and formatting
- Plain CSS (no framework, no external state-management library)

## Getting Started

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
src/
├── api/
│   ├── posts.ts               # Typed fetch wrapper for post CRUD, surfaces backend validation errors
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
│   ├── PostDetailPage.tsx                   # Single post view, comments, owner-only Edit/Delete
│   ├── PostFormPage.tsx                      # Shared create/edit form, client + backend validation
│   ├── PostFormPage.test.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   ├── post.ts                                # Post data contract
│   ├── auth.ts                                 # User / AuthResponse contracts
│   └── comment.ts                               # Comment data contract
├── App.tsx                                       # Route definitions
├── main.tsx                                       # AuthProvider + ToastProvider + app entry
└── test-setup.ts                                   # jest-dom setup for Vitest

tests/
└── full-journey.spec.ts                              # Playwright E2E test: register → create post → view listing
```

## Architecture Notes

- **Data boundary:** components never call `fetch` directly — they call typed functions like `getPosts()` from `api/posts.ts`, which return `Promise<Post[]>`. This is the same contract the project started with when `getPosts()` was still backed by mock data, so connecting the real backend required no changes to any component.
- **Derived vs. stored state:** `filteredPosts`, `visiblePosts`, and `totalPages` on `HomePage` are calculated on render from `posts`, `searchTerm`, and `currentPage` rather than stored separately, so they can never fall out of sync with each other.
- **Auth and Toast contexts are split into two files each** (`*Context.ts` for the context object and hook, `*Provider.tsx` for the component). This isn't just style — a file that exports both a component and non-component values breaks Vite's fast-refresh, since it can't tell what to hot-reload. Splitting them satisfies the `react-refresh/only-export-components` lint rule.
- **Auth state is global, page state is local:** `AuthProvider` holds the current user and token because the header, route guards, and ownership checks all need it. Everything else (search term, current page, form fields) stays local to the component that owns it.
- **Ownership enforcement, frontend side:** `PostDetailPage` compares the logged-in user's username against a post's or comment's `author` field to decide whether to show Edit/Delete controls. This is a UI convenience only — the backend independently enforces ownership via a `403` response on any unauthorized write, regardless of what the frontend displays. (Confirmed necessary: an earlier backend gap meant `PostDetailView` had no ownership check at all — the frontend correctly hid the buttons, but the API itself would have allowed the edit. Backend tests are what actually catch this class of bug; the frontend hiding a button is not a security guarantee.)
- **Token auth:** the API wrapper attaches `Authorization: Token <value>` to any request that needs it, reading the token from `localStorage`. `AuthProvider` is the only piece of code that writes to `localStorage`; API functions only read from it.
- **Validation:** client-side checks (e.g. minimum title length, non-blank content) catch obvious mistakes before a request is sent. The backend is the actual source of truth for validity — `api/posts.ts` parses error responses from failed requests and surfaces the backend's real message (e.g. "A post with this slug already exists") rather than a generic failure string. Both an inline form error and a toast notification render on validation failure, which is why tests asserting on the error text use `findAllByText`/`getAllByText` rather than the singular form.
- **E2E test data:** the Playwright test registers a fresh, timestamp-suffixed username and post title on every run, rather than reusing fixed values. This avoids the "duplicate slug" validation error the backend correctly enforces, and means the test can be re-run any number of times without manual cleanup.

## Current Scope

**Included:** real-time post fetching from a live Django API, search filtering, pagination, loading/empty/error states, user registration and login, token-based auth persisted across page reloads, protected routes, post creation/editing/deletion restricted to the post's owner, comment viewing/creation/deletion, client + backend validation with surfaced error messages, a full RTL unit/integration test suite, ESLint + Prettier enforcement, and a Playwright end-to-end test of the core user journey.

**Excluded (deliberately, for now):** Redux/Zustand, React Query, server-side search/ordering beyond what the backend's `?search=` and `?author__username=` query params provide, route-based code-splitting.

## Next Steps

Further UI polish, and any adjustments needed if the backend's pagination or filtering contract changes further.
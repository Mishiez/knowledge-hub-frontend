# Knowledge Hub — Frontend

A React + TypeScript frontend for the Knowledge Hub project. Implements a searchable, paginated list of posts, user authentication, post creation/editing/deletion, and comments — connected to a live Django REST Framework API.

**Backend repo:** https://github.com/Mishiez/knowledge-hub

## Tech Stack

- **React 18** + **TypeScript**
- **React Router** — client-side routing and protected routes
- **Vite** — dev server and build tool
- **Vitest** + **React Testing Library** — component and interaction testing
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

## Running Tests

```bash
npm test
```

Runs the full test suite in watch mode. Use `npm test -- --run` for a single non-watch run.

## Project Structure

```
src/
├── api/
│   ├── posts.ts           # Typed fetch wrapper for post CRUD, surfaces backend validation errors
│   ├── auth.ts             # Typed fetch wrapper for register/login/logout
│   └── comments.ts         # Typed fetch wrapper for comment list/create/delete
├── context/
│   ├── AuthContext.tsx     # Global auth state: current user, token, login/logout
│   └── ToastContext.tsx    # Global toast/notification state
├── components/
│   ├── Header/             # Auth-aware nav
│   ├── SearchBar/           # Controlled search input
│   ├── PostList/            # Maps posts to PostCard
│   ├── PostCard/            # Renders a single post, links to detail page
│   ├── Pagination/          # Boundary-aware page controls
│   ├── Comment/             # Single comment display, owner-only delete
│   ├── CommentList/         # Renders comments for a post
│   ├── CommentForm/         # Protected comment submission form
│   ├── ProtectedRoute.tsx   # Redirects unauthenticated users to /login
│   └── states/               # LoadingState, EmptyState, ErrorState
├── pages/
│   ├── HomePage.tsx          # Post list: search, pagination, real API data
│   ├── PostDetailPage.tsx    # Single post view, comments, owner-only Edit/Delete
│   ├── PostFormPage.tsx      # Shared create/edit form, client + backend validation
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   ├── post.ts                # Post data contract
│   ├── auth.ts                 # User / AuthResponse contracts
│   └── comment.ts              # Comment data contract
├── App.tsx                     # Route definitions
└── main.tsx                     # AuthProvider + ToastProvider + app entry
```

## Architecture Notes

- **Data boundary:** components never call `fetch` directly — they call typed functions like `getPosts()` from `api/posts.ts`, which return `Promise<Post[]>`. This is the same contract the project started with when `getPosts()` was still backed by mock data, so connecting the real backend required no changes to any component.
- **Derived vs. stored state:** `filteredPosts`, `visiblePosts`, and `totalPages` on `HomePage` are calculated on render from `posts`, `searchTerm`, and `currentPage` rather than stored separately, so they can never fall out of sync with each other.
- **Auth state is global, page state is local:** `AuthContext` holds the current user and token because the header, route guards, and ownership checks all need it. Everything else (search term, current page, form fields) stays local to the component that owns it.
- **Ownership enforcement, frontend side:** `PostDetailPage` compares the logged-in user's username against a post's or comment's `author` field to decide whether to show Edit/Delete controls. This is a UI convenience only — the backend independently enforces ownership via a `403` response on any unauthorized write, regardless of what the frontend displays. (Confirmed necessary: an earlier backend gap meant `PostDetailView` had no ownership check at all — the frontend correctly hid the buttons, but the API itself would have allowed the edit. Backend tests are what actually catch this class of bug; the frontend hiding a button is not a security guarantee.)
- **Token auth:** the API wrapper attaches `Authorization: Token <value>` to any request that needs it, reading the token from `localStorage`. `AuthContext` is the only piece of code that writes to `localStorage`; API functions only read from it.
- **Validation:** client-side checks (e.g. minimum title length, non-blank content) catch obvious mistakes before a request is sent. The backend is the actual source of truth for validity — `api/posts.ts` parses error responses from failed requests and surfaces the backend's real message (e.g. "A post with this slug already exists") rather than a generic failure string.

## Current Scope

**Included:** real-time post fetching from a live Django API, search filtering, pagination, loading/empty/error states, user registration and login, token-based auth persisted across page reloads, protected routes, post creation/editing/deletion restricted to the post's owner, comment viewing/creation/deletion, and client + backend validation with surfaced error messages. Full RTL test suite covering rendering, interactions, and async timing.

**Excluded (deliberately, for now):** Redux/Zustand, React Query, server-side search/ordering beyond what the backend's `?search=` and `?author__username=` query params provide.

## Next Steps

Further UI polish and any adjustments needed if the backend's pagination or filtering contract changes further.

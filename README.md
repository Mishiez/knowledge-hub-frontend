# Knowledge Hub — Frontend

A React + TypeScript frontend for the Knowledge Hub project. What started as a mock-data build to learn core React fundamentals — state, derived data, controlled components, conditional rendering, and testing — has since been connected to a real Django REST Framework backend, with authentication and full post CRUD.

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
│   ├── posts.ts          # Typed fetch wrapper for post CRUD
│   └── auth.ts           # Typed fetch wrapper for register/login/logout
├── context/
│   └── AuthContext.tsx   # Global auth state: current user, token, login/logout
├── components/
│   ├── Header/           # Auth-aware nav
│   ├── SearchBar/         # Controlled search input
│   ├── PostList/          # Maps posts to PostCard
│   ├── PostCard/          # Renders a single post, links to detail page
│   ├── Pagination/        # Boundary-aware page controls
│   ├── ProtectedRoute.tsx # Redirects unauthenticated users to /login
│   └── states/             # LoadingState, EmptyState, ErrorState
├── pages/
│   ├── HomePage.tsx        # Post list: search, pagination, real API data
│   ├── PostDetailPage.tsx  # Single post view, owner-only Edit/Delete
│   ├── PostFormPage.tsx    # Shared create/edit form
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── types/
│   ├── post.ts             # Post data contract
│   └── auth.ts             # User / AuthResponse contracts
├── App.tsx                 # Route definitions
└── main.tsx                 # AuthProvider + app entry
```

## Architecture Notes

- **Data boundary:** components never call `fetch` directly — they call typed functions like `getPosts()` from `api/posts.ts`, which return `Promise<Post[]>`. This is the same contract the project started with when `getPosts()` was still backed by mock data, so connecting the real backend required no changes to any component.
- **Derived vs. stored state:** `filteredPosts`, `visiblePosts`, and `totalPages` on `HomePage` are calculated on render from `posts`, `searchTerm`, and `currentPage` rather than stored separately, so they can never fall out of sync with each other.
- **Auth state is global, page state is local:** `AuthContext` holds the current user and token because the header, route guards, and ownership checks all need it. Everything else (search term, current page, form fields) stays local to the component that owns it.
- **Ownership enforcement, frontend side:** `PostDetailPage` compares the logged-in user's username against the post's `author` field to decide whether to show Edit/Delete controls. This is a UI convenience only — the backend independently enforces ownership via a `403` response on any unauthorized write, regardless of what the frontend displays.
- **Token auth:** the API wrapper attaches `Authorization: Token <value>` to any request that needs it, reading the token from `localStorage`. `AuthContext` is the only piece of code that writes to `localStorage`; API functions only read from it.

## Current Scope

**Included:** real-time post fetching from a live Django API, search filtering, pagination, loading/empty/error states, user registration and login, token-based auth persisted across page reloads, protected routes, and post creation/editing/deletion restricted to the post's owner. Full RTL test suite covering rendering, interactions, and async timing.

**Excluded (deliberately, for now):** Redux/Zustand, React Query, comments UI, filtering/search/ordering beyond client-side title/content search, and server-side pagination (the current `/api/posts/` endpoint returns an unpaginated list).

## Next Steps

Comment creation/display, and adapting `getPosts()` if/when the backend re-enables server-side pagination (which will change the response shape from a raw array to a paginated object).
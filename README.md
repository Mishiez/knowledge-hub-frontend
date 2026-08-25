# Knowledge Hub — Frontend

A React + TypeScript frontend for the Knowledge Hub project. The goal of this gate was to learn core React fundamentals — state, derived data, controlled components, conditional rendering, and testing — using a mock data layer.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — dev server and build tool
- **Vitest** + **React Testing Library** — component and interaction testing
- Plain CSS (no framework, no state-management library)

## Getting Started

```bash
npm install
npm run dev
```

Runs the app locally with hot reload.

## Running Tests

```bash
npm test
```

Runs the full test suite in watch mode. Use `npm test -- --run` for a single non-watch run.

## Project Structure

```
src/
├── components/
│   ├── SearchBar/       # Controlled search input
│   ├── PostList/        # Maps posts to PostCard
│   ├── PostCard/        # Renders a single post
│   ├── Pagination/      # Boundary-aware page controls
│   └── states/          # LoadingState, EmptyState, ErrorState
├── pages/
│   └── HomePage.tsx     # Owns all state; composes the above
├── types/
│   └── post.ts          # Post data contract
├── services/
│   └── posts.ts         # Mock data service (Promise<Post[]>-based)
├── App.tsx
└── main.tsx
```

## Architecture Notes

- **Data boundary:** Components never know whether data comes from a mock or a real API — they only ever call `getPosts()` and receive `Promise<Post[]>`. When a real Django endpoint is ready, only the inside of `getPosts()` changes; no component code needs to change.
- **Derived vs. stored state:** `filteredPosts`, `visiblePosts`, and `totalPages` are calculated on render from `posts`, `searchTerm`, and `currentPage` rather than stored separately — this avoids the two ever falling out of sync.
- **Mock service scenarios:** `getPosts(scenario)` accepts `'success' | 'empty' | 'error'` to deterministically simulate each backend response for both manual testing and automated tests, including an artificial delay so loading states are actually observable.

## Current Scope

Included: static rendering, mock async data fetching, loading/empty/error states, search filtering, pagination, `useMemo`-based re-render optimization, and a full RTL test suite.

Excluded: Redux/Zustand, React Query, authentication, complex routing, server-side pagination, and topic filtering (the backend doesn't yet support topics).

## Next Steps

Connecting to the real Django backend.
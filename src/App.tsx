import type { Post } from './types/post';
import PostList from './components/PostList/PostList';

const dummyPosts: Post[] = [
  {
    id: 1,
    title: 'Understanding useEffect',
    slug: 'understanding-useeffect',
    content: 'useEffect runs after render and lets you sync with external systems.',
    author: 'Michelle',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Why Props Flow Down',
    slug: 'why-props-flow-down',
    content: 'React data flow is one-directional: parent to child via props.',
    author: 'Michelle',
    created_at: '2026-08-10T14:30:00Z',
  },
  {
    id: 3,
    title: 'TypeScript Interfaces vs Types',
    slug: 'ts-interfaces-vs-types',
    content: 'Interfaces are extendable and preferred for object shapes like Post.',
    author: 'Michelle',
    created_at: '2026-08-15T09:15:00Z',
  },
];

function App() {
  return (
    <div className="app">
      <h1>Knowledge Hub</h1>
      <PostList posts={dummyPosts} />
    </div>
  );
}

export default App;
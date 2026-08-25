import { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types/post';
import { getPosts, type Scenario } from '../services/posts';
import PostList from '../components/PostList/PostList';
import SearchBar from '../components/SearchBar/SearchBar';
import LoadingState from '../components/states/LoadingState';
import EmptyState from '../components/states/EmptyState';
import ErrorState from '../components/states/ErrorState';

const DEV_SCENARIO: Scenario = 'success';

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadPosts = useCallback(() => {
    setLoading(true);
    setError(false);

    getPosts(DEV_SCENARIO)
      .then((data) => {
        setPosts(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Derived — not stored in state. Recalculated on every render from
  // posts + searchTerm, so it's always in sync with both.
  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term)
    );
  });

  return (
    <div className="home-page">
      <h1>Knowledge Hub</h1>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={loadPosts} />}
      {!loading && !error && filteredPosts.length === 0 && <EmptyState />}
      {!loading && !error && filteredPosts.length > 0 && (
        <PostList posts={filteredPosts} />
      )}
    </div>
  );
}

export default HomePage;
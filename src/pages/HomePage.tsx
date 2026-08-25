import { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types/post';
import { getPosts, type Scenario } from '../services/posts';
import PostList from '../components/PostList/PostList';
import LoadingState from '../components/states/LoadingState';
import EmptyState from '../components/states/EmptyState';
import ErrorState from '../components/states/ErrorState';

// Temporary dev-only control so you can manually confirm all four states.
// Not a real feature — swap/remove once you've visually verified each one.
const DEV_SCENARIO: Scenario = 'error';

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

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

  return (
    <div className="home-page">
      <h1>Knowledge Hub</h1>
      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={loadPosts} />}
      {!loading && !error && posts.length === 0 && <EmptyState />}
      {!loading && !error && posts.length > 0 && <PostList posts={posts} />}
    </div>
  );
}

export default HomePage;
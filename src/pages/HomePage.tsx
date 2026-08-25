import { useState, useEffect } from 'react';
import type { Post } from '../types/post';
import { getPosts } from '../services/posts';
import PostList from '../components/PostList/PostList';

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    getPosts('success')
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

  return (
    <div className="home-page">
      <h1>Knowledge Hub</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Something went wrong.</p>}
      {!loading && !error && <PostList posts={posts} />}
    </div>
  );
}

export default HomePage;
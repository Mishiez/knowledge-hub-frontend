import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post } from '../types/post';
import { getPostBySlug } from '../api/posts';
import LoadingState from '../components/states/LoadingState';
import ErrorState from '../components/states/ErrorState';

function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    getPostBySlug(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error || !post) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <article className="post-detail">
      <Link to="/">← Back</Link>
      <h1>{post.title}</h1>
      <p className="post-meta">By {post.author} · {new Date(post.created_at).toLocaleDateString()}</p>
      <p>{post.content}</p>
    </article>
  );
}

export default PostDetailPage;
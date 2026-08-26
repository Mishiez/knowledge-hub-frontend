import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Post } from '../types/post';
import { getPostBySlug, deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/states/LoadingState';
import ErrorState from '../components/states/ErrorState';

function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  async function handleDelete() {
    if (!post) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePost(post.slug);
      navigate('/');
    } catch {
      window.alert('Could not delete post.');
    }
  }

  if (loading) return <LoadingState />;
  if (error || !post) return <ErrorState onRetry={() => window.location.reload()} />;

  const isOwner = user?.username === post.author;

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">← Back</Link>
      <h1>{post.title}</h1>
      <p className="post-meta">
        By {post.author} · {new Date(post.created_at).toLocaleDateString()}
      </p>
      <p className="post-detail-content">{post.content}</p>

      {isOwner && (
        <div className="post-detail-actions">
          <Link to={`/posts/${post.slug}/edit`} className="btn-edit">Edit</Link>
          <button onClick={handleDelete} className="btn-delete">Delete</button>
        </div>
      )}
    </article>
  );
}

export default PostDetailPage;
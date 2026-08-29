import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Post } from '../types/post';
import type { Comment } from '../types/comment'; // or '../types/comment' if you split it
import { getPostBySlug, deletePost } from '../api/posts';
import { getComments, createComment, deleteComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/states/LoadingState';
import ErrorState from '../components/states/ErrorState';
import { CommentList } from '../components/CommentList/CommentList';
import { CommentForm } from '../components/CommentForm/CommentForm';

function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // assumes { user, token }
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load post
  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(false);
    getPostBySlug(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);
  // Load comments once we have the post
  useEffect(() => {
    if (!post?.id) return;
    getComments(post.id).then(setComments).catch(console.error);
  }, [post?.id]);

  async function handleDeletePost() {
    if (!post) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePost(post.slug);
      navigate('/');
    } catch {
      window.alert('Could not delete post.');
    }
  }

  async function handleCreateComment(body: string) {
    if (!post || !token) return;
    try {
      const newComment = await createComment(post.id, body, token);
      setComments((prev) => [...prev, newComment]); // local update, no re-fetch
    } catch {
      window.alert('Could not post comment.');
    }
  }

  async function handleDeleteComment(id: number) {
    if (!token) return;
    try {
      await deleteComment(id, token);
      setComments((prev) => prev.filter((c) => c.id !== id)); // local update
    } catch {
      window.alert('Could not delete comment.');
    }
  }

  if (loading) return <LoadingState />;
  if (error || !post) return <ErrorState onRetry={() => window.location.reload()} />;

  const isOwner = user?.username === post.author;

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">
        ← Back
      </Link>
      <h1>{post.title}</h1>
      <p className="post-meta">
        By {post.author} · {new Date(post.created_at).toLocaleDateString()}
      </p>
      <p className="post-detail-content">{post.content}</p>

      {isOwner && (
        <div className="post-detail-actions">
          <Link to={`/posts/${post.slug}/edit`} className="btn-edit">
            Edit
          </Link>
          <button onClick={handleDeletePost} className="btn-delete">
            Delete
          </button>
        </div>
      )}

      {/* Comments section */}
      <section className="comments-section">
        <h2>Comments</h2>
        <CommentList
          comments={comments}
          currentUsername={user?.username}
          onDelete={handleDeleteComment}
        />
        {user ? (
          <CommentForm onSubmit={handleCreateComment} />
        ) : (
          <p className="login-prompt">
            <Link to="/login">Log in</Link> to leave a comment.
          </p>
        )}
      </section>
    </article>
  );
}

export default PostDetailPage;

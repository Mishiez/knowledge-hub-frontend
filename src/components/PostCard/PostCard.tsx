import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <h2>
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="post-meta">
        By {post.author} · {new Date(post.created_at).toLocaleDateString()} · ♡ {post.like_count}
      </p>
      <p>{post.content}</p>
    </article>
  );
}

export default PostCard;

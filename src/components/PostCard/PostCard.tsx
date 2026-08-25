import type { Post } from '../../types/post';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <p className="post-meta">
        By {post.author} · {new Date(post.created_at).toLocaleDateString()}
      </p>
      <p>{post.content}</p>
    </article>
  );
}

export default PostCard;
import type { Comment as CommentType } from "../../types/comment";

interface CommentProps {
  comment: CommentType;
  currentUsername?: string;
  onDelete: (id: number) => void;
}

export function Comment({ comment, currentUsername, onDelete }: CommentProps) {
  const isOwner = currentUsername === comment.author;

  return (
    <div className="comment">
      <strong>{comment.author}</strong>
      <p>{comment.body}</p>
      <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
      {isOwner && (
        <button onClick={() => onDelete(comment.id)}>Delete</button>
      )}
    </div>
  );
}
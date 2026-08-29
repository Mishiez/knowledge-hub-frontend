import type { Comment as CommentType } from '../../types/comment';
import { Comment } from '../Comment/Comment';

interface CommentListProps {
  comments: CommentType[];
  currentUsername?: string;
  onDelete: (id: number) => void;
}

export function CommentList({ comments, currentUsername, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          currentUsername={currentUsername}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

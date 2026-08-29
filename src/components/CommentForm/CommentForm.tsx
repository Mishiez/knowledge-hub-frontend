import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (body: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body);
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
      />
      <button type="submit">Post Comment</button>
    </form>
  );
}

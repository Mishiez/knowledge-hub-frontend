import type { Comment } from "../types/comment";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getComments(postId: number): Promise<Comment[]> {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments/`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function createComment(
  postId: number,
  body: string,
  token: string
): Promise<Comment> {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}

export async function deleteComment(commentId: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/comments/${commentId}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}
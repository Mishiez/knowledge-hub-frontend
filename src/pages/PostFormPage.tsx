import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, updatePost, getPostBySlug } from '../api/posts';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function PostFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !slug) return;
    getPostBySlug(slug)
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
      })
      .finally(() => setLoading(false));
  }, [isEdit, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && slug) {
        const updated = await updatePost(slug, { title, content });
        navigate(`/posts/${updated.slug}`);
      } else {
        const newPost = await createPost({ title, content, slug: slugify(title) });
        navigate(`/posts/${newPost.slug}`);
      }
    } catch {
      setError('Could not save post. Check your input and try again.');
    }
  }

  if (loading) return null;

  return (
    <div className="post-form-page">
      <h1>{isEdit ? 'Edit Post' : 'New Post'}</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
        {error && <p className="form-error">{error}</p>}
        <button type="submit">{isEdit ? 'Save Changes' : 'Publish'}</button>
      </form>
    </div>
  );
}

export default PostFormPage;
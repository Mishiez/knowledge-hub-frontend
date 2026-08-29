import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Post } from '../types/post';
import { getPosts } from '../api/posts';
import PostList from '../components/PostList/PostList';
import SearchBar from '../components/SearchBar/SearchBar';
import Pagination from '../components/Pagination/Pagination';
import LoadingState from '../components/states/LoadingState';
import EmptyState from '../components/states/EmptyState';
import ErrorState from '../components/states/ErrorState';

const PAGE_SIZE = 4; // small on purpose, so pagination is actually testable with 3 mock posts

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadPosts = useCallback(() => {
    setLoading(true);
    setError(false);

    getPosts()
      .then((data) => {
        setPosts(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return posts.filter(
      (post) => post.title.toLowerCase().includes(term) || post.content.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));

  const visiblePosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setCurrentPage(1); // new search = new result set, page 1 makes sense again
  }

  return (
    <div className="home-page">
      <h1>Knowledge Hub</h1>
      <SearchBar value={searchTerm} onChange={handleSearchChange} />

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={loadPosts} />}
      {!loading && !error && filteredPosts.length === 0 && <EmptyState />}
      {!loading && !error && filteredPosts.length > 0 && (
        <>
          <PostList posts={visiblePosts} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default HomePage;

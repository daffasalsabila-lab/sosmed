import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/http';
import { fetchPosts } from '../api';

const mergeUnique = (prev, next) => {
  const seen = new Set(prev.map((p) => p.id));
  return [...prev, ...next.filter((p) => !seen.has(p.id))];
};

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPosts(1)
      .then(({ posts: rows, meta }) => {
        if (!active) return;
        setPosts(rows);
        setHasMore(meta.hasMore);
      })
      .catch((err) => toast.error(getErrorMessage(err, 'Gagal memuat beranda')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const { posts: rows, meta } = await fetchPosts(page + 1);
      setPosts((prev) => mergeUnique(prev, rows));
      setPage(page + 1);
      setHasMore(meta.hasMore);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [page]);

  const addPost = useCallback((post) => setPosts((prev) => [post, ...prev]), []); // terbaru di paling atas
  const removePost = useCallback((id) => setPosts((prev) => prev.filter((p) => p.id !== id)), []);
  const patchPost = useCallback(
    (id, patch) => setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [],
  );

  return { posts, loading, loadingMore, hasMore, loadMore, addPost, removePost, patchPost };
}

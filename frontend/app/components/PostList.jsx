"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import { apiFetch } from "../function/utils";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/feed?page=${p}`);
      // expecting { posts: [...], nextPage: n or null }
      if (p === 1) setPosts(data.posts || []);
      else setPosts((prev) => [...prev, ...(data.posts || [])]);
      setHasMore(Boolean(data.nextPage));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load
    fetchPage(1);
  }, [fetchPage]);

  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        setPage((p) => p + 1);
      }
    });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page === 1) return;
    fetchPage(page);
  }, [page, fetchPage]);

  const handleRefetch = () => fetchPage(1); // used after posting

  if (!loading && posts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        You’re not following anyone yet. Follow someone to see their posts.
      </div>
    );
  }
  return (
    <div>
      <div className="divide-y">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <div ref={loaderRef} className="p-4 text-center">
        {loading
          ? "Loading..."
          : hasMore
          ? "Scroll to load more"
          : "No more posts"}
      </div>
    </div>
  );
};

export default PostList;

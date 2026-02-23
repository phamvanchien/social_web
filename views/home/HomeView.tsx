"use client";
import React, { useEffect, useState, useCallback } from "react";
import PostCard from "@/components/layouts/posts/PostCard";
import { listPosts } from "@/api/post.api";
import { ResponsePostItem } from "@/types/post.type";
import { ResponseWithPaginationType } from "@/types/base.type";
import { API_CODE } from "@/enums/api.enum";
import ErrorList from "@/components/common/ErrorList";
import PostCardLoading from "@/components/layouts/posts/PostCardLoading";

const HomeView = () => {
  const [posts, setPosts] = useState<ResponseWithPaginationType<ResponsePostItem[]>>();
  // const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorPage, setErrorPage] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  // const socket = useSocket();

  // Lấy vị trí hiện tại
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        console.log("Geolocation error:", error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setErrorPage(false);
    try {
      const response = await listPosts({
        page: 1,
        size: 10,
        ...(currentCoords && {
          longitude: currentCoords.lng,
          latitude: currentCoords.lat,
        }),
      });
      if (response && response.code === API_CODE.OK) {
        setPosts(response.data);
        return;
      }
      setErrorPage(true);
    } catch (error) {
      console.log(error)
      setErrorPage(true);
    } finally {
      setLoading(false);
    }
  }, [currentCoords]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <section className="col-span-12 lg:col-span-6">
      {loading && !errorPage && !posts && (
        <>
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="mb-4">
              <PostCardLoading />
            </div>
          ))}
        </>
      )}

      {!loading && errorPage && !posts && (
        <ErrorList onRetry={fetchPosts} />
      )}

      {!loading && !errorPage && posts &&
        posts.items.map((post, i) => (
          <div key={i} className="mb-4">
            <PostCard post={post} />
          </div>
        ))}
    </section>
  );
};
export default HomeView;


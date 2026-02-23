"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard from "@/components/layouts/posts/PostCard";
import { getPostDetail } from "@/api/post.api";
import { ResponsePostItem } from "@/types/post.type";
import { API_CODE } from "@/enums/api.enum";
import ErrorList from "@/components/common/ErrorList";
import PostCardLoading from "@/components/layouts/posts/PostCardLoading";

export default function PostDetailPage() {
  const params = useParams();
  const encodedId = params.id as string;

  const [post, setPost] = useState<ResponsePostItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorPage, setErrorPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPost = async () => {
    if (!encodedId) return;

    setLoading(true);
    setErrorPage(false);
    setErrorMessage("");

    try {
      const response = await getPostDetail(encodedId);
      if (response && response.code === API_CODE.OK) {
        setPost(response.data);
        return;
      }
      setErrorPage(true);
      setErrorMessage(response?.message || "Không thể tải bài viết");
    } catch (error) {
      console.log(error);
      setErrorPage(true);
      setErrorMessage("Đã xảy ra lỗi khi tải bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [encodedId]);

  return (
    <section className="col-span-12 lg:col-span-6">
      {loading && !errorPage && !post && (
        <div className="mb-4">
          <PostCardLoading />
        </div>
      )}

      {!loading && errorPage && !post && (
        <ErrorList onRetry={fetchPost} description={errorMessage || "Đã xảy ra lỗi khi tải danh sách. Vui lòng thử lại."} />
      )}

      {!loading && !errorPage && post && (
        <div className="mb-4">
          <PostCard post={post} />
        </div>
      )}
    </section>
  );
}

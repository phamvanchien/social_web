"use client";

import IconComment from "@/components/icons/IconComment";
import IconHeart from "@/components/icons/IconHeart";
import IconShare from "@/components/icons/IconShare";
import { useSocket } from "@/hooks/socket";
import { RootState } from "@/reduxs/store.redux";
import { ResponsePostItem, UserPost } from "@/types/post.type";
import { ResponseCommentItem, CommentSortType } from "@/types/comment.type";
import { createComment, getCommentsByPostId, getCommentCount, getCommentReplies } from "@/api/comment.api";
import Image from "next/image";
import {
  Globe,
  MoreHorizontal,
  Plus,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ZoomIn,
  ZoomOut,
  Smile
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { timeAgo } from "@/utils/helper.utils";

interface PostCardProps {
  post: ResponsePostItem;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const user: UserPost = post.user;
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Người dùng";
  const media = (post.files || []).map((f) => f.url).filter(Boolean);
  const moreCount = Math.max(0, media.length - 4);
  const userLogged = useSelector((state: RootState) => state.userSlice).data;
  const heartActiveColor = "oklch(63.7% .237 25.331)";
  const socket = useSocket();
  const [liked, setLiked] = useState(post.userLiked);
  const [isHeartBouncing, setIsHeartBouncing] = useState(false);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [galleryZoom, setGalleryZoom] = useState(1);

  const formatCount = (n: number) => {
    if (!n || n === 0) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };
  const likeDisplayCount = useMemo(
    () => Math.max(0, (post.like ?? 0) + (liked ? 1 : 0)),
    [post.like, liked]
  );

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const htmlContent = useMemo(() => {
    const raw = post.content || "";
    return escapeHtml(raw).replace(/\n/g, "<br/>");
  }, [post.content]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Comments state
  const [comments, setComments] = useState<ResponseCommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<ResponseCommentItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Replies list state
  const [expandedReplies, setExpandedReplies] = useState<Record<number, ResponseCommentItem[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});
  const [repliesPage, setRepliesPage] = useState<Record<number, number>>({});
  const [hasMoreReplies, setHasMoreReplies] = useState<Record<number, boolean>>({});

  // Comment like state
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<number, number>>({});
  const [bouncingCommentHearts, setBouncingCommentHearts] = useState<Record<number, boolean>>({});

  // Comment sort state
  const [commentSort, setCommentSort] = useState<CommentSortType>('top');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch comment count on mount
  useEffect(() => {
    const fetchCount = async () => {
      const response = await getCommentCount(post.id);
      if (response?.code === 200) {
        setCommentCount(response.data.count);
      }
    };
    fetchCount();
  }, [post.id]);

  // Fetch comments when section opens
  const fetchComments = async (page: number = 1, sort: CommentSortType = commentSort) => {
    setCommentsLoading(true);
    const response = await getCommentsByPostId({ postId: post.id, page, size: 10, sort });
    if (response?.code === 200) {
      if (page === 1) {
        setComments(response.data.items);
      } else {
        setComments((prev) => [...prev, ...response.data.items]);
      }
      setHasMoreComments(page < response.data.totalPage);
      setCommentsPage(page);
    }
    setCommentsLoading(false);
  };

  const handleToggleComments = async () => {
    if (!isCommentsOpen && comments.length === 0) {
      await fetchComments(1, commentSort);
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleLoadMoreComments = () => {
    if (!commentsLoading && hasMoreComments) {
      fetchComments(commentsPage + 1, commentSort);
    }
  };

  // Handle sort change
  const handleSortChange = async (sort: CommentSortType) => {
    if (sort === commentSort) {
      setIsSortDropdownOpen(false);
      return;
    }
    setCommentSort(sort);
    setIsSortDropdownOpen(false);
    setCommentsPage(1);
    await fetchComments(1, sort);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const response = await createComment({
      postId: post.id,
      content: commentText.trim(),
    });

    if (response?.code === 201) {
      setComments((prev) => [response.data, ...prev]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Reply handlers
  const handleStartReply = (comment: ResponseCommentItem) => {
    setReplyingTo(comment);
    setReplyText("");
    setTimeout(() => replyInputRef.current?.focus(), 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmittingReply || !replyingTo) return;

    setIsSubmittingReply(true);
    const response = await createComment({
      postId: post.id,
      content: replyText.trim(),
      parentId: replyingTo.id,
    });

    if (response?.code === 201) {
      // Update repliesCount for the parent comment
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, repliesCount: c.repliesCount + 1 }
            : c
        )
      );
      setCommentCount((prev) => prev + 1);

      // Add new reply to expanded replies list if it's open
      if (expandedReplies[replyingTo.id]) {
        setExpandedReplies((prev) => ({
          ...prev,
          [replyingTo.id]: [...(prev[replyingTo.id] || []), response.data],
        }));
      } else {
        // Auto expand replies to show the new reply
        setExpandedReplies((prev) => ({
          ...prev,
          [replyingTo.id]: [response.data],
        }));
      }

      setReplyText("");
      setReplyingTo(null);
    }
    setIsSubmittingReply(false);
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
    if (e.key === "Escape") {
      handleCancelReply();
    }
  };

  // Fetch replies for a comment
  const fetchReplies = async (commentId: number, page: number = 1) => {
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
    const response = await getCommentReplies({ commentId, page, size: 5 });
    if (response?.code === 200) {
      setExpandedReplies((prev) => ({
        ...prev,
        [commentId]: page === 1
          ? response.data.items
          : [...(prev[commentId] || []), ...response.data.items],
      }));
      setRepliesPage((prev) => ({ ...prev, [commentId]: page }));
      setHasMoreReplies((prev) => ({ ...prev, [commentId]: page < response.data.totalPage }));
    }
    setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
  };

  const handleExpandReplies = async (commentId: number) => {
    // Only expand and fetch replies if not already expanded
    if (!expandedReplies[commentId]) {
      await fetchReplies(commentId, 1);
    }
  };

  const handleLoadMoreReplies = (commentId: number) => {
    const currentPage = repliesPage[commentId] || 1;
    if (!loadingReplies[commentId] && hasMoreReplies[commentId]) {
      fetchReplies(commentId, currentPage + 1);
    }
  };

  // Handle like/unlike comment
  const handleClickLikeComment = (commentId: number, currentLike: number) => {
    const isLiked = likedComments[commentId];
    const payload = {
      userId: userLogged?.id,
      commentId,
    };

    if (isLiked) {
      socket?.emit('unlike_to_comment', payload);
      setLikedComments((prev) => ({ ...prev, [commentId]: false }));
      setCommentLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? currentLike) - 1 }));
      setBouncingCommentHearts((prev) => ({ ...prev, [commentId]: false }));
    } else {
      socket?.emit('like_to_comment', payload);
      setLikedComments((prev) => ({ ...prev, [commentId]: true }));
      setCommentLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? currentLike) + 1 }));
      setBouncingCommentHearts((prev) => ({ ...prev, [commentId]: true }));
      setTimeout(() => {
        setBouncingCommentHearts((prev) => ({ ...prev, [commentId]: false }));
      }, 700);
    }
  };

  // Get display like count for a comment
  const getCommentLikeCount = (comment: ResponseCommentItem) => {
    return commentLikeCounts[comment.id] ?? comment.like;
  };

  const handleClickLike = async () => {
    const payload = {
      userId: userLogged?.id,
      postId: post.id
    };

    if (liked) {
      socket?.emit('unlike_to_post', payload);
      setLiked(false);
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
      setIsHeartBouncing(false);
    } else {
      socket?.emit('like_to_post', payload);
      setLiked(true);
      setIsHeartBouncing(true);
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
      bounceTimer.current = setTimeout(() => setIsHeartBouncing(false), 700);
    }
  }

  useEffect(() => {
    return () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
    };
  }, []);

  const openGallery = (index: number) => {
    if (media.length === 0) return;
    const clampedIndex = Math.min(Math.max(index, 0), media.length - 1);
    setActiveMediaIndex(clampedIndex);
    setIsGalleryOpen(true);
    setGalleryZoom(1);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const prevMedia = () => {
    setActiveMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const nextMedia = () => {
    setActiveMediaIndex((prev) => (prev + 1) % media.length);
  };

  useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") prevMedia();
      if (e.key === "ArrowRight") nextMedia();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isGalleryOpen]);

  useEffect(() => {
    if (media.length === 0) {
      setIsGalleryOpen(false);
      setActiveMediaIndex(0);
    } else if (activeMediaIndex > media.length - 1) {
      setActiveMediaIndex(media.length - 1);
    }
  }, [media.length, activeMediaIndex]);

  const zoomIn = () => setGalleryZoom((z) => Math.min(3, z + 0.25));
  const zoomOut = () => setGalleryZoom((z) => Math.max(0.5, z - 0.25));

  return (
    <article className="bg-white overflow-hidden rounded-xl border border-gray-200/60 shadow-sm">
      {/* Top bar: Location + Time | Follow + More */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <Globe className="w-4 h-4 text-gray-400" />
          <span>{"P. Gò Vấp, TP. Hồ Chí Minh"}</span>
          <span className="text-gray-300">·</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          {user.id !== userLogged?.id && (
            <button className="cursor-pointer text-[13px] text-blue-500 font-medium inline-flex items-center gap-1 hover:text-rose-600">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Theo dõi</span>
            </button>
          )}
          <button className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User info: Avatar + Name */}
      <div className="flex items-center gap-3 px-4 pb-2">
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
          <Image
            src={user?.avatar || "/images/test/avatar.png"}
            alt={fullName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <span className="font-semibold text-[15px] text-gray-900">{fullName}</span>
      </div>

      {/* Caption */}
      <div
        className="px-4 pb-3 text-[15px] text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Media */}
      {media.length === 0 ? null : media.length === 1 ? (
        // 👉 Một ảnh: full width
        <div
          className="relative w-full bg-gray-100 aspect-[4/5] cursor-zoom-in"
          onClick={() => openGallery(0)}
        >
          <Image
            src={media[0]}
            alt="post"
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
        </div>
      ) : media.length === 2 ? (
        // 👉 Hai ảnh: chia đôi mỗi ảnh 50%
        <div className="flex w-full bg-gray-100">
          {media.slice(0, 2).map((url, i) => (
            <div
              key={i}
              className="relative w-1/2 aspect-square overflow-hidden cursor-zoom-in"
              onClick={() => openGallery(i)}
            >
              <Image
                src={url}
                alt={`media-${i}`}
                fill
                sizes="(min-width: 768px) 360px, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        // 👉 Từ 3 ảnh trở lên: hiển thị dạng lưới
        <div className="bg-black/5">
          <div className="grid grid-cols-3 grid-rows-3 gap-1 h-[520px] bg-gray-100">
            <div
              className="relative col-span-2 row-span-3 overflow-hidden cursor-zoom-in"
              onClick={() => openGallery(0)}
            >
              <Image
                src={media[0]}
                alt="media-0"
                fill
                sizes="(min-width: 1024px) 620px, 66vw"
                className="object-cover"
              />
            </div>
            <div
              className="relative overflow-hidden cursor-zoom-in"
              onClick={() => openGallery(1)}
            >
              <Image
                src={media[1]}
                alt="media-1"
                fill
                sizes="(min-width: 1024px) 300px, 33vw"
                className="object-cover"
              />
            </div>
            <div
              className="relative overflow-hidden cursor-zoom-in"
              onClick={() => openGallery(2)}
            >
              <Image
                src={media[2] ?? media[1]}
                alt="media-2"
                fill
                sizes="(min-width: 1024px) 300px, 33vw"
                className="object-cover"
              />
            </div>
            <div
              className="relative overflow-hidden cursor-zoom-in"
              onClick={() => openGallery(3)}
            >
              <Image
                src={media[3] ?? media[2] ?? media[1]}
                alt="media-3"
                fill
                sizes="(min-width: 1024px) 300px, 33vw"
                className="object-cover"
              />
              {moreCount > 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-3xl font-semibold">+{moreCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side: reaction counts */}
        <div className="flex items-center gap-5">
          <button
            className="flex items-center gap-1.5 cursor-pointer group"
            onClick={handleClickLike}
          >
            <span className={`inline-flex ${isHeartBouncing ? "animate-[bounce_0.6s_ease]" : ""}`}>
              <IconHeart
                background={liked ? heartActiveColor : undefined}
                borderColor={liked ? heartActiveColor : undefined}
                className="w-6 h-6"
              />
            </span>
            <span className="text-[14px] text-gray-700 font-medium">
              {formatCount(likeDisplayCount)}
            </span>
          </button>

          <button
            className="flex items-center gap-1.5 text-gray-600 cursor-pointer group"
            onClick={handleToggleComments}
          >
            <IconComment className="w-6 h-6" />
            <span className="text-[14px] font-medium">{formatCount(commentCount)}</span>
          </button>

          <button className="flex items-center gap-1.5 text-gray-600 cursor-pointer group">
            <IconShare className="w-6 h-6" />
            <span className="text-[14px] font-medium">{formatCount(post.share ?? 0)}</span>
          </button>
        </div>

        {/* Right side: bookmark */}
        <button
          className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
          aria-label="Lưu bài viết"
        >
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="border-t border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="relative" ref={sortDropdownRef}>
              <button
                className="flex items-center gap-1 text-[14px] text-gray-700 hover:text-gray-900 cursor-pointer"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                <span>{commentSort === 'top' ? 'Bình luận hàng đầu' : 'Tất cả bình luận'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isSortDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[180px]">
                  <button
                    className={`w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 ${commentSort === 'top' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                    onClick={() => handleSortChange('top')}
                  >
                    Bình luận hàng đầu
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 ${commentSort === 'all' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                    onClick={() => handleSortChange('all')}
                  >
                    Tất cả bình luận
                  </button>
                </div>
              )}
            </div>
            <span className="text-[14px] font-semibold text-gray-900">
              {new Intl.NumberFormat("vi-VN").format(commentCount)} bình luận
            </span>
          </div>

          {/* Comments List */}
          <div className="px-4 pb-3 space-y-4">
            {commentsLoading && comments.length === 0 ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500 text-[14px] py-4">Chưa có bình luận nào</p>
            ) : (
              comments.map((comment: ResponseCommentItem) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={comment.user.avatar || "/images/test/avatar.png"}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-[15px] text-gray-900">
                            {comment.user.firstName} {comment.user.lastName}
                          </p>
                          <p className="text-[14px] text-gray-800 mt-0.5">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-1.5 text-[13px] text-gray-500">
                            <span>{timeAgo(comment.createdAt)}</span>
                            <button
                              className="font-medium hover:text-gray-700"
                              onClick={() => handleStartReply(comment)}
                            >
                              Trả lời
                            </button>
                          </div>
                          {comment.repliesCount > 0 && !expandedReplies[comment.id] && (
                            <button
                              className="flex items-center gap-1 mt-2 text-[13px] text-gray-500 hover:text-gray-700"
                              onClick={() => handleExpandReplies(comment.id)}
                            >
                              <ChevronDown className="w-4 h-4" />
                              <span>{`Xem ${comment.repliesCount} câu trả lời`}</span>
                            </button>
                          )}
                        </div>

                        {/* Like + More */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleClickLikeComment(comment.id, comment.like)}
                          >
                            <span className={`inline-flex ${bouncingCommentHearts[comment.id] ? "animate-[bounce_0.6s_ease]" : ""}`}>
                              <IconHeart
                                background={likedComments[comment.id] ? heartActiveColor : undefined}
                                borderColor={likedComments[comment.id] ? heartActiveColor : undefined}
                                className="w-5 h-5"
                              />
                            </span>
                            <span className="text-[13px] text-gray-600">{getCommentLikeCount(comment)}</span>
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Replies List */}
                  {(expandedReplies[comment.id] || loadingReplies[comment.id]) && (
                    <div className="ml-10 pl-3 border-l-2 border-gray-100 space-y-3">
                      {loadingReplies[comment.id] && !expandedReplies[comment.id] ? (
                        <div className="flex justify-center py-2">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {expandedReplies[comment.id]?.map((reply: ResponseCommentItem, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={reply.user.avatar || "/images/test/avatar.png"}
                                  alt={`${reply.user.firstName} ${reply.user.lastName}`}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-semibold text-[14px] text-gray-900">
                                      {reply.user.firstName} {reply.user.lastName}
                                    </p>
                                    <p className="text-[13px] text-gray-800 mt-0.5">{reply.content}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                                      <span>{timeAgo(reply.createdAt)}</span>
                                      <button
                                        className="font-medium hover:text-gray-700"
                                        onClick={() => handleStartReply(comment)}
                                      >
                                        Trả lời
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                      onClick={() => handleClickLikeComment(reply.id, reply.like)}
                                    >
                                      <span className={`inline-flex ${bouncingCommentHearts[reply.id] ? "animate-[bounce_0.6s_ease]" : ""}`}>
                                        <IconHeart
                                          background={likedComments[reply.id] ? heartActiveColor : undefined}
                                          borderColor={likedComments[reply.id] ? heartActiveColor : undefined}
                                          className="w-4 h-4"
                                        />
                                      </span>
                                      <span className="text-[12px] text-gray-600">{getCommentLikeCount(reply)}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Load more replies button */}
                          {hasMoreReplies[comment.id] && (
                            <button
                              className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 font-medium"
                              onClick={() => handleLoadMoreReplies(comment.id)}
                              disabled={loadingReplies[comment.id]}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>{loadingReplies[comment.id] ? "Đang tải..." : "Xem câu trả lời cũ hơn"}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Reply Input - shows when replying to this comment */}
                  {replyingTo?.id === comment.id && (
                    <div className="ml-13 pl-10">
                      <div className="flex items-start gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={userLogged?.avatar || "/images/test/avatar.png"}
                            alt="Your avatar"
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] text-gray-500">
                              Đang trả lời <span className="font-medium text-gray-700">{comment.user.firstName} {comment.user.lastName}</span>
                            </span>
                            <button
                              className="text-[12px] text-gray-400 hover:text-gray-600"
                              onClick={handleCancelReply}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                            <input
                              ref={replyInputRef}
                              type="text"
                              placeholder="Viết câu trả lời..."
                              className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder-gray-500 outline-none"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={handleReplyKeyDown}
                              disabled={isSubmittingReply}
                            />
                            <button
                              className="text-blue-500 hover:text-blue-600 ml-2 text-[13px] font-medium disabled:opacity-50"
                              onClick={handleSubmitReply}
                              disabled={isSubmittingReply || !replyText.trim()}
                            >
                              {isSubmittingReply ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                              ) : (
                                "Gửi"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Load more button */}
            {hasMoreComments && (
              <button
                className="w-full py-2 text-[14px] text-gray-600 hover:text-gray-800 font-medium"
                onClick={handleLoadMoreComments}
                disabled={commentsLoading}
              >
                {commentsLoading ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            )}
          </div>

          {/* Comment Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={userLogged?.avatar || "/images/test/avatar.png"}
                alt="Your avatar"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5">
              <input
                type="text"
                placeholder="Thêm bình luận.."
                className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder-gray-500 outline-none"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
              <button
                className="text-gray-400 hover:text-gray-600 ml-2"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Smile className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGalleryOpen && media.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={closeGallery}
            aria-label="Đóng xem ảnh"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="absolute left-4 md:left-8 text-white/80 hover:text-white p-3"
            onClick={prevMedia}
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative w-[90vw] max-w-4xl h-[80vh] overflow-hidden">
            <Image
              src={media[activeMediaIndex]}
              alt={`media-full-${activeMediaIndex}`}
              fill
              sizes="100vw"
              className="object-contain transition-transform duration-200"
              style={{ transform: `scale(${galleryZoom})` }}
              priority
            />
          </div>

          <button
            type="button"
            className="absolute right-4 md:right-8 text-white/80 hover:text-white p-3"
          onClick={nextMedia}
          aria-label="Ảnh tiếp"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 text-white">
            <button
              type="button"
              className="p-1 hover:text-white/80"
              onClick={zoomOut}
              aria-label="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold min-w-[48px] text-center">
              {Math.round(galleryZoom * 100)}%
            </span>
            <button
              type="button"
              className="p-1 hover:text-white/80"
              onClick={zoomIn}
              aria-label="Phóng to"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;

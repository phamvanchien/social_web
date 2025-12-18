"use client";

import IconComment from "@/components/icons/IconComment";
import IconHeart from "@/components/icons/IconHeart";
import IconShare from "@/components/icons/IconShare";
import { useSocket } from "@/hooks/socket";
import { RootState } from "@/reduxs/store.redux";
import { ResponsePostItem, UserPost } from "@/types/post.type";
import Image from "next/image";
import {
  Globe,
  MoreHorizontal,
  Plus,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import React from "react";
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
  const [liked, setLiked] = React.useState(false);
  const [isHeartBouncing, setIsHeartBouncing] = React.useState(false);
  const bounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [galleryZoom, setGalleryZoom] = React.useState(1);

  const formatCount = (n: number) => new Intl.NumberFormat("vi-VN").format(n || 0);
  const likeDisplayCount = React.useMemo(
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

  const htmlContent = React.useMemo(() => {
    const raw = post.content || "";
    return escapeHtml(raw).replace(/\n/g, "<br/>");
  }, [post.content]);

  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

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

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") prevMedia();
      if (e.key === "ArrowRight") nextMedia();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isGalleryOpen]);

  React.useEffect(() => {
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
    <article className="bg-white rounded-2xl ring-1 ring-gray-200/70 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-gray-200">
            <Image
              src={user?.avatar || "/images/test/avatar.png"}
              alt={fullName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px]">{fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <span>{"P5 - Hồ Chí Minh"}</span>
              <span className="text-gray-300">·</span>
              <span>{timeAgo(post.created_at)}</span>
              <span className="text-gray-300">·</span>
              <Globe className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {
            (user.id !== userLogged?.id) &&
            <button className="cursor-pointer text-[12px] text-blue-600 font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-50">
              <Plus className="w-3.5 h-3.5" />
              Theo dõi
            </button>
          }
          <button className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Caption */}
      <div
        className="px-4 pb-3 text-[14px] text-gray-800 leading-snug"
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
      <div className="flex items-center justify-between px-4 py-3 text-[14px] border-t border-gray-100">
        {/* Left side: reaction counts */}
        <div className="flex items-center justify-start gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleClickLike}>
            <span className={`inline-flex ${isHeartBouncing ? "animate-[bounce_0.6s_ease]" : ""}`}>
              <IconHeart
                background={liked ? heartActiveColor : undefined}
                borderColor={liked ? heartActiveColor : undefined}
              />
            </span>
            <span className="font-medium">{formatCount(likeDisplayCount)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <IconComment className="w-4 h-4" />
            <span>{formatCount(0)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 cursor-pointer">
            <IconShare className="w-5 h-5" />
            <span>{formatCount(post.share)}</span>
          </div>
        </div>

        {/* Right side: bookmark */}
        <button
          className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
          aria-label="Lưu bài viết"
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

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

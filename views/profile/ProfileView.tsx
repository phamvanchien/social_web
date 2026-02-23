"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getProfile } from "@/api/user.api";
import { getPostsByUserProfile } from "@/api/post.api";
import { UserProfileResponse } from "@/types/user.type";
import { ResponsePostItem } from "@/types/post.type";
import { API_CODE } from "@/enums/api.enum";
import PostCard from "@/components/layouts/posts/PostCard";
import PostCardLoading from "@/components/layouts/posts/PostCardLoading";
import AvatarUploadModal from "./AvatarUploadModal";
import {
  Camera,
  MapPin,
  Calendar,
  Link as LinkIcon,
  MoreHorizontal,
  Grid3X3,
  Bookmark,
  Heart,
  Edit3,
  BadgeCheck,
} from "lucide-react";

const ProfileView = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [posts, setPosts] = useState<ResponsePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">("posts");
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getProfile();
      if (response && response.code === API_CODE.OK) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (userId: number) => {
    setPostsLoading(true);
    try {
      const response = await getPostsByUserProfile({ page: 1, size: 20 });
      if (response && response.code === API_CODE.OK) {
        setPosts(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Reverse geocoding to get location name from lat/long
  const fetchLocationName = async (lat: number, long: number) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        const { city, town, village, state, country } = data.address;
        const locationParts = [city || town || village, state, country].filter(Boolean);
        setLocationName(locationParts.join(", "));
      } else {
        setLocationName(null);
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName(null);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch posts and location when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      fetchPosts(profile.id);
    }
    if (profile?.lat && profile?.long) {
      fetchLocationName(profile.lat, profile.long);
    }
  }, [profile?.id, profile?.lat, profile?.long]);

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Người dùng";

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAvatarUpdated = (newProfile: UserProfileResponse) => {
    setProfile(newProfile);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <section className="col-span-12 lg:col-span-6">
        {/* Cover skeleton */}
        <div className="relative h-48 md:h-64 lg:h-72 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-b-2xl" />

        {/* Profile info skeleton */}
        <div className="relative px-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:gap-6">
            {/* Avatar skeleton */}
            <div className="relative -mt-16 md:-mt-20">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse border-4 border-white" />
            </div>
            {/* Info skeleton */}
            <div className="flex-1 mt-4 md:mt-0 md:mb-4">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-12 lg:col-span-6">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 lg:h-72 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 rounded-b-2xl overflow-hidden">
        {profile?.coverPhoto ? (
          <Image
            src={profile.coverPhoto}
            alt="Cover"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        )}

        {/* Edit cover button */}
        <button className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition">
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 pb-4 bg-white dark:bg-gray-900">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-20 z-10">
            <button
              onClick={handleAvatarClick}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
            >
              <Image
                src={profile?.avatar || "/images/default-avatar.png"}
                alt={fullName}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            </button>
            {/* Edit avatar button */}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center shadow-sm transition"
            >
              <Camera className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Name and actions */}
          <div className="flex-1 mt-4 md:mt-0 md:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {fullName}
                  </h1>
                  {profile?.verifiedAt && (
                    <BadgeCheck className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-[15px] mt-0.5">@{profile?.email?.split("@")[0] || "user"}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition">
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-700 flex items-center justify-center transition">
                  <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(profile?.stats.posts || 0)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">bài viết</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(profile?.stats.followers || 0)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">người theo dõi</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(profile?.stats.following || 0)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">đang theo dõi</span>
          </div>
        </div>

        {/* Bio and info */}
        <div className="mt-4 space-y-3">
          {/* Info items */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {(profile?.lat && profile?.long) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {locationLoading ? (
                  <span className="w-24 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                  <span>{locationName || "Việt Nam"}</span>
                )}
              </div>
            )}
            {/* <div className="flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4" />
              <a href="#" className="text-blue-500 hover:underline">lokasa.vn</a>
            </div> */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Tham gia {profile?.createdAt ? formatDate(profile.createdAt) : ""}</span>
            </div>
          </div>
        </div>

        {/* Mutual friends placeholder */}
        {/* <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white"
              />
            ))}
          </div>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 dark:text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">3 bạn chung</span> bao gồm Nguyễn Văn A và 2 người khác
          </p>
        </div> */}
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mt-2">
        <div className="flex">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium transition border-b-2 ${
              activeTab === "posts"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            <Grid3X3 className="w-5 h-5" />
            <span>Bài viết</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium transition border-b-2 ${
              activeTab === "saved"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("saved")}
          >
            <Bookmark className="w-5 h-5" />
            <span>Đã lưu</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium transition border-b-2 ${
              activeTab === "liked"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("liked")}
          >
            <Heart className="w-5 h-5" />
            <span>Đã thích</span>
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      <div className="mt-4 space-y-4">
        {activeTab === "posts" && (
          <>
            {postsLoading ? (
              <>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <PostCardLoading key={idx} />
                ))}
              </>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Chưa có bài viết</h3>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-[15px]">
                  Khi bạn đăng bài viết, chúng sẽ xuất hiện tại đây.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "saved" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Bài viết đã lưu</h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-[15px]">
              Những bài viết bạn lưu sẽ xuất hiện tại đây.
            </p>
          </div>
        )}

        {activeTab === "liked" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Bài viết đã thích</h3>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-[15px]">
              Những bài viết bạn thích sẽ xuất hiện tại đây.
            </p>
          </div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={profile?.avatar || null}
        userName={fullName}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </section>
  );
};

export default ProfileView;

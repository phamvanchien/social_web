"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxs/store.redux";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/api/notification.api";
import { NotificationItem, NOTIFICATION_MESSAGES, NotificationType } from "@/types/notification.type";
import { useSocket } from "@/hooks/socket";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function NotificationBell() {
  const userLogged = useSelector((state: RootState) => state.userSlice).data;
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      if (response.code === 200) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getNotifications({ page: pageNum, size: 10 });
      if (response.code === 200) {
        const newItems = response.data.items;
        if (append) {
          setNotifications(prev => [...prev, ...newItems]);
        } else {
          setNotifications(newItems);
        }
        setHasMore(pageNum < response.data.totalPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Handle new notification from socket
  const handleNewNotification = useCallback((notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!userLogged?.id || !socket) return;

    // Join notification room
    socket.emit("join_notification_room", { userId: userLogged.id });

    // Listen for new notifications
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [userLogged?.id, socket, handleNewNotification]);

  // Initial fetch
  useEffect(() => {
    if (userLogged?.id) {
      fetchUnreadCount();
    }
  }, [userLogged?.id, fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && userLogged?.id) {
      fetchNotifications(1, false);
    }
  }, [isOpen, userLogged?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await markAsRead(id);
      if (response.code === 200) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsRead();
      if (response.code === 200) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  // Get notification message
  const getNotificationMessage = (type: NotificationType) => {
    return NOTIFICATION_MESSAGES[type] || "";
  };

  // Get notification link
  const getNotificationLink = (notification: NotificationItem) => {
    if (notification.post?.link) {
      return notification.post.link;
    }
    return "#";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition"
        title="Thong bao"
        aria-label="Thong bao"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-medium flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">
              Thong bao
            </h3>
            {unreadCount > 0 && (
              <button
                className="text-[13px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="w-4 h-4" />
                Danh dau da doc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 && !loading ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-[14px]">
                Chua co thong bao nao
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getNotificationLink(notification)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={notification.actor?.avatar || "/images/default-avatar.png"}
                        alt="Avatar"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">
                          {notification.actor
                            ? `${notification.actor.firstName} ${notification.actor.lastName}`
                            : "Ai do"}
                        </span>{" "}
                        {getNotificationMessage(notification.type)}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </Link>
                ))}

                {/* Load more button */}
                {hasMore && (
                  <button
                    className="w-full py-3 text-[14px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? "Dang tai..." : "Xem them"}
                  </button>
                )}
              </>
            )}

            {loading && notifications.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-[14px]">
                Dang tai...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export type NotificationType = 'like_post' | 'comment_post' | 'reply_comment' | 'like_comment';

export interface NotificationActor {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface NotificationPost {
  id: number;
  content: string | null;
  link: string;
}

export interface NotificationComment {
  id: number;
  content: string | null;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actor: NotificationActor | null;
  post: NotificationPost | null;
  comment: NotificationComment | null;
}

export interface NotificationListResponse {
  code: number;
  message: string;
  data: {
    items: NotificationItem[];
    total: number;
    page: number;
    totalPage: number;
  };
}

export interface UnreadCountResponse {
  code: number;
  message: string;
  data: {
    count: number;
  };
}

export const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  like_post: 'đã thích bài viết của bạn',
  comment_post: 'đã bình luận bài viết của bạn',
  reply_comment: 'đã trả lời bình luận của bạn',
  like_comment: 'đã thích bình luận của bạn',
};

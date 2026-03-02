import { BaseResponseType, RequestWithPaginationType } from "@/types/base.type"
import { request } from "./base.api"
import { API_METHOD } from "@/enums/api.enum"
import { APP_CONFIG } from "@/config/app.config"
import { NotificationListResponse, UnreadCountResponse } from "@/types/notification.type"

export const getNotifications = async (payload: RequestWithPaginationType): Promise<NotificationListResponse> => {
  return request({
    method: API_METHOD.GET,
    params: payload,
    url: APP_CONFIG.API.PREFIX.notification
  });
}

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  return request({
    method: API_METHOD.GET,
    url: `${APP_CONFIG.API.PREFIX.notification}/unread-count`
  });
}

export const markAsRead = async (id: number): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.PATCH,
    url: `${APP_CONFIG.API.PREFIX.notification}/${id}/read`
  });
}

export const markAllAsRead = async (): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.PATCH,
    url: `${APP_CONFIG.API.PREFIX.notification}/read-all`
  });
}

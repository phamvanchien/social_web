import { BaseResponseType, ResponseWithPaginationType } from "@/types/base.type"
import { request } from "./base.api"
import { API_METHOD } from "@/enums/api.enum"
import { APP_CONFIG } from "@/config/app.config"
import {
  RequestCreateComment,
  RequestGetComments,
  RequestGetReplies,
  ResponseCommentCount,
  ResponseCommentItem
} from "@/types/comment.type"

export const createComment = async (payload: RequestCreateComment): Promise<BaseResponseType<ResponseCommentItem>> => {
  return request({
    method: API_METHOD.POST,
    data: payload,
    url: APP_CONFIG.API.PREFIX.comments
  });
}

export const getCommentsByPostId = async (payload: RequestGetComments): Promise<BaseResponseType<ResponseWithPaginationType<ResponseCommentItem[]>>> => {
  const { postId, page = 1, size = 10, sort = 'top' } = payload;
  return request({
    method: API_METHOD.GET,
    params: { page, size, sort },
    url: `${APP_CONFIG.API.PREFIX.comments}/post/${postId}`
  });
}

export const getCommentReplies = async (payload: RequestGetReplies): Promise<BaseResponseType<ResponseWithPaginationType<ResponseCommentItem[]>>> => {
  const { commentId, page = 1, size = 10 } = payload;
  return request({
    method: API_METHOD.GET,
    params: { page, size },
    url: `${APP_CONFIG.API.PREFIX.comments}/${commentId}/replies`
  });
}

export const getCommentCount = async (postId: number): Promise<BaseResponseType<ResponseCommentCount>> => {
  return request({
    method: API_METHOD.GET,
    url: `${APP_CONFIG.API.PREFIX.comments}/count/${postId}`
  });
}

export const deleteComment = async (commentId: number): Promise<BaseResponseType<boolean>> => {
  return request({
    method: API_METHOD.DELETE,
    url: `${APP_CONFIG.API.PREFIX.comments}/${commentId}`
  });
}

import { BaseResponseType, RequestWithPaginationType, ResponseWithPaginationType } from "@/types/base.type"
import { request } from "./base.api"
import { API_METHOD } from "@/enums/api.enum"
import { APP_CONFIG } from "@/config/app.config"
import { RequestCreatePost, ResponsePostItem } from "@/types/post.type"

export const createPost = async (payload: RequestCreatePost): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.POST,
    data: payload,
    url: APP_CONFIG.API.PREFIX.post
  });
}

export const listPosts = async (payload: RequestWithPaginationType): Promise<BaseResponseType<ResponseWithPaginationType<ResponsePostItem[]>>> => {
  return request({
    method: API_METHOD.GET,
    params: payload,
    url: APP_CONFIG.API.PREFIX.post
  });
}

export const getPostDetail = async (encodedId: string): Promise<BaseResponseType<ResponsePostItem>> => {
  return request({
    method: API_METHOD.GET,
    url: `${APP_CONFIG.API.PREFIX.post}/detail/${encodedId}`
  });
}

export const getPostsByUserProfile = async (payload: RequestWithPaginationType): Promise<BaseResponseType<ResponseWithPaginationType<ResponsePostItem[]>>> => {
  return request({
    method: API_METHOD.GET,
    params: payload,
    url: `${APP_CONFIG.API.PREFIX.post}/profile`
  });
}
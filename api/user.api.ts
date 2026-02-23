import { request } from "./base.api";
import { API_METHOD } from "@/enums/api.enum";
import { APP_CONFIG } from "@/config/app.config";
import { BaseResponseType } from "@/types/base.type";
import { UserProfileResponse } from "@/types/user.type";

export interface UpdateLocationPayload {
  lat: number;
  long: number;
}

export const updateUserLocation = async (payload: UpdateLocationPayload): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.user + '/location',
    data: payload
  });
}

export const getProfile = async (): Promise<BaseResponseType<UserProfileResponse>> => {
  return request({
    method: API_METHOD.GET,
    url: APP_CONFIG.API.PREFIX.user + '/profile'
  });
}

export const getProfileById = async (userId: number): Promise<BaseResponseType<UserProfileResponse>> => {
  return request({
    method: API_METHOD.GET,
    url: APP_CONFIG.API.PREFIX.user + '/profile/' + userId
  });
}

export const updateAvatar = async (file: File): Promise<BaseResponseType<UserProfileResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    method: API_METHOD.PATCH,
    url: APP_CONFIG.API.PREFIX.user + '/avatar',
    data: formData
  });
}

export interface UpdateWardPayload {
  provinceId: number;
  wardId: number;
}

export const updateUserWard = async (payload: UpdateWardPayload): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.user + '/ward',
    data: payload
  });
}

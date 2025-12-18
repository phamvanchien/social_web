import { RequestAuthenticateType, ResponseAuthenticateGoogleType, ResponseAuthenticateType } from "@/types/authenticate.type";
import { request } from "./base.api";
import { API_METHOD } from "@/enums/api.enum";
import { APP_CONFIG } from "@/config/app.config";
import { BaseResponseType } from "@/types/base.type";

export const authenticate = async (payload: RequestAuthenticateType): Promise<ResponseAuthenticateType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.authenticate,
    data: payload
  });
}

export const authWithGoogle = async (): Promise<BaseResponseType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.authenticate + APP_CONFIG.API.PREFIX.google
  })
}

export const authWithGoogleCallback = async (code: string): Promise<ResponseAuthenticateGoogleType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.authenticate + APP_CONFIG.API.PREFIX.google_callback,
    data: { code }
  })
}
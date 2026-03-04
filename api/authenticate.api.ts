import { RequestAuthenticateType, RequestForgotPasswordType, RequestRecoveryPasswordType, RequestVerifyOtpType, ResponseAuthenticateGoogleType, ResponseAuthenticateType, RequestRegisterSendOtpType, RequestRegisterVerifyOtpType, RequestRegisterCompleteType } from "@/types/authenticate.type";
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

export const forgotPassword = async (payload: RequestForgotPasswordType): Promise<BaseResponseType<null>> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.forgot_password,
    data: payload
  });
}

export const verifyOtp = async (payload: RequestVerifyOtpType): Promise<BaseResponseType<null>> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.verify_otp,
    data: payload
  });
}

export const recoveryPassword = async (payload: RequestRecoveryPasswordType): Promise<BaseResponseType<null>> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.recovery_password,
    data: payload
  });
}

export const registerSendOtp = async (payload: RequestRegisterSendOtpType): Promise<BaseResponseType<null>> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.register_send_otp,
    data: payload
  });
}

export const registerVerifyOtp = async (payload: RequestRegisterVerifyOtpType): Promise<BaseResponseType<null>> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.register_verify_otp,
    data: payload
  });
}

export const registerComplete = async (payload: RequestRegisterCompleteType): Promise<ResponseAuthenticateType> => {
  return request({
    method: API_METHOD.POST,
    url: APP_CONFIG.API.PREFIX.register_complete,
    data: payload
  });
}
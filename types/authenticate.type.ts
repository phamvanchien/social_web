import { BaseResponseType } from "./base.type"
import { UserResponseType } from "./user.type"
export interface RequestAuthenticateType {
  user: string
  password: string
}

export interface RequestVerifyAccountType {
  hash: string
  email: string
}

export interface RequestForgotPasswordType {
  email: string
}

export interface RequestGoogleAuthCallback {
  code: string
  scope: string
  authuser: string
  prompt: string
  fromInvite: string | null
}

export interface RequestVerifyOtpType {
  email: string
  otp: string
}

export interface RequestRecoveryPasswordType {
  email: string
  otp: string
  password: string,
  confirm_password: string
}

export interface ResponseAuthenticateType extends BaseResponseType {
  data: {
    access_token: string
    user: UserResponseType
    target?: 'location' | null
  }
}

export interface ResponseAuthenticateGoogleType extends BaseResponseType {
  data: {
    access_token: string
    user: UserResponseType
    target?: 'location' | null
  }
}

export interface ResponseAuthenticateActionType extends BaseResponseType {
  data: boolean
}

export interface RequestRegisterSendOtpType {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  confirm_password: string
}

export interface RequestRegisterVerifyOtpType {
  email: string
  otp: string
}

export interface RequestRegisterCompleteType {
  email: string
  otp: string
}
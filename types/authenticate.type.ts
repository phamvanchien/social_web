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

export interface RequestRecoveryPasswordType {
  email: string
  hash: string
  password: string,
  confirm_password: string
}

export interface ResponseAuthenticateType extends BaseResponseType {
  data: {
    access_token: string
    user: UserResponseType
  }
}

export interface ResponseAuthenticateGoogleType extends BaseResponseType {
  data: {
    access_token: string
    user: UserResponseType
  }
}

export interface ResponseAuthenticateActionType extends BaseResponseType {
  data: boolean
}
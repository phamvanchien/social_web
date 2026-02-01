import { AxiosRequestConfig, Method } from "axios";

export interface AppConfigType {
  ENVIROMENT: 'develop' | 'production'
  TOKEN_EXPIRE_TIME: number,
  URL?: string,
  API: {
    TIMEOUT: number
    URL: string,
    PREFIX: {
      authenticate: string,
      google: string,
      google_callback: string
      post: string
      comments: string
      user: string
    }
  }
}

export interface RequestApiWithTokenType extends AxiosRequestConfig {
  method: Method;
  url: string;
  data?: any;
}
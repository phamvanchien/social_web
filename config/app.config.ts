import { AppConfigType } from "@/types/config.type";

export const APP_CONFIG: AppConfigType = {
  ENVIROMENT: process.env.NEXT_PUBLIC_ENVIROMENT as 'develop' | 'production',
  TOKEN_EXPIRE_TIME: 28 * (24 * 60 * 60 * 1000),
  URL: process.env.NEXT_PUBLIC_URL,
  API: {
    TIMEOUT: 28 * (24 * 60 * 60 * 1000),
    URL: process.env.NEXT_PUBLIC_API_URL as string,
    PREFIX: {
      authenticate: '/authenticate',
      google: '/google',
      google_callback: '/google/callback',
      post: '/post',
      comments: '/comments',
      user: '/user',
      regions: '/regions'
    }
  }
}
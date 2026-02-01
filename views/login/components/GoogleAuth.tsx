"use client";

import { authWithGoogleCallback } from "@/api/authenticate.api";
import Loading from "@/components/common/Loading";
import { APP_CONFIG } from "@/config/app.config";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { AppErrorType, BaseResponseType } from "@/types/base.type";
import { setCookie } from "@/utils/cookie.utils";
import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";

interface GoogleAuthProps {
  setErrorMessage: Dispatch<SetStateAction<AppErrorType | undefined>>
  code: string | null;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ setErrorMessage, code }) => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      if (!code) {
        setErrorMessage({
          property: null,
          message: APP_ERROR.SERVER_ERROR
        });
        return;
      }
      const response = await authWithGoogleCallback(code);
      if (response && response.code === API_CODE.OK) {
        setCookie(APP_AUTH.COOKIE_AUTH_KEY, response.data.access_token, {
          expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
          path: '/',
          sameSite: 'lax',
          secure: true
        });
        window.location.href = "/";
        return;
      }
      setErrorMessage({
        property: null,
        message: APP_ERROR.SERVER_ERROR
      });
    } catch (error) {
      setErrorMessage({
        property: null,
        message: (error as BaseResponseType).error?.message as string
      });
    }
  }, [code, setErrorMessage]);

  useEffect(() => {
    handleGoogleLogin();
  }, [handleGoogleLogin]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" variant="spinner" color="rgb(99 102 241); indigo-500" />
        
        <p className="font-medium text-zinc-700">
          Đang đăng nhập với Google...
        </p>
      </div>
    </main>
  );
};

export default GoogleAuth;

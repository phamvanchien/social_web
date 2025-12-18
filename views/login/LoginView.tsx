"use client";

import { authenticate, authWithGoogle } from "@/api/authenticate.api";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { AppErrorType, BaseResponseType } from "@/types/base.type";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleAuth from "./components/GoogleAuth";
import Loading from "@/components/common/Loading";
import { setCookie } from "@/utils/cookie.utils";
import { APP_CONFIG } from "@/config/app.config";

const LoginView = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<AppErrorType>();
  const [loading, setLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);

  const searchParams = useSearchParams()
  const code = searchParams.get('code');
  const scope = searchParams.get('scope');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user || user === '') {
        setErrorMessage({
          property: 'user',
          message: 'Vui lòng nhập email hoặc số điện thoại'
        });
        return;
      }

      if (!password || password === '') {
        setErrorMessage({
          property: 'password',
          message: 'Vui lòng nhập mật khẩu'
        });
        return;
      }

      if (password.length < 6) {
        setErrorMessage({
          property: 'password',
          message: 'Mật khẩu phải có ít nhất 6 ký tự'
        });
        return;
      }

      if (password.length > 16) {
        setErrorMessage({
          property: 'password',
          message: 'Mật khẩu không được vượt quá 16 ký tự'
        });
        return;
      }

      setLoading(true);
      const response = await authenticate({
        user: user,
        password: password
      });

      setLoading(false);
      if (response && response.code === API_CODE.OK) {
        setCookie(APP_AUTH.COOKIE_AUTH_KEY, response.data.access_token, { 
          expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
          path: '/',
          sameSite: 'lax',
          secure: true
        });
        setCookie(APP_AUTH.COOKIE_AUTH_USER, JSON.stringify(response.data.user), { 
          expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
          path: '/',
          sameSite: 'lax',
          secure: true
        });
        window.location.href = "/";
        return;
      }

      setErrorMessage(response.error ? response.error : {
        property: null,
        message: APP_ERROR.SERVER_ERROR
      });
    } catch (error) {
      setLoading(false);
      setErrorMessage({
        property: null,
        message: (error as BaseResponseType).error?.message as string
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoginLoading(true);
      const response = await authWithGoogle();
      if (response && response.code === API_CODE.OK) {
        window.location.href = response.data;
        return;
      }
      setErrorMessage({
        property: null,
        message: APP_ERROR.SERVER_ERROR
      });
    } catch (error) {
      setGoogleLoginLoading(false);
      setErrorMessage({
        property: null,
        message: (error as BaseResponseType).error?.message as string
      });
    }
  };

  useEffect(() => {
    if (code && scope) {
      setGoogleAuth(true);
    }
  }, [code, scope]);

  if (googleAuth) {
    return <GoogleAuth setErrorMessage={setErrorMessage} code={code} />
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">Login here</h1>
      <p className="mt-2 text-center text-base font-semibold text-black">
        Welcome back you’ve<br /> been missed!
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {(errorMessage && errorMessage.property === null) && <Alert variant="error">{errorMessage.message}</Alert>}
        <div>
          <label htmlFor="user" className="sr-only">Email / Số điện thoại</label>
          <Input
            id="user"
            type="text"
            placeholder="Email / Số điện thoại"
            value={user}
            onChange={(e) => { setErrorMessage(undefined); setUser(e.target.value) }}
            errorMessages={(errorMessage && errorMessage.property === 'user') ? [errorMessage.message] : undefined}
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">Mật khẩu</label>
          <Input.Password
            id="password"
            placeholder="Mật khẩu"
            onChange={(e) => { setErrorMessage(undefined); setPassword(e.target.value) }}
            minLength={6}
            maxLength={16}
            errorMessages={(errorMessage && errorMessage.property === 'password') ? [errorMessage.message] : undefined}
          />
        </div>

        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-700 hover:underline">
            Bạn quên mật khẩu?
          </Link>
        </div>

        <Button fullWidth variant="primary">
          {loading ? <Loading size="md" variant="spinner" /> : 'Đăng nhập'}
        </Button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-zinc-500">hoặc</span>
          </div>
        </div>

        <Button
          type="button"
          variant="light"
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 active:scale-[0.99] transition"
          aria-label="Đăng nhập với Google"
        >
          {
            googleLoginLoading ? <Loading size="md" variant="spinner" color="rgb(99 102 241); indigo-500" /> :
            <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5h-1.9v-.1H24v7.2h11.2c-1.6 4.6-6 7.9-11.2 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.5 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.5 0 19.7-8.1 19.7-19.6 0-1.3-.1-2.2-.1-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C14.4 15 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.5 6.1 29 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.8-5.1l-5.9-4.8C29 35.3 26.7 36 24 36c-5.1 0-9.5-3.2-11.2-7.8l-6 4.6C10.2 39.7 16.6 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H24v7.2h11.2c-.8 2.4-2.3 4.4-4.3 5.9l5.9 4.8c3.4-3.2 5.6-7.9 5.6-13.9 0-1.3-.1-2.2-.1-4z"/>
            </svg>
            <span>Đăng nhập với Google</span>
            </>
          }
        </Button>
      </form>
    </section>
  );
}

export default LoginView;
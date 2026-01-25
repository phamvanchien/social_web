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
    <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại!</h1>
            <p className="mt-2 text-sm text-gray-600">
              Đăng nhập để tiếp tục trải nghiệm
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(errorMessage && errorMessage.property === null) && (
              <Alert variant="error">{errorMessage.message}</Alert>
            )}

            {/* Email/Phone Input */}
            <div className="space-y-2">
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                Email hoặc số điện thoại
              </label>
              <Input
                id="user"
                type="text"
                placeholder="example@email.com"
                value={user}
                onChange={(e) => { setErrorMessage(undefined); setUser(e.target.value) }}
                errorMessages={(errorMessage && errorMessage.property === 'user') ? [errorMessage.message] : undefined}
                className="h-12 rounded-xl border-gray-300 bg-gray-50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input.Password
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                onChange={(e) => { setErrorMessage(undefined); setPassword(e.target.value) }}
                minLength={6}
                maxLength={16}
                errorMessages={(errorMessage && errorMessage.property === 'password') ? [errorMessage.message] : undefined}
                className="h-12 rounded-xl border-gray-300 bg-gray-50 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Login Button */}
            <Button
              fullWidth
              variant="primary"
              className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? <Loading size="md" variant="spinner" /> : 'Đăng nhập'}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="light"
              onClick={handleGoogleLogin}
              className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:shadow active:scale-[0.98]"
              aria-label="Đăng nhập với Google"
            >
              {googleLoginLoading ? (
                <Loading size="md" variant="spinner" color="rgb(99 102 241)" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5h-1.9v-.1H24v7.2h11.2c-1.6 4.6-6 7.9-11.2 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.5 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.5 0 19.7-8.1 19.7-19.6 0-1.3-.1-2.2-.1-3.9z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C14.4 15 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.5 6.1 29 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
                    <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.8-5.1l-5.9-4.8C29 35.3 26.7 36 24 36c-5.1 0-9.5-3.2-11.2-7.8l-6 4.6C10.2 39.7 16.6 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H24v7.2h11.2c-.8 2.4-2.3 4.4-4.3 5.9l5.9 4.8c3.4-3.2 5.6-7.9 5.6-13.9 0-1.3-.1-2.2-.1-4z"/>
                  </svg>
                  <span>Đăng nhập với Google</span>
                </div>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/auth/register" className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Điều khoản dịch vụ</Link>
            {' '}và{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginView;
"use client";

import { authenticate, authWithGoogle } from "@/api/authenticate.api";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { AppErrorType, BaseResponseType } from "@/types/base.type";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleAuth from "./components/GoogleAuth";
import { setCookie } from "@/utils/cookie.utils";
import { APP_CONFIG } from "@/config/app.config";

const REMEMBER_USER_KEY = "lacial_remember_user";

const LoginView = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<AppErrorType>();
  const [loading, setLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);

  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const scope = searchParams.get("scope");

  // Load remembered user on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(REMEMBER_USER_KEY);
      if (savedUser) {
        setUser(savedUser);
        setRememberMe(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Detect Google OAuth callback
  useEffect(() => {
    if (code && scope) {
      setGoogleAuth(true);
    }
  }, [code, scope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user || user === "") {
        setErrorMessage({
          property: "user",
          message: "Vui lòng nhập email hoặc số điện thoại",
        });
        return;
      }

      if (!password || password === "") {
        setErrorMessage({
          property: "password",
          message: "Vui lòng nhập mật khẩu",
        });
        return;
      }

      if (password.length < 6) {
        setErrorMessage({
          property: "password",
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
        return;
      }

      if (password.length > 16) {
        setErrorMessage({
          property: "password",
          message: "Mật khẩu không được vượt quá 16 ký tự",
        });
        return;
      }

      setLoading(true);
      const response = await authenticate({ user, password });
      setLoading(false);

      if (response && response.code === API_CODE.OK) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem(REMEMBER_USER_KEY, user);
        } else {
          localStorage.removeItem(REMEMBER_USER_KEY);
        }

        // Set cookies
        setCookie(APP_AUTH.COOKIE_AUTH_KEY, response.data.access_token, {
          expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
          path: "/",
          sameSite: "lax",
          secure: APP_CONFIG.ENVIROMENT === "production",
        });
        setCookie(APP_AUTH.COOKIE_AUTH_USER, JSON.stringify(response.data.user), {
          expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
          path: "/",
          sameSite: "lax",
          secure: APP_CONFIG.ENVIROMENT === "production",
        });

        if (response.data.target === "location") {
          window.location.href = "/location";
        } else {
          window.location.href = "/";
        }
        return;
      }

      setErrorMessage(
        response.error
          ? response.error
          : { property: null, message: APP_ERROR.SERVER_ERROR }
      );
    } catch (error) {
      setLoading(false);
      setErrorMessage({
        property: null,
        message: (error as BaseResponseType).error?.message as string,
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
        message: APP_ERROR.SERVER_ERROR,
      });
    } catch (error) {
      setGoogleLoginLoading(false);
      setErrorMessage({
        property: null,
        message: (error as BaseResponseType).error?.message as string,
      });
    }
  };

  if (googleAuth) {
    return <GoogleAuth setErrorMessage={setErrorMessage} code={code} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* ===== LEFT PANEL (60%) - Hidden on mobile ===== */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-[#0C8BDA] to-[#065A8C] overflow-hidden">
        {/* Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full bg-white/20" />
          <div className="absolute bottom-32 right-40 w-[400px] h-[400px] rounded-full bg-white/[0.15]" />
          <div
            className="absolute top-40 right-20"
            style={{
              width: 0,
              height: 0,
              borderLeft: "150px solid transparent",
              borderRight: "150px solid transparent",
              borderBottom: "260px solid rgba(255,255,255,0.1)",
            }}
          />
          <div className="absolute bottom-20 left-1/4 w-[200px] h-[200px] bg-white/10 rotate-45" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-20">
          {/* Glassmorphism Cards */}
          <div className="grid grid-cols-2 gap-4 mb-12">
            {/* Card 1 - Text lines */}
            <div className="bg-white/[0.15] border border-white/20 rounded-xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
              <div className="h-2 w-16 rounded bg-white/40 mb-2" />
              <div className="h-2 w-24 rounded bg-white/60 mb-2" />
              <div className="h-2 w-20 rounded bg-white/40 mb-2" />
              <div className="mt-3">
                <div className="h-1 w-full rounded bg-white/30 mb-1" />
                <div className="h-1 w-3/4 rounded bg-white/30" />
              </div>
            </div>

            {/* Card 2 - Chart */}
            <div className="bg-white/[0.15] border border-white/20 rounded-xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
              <div className="flex justify-between mb-2">
                <div className="h-2 w-12 rounded bg-white/40" />
                <div className="h-2 w-8 rounded bg-white/60" />
              </div>
              <div className="flex gap-1 mt-4 items-end h-12">
                <div className="flex-1 h-8 bg-white/30 rounded-sm animate-pulse" />
                <div className="flex-1 h-12 bg-white/30 rounded-sm animate-pulse [animation-delay:200ms]" />
                <div className="flex-1 h-6 bg-white/30 rounded-sm animate-pulse [animation-delay:400ms]" />
                <div className="flex-1 h-10 bg-white/30 rounded-sm animate-pulse [animation-delay:600ms]" />
                <div className="flex-1 h-9 bg-white/30 rounded-sm animate-pulse [animation-delay:800ms]" />
                <div className="flex-1 h-11 bg-white/30 rounded-sm animate-pulse [animation-delay:1000ms]" />
                <div className="flex-1 h-7 bg-white/30 rounded-sm animate-pulse [animation-delay:1200ms]" />
              </div>
            </div>

            {/* Card 3 - User card */}
            <div className="bg-white/[0.15] border border-white/20 rounded-xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/40" />
                <div className="flex-1">
                  <div className="h-2 w-16 rounded bg-white/60 mb-1" />
                  <div className="h-1.5 w-12 rounded bg-white/40" />
                </div>
              </div>
              <div className="h-1 w-full rounded bg-white/30 mb-1.5" />
              <div className="h-1 w-[85%] rounded bg-white/30" />
            </div>

            {/* Card 4 - Profile card */}
            <div className="bg-white/[0.15] border border-white/20 rounded-xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] text-center">
              <div className="w-16 h-16 rounded-full bg-white/40 mx-auto mb-2" />
              <div className="h-2 w-20 rounded bg-white/60 mx-auto mb-1" />
              <div className="h-1.5 w-16 rounded bg-white/40 mx-auto" />
            </div>
          </div>

          {/* Illustration */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <img
              src="https://images.unsplash.com/photo-1759473434569-aa1eba37fb15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlcnNvbiUyMHBob25lJTIwY2l0eSUyMHN0cmVldCUyMGNhZmUlMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzcyMTY1OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Person using phone in vibrant city street"
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Headline */}
          <div className="text-white">
            <h1 className="text-5xl font-bold leading-tight tracking-tight mb-3">
              Chào mừng đến với Lacial
            </h1>
            <p className="text-xl opacity-80">
              Khám phá những thú vị xung quanh bạn
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (40%) ===== */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white dark:bg-gray-950 px-6 sm:px-12">
        <div className="w-full max-w-[448px]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0C8BDA] to-[#065A8C] rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-semibold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-center mb-8">
            Đăng nhập
          </h2>

          {/* Error Alert */}
          {errorMessage && errorMessage.property === null && (
            <div className="mb-4">
              <Alert variant="error">{errorMessage.message}</Alert>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                <input
                  type="email"
                  id="email"
                  value={user}
                  onChange={(e) => { setErrorMessage(undefined); setUser(e.target.value); }}
                  className={`w-full h-12 pl-10 pr-4 border rounded-xl text-[15px] transition-colors outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    errorMessage?.property === "user"
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
                  }`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errorMessage?.property === "user" && (
                <p className="mt-1.5 text-xs text-red-500">{errorMessage.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => { setErrorMessage(undefined); setPassword(e.target.value); }}
                  className={`w-full h-12 pl-10 pr-10 border rounded-xl text-[15px] transition-colors outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    errorMessage?.property === "password"
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
                  }`}
                  placeholder="Nhập mật khẩu"
                  minLength={6}
                  maxLength={16}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errorMessage?.property === "password" && (
                <p className="mt-1.5 text-xs text-red-500">{errorMessage.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-[#0C8BDA]"
                />
                <span className="text-sm text-[#4b5563] dark:text-gray-400">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm font-medium text-[#0C8BDA] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              loadingText="Đang đăng nhập..."
              rounded="xl"
              className="w-full h-12 text-[15px] font-semibold cursor-pointer mb-4"
            >
              Đăng nhập
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[#e5e7eb] dark:bg-gray-700" />
              <span className="text-sm text-[#6b7280] dark:text-gray-400">
                hoặc tiếp tục với
              </span>
              <div className="flex-1 h-px bg-[#e5e7eb] dark:bg-gray-700" />
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {/* Google */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                loading={googleLoginLoading}
                loadingText="Google"
                variant="light"
                rounded="full"
                className="h-12 bg-white dark:bg-gray-900 border border-[#d1d5db] dark:border-gray-700 text-[15px] font-medium text-[#1a1a1a] dark:text-gray-100 cursor-pointer hover:bg-[#f9fafb] dark:hover:bg-gray-800"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.8789 15.7789 19.9895 13.221 19.9895 10.1871Z" fill="#4285F4" />
                    <path d="M10.1993 19.9313C12.9527 19.9313 15.2643 19.0454 16.9527 17.5174L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1993 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.76588 17.6945 6.21061 19.9313 10.1993 19.9313Z" fill="#34A853" />
                    <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27909 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05" />
                    <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33717L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335" />
                  </svg>
                  Google
                </span>
              </Button>

              {/* Apple (Coming Soon) */}
              <button
                type="button"
                onClick={() => alert("Tính năng đăng nhập với Apple sẽ sớm ra mắt!")}
                className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-[#d1d5db] dark:border-gray-700 rounded-3xl text-[15px] font-medium text-[#1a1a1a] dark:text-gray-100 cursor-pointer transition-colors hover:bg-[#f9fafb] dark:hover:bg-gray-800"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.44 4.44 0 0 0-2.91 1.52 4.17 4.17 0 0 0-1.02 2.57 3.69 3.69 0 0 0 2.87-1.4Zm1.27 1.52c-1.6-.1-2.97.91-3.73.91-.77 0-1.94-.86-3.21-.84a4.76 4.76 0 0 0-4.01 2.45c-1.72 2.97-.44 7.37 1.22 9.79.82 1.19 1.8 2.52 3.09 2.47 1.23-.05 1.7-.8 3.19-.8 1.49 0 1.92.8 3.22.77 1.33-.02 2.17-1.21 2.98-2.4a10.96 10.96 0 0 0 1.35-2.77 4.36 4.36 0 0 1-2.6-3.98 4.42 4.42 0 0 1 2.1-3.71 4.56 4.56 0 0 0-3.6-1.89Z" />
                </svg>
                Apple
              </button>
            </div>
          </form>

          {/* Sign Up Section */}
          <div className="mt-8">
            <p className="text-sm text-[#6b7280] dark:text-gray-400 text-center mb-4">
              Chưa có tài khoản?
            </p>
            <Link
              href="/register"
              className="flex items-center justify-center w-full h-12 bg-transparent text-[#0C8BDA] border-[1.5px] border-[#0C8BDA] rounded-xl text-[15px] font-semibold transition-colors hover:bg-[#0C8BDA]/5"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

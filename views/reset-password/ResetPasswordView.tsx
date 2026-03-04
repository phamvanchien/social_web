"use client";

import { forgotPassword, verifyOtp, recoveryPassword } from "@/api/authenticate.api";
import Button from "@/components/common/Button";
import { API_CODE } from "@/enums/api.enum";
import { AppErrorType } from "@/types/base.type";
import { useCountdown } from "@/hooks/useCountdown";
import { maskEmail } from "@/utils/string.utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = 1 | 2 | 3 | "success";

// ===== Step Indicator =====
const StepIndicator = ({ current }: { current: Step }) => {
  const steps = [1, 2, 3] as const;

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isDone = typeof current === "number" ? step < current : true;
        const isActive = current === step;

        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isDone
                  ? "bg-[#0C8BDA] text-white"
                  : isActive
                  ? "bg-[#0C8BDA] text-white ring-2 ring-[#0C8BDA]/30"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 transition-colors ${
                  isDone ? "bg-[#0C8BDA]" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ===== Inline Error =====
const InlineError = ({ message }: { message: string }) => (
  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
    {message}
  </p>
);

// ===== Step 1: Nhap Email =====
const Step1Email = ({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppErrorType | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError({ property: "email", message: "Vui lòng nhập email của bạn" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError({ property: "email", message: "Email không đúng định dạng" });
      return;
    }

    setLoading(true);
    const response = await forgotPassword({ email: email.trim() });
    setLoading(false);

    if (response && response.code === API_CODE.OK) {
      onSuccess(email.trim());
      return;
    }

    setError(
      response?.error
        ? { property: "email", message: response.error.message }
        : { property: null, message: "Đã xảy ra lỗi, vui lòng thử lại" }
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email đăng ký
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m2 7 10 7 10-7" />
          </svg>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => { setError(undefined); setEmail(e.target.value); }}
            placeholder="Nhập email của bạn"
            className={`w-full h-12 pl-10 pr-4 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              error?.property === "email"
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-[#0C8BDA]"
            }`}
          />
        </div>
        {error?.property === "email" && <InlineError message={error.message} />}
        {error?.property === null && <InlineError message={error.message} />}
      </div>

      <Button
        type="submit"
        loading={loading}
        loadingText="Đang gửi mã..."
        rounded="xl"
        className="w-full h-12 text-[15px] font-semibold mb-4"
      >
        Gửi mã xác nhận
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-[#0C8BDA] hover:underline font-medium">
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
};

// ===== Step 2: Nhap OTP =====
const Step2Otp = ({
  email,
  onSuccess,
  onChangeEmail,
}: {
  email: string;
  onSuccess: (otp: string) => void;
  onChangeEmail: () => void;
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<AppErrorType | undefined>();
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const { seconds, minutes, isExpired, reset } = useCountdown(600);

  // Quan ly resend cooldown (60 giay dau sau moi lan gui)
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Hien nut resend khi OTP het han
  const showResend = canResend || isExpired;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      setError({ property: "otp", message: "Vui lòng nhập đủ 6 chữ số OTP" });
      return;
    }

    setLoading(true);
    const response = await verifyOtp({ email, otp: otp.trim() });
    setLoading(false);

    if (response && response.code === API_CODE.OK) {
      onSuccess(otp.trim());
      return;
    }

    setError(
      response?.error
        ? { property: "otp", message: response.error.message }
        : { property: null, message: "Đã xảy ra lỗi, vui lòng thử lại" }
    );
  };

  const handleResend = async () => {
    setResendLoading(true);
    const response = await forgotPassword({ email });
    setResendLoading(false);

    if (response && response.code === API_CODE.OK) {
      reset(600);
      setCanResend(false);
      setResendCooldown(60);
      setOtp("");
      setError(undefined);
      return;
    }

    setError(
      response?.error
        ? { property: null, message: response.error.message }
        : { property: null, message: "Không thể gửi lại mã. Vui lòng thử lại sau." }
    );
  };

  const timerColorClass =
    minutes === 0 && seconds < 60
      ? "text-orange-500 dark:text-orange-400"
      : "text-gray-600 dark:text-gray-400";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Email masked */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
        Mã OTP đã được gửi đến{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {maskEmail(email)}
        </span>
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mã OTP
          </label>
          <span className={`text-sm font-mono font-medium ${timerColorClass}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setError(undefined);
            setOtp(val);
          }}
          placeholder="Nhập 6 chữ số"
          maxLength={6}
          inputMode="numeric"
          className={`w-full h-12 px-4 border rounded-xl text-[15px] text-center tracking-[0.5em] font-mono outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:tracking-normal placeholder:font-sans placeholder:text-[15px] ${
            error?.property === "otp"
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 dark:border-gray-700 focus:border-[#0C8BDA]"
          }`}
        />
        {error?.property === "otp" && <InlineError message={error.message} />}
        {error?.property === null && <InlineError message={error.message} />}
      </div>

      {/* Resend button */}
      {showResend && (
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-[#0C8BDA] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Đang gửi lại..." : "Gửi lại mã"}
          </button>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        loadingText="Đang xác nhận..."
        rounded="xl"
        className="w-full h-12 text-[15px] font-semibold mb-4"
      >
        Xác nhận OTP
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-sm text-[#0C8BDA] hover:underline font-medium"
        >
          Thay đổi email
        </button>
      </div>
    </form>
  );
};

// ===== Step 3: Dat Mat Khau Moi =====
const Step3Password = ({
  email,
  otp,
  onSuccess,
}: {
  email: string;
  otp: string;
  onSuccess: () => void;
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppErrorType | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError({ property: "password", message: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (password.length < 6) {
      setError({ property: "password", message: "Mật khẩu phải có ít nhất 6 ký tự" });
      return;
    }
    if (password.length > 16) {
      setError({ property: "password", message: "Mật khẩu không được vượt quá 16 ký tự" });
      return;
    }
    if (!confirmPassword) {
      setError({ property: "confirm_password", message: "Vui lòng xác nhận mật khẩu" });
      return;
    }
    if (password !== confirmPassword) {
      setError({ property: "confirm_password", message: "Xác nhận mật khẩu không khớp" });
      return;
    }

    setLoading(true);
    const response = await recoveryPassword({ email, otp, password, confirm_password: confirmPassword });
    setLoading(false);

    if (response && response.code === API_CODE.OK) {
      onSuccess();
      return;
    }

    setError(
      response?.error
        ? { property: null, message: response.error.message }
        : { property: null, message: "Đã xảy ra lỗi, vui lòng thử lại" }
    );
  };

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error?.property === null && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-600 rounded text-sm text-red-800 dark:text-red-300" role="alert">
          {error.message}
        </div>
      )}

      {/* Mat khau moi */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mật khẩu mới
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => { setError(undefined); setPassword(e.target.value); }}
            placeholder="Nhập mật khẩu mới (6-16 ký tự)"
            minLength={6}
            maxLength={16}
            className={`w-full h-12 pl-10 pr-10 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              error?.property === "password"
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-[#0C8BDA]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
        {error?.property === "password" && <InlineError message={error.message} />}
      </div>

      {/* Xac nhan mat khau */}
      <div className="mb-6">
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm_password"
            value={confirmPassword}
            onChange={(e) => { setError(undefined); setConfirmPassword(e.target.value); }}
            placeholder="Nhập lại mật khẩu"
            minLength={6}
            maxLength={16}
            className={`w-full h-12 pl-10 pr-10 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              error?.property === "confirm_password"
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-[#0C8BDA]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <EyeIcon visible={showConfirmPassword} />
          </button>
        </div>
        {error?.property === "confirm_password" && <InlineError message={error.message} />}
      </div>

      <Button
        type="submit"
        loading={loading}
        loadingText="Đang đặt mật khẩu..."
        rounded="xl"
        className="w-full h-12 text-[15px] font-semibold"
      >
        Đặt mật khẩu mới
      </Button>
    </form>
  );
};

// ===== Success Screen =====
const SuccessScreen = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="text-center py-4">
      {/* Checkmark icon */}
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scale-in_0.3s_ease-out]">
        <svg
          className="text-green-500 dark:text-green-400"
          width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Đặt mật khẩu thành công!
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Mật khẩu của bạn đã được cập nhật. Chuyển về trang đăng nhập sau{" "}
        <span className="font-medium text-[#0C8BDA]">{countdown}</span> giây...
      </p>

      <Button
        type="button"
        onClick={() => router.push("/login")}
        rounded="xl"
        className="w-full h-12 text-[15px] font-semibold"
      >
        Đăng nhập ngay
      </Button>
    </div>
  );
};

// ===== Main View =====
const ResetPasswordView = () => {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const stepTitles: Record<string, string> = {
    "1": "Quên mật khẩu",
    "2": "Nhập mã OTP",
    "3": "Đặt mật khẩu mới",
    "success": "Thành công",
  };

  const stepSubtitles: Record<string, string> = {
    "1": "Nhập email để nhận mã xác nhận",
    "2": "Nhập mã OTP được gửi đến email",
    "3": "Tạo mật khẩu mới cho tài khoản",
    "success": "",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-[448px]">
        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0C8BDA] to-[#065A8C] rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Title */}
          {step !== "success" && (
            <>
              <h2 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100 text-center mb-1">
                {stepTitles[String(step)]}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                {stepSubtitles[String(step)]}
              </p>

              {/* Step Indicator */}
              <StepIndicator current={step} />
            </>
          )}

          {/* Step Content */}
          {step === 1 && (
            <Step1Email
              onSuccess={(submittedEmail) => {
                setEmail(submittedEmail);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <Step2Otp
              email={email}
              onSuccess={(submittedOtp) => {
                setOtp(submittedOtp);
                setStep(3);
              }}
              onChangeEmail={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Password
              email={email}
              otp={otp}
              onSuccess={() => setStep("success")}
            />
          )}

          {step === "success" && <SuccessScreen />}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;

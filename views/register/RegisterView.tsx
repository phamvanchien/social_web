"use client";

import { registerSendOtp, registerVerifyOtp, registerComplete } from "@/api/authenticate.api";
import Button from "@/components/common/Button";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH, APP_ERROR } from "@/enums/app.enum";
import { RequestRegisterSendOtpType } from "@/types/authenticate.type";
import { AppErrorType } from "@/types/base.type";
import { APP_CONFIG } from "@/config/app.config";
import { useCountdown } from "@/hooks/useCountdown";
import { setCookie } from "@/utils/cookie.utils";
import { maskEmail } from "@/utils/string.utils";
import Link from "next/link";
import { useEffect, useState } from "react";

// ===== Helper: isEmail =====
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ===== Helper: isValidPhone =====
const isValidPhone = (phone: string): boolean => {
  return /^\d{10,11}$/.test(phone);
};

// ===== EyeIcon =====
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

// ===== InlineError =====
const InlineError = ({ message }: { message: string }) => (
  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
    {message}
  </p>
);

// ===== StepIndicator =====
const StepIndicator = ({ step }: { step: 1 | 2 }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {/* Step 1 */}
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
        step > 1
          ? "bg-[#0C8BDA] text-white"
          : "bg-[#0C8BDA] text-white ring-2 ring-[#0C8BDA]/30"
      }`}
    >
      {step > 1 ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        "1"
      )}
    </div>

    {/* Connector */}
    <div className={`w-16 h-0.5 transition-colors ${step > 1 ? "bg-[#0C8BDA]" : "bg-gray-200 dark:bg-gray-700"}`} />

    {/* Step 2 */}
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
        step === 2
          ? "bg-[#0C8BDA] text-white ring-2 ring-[#0C8BDA]/30"
          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
      }`}
    >
      2
    </div>
  </div>
);

// ===== Main View =====
const RegisterView = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RequestRegisterSendOtpType>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string>("");

  // Step 2 state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendTrigger, setResendTrigger] = useState(0);

  // Countdown (10 min = 600s) - reset when step changes to 2 or resend triggered
  const { seconds, minutes, isExpired, reset } = useCountdown(600);

  // Reset countdown when entering step 2
  useEffect(() => {
    if (step === 2) {
      reset(600);
      setOtp("");
      setOtpError("");
      setResendMessage("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resendTrigger]);

  const setField = (field: keyof RequestRegisterSendOtpType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
    if (globalError) setGlobalError("");
  };

  // ===== Validate Step 1 =====
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Họ không được để trống";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Tên không được để trống";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = "Email không hợp lệ";
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (formData.password.length > 16) {
      newErrors.password = "Mật khẩu không được vượt quá 16 ký tự";
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Vui lòng xác nhận mật khẩu";
    } else if (formData.confirm_password !== formData.password) {
      newErrors.confirm_password = "Xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Handle Submit Step 1 =====
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateStep1()) return;

    setLoading(true);
    const payload: RequestRegisterSendOtpType = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone?.trim() || undefined,
    };

    const response = await registerSendOtp(payload);
    setLoading(false);

    if (response && response.code === API_CODE.OK) {
      setStep(2);
      return;
    }

    // Handle errors
    if (response?.code === 429) {
      setGlobalError(response.error?.message || APP_ERROR.SERVER_ERROR);
      return;
    }

    if (response?.error) {
      if (response.error.property) {
        setErrors({ [response.error.property]: response.error.message });
      } else {
        setGlobalError(response.error.message);
      }
    } else {
      setGlobalError(APP_ERROR.SERVER_ERROR);
    }
  };

  // ===== Handle Submit Step 2 =====
  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setGlobalError("");

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }

    setLoading(true);

    // Step 1: verify OTP
    const verifyResponse = await registerVerifyOtp({
      email: formData.email.trim().toLowerCase(),
      otp: trimmedOtp,
    });

    if (!verifyResponse || verifyResponse.code !== API_CODE.OK) {
      setLoading(false);
      const msg = verifyResponse?.error?.message || APP_ERROR.SERVER_ERROR;
      setOtpError(msg);
      return;
    }

    // Step 2: complete registration
    const completeResponse = await registerComplete({
      email: formData.email.trim().toLowerCase(),
      otp: trimmedOtp,
    });

    setLoading(false);

    if (completeResponse && completeResponse.code === API_CODE.OK) {
      // Set cookies
      setCookie(APP_AUTH.COOKIE_AUTH_KEY, completeResponse.data.access_token, {
        expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
        path: "/",
        sameSite: "lax",
        secure: APP_CONFIG.ENVIROMENT === "production",
      });
      setCookie(APP_AUTH.COOKIE_AUTH_USER, JSON.stringify(completeResponse.data.user), {
        expires: APP_CONFIG.TOKEN_EXPIRE_TIME,
        path: "/",
        sameSite: "lax",
        secure: APP_CONFIG.ENVIROMENT === "production",
      });

      window.location.href = "/location";
      return;
    }

    setGlobalError(completeResponse?.error?.message || APP_ERROR.SERVER_ERROR);
  };

  // ===== Handle Resend OTP =====
  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    setGlobalError("");

    const payload: RequestRegisterSendOtpType = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: formData.phone?.trim() || undefined,
    };

    const response = await registerSendOtp(payload);
    setResendLoading(false);

    if (response && response.code === API_CODE.OK) {
      reset(600);
      setResendTrigger((prev) => prev + 1);
      setOtp("");
      setOtpError("");
      setResendMessage("Mã mới đã được gửi đến email của bạn.");
      return;
    }

    if (response?.code === 429) {
      setGlobalError(response.error?.message || "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.");
    } else {
      setGlobalError(response?.error?.message || APP_ERROR.SERVER_ERROR);
    }
  };

  // ===== Handle Back to Step 1 =====
  const handleBackToStep1 = () => {
    setStep(1);
    setOtp("");
    setOtpError("");
    setGlobalError("");
    setResendMessage("");
  };

  const inputClass = (field: string) =>
    `w-full h-12 px-4 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
      errors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
    }`;

  const inputWithIconClass = (field: string) =>
    `w-full h-12 pl-10 pr-4 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
      errors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
    }`;

  const timerColorClass =
    minutes === 0 && seconds < 60
      ? "text-orange-500 dark:text-orange-400"
      : "text-gray-600 dark:text-gray-400";

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
            {/* Card 1 */}
            <div className="bg-white/[0.15] border border-white/20 rounded-xl p-4 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
              <div className="h-2 w-16 rounded bg-white/40 mb-2" />
              <div className="h-2 w-24 rounded bg-white/60 mb-2" />
              <div className="h-2 w-20 rounded bg-white/40 mb-2" />
              <div className="mt-3">
                <div className="h-1 w-full rounded bg-white/30 mb-1" />
                <div className="h-1 w-3/4 rounded bg-white/30" />
              </div>
            </div>

            {/* Card 2 */}
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

            {/* Card 3 */}
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

            {/* Card 4 */}
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
              Tham gia Lacial ngay
            </h1>
            <p className="text-xl opacity-80">
              Kết nối với bạn bè và cộng đồng xung quanh bạn
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (40%) ===== */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white dark:bg-gray-950 px-6 sm:px-12 py-12">
        <div className="w-full max-w-[448px]">
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
          <h2 className="text-[28px] font-semibold text-[#1a1a1a] dark:text-gray-100 tracking-tight text-center mb-2">
            {step === 1 ? "Tạo tài khoản" : "Xác nhận email"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {step === 1
              ? "Nhập thông tin để bắt đầu"
              : "Nhập mã OTP được gửi đến email của bạn"}
          </p>

          {/* Stepper */}
          <StepIndicator step={step} />

          {/* Global Error */}
          {globalError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400" role="alert">
              {globalError}
            </div>
          )}

          {/* ===== STEP 1: Form ===== */}
          {step === 1 && (
            <form onSubmit={handleSubmitStep1} noValidate>
              {/* Ho + Ten: side by side tren desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                {/* Ho */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                    placeholder="Nguyễn"
                    maxLength={100}
                    className={inputClass("first_name")}
                  />
                  {errors.first_name && <InlineError message={errors.first_name} />}
                </div>

                {/* Ten */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                    placeholder="Văn A"
                    maxLength={100}
                    className={inputClass("last_name")}
                  />
                  {errors.last_name && <InlineError message={errors.last_name} />}
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="your@email.com"
                    maxLength={150}
                    className={inputWithIconClass("email")}
                  />
                </div>
                {errors.email && <InlineError message={errors.email} />}
              </div>

              {/* So dien thoai (optional) */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                  Số điện thoại{" "}
                  <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="0912345678"
                    inputMode="numeric"
                    maxLength={11}
                    className={inputWithIconClass("phone")}
                  />
                </div>
                {errors.phone && <InlineError message={errors.phone} />}
              </div>

              {/* Mat khau */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    maxLength={16}
                    className={`w-full h-12 pl-10 pr-10 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
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
                {errors.password && <InlineError message={errors.password} />}
              </div>

              {/* Xac nhan mat khau */}
              <div className="mb-6">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-[#1a1a1a] dark:text-gray-200 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    value={formData.confirm_password}
                    onChange={(e) => setField("confirm_password", e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    minLength={6}
                    maxLength={16}
                    className={`w-full h-12 pl-10 pr-10 border rounded-xl text-[15px] outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                      errors.confirm_password
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#e5e7eb] dark:border-gray-700 focus:border-[#0C8BDA]"
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
                {errors.confirm_password && <InlineError message={errors.confirm_password} />}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Đang xử lý..."
                rounded="xl"
                className="w-full h-12 text-[15px] font-semibold cursor-pointer mb-4"
              >
                Tiếp tục
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#e5e7eb] dark:bg-gray-700" />
                <span className="text-sm text-[#6b7280] dark:text-gray-400">hoặc tiếp tục với</span>
                <div className="flex-1 h-px bg-[#e5e7eb] dark:bg-gray-700" />
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => alert("Vui lòng dùng tính năng Đăng nhập với Google")}
                  className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-[#d1d5db] dark:border-gray-700 rounded-3xl text-[15px] font-medium text-[#1a1a1a] dark:text-gray-100 cursor-pointer hover:bg-[#f9fafb] dark:hover:bg-gray-800 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.8789 15.7789 19.9895 13.221 19.9895 10.1871Z" fill="#4285F4" />
                    <path d="M10.1993 19.9313C12.9527 19.9313 15.2643 19.0454 16.9527 17.5174L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1993 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.76588 17.6945 6.21061 19.9313 10.1993 19.9313Z" fill="#34A853" />
                    <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27909 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05" />
                    <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33717L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335" />
                  </svg>
                  Google
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => alert("Tính năng đăng nhập với Apple sẽ sớm ra mắt!")}
                  className="h-12 flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-[#d1d5db] dark:border-gray-700 rounded-3xl text-[15px] font-medium text-[#1a1a1a] dark:text-gray-100 cursor-pointer hover:bg-[#f9fafb] dark:hover:bg-gray-800 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.44 4.44 0 0 0-2.91 1.52 4.17 4.17 0 0 0-1.02 2.57 3.69 3.69 0 0 0 2.87-1.4Zm1.27 1.52c-1.6-.1-2.97.91-3.73.91-.77 0-1.94-.86-3.21-.84a4.76 4.76 0 0 0-4.01 2.45c-1.72 2.97-.44 7.37 1.22 9.79.82 1.19 1.8 2.52 3.09 2.47 1.23-.05 1.7-.8 3.19-.8 1.49 0 1.92.8 3.22.77 1.33-.02 2.17-1.21 2.98-2.4a10.96 10.96 0 0 0 1.35-2.77 4.36 4.36 0 0 1-2.6-3.98 4.42 4.42 0 0 1 2.1-3.71 4.56 4.56 0 0 0-3.6-1.89Z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Dang nhap link */}
              <div className="text-center">
                <p className="text-sm text-[#6b7280] dark:text-gray-400">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="font-medium text-[#0C8BDA] hover:underline">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* ===== STEP 2: OTP ===== */}
          {step === 2 && (
            <form onSubmit={handleSubmitStep2} noValidate>
              {/* Email display */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                Mã OTP đã được gửi đến{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {maskEmail(formData.email)}
                </span>
                .{" "}
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-[#0C8BDA] hover:underline font-medium"
                >
                  Thay đổi
                </button>
              </p>

              {/* OTP Input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mã OTP
                  </label>
                  {!isExpired && (
                    <span className={`text-sm font-mono font-medium ${timerColorClass}`}>
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                    if (otpError) setOtpError("");
                  }}
                  placeholder="Nhập 6 chữ số"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full h-12 px-4 border rounded-xl text-[15px] text-center tracking-[0.5em] font-mono outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:tracking-normal placeholder:font-sans ${
                    otpError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-[#0C8BDA]"
                  }`}
                />
                {otpError && <InlineError message={otpError} />}
              </div>

              {/* Resend message */}
              {resendMessage && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center mb-3">
                  {resendMessage}
                </p>
              )}

              {/* Resend button - only when expired or countdown done */}
              {isExpired && (
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

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                loadingText="Đang xác nhận..."
                rounded="xl"
                className="w-full h-12 text-[15px] font-semibold mb-4"
                disabled={otp.length < 6 || loading}
              >
                Xác nhận
              </Button>

              {/* Back link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-sm text-[#0C8BDA] hover:underline font-medium"
                >
                  Quay lại
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterView;

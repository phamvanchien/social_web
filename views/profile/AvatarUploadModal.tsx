"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Modal, ModalPrimaryButton, ModalSecondaryButton } from "@/components/common/Modal";
import { updateAvatar } from "@/api/user.api";
import { UserProfileResponse } from "@/types/user.type";
import { API_CODE } from "@/enums/api.enum";
import { APP_AUTH } from "@/enums/app.enum";
import { getCookie, setCookie } from "@/utils/cookie.utils";
import { useAppDispatch } from "@/reduxs/store.redux";
import { updateUserAvatar } from "@/reduxs/user.redux";
import { Camera, Upload, X, Crop } from "lucide-react";
import ImageCropper from "./ImageCropper";

type AvatarUploadModalProps = {
  open: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  userName: string;
  onAvatarUpdated: (newProfile: UserProfileResponse) => void;
};

type ModalStep = "view" | "crop" | "preview";

export default function AvatarUploadModal({
  open,
  onClose,
  currentAvatar,
  userName,
  onAvatarUpdated,
}: AvatarUploadModalProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<ModalStep>("view");
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep("view");
      setOriginalImageUrl(null);
      setCroppedBlob(null);
      setCroppedPreviewUrl(null);
      setError(null);
      setIsUploading(false);
    }
  }, [open]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [originalImageUrl, croppedPreviewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }

    // Validate file size (max 10MB for original, will be compressed after crop)
    if (file.size > 10 * 1024 * 1024) {
      setError("Kích thước file tối đa là 10MB");
      return;
    }

    setError(null);

    // Cleanup old URL
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }

    const url = URL.createObjectURL(file);
    setOriginalImageUrl(url);
    setStep("crop");
    e.currentTarget.value = "";
  };

  const handleCropComplete = useCallback((blob: Blob) => {
    setCroppedBlob(blob);

    // Create preview URL for the cropped image
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }
    const url = URL.createObjectURL(blob);
    setCroppedPreviewUrl(url);
  }, [croppedPreviewUrl]);

  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmCrop = () => {
    if (croppedBlob) {
      setStep("preview");
    }
  };

  const handleUpload = async () => {
    if (!croppedBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      // Convert blob to File
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const response = await updateAvatar(file);

      if (response.code === API_CODE.OK && response.data) {
        const newAvatarUrl = response.data.avatar;

        // Update cookie with new user profile
        const cookieUserStr = getCookie(APP_AUTH.COOKIE_AUTH_USER);
        if (cookieUserStr) {
          try {
            const cookieUser = JSON.parse(cookieUserStr);
            cookieUser.avatar = newAvatarUrl;
            setCookie(APP_AUTH.COOKIE_AUTH_USER, JSON.stringify(cookieUser));
          } catch (parseError) {
            console.error("Error parsing cookie:", parseError);
          }
        }

        // Update Redux store to reflect avatar change in Header
        if (newAvatarUrl) {
          dispatch(updateUserAvatar(newAvatarUrl));
        }

        // Notify parent component
        onAvatarUpdated(response.data);
        onClose();
      } else {
        setError(response.message || "Có lỗi xảy ra khi cập nhật ảnh đại diện");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Có lỗi xảy ra khi cập nhật ảnh đại diện");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("crop");
    } else if (step === "crop") {
      setStep("view");
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl);
        setOriginalImageUrl(null);
      }
      setCroppedBlob(null);
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
        setCroppedPreviewUrl(null);
      }
      setError(null);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "view":
        return "Ảnh đại diện";
      case "crop":
        return "Cắt ảnh đại diện";
      case "preview":
        return "Xem trước";
      default:
        return "Ảnh đại diện";
    }
  };

  const renderFooter = () => {
    switch (step) {
      case "view":
        return (
          <>
            <ModalSecondaryButton onClick={onClose}>
              Đóng
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleChangeAvatar}>
              <Camera className="w-4 h-4 mr-2" />
              Đổi ảnh đại diện
            </ModalPrimaryButton>
          </>
        );
      case "crop":
        return (
          <>
            <ModalSecondaryButton onClick={handleBack}>
              Quay lại
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleConfirmCrop} disabled={!croppedBlob}>
              <Crop className="w-4 h-4 mr-2" />
              Xác nhận cắt ảnh
            </ModalPrimaryButton>
          </>
        );
      case "preview":
        return (
          <>
            <ModalSecondaryButton onClick={handleBack} disabled={isUploading}>
              Quay lại
            </ModalSecondaryButton>
            <ModalPrimaryButton onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Cập nhật
                </>
              )}
            </ModalPrimaryButton>
          </>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (step) {
      case "view":
        return (
          <div className="flex flex-col items-center">
            {/* Avatar display */}
            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700">
              <Image
                src={currentAvatar || "/images/default-avatar.png"}
                alt={userName}
                fill
                sizes="256px"
                className="object-cover"
                priority
              />
            </div>

            {/* User name */}
            <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{userName}</p>
          </div>
        );

      case "crop":
        return (
          <div className="flex flex-col items-center">
            {originalImageUrl && (
              <ImageCropper
                imageSrc={originalImageUrl}
                onCropComplete={handleCropComplete}
                cropSize={256}
              />
            )}

            {/* Error message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case "preview":
        return (
          <div className="flex flex-col items-center">
            {/* Cropped preview */}
            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700">
              {croppedPreviewUrl && (
                <Image
                  src={croppedPreviewUrl}
                  alt="Preview"
                  fill
                  sizes="256px"
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {/* User name */}
            <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{userName}</p>

            {/* Error message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Preview indicator */}
            {!error && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Xem trước ảnh đại diện mới của bạn
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={getTitle()}
      size="md"
      footer={renderFooter()}
      closeOnOverlay={!isUploading && step !== "crop"}
      closeOnEsc={!isUploading}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {renderContent()}
    </Modal>
  );
}

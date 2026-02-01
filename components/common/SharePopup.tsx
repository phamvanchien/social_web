"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Link2,
  Share2,
  Facebook,
  Send,
  Check,
  X,
} from "lucide-react";

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  postContent?: string;
}

// Twitter/X icon component
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Telegram icon component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const SharePopup = ({ open, onClose, postId, postContent }: SharePopupProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined" && !!document.body;

  // Get post URL
  const getPostUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/post/${postId}`;
    }
    return "";
  };

  // Get share text
  const getShareText = () => {
    const text = postContent?.slice(0, 100) || "Xem bài viết này trên lokasa";
    return text.length < (postContent?.length || 0) ? `${text}...` : text;
  };

  // Handle animation on open
  useEffect(() => {
    if (open) {
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
    }
  }, [open]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Reset copied state when popup closes
  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPostUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chia sẻ từ lokasa",
          text: getShareText(),
          url: getPostUrl(),
        });
        onClose();
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled or failed:", err);
      }
    }
  };

  // Share to Facebook
  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank", "width=600,height=400");
    onClose();
  };

  // Share to Twitter/X
  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank", "width=600,height=400");
    onClose();
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${getShareText()} ${getPostUrl()}`)}`;
    window.open(url, "_blank");
    onClose();
  };

  // Share to Telegram
  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(getPostUrl())}&text=${encodeURIComponent(getShareText())}`;
    window.open(url, "_blank");
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isBrowser || !open) return null;

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal content - Bottom sheet on mobile, centered modal on desktop */}
      <div
        ref={ref}
        className={`relative w-full md:w-auto md:max-w-[360px] bg-white md:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden transition-transform duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 md:translate-y-0"
            : "translate-y-full md:translate-y-4"
        }`}
      >
        {/* Drag handle - mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-[16px] font-semibold text-gray-900">Chia sẻ</h3>
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Share options */}
        <div className="py-3 max-h-[70vh] md:max-h-none overflow-y-auto">
          {/* In-app share options (placeholders for future) */}
          <div className="px-4 pb-3 mb-3 border-b border-gray-100">
            <p className="text-[11px] text-gray-400 uppercase font-medium mb-2 px-1">Chia sẻ trong lokasa</p>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              onClick={() => {
                // TODO: Implement share to timeline
                alert("Chức năng đang phát triển");
              }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[14px] text-gray-800">Chia sẻ lên bảng tin</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              onClick={() => {
                // TODO: Implement send to friend
                alert("Chức năng đang phát triển");
              }}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[14px] text-gray-800">Gửi cho bạn bè</span>
            </button>
          </div>

          {/* External share options */}
          <div className="px-4">
            <p className="text-[11px] text-gray-400 uppercase font-medium mb-2 px-1">Chia sẻ qua</p>

            {/* Copy link */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              onClick={handleCopyLink}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Link2 className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <span className="text-[14px] text-gray-800">
                {copied ? "Đã sao chép!" : "Sao chép liên kết"}
              </span>
            </button>

            {/* Native Share (mobile) */}
            {supportsNativeShare && (
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                onClick={handleNativeShare}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-[14px] text-gray-800">Chia sẻ qua ứng dụng khác</span>
              </button>
            )}

            {/* Social platforms */}
            <div className="flex items-center gap-3 mt-3 px-1 pb-2">
              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                onClick={handleShareFacebook}
              >
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-[12px] text-gray-600">Facebook</span>
              </button>

              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                onClick={handleShareTwitter}
              >
                <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center">
                  <TwitterIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[12px] text-gray-600">X</span>
              </button>

              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                onClick={handleShareWhatsApp}
              >
                <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[12px] text-gray-600">WhatsApp</span>
              </button>

              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                onClick={handleShareTelegram}
              >
                <div className="w-11 h-11 rounded-full bg-sky-500 flex items-center justify-center">
                  <TelegramIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[12px] text-gray-600">Telegram</span>
              </button>
            </div>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="md:hidden h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>,
    document.body
  );
};

export default SharePopup;

"use client";
import Button from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import EmojiPicker from "@/components/common/EmojiPicker";
import { Calendar, ChevronDown, Globe, ImagePlus, MapPin, Smile, Lock, X, Users, Check } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { createPost } from "@/api/post.api";
import { RequestCreatePost } from "@/types/post.type";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxs/store.redux";

interface CreatePostProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

type VisibilityValue = 1 | 2 | 3;

const CreatePost: React.FC<CreatePostProps> = ({ open, setOpen }) => {
  const [visibilityDraft, setVisibilityDraft] = useState<VisibilityValue>(3);
  const [visibility, setVisibility] = useState<VisibilityValue>(3);
  const [openVisibility, setOpenVisibility] = useState(false);
  const userLogged = useSelector((state: RootState) => state.userSlice).data;
  const visibilityOptions = useMemo(
    () => [
      { value: 3, title: "Vị trí đang sống", desc: "Bất kỳ ai nằm trong khu vực phường, xã bạn đang sống sẽ thấy.", icon: <MapPin className="w-5 h-5" /> },
      { value: 2, title: "Bạn bè", desc: "Danh sách bạn bè", icon: <Users className="w-5 h-5" /> },
      { value: 1, title: "Chỉ mình tôi", desc: "Chỉ mình bạn", icon: <Lock className="w-5 h-5" /> }
    ],
    []
  );
  const selectedVisibility = visibilityOptions.find((o) => o.value === visibility);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length) setImages((prev) => [...prev, ...files]);
    e.currentTarget.value = ""; // allow re-picking same files
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const form = new FormData();
      if (content.trim()) form.append("content", content); // preserve newlines
      form.append("scope", visibility.toString());
      form.append("type", "1");
      form.append("active", "1");
      images.forEach((f) => form.append("files", f));

      await createPost(form as unknown as RequestCreatePost);
      // reset and close
      setOpen(false);
      setContent("");
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)} size="lg" align="top">
        {/* Top user row */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/70 mt-4">
          <div className="flex items-center gap-3">
            <img src={userLogged?.avatar} alt="me" className="w-10 h-10 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-gray-900">{userLogged?.first_name} {userLogged?.last_name}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenVisibility(true)}
            className="cursor-pointer inline-flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-800"
          >
            {selectedVisibility?.icon ?? <Globe className="w-4 h-4" />}
            {selectedVisibility?.title ?? visibilityOptions[0].title}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Composer card */}
        <div className="mt-4 rounded-xl bg-gray-50 p-4 shadow-sm ring-1 ring-gray-200/70">
          <textarea
            placeholder="Chia sẻ cảm xúc của bạn hiện tại!"
            className="w-full h-32 bg-transparent outline-none resize-none text-[15px] placeholder:text-gray-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-gray-200 bg-white">
                  <img src={src} alt={`upload-${i}`} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="cursor-pointer absolute top-1 right-1 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-gray-700 shadow ring-1 ring-black/10 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[14px] text-gray-700">Chia sẻ vào bài viết</div>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickImages}
              />
              <button
                type="button"
                title="Ảnh/Video"
                className="cursor-pointer text-sky-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-6 h-6" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  title="Cảm xúc"
                  className="cursor-pointer text-amber-500"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-6 h-6" />
                </button>
                <EmojiPicker
                  open={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onSelect={handleEmojiSelect}
                />
              </div>
              <span title="Sự kiện" className="text-green-600">
                <Calendar className="w-6 h-6" />
              </span>
              <span title="Vị trí" className="cursor-pointer text-red-500">
                <MapPin className="w-6 h-6" />
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5">
          <Button
            variant="primary"
            rounded="xl"
            fullWidth
            className="cursor-pointer"
            disabled={submitting || (content === "" && images.length === 0)}
            onClick={onSubmit}
          >
            {submitting ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </div>
      </Modal>

      {/* Visibility chooser modal */}
      <Modal open={openVisibility} onClose={() => setOpenVisibility(false)} size="md" align="top">
        <div className="pb-3 border-b border-gray-200/70 text-center font-semibold">Ai có thể xem bài viết này?</div>
        <div className="mt-3 text-[14px] text-gray-600">
          Bài viết này sẽ hiển thị trên bảng tin và trang cá nhân của bạn. Bạn có thể tuỳ chỉnh lại đối tượng xem bài viết bên dưới.
        </div>
        <div className="mt-4 space-y-2">
          {visibilityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibilityDraft(opt.value as VisibilityValue)}
              className="w-full cursor-pointer flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  {opt.icon}
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-medium text-gray-900">{opt.title}</div>
                  <div className="text-[12px] text-gray-500">{opt.desc}</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${visibilityDraft === opt.value ? 'border-sky-500 ring-2 ring-sky-200 text-sky-600' : 'border-gray-300 text-transparent'}`}>
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="light" className="cursor-pointer" onClick={() => {setOpenVisibility(false); setVisibilityDraft(3)}}>Đóng</Button>
          <Button variant="primary" className="cursor-pointer" onClick={() => {setOpenVisibility(false); setVisibility(visibilityDraft)}}>Hoàn thành</Button>
        </div>
      </Modal>
    </>
  );
};
export default CreatePost;

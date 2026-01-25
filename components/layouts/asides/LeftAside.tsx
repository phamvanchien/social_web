"use client"
import { RootState } from "@/reduxs/store.redux";
import {
  FileText,
  Sparkles,
  MessageSquare,
  UserRound,
  Video,
  Bookmark,
  Cake,
  Compass,
} from "lucide-react";
import { useSelector } from "react-redux";

const LeftAside = () => {
  const userLogged = useSelector((state: RootState) => state.userSlice).data;
  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="sticky top-20 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden">
              <img src={userLogged?.avatar ?? ''} alt="user" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight">{userLogged?.first_name} {userLogged?.last_name}</div>
              <div className="text-[12px] text-gray-500">P.5 Hồ Chí Minh</div>
            </div>
          </div>
        </div>

        {/* Menu (lucide icons) */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm">
          <ul className="p-2 text-[14px]">
            {[
              { label: "Bài viết", icon: <FileText className="w-4 h-4" /> },
              { label: "Đề xuất", icon: <Sparkles className="w-4 h-4" /> },
              { label: "Tin nhắn", icon: <MessageSquare className="w-4 h-4" /> },
              { label: "Bạn bè", icon: <UserRound className="w-4 h-4" /> },
              { label: "Video", icon: <Video className="w-4 h-4" /> },
              { label: "Tin đã lưu", icon: <Bookmark className="w-4 h-4" /> },
              { label: "Sinh nhật", icon: <Cake className="w-4 h-4" /> },
              { label: "Gợi ý khác", icon: <Compass className="w-4 h-4" /> },
            ].map((m) => (
              <li
                key={m.label}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0f2f5] cursor-pointer"
              >
                <span className="w-5 text-center">{m.icon}</span>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm">
          <div className="px-3 pt-3 pb-2 text-[12px] font-semibold text-gray-600 uppercase">Chế độ</div>
          <ul className="px-2 pb-2 text-[14px]">
            {["Mới nhất", "Học hỏi - Kiến thức", "Mua sắm"].map((x) => (
              <li key={x} className="px-3 py-2 rounded-lg hover:bg-[#f0f2f5] cursor-pointer">
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
export default LeftAside;
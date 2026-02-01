"use client"
import {
  MapPin,
  Home,
  MessageSquare,
  Users,
  Video,
  Bookmark,
  Gift,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Smile,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

const LeftAside = () => {
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-1">
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-3">
          {/* Location */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-3 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-pointer transition">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-blue-700">P.5 Hồ Chí Minh</div>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-600" />
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Main Menu */}
          <ul className="space-y-0">
            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <Home className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Đề xuất</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="relative flex items-center justify-center w-9 h-9">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  3+
                </span>
              </div>
              <span className="text-[15px] font-medium text-gray-800">Tin nhắn</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Bạn bè</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <Video className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Pings</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <Bookmark className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Tin đã lưu</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <Gift className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Sinh nhật</span>
            </li>

            <li className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
              <div className="flex items-center justify-center w-9 h-9">
                <HelpCircle className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-[15px] font-medium text-gray-800">Trợ giúp</span>
            </li>
          </ul>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Topics Section */}
          <div>
            <div
              className="flex items-center justify-between px-2 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              onClick={() => setTopicsExpanded(!topicsExpanded)}
            >
              <span className="text-[15px] font-semibold text-gray-800">Chủ đề</span>
              {topicsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>

            {topicsExpanded && (
              <ul className="mt-1 space-y-0">
                {/* Văn hóa - Giải trí */}
                <li>
                  <div
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => toggleTopic('culture')}
                  >
                    <div className="flex items-center justify-center w-9 h-9">
                      <Smile className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="flex-1 text-[14px] text-gray-700">Văn hoá - Giải quí</span>
                    {expandedTopics.includes('culture') ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </li>

                {/* Học tập - Kiến thức */}
                <li>
                  <div
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => toggleTopic('education')}
                  >
                    <div className="flex items-center justify-center w-9 h-9">
                      <BookOpen className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="flex-1 text-[14px] text-gray-700">Học tập - Kiến thức</span>
                    {expandedTopics.includes('education') ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </li>

                {/* Mua sắm */}
                <li>
                  <div
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => toggleTopic('shopping')}
                  >
                    <div className="flex items-center justify-center w-9 h-9">
                      <ShoppingBag className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="flex-1 text-[14px] text-gray-700">Mua sắm</span>
                    {expandedTopics.includes('shopping') ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
export default LeftAside;
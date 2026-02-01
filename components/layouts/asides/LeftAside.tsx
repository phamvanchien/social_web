"use client"
import {
  MapPin,
  Home,
  MessageCircle,
  Users,
  Play,
  Bookmark,
  Gift,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Smile,
  BookOpen,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface LeftAsideProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const LeftAside = ({ isMobile, onClose }: LeftAsideProps) => {
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={isMobile ? "h-full flex flex-col" : "col-span-12 lg:col-span-3"}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className="w-8 h-8 rounded-full bg-[#2196F3] text-white flex items-center justify-center font-bold text-[9px] tracking-tight">
              lokasa
            </div>
            <span className="font-semibold text-gray-800">Menu</span>
          </Link>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      <div className={`${isMobile ? "flex-1 overflow-y-auto px-2 py-2" : "sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto"}`}>
        {/* Location */}
        <div className="flex items-center gap-3 px-2 py-3 cursor-pointer group">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-[15px] font-medium text-blue-600">P.5 Hồ Chí Minh</span>
          <ChevronDown className="w-4 h-4 text-blue-600" />
        </div>

        {/* Main Menu */}
        <nav className="mt-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <Home className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                <span className="text-[15px] text-gray-800">Đề xuất</span>
              </Link>
            </li>

            <li>
              <Link
                href="/messages"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <div className="relative">
                  <MessageCircle className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    3+
                  </span>
                </div>
                <span className="text-[15px] text-gray-800">Tin nhắn</span>
              </Link>
            </li>

            <li>
              <Link
                href="/friends"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <Users className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                <span className="text-[15px] text-gray-800">Bạn bè</span>
              </Link>
            </li>

            <li>
              <Link
                href="/pings"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <div className="w-6 h-6 border-2 border-gray-600 rounded flex items-center justify-center">
                  <Play className="w-3 h-3 text-gray-600 ml-0.5" fill="currentColor" />
                </div>
                <span className="text-[15px] text-gray-800">Pings</span>
              </Link>
            </li>

            <li>
              <Link
                href="/saved"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <Bookmark className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                <span className="text-[15px] text-gray-800">Tin đã lưu</span>
              </Link>
            </li>

            <li>
              <Link
                href="/birthdays"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <Gift className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                <span className="text-[15px] text-gray-800">Sinh nhật</span>
              </Link>
            </li>

            <li>
              <Link
                href="/help"
                className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                onClick={handleLinkClick}
              >
                <HelpCircle className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                <span className="text-[15px] text-gray-800">Trợ giúp</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4 mx-2"></div>

        {/* Topics Section */}
        <div>
          <button
            className="flex items-center justify-between w-full px-2 py-2 hover:bg-gray-100 rounded-lg transition"
            onClick={() => setTopicsExpanded(!topicsExpanded)}
          >
            <span className="text-[15px] text-gray-600">Chủ đề</span>
            {topicsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {topicsExpanded && (
            <ul className="mt-1 space-y-1">
              {/* Văn hóa gần gũi */}
              <li>
                <button
                  className="flex items-center gap-4 w-full px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => toggleTopic('culture')}
                >
                  <Smile className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                  <span className="flex-1 text-left text-[15px] text-gray-800">Văn hoá gần gũi</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedTopics.includes('culture') ? 'rotate-180' : ''}`} />
                </button>
              </li>

              {/* Học tập - Kiến thức */}
              <li>
                <button
                  className="flex items-center gap-4 w-full px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => toggleTopic('education')}
                >
                  <BookOpen className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                  <span className="flex-1 text-left text-[15px] text-gray-800">Học tập - Kiến thức</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedTopics.includes('education') ? 'rotate-180' : ''}`} />
                </button>
              </li>

              {/* Mua sắm */}
              <li>
                <button
                  className="flex items-center gap-4 w-full px-2 py-3 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => toggleTopic('shopping')}
                >
                  <ShoppingBag className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                  <span className="flex-1 text-left text-[15px] text-gray-800">Mua sắm</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedTopics.includes('shopping') ? 'rotate-180' : ''}`} />
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
export default LeftAside;

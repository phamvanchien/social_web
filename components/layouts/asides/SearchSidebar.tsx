"use client";
import { Search, X, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface SearchSidebarProps {
  onClose: () => void;
}

// Hardcoded recent searches (sẽ xử lý logic sau)
const recentSearches = [
  {
    id: 1,
    type: "user",
    name: "Nguyễn Văn An",
    avatar: "/images/test/avatar.png",
    subtitle: "Bạn bè",
  },
  {
    id: 2,
    type: "user",
    name: "Trần Thị Bình",
    avatar: "/images/test/avatar.png",
    subtitle: "Gợi ý cho bạn",
  },
  {
    id: 3,
    type: "keyword",
    text: "quán cà phê quận 1",
  },
  {
    id: 4,
    type: "keyword",
    text: "review đồ ăn hồ chí minh",
  },
  {
    id: 5,
    type: "user",
    name: "Lê Hoàng Nam",
    avatar: "/images/test/avatar.png",
    subtitle: "12 bạn chung",
  },
];

const trendingSearches = [
  "Quán ăn ngon Sài Gòn",
  "Địa điểm check-in hot",
  "Review phim mới",
  "Mẹo tiết kiệm tiền",
  "Công thức nấu ăn",
];

const SearchSidebar = ({ onClose }: SearchSidebarProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleRemoveRecent = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement remove logic
    console.log("Remove recent search:", id);
  };

  const handleClearAll = () => {
    // TODO: Implement clear all logic
    console.log("Clear all recent searches");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          onClick={onClose}
          aria-label="Đóng tìm kiếm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">Tìm kiếm</span>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm trên lokasa..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-0 text-[15px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            autoFocus
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchValue && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center"
              onClick={() => setSearchValue("")}
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Searches */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-semibold text-gray-800">Tìm kiếm gần đây</h3>
            <button
              className="text-[13px] text-blue-600 hover:underline"
              onClick={handleClearAll}
            >
              Xóa tất cả
            </button>
          </div>

          <ul className="space-y-1">
            {recentSearches.map((item) => (
              <li key={item.id}>
                <button className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-100 transition group">
                  {item.type === "user" ? (
                    <>
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={item.avatar!}
                          alt={item.name!}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[15px] text-gray-800 font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-[13px] text-gray-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="flex-1 text-left text-[15px] text-gray-800 truncate">
                        {item.text}
                      </span>
                    </>
                  )}
                  <button
                    className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => handleRemoveRecent(item.id, e)}
                    aria-label="Xóa"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2 mx-4"></div>

        {/* Trending Searches */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-[15px] font-semibold text-gray-800">Xu hướng tìm kiếm</h3>
          </div>

          <ul className="space-y-1">
            {trendingSearches.map((text, index) => (
              <li key={index}>
                <button className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-100 transition">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="flex-1 text-left text-[15px] text-gray-800 truncate">
                    {text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchSidebar;

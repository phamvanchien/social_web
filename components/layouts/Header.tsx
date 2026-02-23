"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, Plus, Search, User, Settings, HelpCircle, LogOut, Menu, X, Clock, TrendingUp } from "lucide-react";
import CreatePost from "./posts/CreatePost";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/reduxs/store.redux";
import { getCookie, removeCookie } from "@/utils/cookie.utils";
import { APP_AUTH } from "@/enums/app.enum";
import { setUser } from "@/reduxs/user.redux";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export default function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userLogged = useSelector((state: RootState) => state.userSlice).data;

  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(userLogged);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userAuth = getCookie(APP_AUTH.COOKIE_AUTH_USER);
    if (userAuth) {
      const userParse = JSON.parse(userAuth);
      dispatch(setUser(userParse));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userLogged) {
      setUserData(userLogged);
    }
  }, [userLogged]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    removeCookie(APP_AUTH.COOKIE_AUTH_KEY);
    removeCookie(APP_AUTH.COOKIE_AUTH_USER);
    window.location.href = "/login";
  };

  const fullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : '';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="w-full px-4 md:px-6">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between h-14">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                onClick={onMenuClick}
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <Link className="flex items-center" href="/" aria-label="Home">
                <div className="w-10 h-10 rounded-full bg-[#2196F3] text-white flex items-center justify-center font-bold text-[11px] tracking-tight">
                  lokasa
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                onClick={onSearchClick}
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Add Button */}
              <button
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition"
                title="Tạo bài viết"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* Notification Button */}
              <button
                className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="w-6 h-6" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-medium flex items-center justify-center">
                  18+
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 cursor-pointer focus:outline-none focus:ring-blue-300"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Image
                    src={userData?.avatar || "/images/default-avatar.png"}
                    alt="Avatar"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3" onClick={() => router.replace('/profile')}>
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0">
                          <Image
                            src={userData?.avatar || "/images/default-avatar.png"}
                            alt="Avatar"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">
                            {fullName || "Người dùng"}
                          </p>
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                            {userData?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Trang cá nhân</span>
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Cài đặt & quyền riêng tư</span>
                      </Link>
                      <Link href="/help" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Trợ giúp & hỗ trợ</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left" onClick={handleLogout}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Header - Grid aligned with main content */}
          <div className="hidden lg:grid grid-cols-12 gap-6 max-w-[1400px] mx-auto h-14 items-center">
            {/* Left: Logo - col-span-3 */}
            <div className="col-span-3 flex items-center">
              <Link className="flex items-center" href="/" aria-label="Home">
                <div className="w-10 h-10 rounded-full bg-[#2196F3] text-white flex items-center justify-center font-bold text-[11px] tracking-tight">
                  lokasa
                </div>
              </Link>
            </div>

            {/* Center: Search - col-span-6 (aligned with post content) */}
            <div className="col-span-6 flex items-center justify-center">
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm lokasa..."
                    className="w-full h-10 pl-5 pr-12 rounded-full bg-gray-100 dark:bg-gray-800 border-0 text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-700 transition"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions - col-span-3 */}
            <div className="col-span-3 flex items-center justify-end gap-3">
              {/* Add Button */}
              <button
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition"
                title="Tạo bài viết"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* Notification Button */}
              <button
                className="relative w-10 h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="w-6 h-6" strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-medium flex items-center justify-center">
                  18+
                </span>
              </button>

              {/* User Avatar with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 cursor-pointer focus:outline-none focus:ring-blue-300"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Image
                    src={userData?.avatar || "/images/default-avatar.png"}
                    alt="Avatar"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3" onClick={() => router.replace('/profile')}>
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0">
                          <Image
                            src={userData?.avatar || "/images/default-avatar.png"}
                            alt="Avatar"
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">
                            {fullName || "Người dùng"}
                          </p>
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                            {userData?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Trang cá nhân</span>
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Cài đặt & quyền riêng tư</span>
                      </Link>
                      <Link href="/help" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Trợ giúp & hỗ trợ</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left" onClick={handleLogout}>
                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="text-[15px] text-gray-800 dark:text-gray-200">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
}

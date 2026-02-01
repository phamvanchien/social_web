"use client";
import { useEffect, useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import Input from "@/components/common/Input";
import CreatePost from "./posts/CreatePost";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/reduxs/store.redux";
import { getCookie } from "@/utils/cookie.utils";
import { APP_AUTH } from "@/enums/app.enum";
import { setUser } from "@/reduxs/user.redux";

export default function Header() {
  const dispatch = useAppDispatch();
  const userLogged = useSelector((state: RootState) => state.userSlice).data;

  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(userLogged);

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

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/60">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="h-14 flex items-center gap-4">
            {/* Left: Logo */}
            <a className="flex items-center" href="#" aria-label="Home">
              <div className="w-9 h-9 rounded-full bg-[#0C8BDA] text-white flex items-center justify-center font-semibold text-[10px] shadow">
                lacial
              </div>
            </a>

            {/* Center: Search */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-[720px]">
                <Input
                  size="lg"
                  placeholder="Tìm kiếm lacial..."
                  leftIcon={<Search className="w-5 h-5" />}
                  className="rounded-full border-gray-200 bg-gray-50 shadow-none focus:bg-white focus:border-gray-300"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
                title="Thêm"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center shadow">
                  3
                </span>
              </button>

              <div className="ml-1">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-200">
                  <img src={userData?.avatar} alt="me" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <CreatePost open={open} setOpen={setOpen} />
    </>
  );
}


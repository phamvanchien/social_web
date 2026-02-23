import {
  Plus,
  UserRound,
} from "lucide-react";

const RightAside = () => {
  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-1 space-y-4">
        {/* Gợi ý cho bạn */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Gợi ý cho bạn</h4>
            <a className="text-[12px] text-indigo-600 dark:text-indigo-400 hover:underline" href="#">
              Xem tất cả
            </a>
          </div>

          <ul className="mt-3 space-y-3">
            {[
              { name: "Bùi Văn Lành", sub: "Thường mở" },
              { name: "Lan Nhi", sub: "Sống tại Hồ Chí Minh" },
              { name: "Long Hoàng", sub: "Thành phố Thủ Đức" },
            ].map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                  <img src="/images/test/avatar.png" alt="" />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold leading-snug text-gray-900 dark:text-gray-100">{p.name}</div>
                  <div className="text-[12px] text-gray-500 dark:text-gray-400">{p.sub}</div>
                </div>
                <button className="px-3 py-1.5 text-[12px] rounded-lg bg-[#f0f2f5] dark:bg-gray-800 hover:brightness-95 dark:hover:bg-gray-700 inline-flex items-center gap-1 text-gray-800 dark:text-gray-200">
                  <Plus className="w-3.5 h-3.5" /> Thêm bạn
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Thường xuyên tương tác */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-3">
          <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Thường xuyên tương tác</h4>
          <ul className="mt-3 space-y-2">
            {["Bùi Văn Lành", "Hà Nhi", "Nguyễn Tấn Hưng", "Lan Anh"].map((n) => (
              <li key={n} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 inline-flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                  <UserRound className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </span>
                <span className="text-[14px] text-gray-800 dark:text-gray-200">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
export default RightAside;

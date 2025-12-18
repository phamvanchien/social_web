import React from "react";
import Header from "./Header";
import LeftAside from "./asides/LeftAside";
import RightAside from "./asides/RightAside";

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] text-gray-800">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="grid grid-cols-12 gap-5">
          <LeftAside />
          {children}
          <RightAside />
        </div>
      </main>
    </div>
  );
}
export default MainLayout;
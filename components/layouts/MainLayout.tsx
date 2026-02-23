"use client";
import React, { useState } from "react";
import Header from "./Header";
import LeftAside from "./asides/LeftAside";
import RightAside from "./asides/RightAside";
import SearchSidebar from "./asides/SearchSidebar";

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Header onMenuClick={toggleSidebar} onSearchClick={toggleSearch} />

      {/* Mobile Menu Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <LeftAside isMobile onClose={closeSidebar} />
      </div>

      {/* Mobile Search Sidebar Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSearch}
        />
      )}

      {/* Mobile Search Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[320px] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSearchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SearchSidebar onClose={closeSearch} />
      </div>

      <main className="w-full md:px-6 md:py-6">
        <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-[1400px] mx-auto">
          {/* Desktop LeftAside */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftAside />
          </div>

          {/* Main Content - full width on mobile */}
          <div className="col-span-12 lg:col-span-6">
            {children}
          </div>

          {/* RightAside - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3">
            <RightAside />
          </div>
        </div>
      </main>
    </div>
  );
}
export default MainLayout;

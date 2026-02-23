import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
return (
    <main className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute top-40 -right-10 h-80 w-80 rounded-full bg-indigo-50/70 dark:bg-indigo-900/10 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-30 text-indigo-50 dark:text-indigo-900/30" viewBox="0 0 400 800" fill="none">
          <path d="M10 120 C 80 90, 160 90, 230 120" stroke="currentColor"/>
          <path d="M20 620 C 120 680, 240 680, 320 620" stroke="currentColor"/>
        </svg>
      </div>

      {children}
    </main>
  );
}
export default AuthLayout;

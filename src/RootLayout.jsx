import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Global Header */}
      <header className="w-full flex justify-between items-center px-6 py-3 bg-black shadow-lg border-b border-gray-900">
        {/* Title on the left */}
        <h1 className="text-5xl font-extrabold text-white tracking-wide">
          Spare<span className="text-indigo-400">Smart</span>
        </h1>

        {/* Logo on the right */}
        <img
          src="/logo.png"
          alt="Company Logo"
          className="logo-class"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-slate-50 mt-4">
        <Outlet />
      </main>
    </div>
  );
}

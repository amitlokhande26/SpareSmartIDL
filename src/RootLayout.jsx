import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header */}
      <header className="flex justify-between items-center pl-4 pr-0 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md border-b border-slate-200">
        {/* Title on the left */}
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          SpareSmart
        </h1>

        {/* Logo on the right */}
        <img
          src="/logo.png"
          alt="Company Logo"
          className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}

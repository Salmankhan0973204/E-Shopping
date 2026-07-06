"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
    }
  }, [user, loading]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 text-lg font-medium">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ─── MOBILE OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">E-Shopping</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 border border-violet-600/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                }`}
              >
                <span className={isActive ? "text-violet-400" : "text-gray-500"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-xl bg-gray-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Toggle Sidebar Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-all duration-200 md:hidden"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <p className="text-sm text-gray-500">
                Welcome back, <span className="text-gray-300 font-medium">{user?.name || "Admin"}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-900 px-3 py-1.5 rounded-full border border-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
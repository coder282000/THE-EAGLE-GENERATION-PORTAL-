"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { mockNotifications } from "@/components/mock/data";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/chapter", label: "My Chapter", icon: "🏛️" },
  { href: "/community/directory", label: "Directory", icon: "👥" },
  { href: "/profile/me", label: "Profile", icon: "👤" },
];

export function MemberLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Count unread notifications
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:bg-ink-900 md:text-white md:fixed md:inset-y-0 md:z-40">
        <div className="p-5 border-b border-ink-700">
          <Link href="/dashboard">
            <Wordmark dark />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-dawn-500/20 text-dawn-300"
                    : "text-ink-300 hover:bg-ink-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-ink-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-ink-300 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <span className="text-lg">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header - Top bar */}
        <header className="bg-white border-b border-ink-100 sticky top-0 z-30">
          <div className="container-portal flex items-center justify-between h-14">
            {/* Wordmark - mobile only */}
            <div className="md:hidden">
              <Link href="/dashboard">
                <Wordmark dark />
              </Link>
            </div>
            {/* Spacer on desktop (since sidebar has the logo) */}
            <div className="hidden md:block flex-1" />

            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <Link
                href="/notifications"
                className="relative text-ink-400 hover:text-ink-600 transition-colors"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-dawn-100 text-sm font-medium text-dawn-700 hover:bg-dawn-200 focus:outline-none focus:ring-2 focus:ring-dawn-400 transition-colors"
                  aria-label="Profile menu"
                  aria-expanded={isDropdownOpen}
                >
                  G
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-ink-100 bg-white shadow-lg animate-rise">
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <p className="font-medium text-ink-900">Grace Mwangi</p>
                        <p className="text-xs text-ink-400">grace@example.com</p>
                      </div>
                      <hr className="my-1 border-ink-100" />

                      <Link
                        href="/profile/me"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>👤</span> My Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>✏️</span> Edit Profile
                      </Link>
                      <Link
                        href="/profile/security"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>🔐</span> Security
                      </Link>
                      <Link
                        href="/profile/privacy"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>🛡️</span> Privacy
                      </Link>
                      <hr className="my-1 border-ink-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-clay-600 hover:bg-clay-50 transition-colors"
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container-portal flex-1 py-6">{children}</main>

        {/* Bottom navigation - Mobile only */}
        <nav className="bg-white border-t border-ink-100 fixed bottom-0 w-full z-10 md:hidden">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center text-xs ${
                    isActive ? "text-dawn-600" : "text-ink-400 hover:text-ink-600"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Spacer for bottom nav on mobile */}
        <div className="h-16 md:h-0" />
      </div>
    </div>
  );
}
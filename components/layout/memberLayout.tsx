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
    // Placeholder – clear session, redirect to login
    setIsDropdownOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <header className="bg-ink-900 text-white sticky top-0 z-10 shadow-sm">
        <div className="container-portal flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex items-center">
            <Wordmark dark />
          </Link>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative text-ink-300 hover:text-white transition-colors"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-sm font-medium text-white hover:bg-ink-600 focus:outline-none focus:ring-2 focus:ring-dawn-400 transition-colors"
                aria-label="Profile menu"
                aria-expanded={isDropdownOpen}
              >
                G
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-ink-100 bg-white shadow-lg animate-rise">
                  <div className="p-2">
                    {/* User info */}
                    <div className="px-3 py-2">
                      <p className="font-medium text-ink-900">Grace Mwangi</p>
                      <p className="text-xs text-ink-400">grace@example.com</p>
                    </div>
                    <hr className="my-1 border-ink-100" />

                    {/* Menu items */}
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

      {/* Bottom navigation (mobile) */}
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
  );
}
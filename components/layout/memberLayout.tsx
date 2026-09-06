"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { mockNotifications } from "@/components/mock/data";
import { useCart } from "@/context/CartContext";

// Feature flag for messaging – controlled by Compliance Lead (G-2)
const FEATURE_DIRECT_MESSAGING =
  process.env.NEXT_PUBLIC_FEATURE_DIRECT_MESSAGING === "true";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Main navigation – grouped sections
const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/chapter", label: "My Chapter", icon: "🏛️" },
      { href: "/shop", label: "Shop", icon: "🛒" }, // Added Shop
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/community/feed", label: "Feed", icon: "📰" },
      { href: "/community/groups", label: "Groups", icon: "👥" },
      ...(FEATURE_DIRECT_MESSAGING
        ? [{ href: "/community/messages", label: "Messages", icon: "💬" }]
        : []),
      { href: "/community/directory", label: "Directory", icon: "📇" },
    ],
  },
  {
    title: "Learning",
    items: [
      { href: "/learning/courses", label: "Courses", icon: "📚" },
      { href: "/learning/my-learning", label: "My Learning", icon: "📖" },
    ],
  },
  {
    title: "Mentorship",
    items: [
      { href: "/mentorship/find", label: "Find a Mentor", icon: "🧑‍🏫" },
      { href: "/mentorship/my-mentors", label: "My Mentors", icon: "🤝" },
      { href: "/mentorship/requests", label: "Request Inbox", icon: "📥" },
    ],
  },
  {
    title: "Events",
    items: [
      { href: "/events", label: "Events", icon: "📅" },
      { href: "/meetings", label: "Meetings", icon: "🎥" },
    ],
  },
  {
    title: "Giving & Support", // New section
    items: [
      { href: "/giving", label: "Give", icon: "❤️" },
      { href: "/profile/giving", label: "Giving History", icon: "📜" },
    ],
  },
  {
    title: "Profile",
    items: [
      { href: "/profile/me", label: "My Profile", icon: "👤" },
      { href: "/profile/settings", label: "Edit Profile", icon: "✏️" },
      { href: "/profile/security", label: "Security", icon: "🔐" },
      { href: "/profile/privacy", label: "Privacy", icon: "🛡️" },
      { href: "/profile/orders", label: "My Orders", icon: "📦" },
      { href: "/profile/subscription", label: "Subscription", icon: "💳" },
      { href: "/profile/verification", label: "Verification", icon: "🪪" },
    ],
  },
];

// Flat list for bottom mobile nav (only the most important items)
const mobileNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/community/feed", label: "Feed", icon: "📰" },
  { href: "/learning/courses", label: "Learn", icon: "📚" },
  { href: "/events", label: "Events", icon: "📅" },
  { href: "/shop", label: "Shop", icon: "🛒" }, // Added Shop to mobile nav
  { href: "/profile/me", label: "Profile", icon: "👤" },
];

export function MemberLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get cart total items
  const { getTotalItems } = useCart();
  const cartTotalItems = getTotalItems();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

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

  // Helper to check active route
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:bg-ink-900 md:text-white md:fixed md:inset-y-0 md:z-40">
        <div className="p-5 border-b border-ink-700">
          <Link href="/dashboard">
            <Wordmark dark />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                      isActive(item.href)
                        ? "bg-dawn-500/20 text-dawn-300"
                        : "text-ink-300 hover:bg-ink-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
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
            <div className="md:hidden">
              <Link href="/dashboard">
                <Wordmark dark />
              </Link>
            </div>
            <div className="hidden md:block flex-1" />

            <div className="flex items-center gap-3 ml-auto md:ml-0">
              {/* Cart icon with badge */}
              <Link
                href="/cart"
                className="relative text-ink-400 hover:text-ink-600 transition-colors"
                aria-label="Shopping cart"
              >
                <span className="text-xl">🛒</span>
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
                    {cartTotalItems}
                  </span>
                )}
              </Link>

              {/* Notifications */}
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

              {/* Profile dropdown */}
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
                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>📦</span> My Orders
                      </Link>
                      <Link
                        href="/profile/subscription"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>💳</span> Subscription
                      </Link>
                      <Link
                        href="/profile/verification"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>🪪</span> Verification
                      </Link>
                      <Link
                        href="/profile/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>❤️</span> Giving History
                      </Link>
                      <Link
                        href="/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>🙏</span> Give Now
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
            {mobileNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center text-xs ${
                    active ? "text-dawn-600" : "text-ink-400 hover:text-ink-600"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="h-16 md:h-0" />
      </div>
    </div>
  );
}
"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { mockNotifications } from "@/components/mock/data";
import { useCart } from "@/context/CartContext";

// Feature flags for compliance-gated modules
const FEATURE_DIRECT_MESSAGING =
  process.env.NEXT_PUBLIC_FEATURE_DIRECT_MESSAGING === "true";
const FEATURE_VIRTUAL_ASSETS =
  process.env.NEXT_PUBLIC_FEATURE_VIRTUAL_ASSETS === "true";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// Main navigation â€“ grouped sections
const getNavSections = (): { title: string; items: NavItem[] }[] => {
  const sections = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "ðŸ“Š" },
        { href: "/chapter", label: "My Chapter", icon: "ðŸ›ï¸" },
        { href: "/shop", label: "Shop", icon: "ðŸ›’" },
      ],
    },
    {
      title: "Community",
      items: [
        { href: "/community/feed", label: "Feed", icon: "ðŸ“°" },
        { href: "/community/groups", label: "Groups", icon: "ðŸ‘¥" },
        ...(FEATURE_DIRECT_MESSAGING
          ? [{ href: "/community/messages", label: "Messages", icon: "ðŸ’¬" }]
          : []),
        { href: "/community/directory", label: "Directory", icon: "ðŸ“‡" },
      ],
    },
    {
      title: "Learning",
      items: [
        { href: "/learning/courses", label: "Courses", icon: "ðŸ“š" },
        { href: "/learning/my-learning", label: "My Learning", icon: "ðŸ“–" },
      ],
    },
    {
      title: "Mentorship",
      items: [
        { href: "/mentorship/find", label: "Find a Mentor", icon: "ðŸ§‘â€ðŸ«" },
        { href: "/mentorship/my-mentors", label: "My Mentors", icon: "ðŸ¤" },
        { href: "/mentorship/requests", label: "Request Inbox", icon: "ðŸ“¥" },
      ],
    },
    {
      title: "Events",
      items: [
        { href: "/events", label: "Events", icon: "ðŸ“…" },
        { href: "/meetings", label: "Meetings", icon: "ðŸŽ¥" },
      ],
    },
    {
      title: "Finance",
      items: [
        ...(FEATURE_VIRTUAL_ASSETS
          ? [{ href: "/wallet", label: "Wallet", icon: "ðŸ’³" }]
          : []),
        { href: "/savings", label: "Savings", icon: "ðŸ’°" },
        { href: "/credit", label: "Credit", icon: "ðŸ’³" },
        { href: "/credit/my-loans", label: "My Loans", icon: "ðŸ“‹" },
        { href: "/credit/guarantees", label: "Guarantees", icon: "ðŸ›¡ï¸" },
      ],
    },
  ];

  // Add OTC section if virtual assets are enabled
  if (FEATURE_VIRTUAL_ASSETS) {
    sections.push({
      title: "OTC",
      items: [
        { href: "/otc/buy", label: "Buy USDT", icon: "ðŸ“ˆ" },
        { href: "/otc/sell", label: "Sell USDT", icon: "ðŸ“‰" },
        { href: "/otc/orders", label: "My Orders", icon: "ðŸ“‹" },
      ],
    });
  }

  // Add Remittance section if virtual assets are enabled
  if (FEATURE_VIRTUAL_ASSETS) {
    sections.push({
      title: "Remittance",
      items: [
        { href: "/remit", label: "Send Money", icon: "ðŸ’¸" },
        { href: "/remit/transfers", label: "My Transfers", icon: "ðŸ“‹" },
        { href: "/remit/recipients", label: "Saved Recipients", icon: "ðŸ‘¤" },
      ],
    });
  }

  // Add Giving & Support and Profile sections
  sections.push(
    {
      title: "Giving & Support",
      items: [
        { href: "/giving", label: "Give", icon: "â¤ï¸" },
        { href: "/profile/giving", label: "Giving History", icon: "ðŸ“œ" },
      ],
    },
    {
      title: "Profile",
      items: [
        { href: "/profile/me", label: "My Profile", icon: "ðŸ‘¤" },
        { href: "/profile/settings", label: "Edit Profile", icon: "âœï¸" },
        { href: "/profile/security", label: "Security", icon: "ðŸ”" },
        { href: "/profile/privacy", label: "Privacy", icon: "ðŸ›¡ï¸" },
        { href: "/profile/orders", label: "My Orders", icon: "ðŸ“¦" },
        { href: "/profile/subscription", label: "Subscription", icon: "ðŸ’³" },
        { href: "/profile/verification", label: "Verification", icon: "ðŸªª" },
      ],
    }
  );

  return sections;
};

// Flat list for bottom mobile nav â€“ conditionally include R5 items
const getMobileNavItems = (): NavItem[] => {
  const base: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "ðŸ " },
    { href: "/community/feed", label: "Feed", icon: "ðŸ“°" },
    { href: "/learning/courses", label: "Learn", icon: "ðŸ“š" },
    { href: "/events", label: "Events", icon: "ðŸ“…" },
    { href: "/shop", label: "Shop", icon: "ðŸ›’" },
    { href: "/savings", label: "Savings", icon: "ðŸ’°" },
  ];

  if (FEATURE_VIRTUAL_ASSETS) {
    base.push({ href: "/wallet", label: "Wallet", icon: "ðŸ’³" });
    base.push({ href: "/otc/buy", label: "OTC", icon: "ðŸ’±" });
    base.push({ href: "/remit", label: "Send", icon: "ðŸ’¸" });
  }

  base.push({ href: "/profile/me", label: "Profile", icon: "ðŸ‘¤" });
  return base;
};

export function MemberLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get cart total items
  const { items } = useCart();
  const cartTotalItems = items.reduce((acc, item) => acc + item.quantity, 0);

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

  const navSections = getNavSections();
  const mobileNavItems = getMobileNavItems();

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
            <span className="text-lg">ðŸšª</span>
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
                <span className="text-xl">ðŸ›’</span>
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
                <span className="text-xl">ðŸ””</span>
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
                        <span>ðŸ‘¤</span> My Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>âœï¸</span> Edit Profile
                      </Link>
                      <Link
                        href="/profile/security"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸ”</span> Security
                      </Link>
                      <Link
                        href="/profile/privacy"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸ›¡ï¸</span> Privacy
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸ“¦</span> My Orders
                      </Link>
                      <Link
                        href="/profile/subscription"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸ’³</span> Subscription
                      </Link>
                      <Link
                        href="/profile/verification"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸªª</span> Verification
                      </Link>
                      <Link
                        href="/profile/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>â¤ï¸</span> Giving History
                      </Link>
                      <Link
                        href="/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span>ðŸ™</span> Give Now
                      </Link>
                      <hr className="my-1 border-ink-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-clay-600 hover:bg-clay-50 transition-colors"
                      >
                        <span>ðŸšª</span> Sign Out
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
          <div className="flex justify-around items-center h-16 overflow-x-auto">
            {mobileNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center text-xs min-w-[4rem] ${
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
"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { mockNotifications } from "@/components/mock/data";
import { useCart } from "@/context/CartContext";

// Lucide React Icons
import {
  LayoutDashboard,
  Building2,
  ShoppingBag,
  Newspaper,
  Users,
  MessageSquare,
  ListChecks,
  BookOpen,
  GraduationCap,
  UserSearch,
  Handshake,
  Inbox,
  CalendarDays,
  Video,
  Wallet,
  PiggyBank,
  CreditCard,
  ClipboardList,
  Shield,
  TrendingUp,
  TrendingDown,
  Send,
  User,
  Heart,
  ScrollText,
  Pencil,
  Lock,
  Package,
  UserCheck,
  Home,
  Bell,
  LogOut,
  HandHeart,
  ArrowUpDown,
} from "lucide-react";

// Feature flags for compliance-gated modules
const FEATURE_DIRECT_MESSAGING =
  process.env.NEXT_PUBLIC_FEATURE_DIRECT_MESSAGING === "true";
const FEATURE_VIRTUAL_ASSETS = true;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Map icon names to components
const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="w-5 h-5" />,
  Chapter: <Building2 className="w-5 h-5" />,
  Shop: <ShoppingBag className="w-5 h-5" />,
  Feed: <Newspaper className="w-5 h-5" />,
  Groups: <Users className="w-5 h-5" />,
  Messages: <MessageSquare className="w-5 h-5" />,
  Directory: <ListChecks className="w-5 h-5" />,
  Courses: <BookOpen className="w-5 h-5" />,
  MyLearning: <GraduationCap className="w-5 h-5" />,
  FindMentor: <UserSearch className="w-5 h-5" />,
  MyMentors: <Handshake className="w-5 h-5" />,
  Inbox: <Inbox className="w-5 h-5" />,
  Events: <CalendarDays className="w-5 h-5" />,
  Meetings: <Video className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  Savings: <PiggyBank className="w-5 h-5" />,
  Credit: <CreditCard className="w-5 h-5" />,
  MyLoans: <ClipboardList className="w-5 h-5" />,
  Guarantees: <Shield className="w-5 h-5" />,
  BuyUSDT: <TrendingUp className="w-5 h-5" />,
  SellUSDT: <TrendingDown className="w-5 h-5" />,
  MyOrders: <Package className="w-5 h-5" />,
  SendMoney: <Send className="w-5 h-5" />,
  Transfers: <ArrowUpDown className="w-5 h-5" />,
  Recipients: <User className="w-5 h-5" />,
  Give: <Heart className="w-5 h-5" />,
  GivingHistory: <ScrollText className="w-5 h-5" />,
  Profile: <User className="w-5 h-5" />,
  EditProfile: <Pencil className="w-5 h-5" />,
  Security: <Lock className="w-5 h-5" />,
  Privacy: <Shield className="w-5 h-5" />,
  MyOrders2: <Package className="w-5 h-5" />,
  Subscription: <CreditCard className="w-5 h-5" />,
  Verification: <UserCheck className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Notifications: <Bell className="w-5 h-5" />,
  Logout: <LogOut className="w-5 h-5" />,
  GiveNow: <HandHeart className="w-5 h-5" />,
  OTC: <ArrowUpDown className="w-5 h-5" />,
};

// Helper function to get icon
const getIcon = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || <LayoutDashboard className="w-5 h-5" />;
};

// Main navigation – grouped sections
const getNavSections = (): { title: string; items: NavItem[] }[] => {
  const sections = [
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: getIcon("Dashboard") },
        { href: "/chapter", label: "My Chapter", icon: getIcon("Chapter") },
        { href: "/shop", label: "Shop", icon: getIcon("Shop") },
      ],
    },
    {
      title: "Community",
      items: [
        { href: "/community/feed", label: "Feed", icon: getIcon("Feed") },
        { href: "/community/groups", label: "Groups", icon: getIcon("Groups") },
        ...(FEATURE_DIRECT_MESSAGING
          ? [{ href: "/community/messages", label: "Messages", icon: getIcon("Messages") }]
          : []),
        { href: "/community/directory", label: "Directory", icon: getIcon("Directory") },
      ],
    },
    {
      title: "Learning",
      items: [
        { href: "/learning/courses", label: "Courses", icon: getIcon("Courses") },
        { href: "/learning/my-learning", label: "My Learning", icon: getIcon("MyLearning") },
      ],
    },
    {
      title: "Mentorship",
      items: [
        { href: "/mentorship/find", label: "Find a Mentor", icon: getIcon("FindMentor") },
        { href: "/mentorship/my-mentors", label: "My Mentors", icon: getIcon("MyMentors") },
        { href: "/mentorship/requests", label: "Request Inbox", icon: getIcon("Inbox") },
      ],
    },
    {
      title: "Events",
      items: [
        { href: "/events", label: "Events", icon: getIcon("Events") },
        { href: "/meetings", label: "Meetings", icon: getIcon("Meetings") },
      ],
    },
    {
      title: "Finance",
      items: [
        ...(FEATURE_VIRTUAL_ASSETS
          ? [{ href: "/wallet", label: "Wallet", icon: getIcon("Wallet") }]
          : []),
        { href: "/savings", label: "Savings", icon: getIcon("Savings") },
        { href: "/credit", label: "Credit", icon: getIcon("Credit") },
        { href: "/credit/my-loans", label: "My Loans", icon: getIcon("MyLoans") },
        { href: "/credit/guarantees", label: "Guarantees", icon: getIcon("Guarantees") },
      ],
    },
  ];

  // Add OTC section if virtual assets are enabled
  if (FEATURE_VIRTUAL_ASSETS) {
    sections.push({
      title: "OTC",
      items: [
        { href: "/otc/buy", label: "Buy USDT", icon: getIcon("BuyUSDT") },
        { href: "/otc/sell", label: "Sell USDT", icon: getIcon("SellUSDT") },
        { href: "/otc/orders", label: "My Orders", icon: getIcon("MyOrders") },
      ],
    });

    sections.push({
      title: "Remittance",
      items: [
        { href: "/remit", label: "Send Money", icon: getIcon("SendMoney") },
        { href: "/remit/transfers", label: "My Transfers", icon: getIcon("Transfers") },
        { href: "/remit/recipients", label: "Saved Recipients", icon: getIcon("Recipients") },
      ],
    });
  }

  sections.push(
    {
      title: "Giving & Support",
      items: [
        { href: "/giving", label: "Give", icon: getIcon("Give") },
        { href: "/profile/giving", label: "Giving History", icon: getIcon("GivingHistory") },
      ],
    },
    {
      title: "Profile",
      items: [
        { href: "/profile/me", label: "My Profile", icon: getIcon("Profile") },
        { href: "/profile/settings", label: "Edit Profile", icon: getIcon("EditProfile") },
        { href: "/profile/security", label: "Security", icon: getIcon("Security") },
        { href: "/profile/privacy", label: "Privacy", icon: getIcon("Privacy") },
        { href: "/profile/orders", label: "My Orders", icon: getIcon("MyOrders2") },
        { href: "/profile/subscription", label: "Subscription", icon: getIcon("Subscription") },
        { href: "/profile/verification", label: "Verification", icon: getIcon("Verification") },
      ],
    }
  );

  return sections;
};

// Flat list for bottom mobile nav
const getMobileNavItems = (): NavItem[] => {
  const base: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: getIcon("Home") },
    { href: "/community/feed", label: "Feed", icon: getIcon("Feed") },
    { href: "/learning/courses", label: "Learn", icon: getIcon("Courses") },
    { href: "/events", label: "Events", icon: getIcon("Events") },
    { href: "/shop", label: "Shop", icon: getIcon("Shop") },
    { href: "/savings", label: "Savings", icon: getIcon("Savings") },
  ];

  if (FEATURE_VIRTUAL_ASSETS) {
    base.push({ href: "/wallet", label: "Wallet", icon: getIcon("Wallet") });
    base.push({ href: "/otc/buy", label: "OTC", icon: getIcon("OTC") });
    base.push({ href: "/remit", label: "Send", icon: getIcon("SendMoney") });
  }

  base.push({ href: "/profile/me", label: "Profile", icon: getIcon("Profile") });
  return base;
};

export function MemberLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

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
            <span className="text-lg">{getIcon("Logout")}</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-ink-100 sticky top-0 z-30">
          <div className="container-portal flex items-center justify-between h-14">
            <div className="md:hidden">
              <Link href="/dashboard">
                <Wordmark dark />
              </Link>
            </div>
            <div className="hidden md:block flex-1" />

            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <Link
                href="/cart"
                className="relative text-ink-400 hover:text-ink-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
                    {cartTotalItems}
                  </span>
                )}
              </Link>

              <Link
                href="/notifications"
                className="relative text-ink-400 hover:text-ink-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
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
                        {getIcon("Profile")} My Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("EditProfile")} Edit Profile
                      </Link>
                      <Link
                        href="/profile/security"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("Security")} Security
                      </Link>
                      <Link
                        href="/profile/privacy"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("Privacy")} Privacy
                      </Link>
                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("MyOrders2")} My Orders
                      </Link>
                      <Link
                        href="/profile/subscription"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("Subscription")} Subscription
                      </Link>
                      <Link
                        href="/profile/verification"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("Verification")} Verification
                      </Link>
                      <Link
                        href="/profile/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("GivingHistory")} Giving History
                      </Link>
                      <Link
                        href="/giving"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {getIcon("GiveNow")} Give Now
                      </Link>
                      <hr className="my-1 border-ink-100" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-clay-600 hover:bg-clay-50 transition-colors"
                      >
                        {getIcon("Logout")} Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container-portal flex-1 py-6">{children}</main>

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
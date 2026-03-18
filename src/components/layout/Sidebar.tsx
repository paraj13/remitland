// ============================================================
// Sidebar Component (Appendix 2 left navigation)
// Displays RemitLand brand + navigation menu + user profile.
// Responsive: collapses on mobile (handled by parent layout).
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Users,
  FileText,
  UserCog,
  Bell,
  Settings,
  MoreHorizontal,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Conversion", href: "/conversion", icon: <ArrowLeftRight size={18} /> },
  { label: "Wallet", href: "/wallet", icon: <Wallet size={18} /> },
  { label: "Beneficiaries", href: "/receivers", icon: <Users size={18} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={18} /> },
  { label: "Team", href: "/team", icon: <UserCog size={18} /> },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Notifications", href: "/notifications", icon: <Bell size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="sidebar-sticky flex flex-col w-64 bg-[var(--color-sidebar-bg)] border-r border-gray-100 px-4 py-6">
      {/* ---- Brand Logo ---- */}
      <div className="flex items-center gap-2 px-3 mb-10">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm italic">R</span>
        </div>
        <span className="text-black font-extrabold text-xl tracking-tight">
          RemitLand
        </span>
      </div>

      {/* ---- Primary Navigation ---- */}
      <nav className="flex-1 flex flex-col gap-1 mb-6" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <span className={clsx(isActive(item.href) ? "text-black" : "text-gray-400")}>
              {item.icon}
            </span>
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ---- Action Buttons ---- */}
      <div className="flex flex-col gap-3 mb-6 mt-auto">
        <button className="btn btn-primary w-full text-sm font-bold py-3.5 rounded-full shadow-sm">
          Add Money
        </button>
        <button className="btn btn-yellow w-full text-sm font-bold py-3.5 rounded-full shadow-sm">
          Send Money
        </button>
      </div>

      {/* ---- Secondary Navigation ---- */}
      <nav className="flex flex-col gap-1 mb-6" aria-label="Secondary navigation">
        {SECONDARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <div className="relative">
              <span className={clsx(isActive(item.href) ? "text-black" : "text-gray-400")}>
                {item.icon}
              </span>
              {item.label === "Notifications" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                  2
                </span>
              )}
            </div>
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>


      {/* ---- User Profile ---- */}
      <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold border border-gray-200">
            KN
          </div>
          <div>
            <p className="text-black text-sm font-bold leading-tight">
              Kasra Nourani
            </p>
            <p className="text-gray-400 text-[11px] leading-tight mt-0.5">
              kasra@email.com
            </p>
          </div>
        </div>
        <MoreHorizontal size={18} className="text-gray-300 cursor-pointer" />
      </div>
    </aside>
  );
}

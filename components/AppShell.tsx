"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ScanFace,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "./ToastContext";
import { ConfirmModal } from "./ConfirmModal";
import { ThemeToggle } from "./ThemeToggle";

interface AppShellProps {
  children: React.ReactNode;
  primaryAction?: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview & system metrics",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    description: "Manage enrolled personnel",
  },
  {
    label: "Attendance Logs",
    href: "/logs",
    icon: ClipboardList,
    description: "Biometric & RFID access history",
  },
];

export function AppShell({ children, primaryAction }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { success, error } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on login page, don't render app shell
  if (pathname === "/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        success("Logged out successfully");
        setIsLogoutModalOpen(false);
        router.push("/login");
        router.refresh();
      } else {
        error("Logout failed. Please try again.");
      }
    } catch {
      error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    ) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#06101e] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-200">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#092B5A] text-white border-b border-[#1733C0]/40 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-teal flex items-center justify-center text-white font-bold shadow-md shadow-brand-blue/30 shrink-0">
            <ScanFace className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-sm font-heading font-bold tracking-tight text-white leading-none truncate">
              Attendance Sys
            </h1>
            <span className="text-[10px] text-[#97C6E6] font-medium truncate block mt-0.5">
              By Project Group 8 (2025/2026 session)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#092B5A] text-white h-full p-6 flex flex-col justify-between border-r border-slate-800 shadow-2xl z-50 animate-slideInRight">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-teal flex items-center justify-center text-white font-bold shadow-md shadow-brand-blue/30">
                    <ScanFace className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-white text-lg leading-tight">
                      Attendance Sys
                    </h2>
                    <p className="text-xs text-[#97C6E6] font-medium">By Project Group 8 (2025/2026 session)</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between border-b border-white/10 my-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Theme</span>
                <ThemeToggle showLabel />
              </div>

              <nav className="mt-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/40 border border-white/25"
                          : "text-slate-200 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-[#97C6E6]" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Red Logout Button (Mobile) */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-950/50 border border-red-400/40 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Vertical Sidebar: Sleek Executive Deep Midnight Navy (#092B5A) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#092B5A] text-white border-r border-[#1733C0]/30 min-h-screen p-5 justify-between sticky top-0 h-screen overflow-y-auto shadow-2xl z-20">
        <div>
          {/* System Brand */}
          <div className="flex items-center justify-between px-1 py-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-teal flex items-center justify-center text-white font-bold shadow-lg shadow-brand-blue/30 border border-white/20">
                <ScanFace className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-white leading-tight">
                  Attendance Sys
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-[#97C6E6] font-semibold">
                    By Project Group 8 (2025/2026 session)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-2 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Navigation
            </span>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-blue to-[#1e40af] text-white shadow-md shadow-brand-blue/30 border border-white/20"
                      : "text-slate-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#97C6E6]" : "text-slate-300"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#97C6E6]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Red Logout Button */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 px-2 py-1 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#97C6E6] shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">
                Administrator
              </p>
              <p className="text-[10px] text-slate-300 truncate font-mono">
                admin@attendance
              </p>
            </div>
          </div>

          {/* Prominent Red Logout Button with tactile hover and confirmation popup */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-md shadow-red-950/40 hover:shadow-red-600/30 border border-red-400/40 transition-all active:scale-95"
            title="Log out of Attendance Sys"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header with high contrast styling & responsive mobile layout */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#0c1f3d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 transition-colors shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-heading font-extrabold text-[#092B5A] dark:text-white tracking-tight leading-tight truncate">
                {currentNav.label}
              </h1>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                {currentNav.description}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Only show desktop ThemeToggle here; mobile has it in top navbar */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              {primaryAction && <div className="w-full sm:w-auto">{primaryAction}</div>}
            </div>
          </div>
        </header>

        {/* Page Body with proper contrast and responsive spacing */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Red Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        title="Sign Out of Console?"
        message="Are you sure you want to end your current session? You will need to enter your admin credentials again to access the console."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
}


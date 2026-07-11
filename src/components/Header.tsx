"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Camera, Home, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/knowledge", label: "知识库", icon: BookOpen },
  { href: "/identify", label: "识图鉴别", icon: Camera },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-walnut-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-walnut-700 text-lg text-white">
            核
          </span>
          <span className="font-serif text-lg font-semibold text-walnut-900">
            文玩核桃知识库
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-walnut-100 text-walnut-800"
                    : "text-walnut-600 hover:bg-walnut-50 hover:text-walnut-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-walnut-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-walnut-100 bg-white px-4 py-3 md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${
                  active
                    ? "bg-walnut-100 text-walnut-800"
                    : "text-walnut-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

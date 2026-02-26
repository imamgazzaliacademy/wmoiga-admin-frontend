"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Megaphone,
  CalendarDays,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Admission", icon: FileText, href: "/admission" },
  { name: "Important Dates", icon: CalendarDays, href: "/important-dates" },
  { name: "Announcement", icon: Megaphone, href: "/announcement" },
  { name: "Students", icon: Users, href: "/students", badge: "Soon" },
  { name: "Alumni", icon: GraduationCap, href: "/alumni", badge: "Soon" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-16 h-[90vh] lg:static inset-y-0 left-0 z-40 w-72 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform duration-300 ease-in-out
          lg:pt-6 lg:pl-6 lg:pb-6
        `}
      >
        <div className="h-full bg-white lg:rounded-2xl  lg:border border-border flex flex-col p-4 shadow-2xl lg:shadow-xl">
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-gray-500 hover:bg-secondary hover:text-primary"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-primary"
                    }
                  />
                  <span className="font-medium">{item.name}</span>

                  {item.badge && (
                    <span
                      className={`ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded
                        ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

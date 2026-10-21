"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Megaphone,
  CalendarDays,
  Award,
  BookOpen,
  LogOut,
  User,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Admission", icon: FileText, href: "/admission" },
  { name: "Important Dates", icon: CalendarDays, href: "/important-dates" },
  { name: "Announcement", icon: Megaphone, href: "/announcement" },
  { name: "Students", icon: Users, href: "/students" },
  { name: "Subjects", icon: BookOpen, href: "/subjects" },
  { name: "Examinations", icon: Award, href: "/examinations" },
  { name: "Alumni", icon: GraduationCap, href: "/alumni", badge: "Soon" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/login");
  };

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
          fixed top-16 bottom-0 lg:static inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform duration-300 ease-in-out
          lg:pt-6 lg:pl-6 lg:pb-6
        `}
      >
        <div className="h-full bg-white lg:rounded-2xl lg:border border-border flex flex-col p-4 shadow-2xl lg:shadow-xl overflow-hidden">
          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-sm
                    ${isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-gray-600 hover:bg-secondary hover:text-primary"
                    }
                  `}
                >
                  <Icon
                    size={18}
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

          {/* Mobile Profile & Logout */}
          <div className="lg:hidden pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-gray-700">
                <User size={16} />
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-gray-900 leading-tight">Admin User</p>
                <p className="text-[10px] text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

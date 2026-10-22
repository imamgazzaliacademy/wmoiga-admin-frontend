"use client";

import { useState, useEffect } from "react";
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
  School,
  ChevronDown,
} from "lucide-react";

interface SubMenuItem {
  name: string;
  icon: any;
  href: string;
  badge?: string;
}

interface MenuItem {
  name: string;
  icon: any;
  href?: string;
  badge?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Admission", icon: FileText, href: "/admission" },
  { name: "Important Dates", icon: CalendarDays, href: "/important-dates" },
  { name: "Announcement", icon: Megaphone, href: "/announcement" },
  { name: "Students", icon: Users, href: "/students" },
  {
    name: "Academics",
    icon: School,
    children: [
      { name: "Subjects", icon: BookOpen, href: "/subjects" },
      { name: "Examinations", icon: Award, href: "/examinations" },
    ],
  },
  { name: "Alumni", icon: GraduationCap, href: "/alumni", badge: "Soon" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Track expanded state for menu groups with submenus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const isAcademicsActive =
      pathname.startsWith("/subjects") || pathname.startsWith("/examinations");
    return { Academics: isAcademicsActive };
  });

  // Ensure Academics opens automatically when navigating to one of its subpages
  useEffect(() => {
    if (pathname.startsWith("/subjects") || pathname.startsWith("/examinations")) {
      setOpenMenus((prev) => ({ ...prev, Academics: true }));
    }
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

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
              const Icon = item.icon;

              // Check if item has children (submenu)
              if (item.children && item.children.length > 0) {
                const isChildActive = item.children.some((child) =>
                  pathname.startsWith(child.href)
                );
                const isExpanded = !!openMenus[item.name];

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.name)}
                      aria-expanded={isExpanded}
                      className={`
                        w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-sm
                        ${
                          isChildActive && !isExpanded
                            ? "bg-primary/10 text-primary font-semibold"
                            : isChildActive
                            ? "text-primary font-semibold hover:bg-secondary"
                            : "text-gray-600 hover:bg-secondary hover:text-primary font-medium"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={
                            isChildActive
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-primary"
                          }
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded
                            ? "rotate-180 text-primary"
                            : "text-gray-400 group-hover:text-primary"
                        }`}
                      />
                    </button>

                    {/* Submenu items */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded
                          ? "max-h-48 opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="pl-3.5 ml-4 border-l-2 border-gray-100 space-y-1 py-1">
                        {item.children.map((child) => {
                          const isSubActive = pathname.startsWith(child.href);
                          const SubIcon = child.icon;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={`
                                relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group text-sm
                                ${
                                  isSubActive
                                    ? "bg-primary text-white shadow-md shadow-primary/25 font-semibold"
                                    : "text-gray-600 hover:bg-secondary hover:text-primary font-medium"
                                }
                              `}
                            >
                              <SubIcon
                                size={16}
                                className={
                                  isSubActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-primary"
                                }
                              />
                              <span>{child.name}</span>

                              {child.badge && (
                                <span
                                  className={`ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded
                                    ${
                                      isSubActive
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-500"
                                    }
                                  `}
                                >
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard menu item
              const isActive = item.href ? pathname.startsWith(item.href) : false;

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  onClick={onClose}
                  className={`
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-sm
                    ${
                      isActive
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
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }
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


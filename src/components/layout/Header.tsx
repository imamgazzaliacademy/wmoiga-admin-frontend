"use client";

import { Bell, User, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";

import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  isOpen: boolean
}

export default function Header({ onMenuClick, isOpen }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 bg-white border-b border-border flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="font-bold text-base sm:text-xl text-[#b38e44]">
          <img src="/fullLogo.png" alt="WMO IGA" className="w-36 sm:w-44 object-contain" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - Visible only on small screens */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-primary hover:bg-secondary transition-all duration-200 rounded-md"
        >
          {isOpen ? <IoClose size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop User Profile - Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {user?.name || "Admin"}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isSuperAdmin
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </span>
                <span className="text-xs text-gray-400">@{user?.username || "admin"}</span>
              </div>
            </div>
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <button onClick={handleLogout} className="p-2 flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors relative" title="Logout">
            <LogOut size={20} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

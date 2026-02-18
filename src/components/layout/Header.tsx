"use client";

import { Bell, User, Menu } from "lucide-react";
import Link from "next/link";
import { IoClose } from "react-icons/io5";

interface HeaderProps {
  onMenuClick: () => void;
  isOpen:boolean
}

export default function Header({ onMenuClick,isOpen }: HeaderProps) {
  return (
    <header className="h-16 px-6 sticky top-0 z-50 lg:px-8 bg-white border-b border-border flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg sm:text-xl text-[#b38e44]">
          <img src="/fullLogo.png" alt="" className="w-50 " />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - Visible only on small screens */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-primary hover:bg-secondary transition-all duration-200 rounded-md"
        >
          {isOpen ? <IoClose size={24} />:<Menu size={24} />}
        </button>

        {/* Desktop User Profile - Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-primary transition-colors relative">
            <Bell size={20} />
          </button>

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                Admin User
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center border border-gray-200 text-gray-600">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

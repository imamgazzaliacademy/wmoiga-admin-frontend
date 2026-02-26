"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen relative bg-cover bg-center  flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(13, 59, 46, 0.1), rgba(13, 59, 46, 0.7)), url('/masjid.JPG')`,
      }}
    >
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-10 border border-gray-100">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Admin Portal</h1>
        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
          Welcome to the central management dashboard for <span className="text-gray-800">WMO Imam Gazzali Academy</span>. Secure access is required to proceed.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 px-4 rounded-xl hover:bg-primary-hover transition-all focus:ring-4 focus:ring-primary/20 font-bold shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Proceed to Login
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <p className="mt-8 text-sm font-medium text-gray-400">© {new Date().getFullYear()} WMO Imam Gazzali Academy</p>
      <p className="mt-8 text-[10px] absolute bottom-10 text-center font-medium text-gray-400">Design and Developed by <br /> Ashique Ghazali</p>
    </div>
  );
}

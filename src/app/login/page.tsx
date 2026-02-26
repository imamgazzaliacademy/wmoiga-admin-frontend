"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (localStorage.getItem("adminToken")) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/atc/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log("the response iss==",data);
            

            if (data.success && data.token) {
                // Store the JWT token
                localStorage.setItem('adminToken', data.token);
                // Redirect to dashboard
                router.push("/dashboard");
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center  p-4"
            style={{
                backgroundImage: `linear-gradient(rgba(13, 59, 46, 0.1), rgba(13, 59, 46, 0.7)), url('/masjid.JPG')`,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden "
            >
                <div className="bg-primary p-8 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <span className="text-3xl font-bold text-white">I</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                    <p className="text-white/80 mt-2">Sign in to manage IgaOnline</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

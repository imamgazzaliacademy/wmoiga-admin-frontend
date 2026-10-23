"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminUser, hasPermission as checkPermission, isSuperAdmin as checkIsSuperAdmin } from "@/utils/permissions";

interface AuthContextType {
    user: AdminUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    hasPermission: (permissionKey: string) => boolean;
    login: (token: string, user: AdminUser) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const verifySession = useCallback(async (authToken: string) => {
        try {
            const res = await fetch("/api/verify_token", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
                setUser(null);
                setToken(null);
                sessionStorage.setItem(
                    "session_expired_msg",
                    "Your session has expired. Please log in again."
                );
                router.replace("/login");
            } else if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem("adminUser", JSON.stringify(data.user));
                }
            }
        } catch (error) {
            console.error("Auth verification failed:", error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const storedToken = localStorage.getItem("adminToken");
        const storedUser = localStorage.getItem("adminUser");

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    // ignore parse error
                }
            }
            verifySession(storedToken);
        } else {
            setLoading(false);
        }
    }, [verifySession]);

    const login = (newToken: string, newUser: AdminUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("adminToken", newToken);
        localStorage.setItem("adminUser", JSON.stringify(newUser));
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    const refreshUser = async () => {
        const currentToken = token || localStorage.getItem("adminToken");
        if (currentToken) {
            await verifySession(currentToken);
        }
    };

    const hasPermission = useCallback(
        (permissionKey: string): boolean => {
            return checkPermission(user, permissionKey);
        },
        [user]
    );

    const isSuperAdminValue = checkIsSuperAdmin(user);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token && !!user,
                isSuperAdmin: isSuperAdminValue,
                hasPermission,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

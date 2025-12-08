"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Check authentication on route change
    if (!loading) {
      checkRouteAccess();
    }
  }, [pathname, loading]);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser) {
        const userObj = JSON.parse(storedUser);

        // jika token ada, tambahkan ke user
        if (storedToken) {
          userObj.token = storedToken;
        }

        setUser(userObj);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkRouteAccess = () => {
    // Routes yang boleh diakses tanpa login
    const publicRoutes = ["/landing-page", "/login", "/register"];

    if (loading) return;

    // Jika user belum login dan mencoba akses protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login");
      return;
    }

    // Jika user sudah login tapi mencoba akses login/register
    if (user && (pathname === "/login" || pathname === "/register")) {
      redirectBasedOnRole();
      return;
    }

    // Check role-based access
    if (user && !checkRoleAccess(pathname, user.role)) {
      // Redirect ke dashboard sesuai role
      redirectBasedOnRole();
    }
  };

  const checkRoleAccess = (path, userRole) => {
    // Superadmin bisa akses semua routes
    if (userRole === "superadmin") return true;

    // Admin tidak bisa akses superadmin routes
    if (userRole === "admin" && path.startsWith("/superadmin")) {
      return false;
    }

    // User biasa hanya bisa akses /dashboard
    if (userRole === "user" && !path.startsWith("/dashboard")) {
      return false;
    }

    return true;
  };

  const redirectBasedOnRole = () => {
    if (!user) return;

    if (user.role === "superadmin") {
      router.push("/superadmin/dashboard");
    } else if (user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const login = (userData) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token); // Pastikan token disimpan
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // TAMBAHKAN INI
    sessionStorage.removeItem("loginSuccessShown");
    router.push("/login");
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

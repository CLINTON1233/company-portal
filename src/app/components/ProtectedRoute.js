"use client";

import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthProvider akan handle redirect
  }

  // Check role-based access
  if (requiredRole) {
    const hasAccess = checkRoleAccess(user.role, requiredRole, pathname);
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return children;
}

function checkRoleAccess(userRole, requiredRole, pathname) {
  // Superadmin bisa akses semua
  if (userRole === 'superadmin') return true;

  // Admin tidak bisa akses superadmin routes
  if (userRole === 'admin' && pathname.startsWith('/superadmin')) {
    return false;
  }

  // User biasa hanya bisa akses dashboard biasa
  if (userRole === 'user' && !pathname.startsWith('/dashboard')) {
    return false;
  }

  return userRole === requiredRole;
}
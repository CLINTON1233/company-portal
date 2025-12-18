"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { User, AlertTriangle, X, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function ProfilePage() {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setFormData(user);
    } else {
      window.location.href = "/login";
    }
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8FD9FB] mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogout = () => {
    logout();
  };

  const handleSave = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_BY_ID(userData.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.status === "success") {
        setUserData(result.user);
        setFormData(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        setEditMode(false);

        Swal.fire({
          title: "Berhasil",
          text: "Data profile berhasil diperbarui!",
          icon: "success",
          confirmButtonColor: "#1e40af",
          background: "#1a1a1a",
          color: "#fff",
        });
      } else {
        Swal.fire({
          title: "Gagal",
          text: result.message || "Gagal menyimpan data",
          icon: "error",
          confirmButtonColor: "#1e40af",
          background: "#1a1a1a",
          color: "#fff",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat menyimpan data!",
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div
        className={`relative min-h-screen flex flex-col ${poppins.className}`}
      >
        {/* Background Sama dengan Dashboard */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/company.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/30 to-black/20" />
        </div>

        {/* HEADER */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-white/30 text-white">
          {/* Logo */}
          {/* <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold italic tracking-tight text-white">
              Company Portal
            </span>
          </Link> */}
  <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={100}
              height={40}
              className="object-contain w-28 sm:w-32"
            />
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className="hover:text-gray-200 transition text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/applications"
              className="hover:text-gray-200 transition text-white"
            >
              Applications
            </Link>
       
            <Link
              href="/admin/profile"
              className="hover:text-gray-200 transition text-white"
            >
              Profile
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="hover:text-gray-200 transition text-white"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/20 rounded transition"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/20 md:hidden z-50">
              <div className="flex flex-col p-4 space-y-3">
                <Link
                  href="/admin/dashboard"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/applications"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications
                </Link>
             
      
                <Link
                  href="/admin/profile"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="text-white hover:text-red-300 transition py-2 font-medium text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Icon People di atas Hero Section */}
        <div className="flex flex-col items-center mt-8 mb-4">
          <div className="bg-[#8FD9FB] p-6 rounded-full mb-4 shadow-lg">
            <User size={70} className="text-white" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center px-4 sm:px-6 mb-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-3xl font-bold leading-tight text-white mb-2">
              <span className="text-white">Profile</span>{" "}
              <span className="text-[#8FD9FB]">Admin</span>
            </h1>
            <p className="text-base text-white/80">
              Manage your account information and preferences
            </p>
          </div>
        </section>

        {/* Profile Form - Warna Putih */}
        <div className="max-w-2xl w-full mx-auto px-4 pb-12">
          <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
            {/* Nama */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                readOnly={!editMode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg text-sm text-gray-900 transition-all duration-300 ${
                  editMode
                    ? "border-[#8FD9FB] bg-white focus:ring-2 focus:ring-[#8FD9FB] focus:border-transparent"
                    : "border-gray-300 bg-gray-50"
                }`}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                placeholder="Email address"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                No. Badge
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge || ""}
                readOnly={!editMode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-300 ${
                  editMode
                    ? "border-[#8FD9FB] bg-white text-gray-900 focus:ring-2 focus:ring-[#8FD9FB] focus:border-transparent"
                    : "border-gray-300 bg-gray-50 text-gray-700"
                }`}
                placeholder="Masukkan nomor badge"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                No. Telepon
              </label>
              <input
                type="text"
                name="telp"
                value={formData.telp || ""}
                readOnly={!editMode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-300 ${
                  editMode
                    ? "border-[#8FD9FB] bg-white text-gray-900 focus:ring-2 focus:ring-[#8FD9FB] focus:border-transparent"
                    : "border-gray-300 bg-gray-50 text-gray-700"
                }`}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            {/* Departemen */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                Departemen
              </label>
              <input
                type="text"
                name="departemen"
                value={formData.departemen || ""}
                readOnly={!editMode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-300 ${
                  editMode
                    ? "border-[#8FD9FB] bg-white text-gray-900 focus:ring-2 focus:ring-[#8FD9FB] focus:border-transparent"
                    : "border-gray-300 bg-gray-50 text-gray-700"
                }`}
                placeholder="Masukkan departemen"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-semibold">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
                placeholder="User role"
              />
            </div>

            {/* Tombol Edit / Simpan */}
            <div className="flex justify-end gap-4 pt-8 mt-6 border-t border-gray-200">
              {editMode ? (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData(userData);
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-[#8FD9FB] text-gray-900 rounded-lg hover:bg-[#7BC9EB] transition font-medium shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-[#8FD9FB] text-gray-900 rounded-lg hover:bg-[#7BC9EB] transition font-medium shadow-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-8 sm:p-10 w-full sm:max-w-md shadow-2xl animate-fade-in relative text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
              </div>

              <h2 className="text-2xl font-medium mb-2 text-gray-800">
                Logout Confirmation
              </h2>

              <p className="text-gray-700 mb-6 text-base">
                Are you sure you want to logout from your account?
              </p>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition text-base font-medium"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-full hover:from-red-700 hover:to-rose-700 transition text-base font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto py-4 text-center text-white text-xs sm:text-sm space-y-1 border-t border-white/30 bg-black/20 px-4 sm:px-6">
          <p className="font-medium">IT Company Monitoring Portal</p>
          <p className="text-white/80">seatrium.com</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

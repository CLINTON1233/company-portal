"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      // if (data.status === "success") {
      //   localStorage.setItem("token", data.token);
      //   const user = data.user;

      //   login({
      //     id: user.id,
      //     nama: user.nama,
      //     email: user.email,
      //     badge: user.badge || "",
      //     telp: user.telp || "",
      //     departemen: user.departemen || "",
      //     role: user.role,
      //     token: data.token,
      //   });

      //   await Swal.fire({
      //     title: "Login Berhasil",
      //     text: `Selamat datang ${user.nama}!`,
      //     icon: "success",
      //     confirmButtonColor: "#1e40af",
      //   });

      //   if (user.role === "superadmin") {
      //     router.push("/superadmin/dashboard");
      //   } else if (user.role === "admin") {
      //     router.push("/admin/dashboard");
      //   } else {
      //     router.push("/dashboard");
      //   }
      // } else {
      //   Swal.fire({
      //     title: "Login Gagal",
      //     text: data.message || "Email atau password salah.",
      //     icon: "error",
      //     confirmButtonText: "Coba Lagi",
      //   });
      // }

      if (data.status === "success") {
  const user = data.user;

  login({
    id: user.id,
    nama: user.nama,
    email: user.email,
    badge: user.badge || "",
    telp: user.telp || "",
    departemen: user.departemen || "",
    role: user.role,
  });

  await Swal.fire({
    title: "Login Berhasil",
    text: `Selamat datang ${user.nama}!`,
    icon: "success",
    confirmButtonColor: "#1e40af",
  });

  if (user.role === "superadmin") {
    router.push("/superadmin/dashboard");
  } else if (user.role === "admin") {
    router.push("/admin/dashboard");
  } else {
    router.push("/dashboard");
  }
} else {
  Swal.fire({
    title: "Login Gagal",
    text: data.message || "Email atau password salah.",
    icon: "error",
    confirmButtonText: "Coba Lagi",
  });
}

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Gagal terhubung ke server.",
        icon: "error",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={`relative min-h-screen flex flex-col ${poppins.className}`}>
      {/* Background dengan efek gradient */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/company.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/40 to-gray-900/30" /> */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/30 to-black/20" />
      </div>

      {/* Header - Gaya Landing Page */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-10 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold italic tracking-tight text-white">
            Company Portal
          </span>
        </Link>

        {/* Back to Home Button - Hanya di desktop */}
        <div className="hidden md:flex items-center space-x-5">
          <Link
            href="/"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content - Dikurangi margin atas */}
      <div className="flex flex-1 items-center justify-center px-4 pt-16 pb-10">
        {" "}
        {/* Ubah pt-16 */}
        <div className="w-full max-w-md">
          {/* Welcome Text - Dikurangi margin bawah */}
          <div className="text-center mb-6 text-white">
            {" "}
            {/* Ubah dari mb-10 ke mb-6 */}
            <p className="text-sm tracking-[0.25em] uppercase mb-1 text-white/90">
              {" "}
              {/* Ubah mb-0 ke mb-1 */}
              Welcome to IT Portal
            </p>
            <h1 className="text-2xl md:text-2xl font-bold leading-tight mb-2">
              {" "}
              {/* Ubah text-3xl ke text-2xl, mb-4 ke mb-2 */}
              Sign In to Your Account
            </h1>
            <p className="text-sm max-w-md mx-auto text-white/90">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Login Form - PUTIH BERSIH */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-white p-7 rounded-2xl shadow-2xl" /* Kurangi p-8 ke p-7 */
          >
            {/* Form Header */}
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {" "}
                {/* Kurangi text-2xl ke text-xl */}
                Welcome Back
              </h3>
              <p className="text-sm text-gray-600">
                {" "}
                {/* Kurangi ukuran teks */}
                Please enter your details
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white font-semibold py-3.5 rounded-lg hover:from-blue-800 hover:to-blue-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-1">
              {" "}
              {/* Kurangi pt-2 ke pt-1 */}
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          {/* Additional Info - Dikurangi margin atas */}
          <div className="mt-6 text-center">
            {" "}
            {/* Ubah mt-8 ke mt-6 */}
            <p className="text-white/90 text-sm">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-300 hover:text-blue-200 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>

          {/* Mobile Back Button - Dikurangi margin atas */}
          <div className="mt-6 md:hidden text-center">
            {" "}
            {/* Ubah mt-8 ke mt-6 */}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white text-sm opacity-90">
        IT Company Portal • Secure Access
      </footer>
    </div>
  );
}

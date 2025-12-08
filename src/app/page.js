"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import "./globals.css";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen flex flex-col font-poppins">
      {/* NAVBAR - TIDAK BERUBAH */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-10 py-5">
        {/* Logo */}
        {/* <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/seatrium.png"
            alt="Seatrium Logo"
            width={150}
            height={150}
            className="object-contain cursor-pointer"
            priority
          />
        </Link> */}
<Link href="/" className="flex items-center space-x-2">
  <span className="text-xl font-semibold italic tracking-tight text-white">
    Company Portal
  </span>
</Link>


        {/* Right Menu */}
        <div className="hidden md:flex items-center space-x-5">
<Link
  href="/login"
  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white 
             rounded-full shadow-lg hover:shadow-xl hover:scale-105 
             transition-all font-semibold tracking-wide"
>
  Sign in
</Link>


        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY - TIDAK BERUBAH */}
      {menuOpen && (
        <div className="fixed inset-0 bg-blue-800/95 text-white flex flex-col items-center justify-center space-y-6 z-30 md:hidden">
          <div className="flex flex-col space-y-3 w-3/4 pt-6">
            <Link
              href="/login"
              className="text-center bg-white text-blue-700 rounded-lg py-2 hover:bg-gray-100 font-medium transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION - MODIFIKASI UNTUK POSISI TENGAH */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Background - TIDAK BERUBAH */}
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

        {/* Content - MODIFIKASI UNTUK POSISI TENGAH */}
       {/* HERO TEXT – gaya PERSIS seperti kode pertama */}
<div className="relative w-full max-w-4xl px-6 md:px-16 pt-32 pb-40 text-white text-left">

  <p className="text-sm md:text-base tracking-[0.25em] uppercase mb-4 text-white/80">
    IT Portal
  </p>

  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight max-w-xl mb-4">
   Empower your IT operations with a smarter, unified platform.
  </h1>

  <p className="text-sm sm:text-base md:text-lg max-w-lg text-white/80 mb-6">
  Monitor systems, track performance, and streamline operations through an intuitive, fast, and integrated IT management portal.
  </p>

  <Link
    href="/login"
    className="inline-block bg-blue-800 hover:bg-blue-700 text-white font-semibold px-10 py-3 rounded-full text-base sm:text-lg transition transform hover:scale-105 shadow-lg"
  >
    Get Started
  </Link>

</div>


        {/* FOOTER - TIDAK BERUBAH */}
        <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white text-sm opacity-80">
          IT Portal Infrastructure{" "}
          {/* <Link
            href="https://seatrium.com"
            target="_blank"
            className="underline hover:opacity-100"
          >
            seatrium.com
          </Link> */}
        </footer>
      </div>
    </div>
  );
}
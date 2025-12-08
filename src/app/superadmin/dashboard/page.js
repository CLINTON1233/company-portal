"use client";

import {
  Globe,
  Monitor,
  Wifi,
  CheckCircle,
  AlertTriangle,
  X,
  Server,
  Users,
  Activity,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import * as LucideIcons from "lucide-react";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SuperAdminDashboardPage() {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [appsList, setAppsList] = useState([]);
  const [groupedApps, setGroupedApps] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalApps: 0,
    activeApps: 0,
    categories: 0,
    activeCategories: 0,
    issues: 3,
    servers: 12,
    users: 45,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));

      const hasShown = sessionStorage.getItem("loginSuccessShown");
      if (!hasShown) {
        setShowLoginSuccess(true);
        sessionStorage.setItem("loginSuccessShown", "true");

        setTimeout(() => {
          setShowLoginSuccess(false);
        }, 3000);
      }
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    fetch(API_ENDPOINTS.APPLICATIONS)
      .then((res) => res.json())
      .then((data) => {
        setAppsList(data);
        const grouped = groupAppsByCategory(data);
        setGroupedApps(grouped);
        updateDashboardStats(data, grouped);
      })
      .catch(console.error);
  };

  //Modal Total Apps
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [activeApps, setActiveApps] = useState([]);
  // Modal Category Apps
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryApps, setCategoryApps] = useState([]);

  const updateDashboardStats = (apps, grouped) => {
    const activeApps = apps.filter(
      (app) => app.status === "active" || !app.status
    ).length;

    const activeCategoriesCount = Object.keys(grouped).filter((category) => {
      const categoryApps = grouped[category];
      return categoryApps.some((app) => app.status === "active" || !app.status);
    }).length;

    setDashboardStats({
      totalApps: apps.length,
      activeApps: activeApps,
      categories: Object.keys(grouped).length,
      activeCategories: activeCategoriesCount,
      issues: Math.floor(Math.random() * 10) + 1,
      servers: 12,
      users: 45,
    });
  };

  const groupAppsByCategory = (apps) => {
    const grouped = {};
    apps.forEach((app) => {
      const categoryName = app.category?.name || "Uncategorized";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(app);
    });
    return grouped;
  };

  const AppIcon = ({
    iconName,
    className = "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-colors duration-300",
  }) => {
    if (!iconName) {
      const GlobeIcon = LucideIcons.Globe;
      return <GlobeIcon className={className} />;
    }

    if (
      iconName.startsWith("icon-") &&
      /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(iconName)
    ) {
      return (
        <img
          src={getUploadUrl(iconName)}
          alt="Application Icon"
          className={className}
          onError={(e) => {
            console.log("Failed to load icon image, using fallback");
          }}
        />
      );
    }

    const formattedName = iconName
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\./g, "");
    const IconComponent = LucideIcons[formattedName] || LucideIcons.Globe;

    return <IconComponent className={className} />;
  };

  // Filter applications based on search query
  const filteredGroupedApps = Object.keys(groupedApps).reduce(
    (acc, category) => {
      const filteredApps = groupedApps[category].filter(
        (app) =>
          app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.category?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );

      if (filteredApps.length > 0) {
        acc[category] = filteredApps;
      }

      return acc;
    },
    {}
  );

  const handleLogout = () => {
    logout();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5" />;
      case "down":
        return <X className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <ProtectedRoute requiredRole="superadmin">
      <div
        className={`relative min-h-screen flex flex-col ${poppins.className}`}
      >
        {/* Background Sama dengan Login */}
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

        {/* Alert Login Sukses */}
        {showLoginSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in z-50">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Login successfully!</span>
          </div>
        )}

        {/* HEADER */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-white/30 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold italic tracking-tight text-white">
              Company Portal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            <Link
              href="/superadmin/dashboard"
              className="hover:text-gray-200 transition text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/superadmin/applications"
              className="hover:text-gray-200 transition text-white"
            >
              Applications
            </Link>
            <Link
              href="/superadmin/management_categories"
              className="hover:text-gray-200 transition text-white"
            >
              Categories
            </Link>
            <Link
              href="/superadmin/management_users"
              className="hover:text-gray-200 transition text-white"
            >
              Users
            </Link>
            <Link
              href="/superadmin/profile"
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
                  href="/superadmin/dashboard"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/superadmin/applications"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications
                </Link>
                <Link
                  href="/superadmin/management_categories"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/superadmin/management_users"
                  className="text-white hover:text-blue-300 transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/profile"
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

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center py-6 px-4 sm:py-10 sm:px-6">
          <div className="text-center mt-0">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl sm:text-3xl md:text-4xl font-semibold leading-tight text-white">
                <span className="text-white">IT Company</span>{" "}
                <span className="text-[#8FD9FB]">Portal</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8 px-4 sm:px-6 w-full flex flex-col sm:flex-row items-center gap-4 justify-between">
          <input
            type="text"
            placeholder="Search applications or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 w-full px-4 sm:px-6 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8FD9FB] bg-white/90 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
          />
        </div>

        {/* DASHBOARD CARDS SECTION */}
        <section className="max-w-6xl mx-auto px-6 sm:px-6 mb-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {/* Total Applications Card - Warna Abu-abu */}
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-2xl p-10 shadow-lg transform transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-36 border border-gray-500/30">
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-gray-200 text-sm font-medium">
                    Total Apps
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {dashboardStats.totalApps}
                  </h3>
                  <p className="text-gray-300 text-xs mt-2">
                    Across all categories
                  </p>
                </div>
              </div>
            </div>

            {/* Active Categories Cards - Semua Biru Muda #8FD9FB */}
            {Object.keys(groupedApps).map((category) => {
              const categoryApps = groupedApps[category];

              return (
                <div
                  key={category}
                  className="bg-[#8FD9FB] text-gray-800 rounded-2xl p-7 shadow-lg transform transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-36 border border-[#8FD9FB]/50 hover:bg-[#7BC9EB]"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCategoryApps(categoryApps);
                    setShowCategoryModal(true);
                  }}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <p className="text-gray-800/90 text-sm font-medium truncate">
                        {category}
                      </p>
                      <h3 className="text-2xl font-bold mt-2 text-gray-900">
                        {categoryApps.length}
                      </h3>
                      <p className="text-gray-800/80 text-xs mt-2">
                        applications
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Applications Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-2">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="w-16 sm:w-32 md:w-40 lg:w-48 h-[2px] bg-gradient-to-r from-transparent to-[#8FD9FB]"></div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-wider whitespace-nowrap px-2">
              APPLICATIONS
            </h3>
            <div className="w-16 sm:w-32 md:w-40 lg:w-48 h-[2px] bg-gradient-to-l from-transparent to-[#8FD9FB]"></div>
          </div>
        </section>

        {/* Categories and Applications Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-6">
          {Object.keys(filteredGroupedApps).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/80 text-lg">No applications found</p>
            </div>
          ) : (
            Object.keys(filteredGroupedApps).map((category) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="text-center">
                  <h3 className="text-1xl font-semibold text-white py-3 px-6 inline-block uppercase bg-white/10 rounded-full">
                    {category}
                    <span className="ml-2 font-semibold text-white/80">
                      ({filteredGroupedApps[category].length} Applications)
                    </span>
                  </h3>
                </div>

                {/* Applications Grid - Semua Warna Biru Muda #8FD9FB */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-4">
                  {filteredGroupedApps[category].map((app, index) => (
                    <div
                      key={index}
                      className="relative cursor-pointer bg-[#8FD9FB] text-gray-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg
                        transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:bg-[#7BC9EB]
                        h-[140px] sm:h-[160px] flex flex-col justify-center items-center text-center group border border-[#8FD9FB]/50"
                    >
                      <div className="flex justify-center mb-2 sm:mb-3">
                        <AppIcon
                          iconName={app.icon}
                          className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-colors duration-300 text-gray-800"
                        />
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-1 truncate max-w-[100px] sm:max-w-[120px] md:max-w-[140px] text-gray-900">
                        {app.title}
                      </h3>
                      <div className="text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[120px] md:max-w-[140px] text-gray-700">
                        {app.fullName}
                      </div>

                      {/* Click Handler */}
                      <div
                        className="absolute inset-0 z-0 cursor-pointer"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          const user = localStorage.getItem("user");

                          const isAppsSMOE =
                            app.title.toLowerCase().includes("appssmoe") ||
                            app.fullName.toLowerCase().includes("appssmoe") ||
                            app.url.includes("localhost:3002");

                          if (isAppsSMOE) {
                            const appsMoeUrl = `http://localhost:3002/?token=${encodeURIComponent(
                              token
                            )}&user=${encodeURIComponent(user)}`;
                            window.open(appsMoeUrl, "_blank");
                          } else {
                            if (
                              app.url.includes("localhost:3001") ||
                              app.url.includes("webssh")
                            ) {
                              const urlWithToken = `${app.url}${
                                app.url.includes("?") ? "&" : "?"
                              }token=${encodeURIComponent(
                                token || ""
                              )}&user=${encodeURIComponent(user || "")}`;
                              window.open(urlWithToken, "_blank");
                            } else {
                              window.open(app.url, "_blank");
                            }
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Active Applications Modal */}
        {showAppsModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8FD9FB] p-2 rounded-lg">
                    <Globe className="w-6 h-6 text-gray-800" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Active Applications
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Total {activeApps.length} active applications in this
                      Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAppsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {activeApps.length === 0 ? (
                  <div className="text-center py-10">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No active applications found
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeApps.map((app, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300 hover:border-[#8FD9FB]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <AppIcon
                              iconName={app.icon}
                              className="w-10 h-10 text-[#8FD9FB]"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {app.title}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {app.fullName}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">
                                Active
                              </span>
                            </div>
                            {app.category && (
                              <div className="mt-2">
                                <span className="inline-block bg-[#8FD9FB]/20 text-gray-800 text-xs px-2 py-1 rounded border border-[#8FD9FB]/30">
                                  {app.category.name}
                                </span>
                              </div>
                            )}
                            {app.url && (
                              <button
                                onClick={() => window.open(app.url, "_blank")}
                                className="mt-3 text-xs bg-[#8FD9FB] text-gray-800 px-3 py-1 rounded-lg hover:bg-[#7BC9EB] transition"
                              >
                                Open App
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {activeApps.length} of {dashboardStats.totalApps}{" "}
                  applications
                </div>
                <button
                  onClick={() => setShowAppsModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Applications Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-fade-in shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#8FD9FB] p-2 rounded-lg">
                    <Server className="w-6 h-6 text-gray-800" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {selectedCategory}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {categoryApps.length} applications in this category
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {categoryApps.length === 0 ? (
                  <div className="text-center py-10">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                      No applications found in this category
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryApps.map((app, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300 hover:border-[#8FD9FB]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <AppIcon
                              iconName={app.icon}
                              className="w-10 h-10 text-[#8FD9FB]"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {app.title}
                            </h3>
                            <p className="text-gray-600 text-sm truncate">
                              {app.fullName}
                            </p>
                            {app.description && (
                              <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                                {app.description}
                              </p>
                            )}
                            {app.url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(app.url, "_blank");
                                }}
                                className="mt-3 text-xs bg-[#8FD9FB] text-gray-800 px-3 py-1 rounded-lg hover:bg-[#7BC9EB] transition"
                              >
                                Open App
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {categoryApps.length} applications in{" "}
                  {selectedCategory}
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2 bg-[#8FD9FB] text-gray-800 rounded-lg hover:bg-[#7BC9EB] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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

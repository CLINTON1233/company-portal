"use client";

import {
  Globe,
  Monitor,
  Wifi,
  CheckCircle,
  AlertTriangle,
  X,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Cog,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import * as LucideIcons from "lucide-react";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { API_ENDPOINTS } from "../../../config/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [appsList, setAppsList] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileTable, setShowMobileTable] = useState(false);
  const { logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [showEditIconDropdown, setShowEditIconDropdown] = useState(false);
  const [editIconSearch, setEditIconSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    fetchCategories();
    fetchIcons();
  }, []);

  const fetchIcons = () => {
    console.log("🔍 Fetching icons from:", API_ENDPOINTS.ICONS);

    fetch(API_ENDPOINTS.ICONS)
      .then((res) => {
        console.log("📡 Icons response status:", res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Icons data received:", data);
        console.log("📊 Data type:", typeof data);
        console.log(
          "🔢 Data length:",
          Array.isArray(data) ? data.length : "Not an array"
        );

        if (Array.isArray(data)) {
          setIcons(data);
          console.log(`🎉 ${data.length} icons loaded successfully`);
        } else {
          console.error("❌ Icons data is not an array:", data);
          setIcons([]);
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching icons:", error);
        setIcons([]);
      });
  };

  useEffect(() => {
    console.log(" Icons state updated:", icons);
  }, [icons]);

  const [newApp, setNewApp] = useState({
    title: "",
    fullName: "",
    url: "",
    icon: "",
    iconFile: null,
    categoryId: "",
  });

  const [editApp, setEditApp] = useState({
    id: null,
    title: "",
    fullName: "",
    url: "",
    icon: "",
    iconFile: null,
    categoryId: "",
  });

  // Fetch categories pada useEffect
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch(API_ENDPOINTS.CATEGORIES)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };
  // Ganti const itemsPerPage = 8; dengan:
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);

  // Options untuk show entries
  const entriesOptions = [10, 25, 50, 100, 200, "All"];

  // Fungsi untuk handle change items per page
  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredApps.length);
    } else {
      setItemsPerPage(value);
    }
    setCurrentPage(1);
    setShowEntriesDropdown(false);
  };
  // Komponen Show Entries Dropdown
  const ShowEntriesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className={`flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition ${poppins.className}`}
      >
        Show {itemsPerPage === filteredApps.length ? "All" : itemsPerPage}
        <ChevronDown className="w-3 h-3" />
      </button>

      {showEntriesDropdown && (
        <div className="absolute bottom-full mb-1 left-0 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {entriesOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleItemsPerPageChange(option)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition ${
                itemsPerPage ===
                (option === "All" ? filteredApps.length : option)
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              {option === "All" ? "All" : option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  // Fungsi untuk export ke Excel
  const exportToExcel = () => {
    try {
      const dataToExport = filteredApps.length > 0 ? filteredApps : appsList;

      if (dataToExport.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "There is no data to export.",
          icon: "warning",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#fff",
        });
        return;
      }

      // Format data untuk Excel - PERBAIKI BAGIAN CATEGORY
      const excelData = dataToExport.map((app, index) => ({
        No: index + 1,
        "Application ID": app.id,
        Title: app.title,
        "Full Name": app.fullName,
        URL: app.url,
        Category: app.category?.name || "Uncategorized", // PERBAIKAN DI SINI
        Icon: app.icon || "Default",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Application ID
        { wch: 20 }, // Title
        { wch: 30 }, // Full Name
        { wch: 40 }, // URL
        { wch: 20 }, // Category
        { wch: 15 }, // Icon
      ];
      worksheet["!cols"] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

      // Generate filename dengan timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `Applications_Export_${timestamp}.xlsx`;

      // Export ke file
      XLSX.writeFile(workbook, filename);

      // Show success message
      Swal.fire({
        title: "Success!",
        text: `Data has been exported to ${filename}`,
        icon: "success",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Swal.fire({
        title: "Export Failed",
        text: "Failed to export data to Excel. Please try again.",
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  // Fungsi untuk export semua data (tanpa filter)
  const exportAllToExcel = () => {
    try {
      if (appsList.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "There is no data to export.",
          icon: "warning",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#fff",
        });
        return;
      }

      const excelData = appsList.map((app, index) => ({
        No: index + 1,
        "Application ID": app.id,
        Title: app.title,
        "Full Name": app.fullName,
        URL: app.url,
        Category: app.category?.name || "Uncategorized", // PERBAIKAN DI SINI
        Icon: app.icon || "Default",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 5 },
        { wch: 15 },
        { wch: 20 },
        { wch: 30 },
        { wch: 40 },
        { wch: 20 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Applications");

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `All_Applications_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      Swal.fire({
        title: "Success!",
        text: `All data has been exported to ${filename}`,
        icon: "success",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Swal.fire({
        title: "Export Failed",
        text: "Failed to export data to Excel. Please try again.",
        icon: "error",
        confirmButtonColor: "#1e40af",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const fetchApplications = () => {
    setIsLoading(true);
    fetch(API_ENDPOINTS.APPLICATIONS)
      .then((res) => res.json())
      .then((data) => {
        setAppsList(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const AppIcon = ({ iconName, className = "w-4 h-4 text-[#8FD9FB]" }) => {
    if (!iconName) {
      const GlobeIcon = LucideIcons.Globe;
      return <GlobeIcon className={className} />;
    }

    // Cek jika ini uploaded file
    if (
      iconName.startsWith("icon-") &&
      /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(iconName)
    ) {
      return (
        <img
          src={`${API_ENDPOINTS.UPLOADS}/${iconName}`}
          alt="Application Icon"
          className={className}
          onError={(e) => {
            console.log("Failed to load icon image");
            e.target.style.display = "none";
          }}
        />
      );
    }

    // Gunakan Lucide icon berdasarkan key
    const IconComponent = LucideIcons[iconName] || LucideIcons.Globe;
    return <IconComponent className={className} />;
  };

  const IconDropdown = ({
    selectedIcon,
    onSelectIcon,
    isOpen,
    onToggle,
    searchQuery,
    onSearchChange,
  }) => {
    const safeIcons = Array.isArray(icons) ? icons : [];
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filteredIcons = safeIcons.filter(
      (icon) =>
        icon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.icon_key?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const IconComponent = ({ iconKey, className = "w-4 h-4" }) => {
      const Icon = LucideIcons[iconKey] || LucideIcons.Globe;
      return <Icon className={className} />;
    };

    // Auto focus ke input ketika dropdown terbuka
    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);

    // Handle click outside untuk close dropdown
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onToggle();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen, onToggle]);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded flex items-center justify-between bg-white text-gray-800"
        >
          <div className="flex items-center gap-2">
            {selectedIcon ? (
              <>
                <IconComponent iconKey={selectedIcon.icon_key} />
                <span>{selectedIcon.name}</span>
              </>
            ) : (
              <span className="text-gray-500">Select an icon</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search icons..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#8FD9FB] focus:border-[#8FD9FB]"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    // Prevent event bubbling untuk key events
                    e.stopPropagation();
                  }}
                />
              </div>
            </div>

            {/* Icons List */}
            <div className="overflow-y-auto max-h-48">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 p-1">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => {
                        onSelectIcon(icon);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-sm text-left rounded hover:bg-blue-50 hover:text-blue-600 transition ${
                        selectedIcon?.id === icon.id
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <IconComponent iconKey={icon.icon_key} />
                      <div className="flex-1">
                        <div className="font-medium">{icon.name}</div>
                        <div className="text-xs text-gray-500">
                          {icon.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No icons found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter data
  const filteredApps = appsList.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const currentData = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Mobile Card View
  const MobileAppCard = ({ app }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-[#8FD9FB] rounded-lg flex-shrink-0">
              <AppIcon iconName={app.icon} className="w-4 h-4 text-gray-800" />
            </div>
            <button
              onClick={() => setSelectedApp(app)}
              className={`text-sm font-semibold text-gray-900 hover:text-[#8FD9FB] transition-colors text-left truncate flex-1 min-w-0 ${poppins.className}`}
            >
              {app.title}
            </button>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditApp(app);
                setShowEditModal(true);
              }}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await handleDeleteApp(app);
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Full Name</span>
            <span className="text-gray-900 text-right truncate ml-2 max-w-[140px]">
              {app.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">URL</span>
            <span className="font-mono text-gray-900 text-xs truncate ml-2 max-w-[120px]">
              {app.url}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category</span>
            <span className="text-gray-900 text-right truncate ml-2">
              {app.category?.name || "Uncategorized"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Icon</span>
            <span className="text-gray-900 truncate ml-2">
              {app.icon || "Default"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">ID: {app.id}</span>
          <button
            onClick={() => setSelectedApp(app)}
            className="px-2 py-1 text-xs bg-[#8FD9FB] text-gray-800 rounded-lg hover:bg-[#7BC9EB] transition font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Modal Detail Aplikasi
  const AppDetailModal = ({ app, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
        <div className="bg-white rounded-lg w-full max-w-sm p-4 shadow-xl animate-fade-in relative mx-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">
            Application Details
          </h2>

          <div className="space-y-3">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3
                className={`font-semibold text-gray-900 mb-2 text-sm ${poppins.className}`}
              >
                Basic Information
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#8FD9FB] rounded-lg">
                    <AppIcon
                      iconName={app.icon}
                      className="w-4 h-4 text-gray-800"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-gray-500 text-xs">Title</label>
                    <p className="font-semibold text-gray-900 truncate">
                      {app.title}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Full Name</label>
                  <p className="font-semibold text-gray-900 truncate">
                    {app.fullName}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Icon Name</label>
                  <p className="font-semibold text-gray-900 truncate">
                    {app.icon || "Default"}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">
                    Application ID
                  </label>
                  <p className="font-semibold text-gray-900">{app.id}</p>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-gray-500 text-xs">Category</label>
              <p className="font-semibold text-gray-900 truncate">
                {app.category?.name || "Uncategorized"}
              </p>
            </div>
            {/* URL Information */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3
                className={`font-semibold text-gray-900 mb-2 text-sm ${poppins.className}`}
              >
                URL Information
              </h3>
              <div className="text-xs">
                <label className="text-gray-500 text-xs">Application URL</label>
                <p className="font-mono text-gray-900 break-all text-xs bg-white p-2 rounded border mt-1">
                  {app.url}
                </p>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-2 bg-[#8FD9FB] text-gray-800 rounded hover:bg-[#7BC9EB] transition text-xs w-full text-center"
                >
                  Open Application
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                setEditApp(app);
                setShowEditModal(true);
                onClose();
              }}
              className="px-3 py-1.5 text-xs rounded bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle Delete Application
  const handleDeleteApp = async (app) => {
    const result = await Swal.fire({
      title: `Delete ${app.title}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await fetch(API_ENDPOINTS.APPLICATION_BY_ID(app.id), {
          method: "DELETE",
        });
        fetchApplications();

        Swal.fire({
          title: "Deleted!",
          text: `${app.title} has been deleted.`,
          icon: "success",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#fff",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Failed to delete application.",
          icon: "error",
          confirmButtonColor: "#1e40af",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
  };
  return (
    <ProtectedRoute requiredRole="superadmin">
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
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold italic tracking-tight text-white">
              Company Portal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            <Link
              href="/superadmin/dashboard"
              className="hover:text-[#8FD9FB] transition text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/superadmin/applications"
              className="hover:text-[#8FD9FB] transition text-white"
            >
              Applications
            </Link>
            <Link
              href="/superadmin/management_categories"
              className="hover:text-[#8FD9FB] transition text-white"
            >
              Categories
            </Link>
            <Link
              href="/superadmin/management_users"
              className="hover:text-[#8FD9FB] transition text-white"
            >
              Users
            </Link>
            <Link
              href="/superadmin/profile"
              className="hover:text-[#8FD9FB] transition text-white"
            >
              Profile
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="hover:text-[#8FD9FB] transition text-white"
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
                  className="text-white hover:text-[#8FD9FB] transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/superadmin/applications"
                  className="text-white hover:text-[#8FD9FB] transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications
                </Link>
                <Link
                  href="/superadmin/management_categories"
                  className="text-white hover:text-[#8FD9FB] transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/superadmin/management_users"
                  className="text-white hover:text-[#8FD9FB] transition py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/profile"
                  className="text-white hover:text-[#8FD9FB] transition py-2 font-medium"
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
        <section className="max-w-5xl mx-auto text-center py-6 px-4 sm:py-8 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-white">
                <span className="text-white">Applications</span>{" "}
                <span className="text-[#8FD9FB]">Management</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/80 mt-2">
              All infrastructure applications in the IT Company Portal
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className={`${poppins.className} space-y-4 p-4 sm:p-6 flex-1`}>
          <div className="space-y-4 max-w-7xl mx-auto w-full">
            {/* Search dan Table Header */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {/* Header dengan Search */}
              <div className="px-5 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold text-gray-900 ${poppins.className}`}
                    >
                      Applications List
                    </h3>
                    <p
                      className={`text-sm text-gray-600 mt-1 ${poppins.className}`}
                    >
                      Manage all infrastructure applications
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search applications..."
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-sm text-gray-900 ${poppins.className}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2 justify-between">
                      <button
                        className={`px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm text-gray-700 font-medium ${poppins.className}`}
                        onClick={fetchApplications}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>

                      <div className="flex gap-2">
                        {/* Tombol Export dengan dropdown */}
                        <div className="relative group">
                          <button
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition ${poppins.className}`}
                          >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={exportToExcel}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
                            >
                              <Download className="w-3 h-3" />
                              Export Filtered Data
                              <span className="text-xs text-gray-500 ml-auto">
                                ({filteredApps.length})
                              </span>
                            </button>
                            <button
                              onClick={exportAllToExcel}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 border-t border-gray-100"
                            >
                              <Download className="w-3 h-3" />
                              Export All Data
                              <span className="text-xs text-gray-500 ml-auto">
                                ({appsList.length})
                              </span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowAddModal(true)}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 bg-[#8FD9FB] rounded-lg hover:bg-[#7BC9EB] transition ${poppins.className}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add New Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counter */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <span
                  className={`text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border ${poppins.className}`}
                >
                  {filteredApps.length} of {appsList.length} Applications
                </span>
              </div>

              {/* Desktop Table / Mobile Cards */}
              {!isMobile ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Application
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Full Name
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          URL
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Category
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Icon
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentData.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-blue-50/30 transition-all duration-200 group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#8FD9FB] rounded-lg">
                                <AppIcon
                                  iconName={app.icon}
                                  className="w-5 h-5 text-gray-800"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className={`text-sm font-semibold text-gray-900 hover:text-[#8FD9FB] transition-colors text-left group-hover:underline truncate ${poppins.className}`}
                                >
                                  {app.title}
                                </button>
                                <span
                                  className={`text-xs text-gray-500 ${poppins.className}`}
                                >
                                  ID: {app.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className} max-w-[120px] truncate block`}
                            >
                              {app.fullName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`font-mono text-xs text-gray-900 max-w-[100px] truncate block ${poppins.className}`}
                            >
                              {app.url}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {app.category?.name || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {app.icon || "Default"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="p-2 text-gray-400 hover:text-[#8FD9FB] hover:bg-[#8FD9FB]/10 rounded transition-all duration-200"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditApp({
                                    id: app.id,
                                    title: app.title,
                                    fullName: app.fullName,
                                    url: app.url,
                                    icon: app.icon,
                                    categoryId:
                                      app.category?.id || app.categoryId,
                                  });
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                title="Delete Application"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Mobile Cards View */
                <div className="p-4">
                  {currentData.map((app) => (
                    <MobileAppCard key={app.id} app={app} />
                  ))}
                </div>
              )}

              {/* Pagination dengan Show Entries */}
              {(totalPages > 1 || itemsPerPage !== 10) && (
                <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Show Entries dan Info */}
                    <div className="flex items-center gap-3">
                      <ShowEntriesDropdown />
                      <p
                        className={`text-sm text-gray-700 ${poppins.className}`}
                      >
                        Showing{" "}
                        <span className="font-semibold">
                          {filteredApps.length === 0
                            ? 0
                            : (currentPage - 1) * itemsPerPage + 1}
                          -
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredApps.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                          {filteredApps.length}
                        </span>{" "}
                        Applications
                      </p>
                    </div>

                    {/* Pagination Buttons */}
                    {totalPages > 1 && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${poppins.className}`}
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${poppins.className}`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Detail Aplikasi */}
        {selectedApp && (
          <AppDetailModal
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in relative mx-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Add New Application
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter application title"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={newApp.title}
                    onChange={(e) =>
                      setNewApp({ ...newApp, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Application Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full application name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={newApp.fullName}
                    onChange={(e) =>
                      setNewApp({ ...newApp, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-app-url.com"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={newApp.url}
                    onChange={(e) =>
                      setNewApp({ ...newApp, url: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 bg-white"
                    value={newApp.categoryId || ""}
                    onChange={(e) =>
                      setNewApp({
                        ...newApp,
                        categoryId: e.target.value
                          ? parseInt(e.target.value)
                          : "",
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application Icon
                  </label>

                  <IconDropdown
                    selectedIcon={icons.find(
                      (icon) => icon.icon_key === newApp.icon
                    )}
                    onSelectIcon={(icon) => {
                      setNewApp({ ...newApp, icon: icon.icon_key });
                      setShowIconDropdown(false);
                      setIconSearch(""); // Reset search setelah select
                    }}
                    isOpen={showIconDropdown}
                    onToggle={() => {
                      setShowIconDropdown(!showIconDropdown);
                      setIconSearch(""); // Reset search ketika toggle
                    }}
                    searchQuery={iconSearch}
                    onSearchChange={setIconSearch}
                  />

                  <div className="flex items-center gap-2 my-3">
                    <div className="w-full h-px bg-gray-300 flex-1"></div>
                    <span className="text-gray-500 text-xs">or</span>
                    <div className="w-full h-px bg-gray-300 flex-1"></div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2"
                    onChange={(e) =>
                      setNewApp({ ...newApp, iconFile: e.target.files[0] })
                    }
                  />

                  <p className="text-xs text-gray-600 mt-2">
                    Choose from icon library or upload your own icon image
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      // Validasi input
                      if (
                        !newApp.title.trim() ||
                        !newApp.fullName.trim() ||
                        !newApp.url.trim() ||
                        !newApp.categoryId
                      ) {
                        Swal.fire({
                          title: "Validation Error",
                          text: "Please fill in all required fields (Title, Full Name, URL, and Category).",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                        return;
                      }

                      // Validasi URL format
                      try {
                        new URL(newApp.url);
                      } catch (urlError) {
                        Swal.fire({
                          title: "Invalid URL",
                          text: "Please enter a valid URL format (e.g., https://example.com).",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                        return;
                      }

                      const formData = new FormData();
                      formData.append("title", newApp.title.trim());
                      formData.append("fullName", newApp.fullName.trim());
                      formData.append("url", newApp.url.trim());
                      formData.append("icon", newApp.icon?.trim() || "Globe");
                      formData.append(
                        "categoryId",
                        newApp.categoryId.toString()
                      );

                      if (newApp.iconFile) {
                        formData.append("iconFile", newApp.iconFile);
                      }

                      console.log("Sending data:", {
                        title: newApp.title,
                        fullName: newApp.fullName,
                        url: newApp.url,
                        icon: newApp.icon || "Globe",
                        categoryId: newApp.categoryId,
                      });

                      const res = await fetch(API_ENDPOINTS.APPLICATIONS, {
                        method: "POST",
                        body: formData,
                      });

                      if (res.ok) {
                        setShowAddModal(false);
                        setNewApp({
                          title: "",
                          fullName: "",
                          url: "",
                          icon: "",
                          iconFile: null,
                          categoryId: "",
                        });
                        fetchApplications();

                        await Swal.fire({
                          title: "Success!",
                          text: "New application has been successfully added.",
                          icon: "success",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                      } else {
                        const responseText = await res.text();
                        let errorMessage = "Failed to save application.";

                        try {
                          const errorData = JSON.parse(responseText);
                          errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                          errorMessage = responseText || errorMessage;
                        }

                        Swal.fire({
                          title: "Error",
                          text: errorMessage,
                          icon: "error",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                      }
                    } catch (err) {
                      console.error("Error adding application:", err);
                      Swal.fire({
                        title: "Connection Error",
                        text: "Cannot connect to server. Please check if the server is running.",
                        icon: "error",
                        confirmButtonColor: "#1e40af",
                        background: "#1f2937",
                        color: "#fff",
                      });
                    }
                  }}
                  className="px-4 py-2.5 text-sm rounded-lg bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium"
                >
                  Save Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in relative mx-auto">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Edit Application
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter application title"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={editApp.title}
                    onChange={(e) =>
                      setEditApp({ ...editApp, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Application Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full application name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={editApp.fullName}
                    onChange={(e) =>
                      setEditApp({ ...editApp, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-app-url.com"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={editApp.url}
                    onChange={(e) =>
                      setEditApp({ ...editApp, url: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 bg-white"
                    value={editApp.categoryId || editApp.category?.id || ""}
                    onChange={(e) =>
                      setEditApp({
                        ...editApp,
                        categoryId: e.target.value
                          ? parseInt(e.target.value)
                          : "",
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Application Icon
                  </label>

                  <IconDropdown
                    selectedIcon={icons.find(
                      (icon) => icon.icon_key === editApp.icon
                    )}
                    onSelectIcon={(icon) => {
                      setEditApp({ ...editApp, icon: icon.icon_key });
                      setShowEditIconDropdown(false);
                      setEditIconSearch(""); // Reset search setelah select
                    }}
                    isOpen={showEditIconDropdown}
                    onToggle={() => {
                      setShowEditIconDropdown(!showEditIconDropdown);
                      setEditIconSearch(""); // Reset search ketika toggle
                    }}
                    searchQuery={editIconSearch}
                    onSearchChange={setEditIconSearch}
                  />

                  <div className="flex items-center gap-2 my-3">
                    <div className="w-full h-px bg-gray-300 flex-1"></div>
                    <span className="text-gray-500 text-xs">or</span>
                    <div className="w-full h-px bg-gray-300 flex-1"></div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2"
                    onChange={(e) =>
                      setEditApp({ ...editApp, iconFile: e.target.files[0] })
                    }
                  />

                  <p className="text-xs text-gray-600 mt-2">
                    Choose from icon library or upload your own icon image
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      // Validasi input
                      if (
                        !editApp.title.trim() ||
                        !editApp.fullName.trim() ||
                        !editApp.url.trim() ||
                        !editApp.categoryId
                      ) {
                        Swal.fire({
                          title: "Validation Error",
                          text: "Please fill in all required fields (Title, Full Name, URL, and Category).",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                        return;
                      }

                      // Validasi URL format
                      try {
                        new URL(editApp.url);
                      } catch (urlError) {
                        Swal.fire({
                          title: "Invalid URL",
                          text: "Please enter a valid URL format (e.g., https://example.com).",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                        return;
                      }

                      const formData = new FormData();
                      formData.append("title", editApp.title.trim());
                      formData.append("fullName", editApp.fullName.trim());
                      formData.append("url", editApp.url.trim());
                      formData.append("icon", editApp.icon?.trim() || "Globe");
                      formData.append(
                        "categoryId",
                        editApp.categoryId.toString()
                      );

                      if (editApp.iconFile) {
                        formData.append("iconFile", editApp.iconFile);
                      }

                      const res = await fetch(
                        API_ENDPOINTS.APPLICATION_BY_ID(editApp.id),
                        {
                          method: "PUT",
                          body: formData,
                        }
                      );

                      if (res.ok) {
                        fetchApplications();
                        setShowEditModal(false);

                        Swal.fire({
                          title: "Success!",
                          text: "Application has been successfully updated.",
                          icon: "success",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                      } else {
                        const responseText = await res.text();
                        let errorMessage = "Failed to update application.";

                        try {
                          const errorData = JSON.parse(responseText);
                          errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                          errorMessage = responseText || errorMessage;
                        }

                        Swal.fire({
                          title: "Error",
                          text: errorMessage,
                          icon: "error",
                          confirmButtonColor: "#1e40af",
                          background: "#1f2937",
                          color: "#fff",
                        });
                      }
                    } catch (error) {
                      console.error("Error updating application:", error);
                      Swal.fire({
                        title: "Connection Error",
                        text: "Cannot connect to server. Please check if the server is running.",
                        icon: "error",
                        confirmButtonColor: "#1e40af",
                        background: "#1f2937",
                        color: "#fff",
                      });
                    }
                  }}
                  className="px-4 py-2.5 text-sm rounded-lg bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium"
                >
                  Save Changes
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
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition text-base font-medium"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition text-base font-medium"
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
          <p className="font-medium">IT Company Portal</p>
          <p className="text-white/80">company.com</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

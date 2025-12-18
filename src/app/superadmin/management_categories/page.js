"use client";

import {
  CheckCircle,
  AlertTriangle,
  X,
  MoreVertical,
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { API_ENDPOINTS } from "../../../config/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SuperAdminManagementCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const [editCategory, setEditCategory] = useState({
    id: null,
    name: "",
    description: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);

  const entriesOptions = [10, 25, 50, 100, 200, "All"];

  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredCategories.length);
    } else {
      setItemsPerPage(value);
    }
    setCurrentPage(1);
    setShowEntriesDropdown(false);
  };

  const ShowEntriesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className={`flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition ${poppins.className}`}
      >
        Show {itemsPerPage === filteredCategories.length ? "All" : itemsPerPage}
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
                (option === "All" ? filteredCategories.length : option)
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
    fetchCategories();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = () => {
    setIsLoading(true);
    fetch(API_ENDPOINTS.CATEGORIES)
      .then((res) => res.json())
      .then((data) => {
        setCategoriesList(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };

  // Filter data
  const filteredCategories = categoriesList.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const currentData = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mobile Card View
  const MobileCategoryCard = ({ category }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-[#8FD9FB] rounded-lg flex-shrink-0">
              <Folder className="w-4 h-4 text-gray-800" />
            </div>
            <button
              onClick={() => setSelectedCategory(category)}
              className={`text-sm font-semibold text-gray-900 hover:text-blue-700 transition-colors text-left truncate flex-1 min-w-0 ${poppins.className}`}
            >
              {category.name}
            </button>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditCategory(category);
                setShowEditModal(true);
              }}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await handleDeleteCategory(category);
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Description</span>
            <span className="text-gray-900 text-right truncate ml-2 max-w-[140px]">
              {category.description || "No description"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">ID: {category.id}</span>
          <button
            onClick={() => setSelectedCategory(category)}
            className="px-2 py-1 text-xs bg-[#8FD9FB] text-gray-800 rounded-lg hover:bg-[#7BC9EB] transition font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Modal Detail Category
  const CategoryDetailModal = ({ category, onClose }) => {
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
            Category Details
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
                    <Folder className="w-4 h-4 text-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-gray-500 text-xs">Name</label>
                    <p className="font-semibold text-gray-900 truncate">
                      {category.name}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Description</label>
                  <p className="font-semibold text-gray-900 truncate">
                    {category.description || "No description"}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Category ID</label>
                  <p className="font-semibold text-gray-900">{category.id}</p>
                </div>
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
                setEditCategory(category);
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

  // Handle Delete Category
  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: `Delete ${category.name}?`,
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
        const res = await fetch(API_ENDPOINTS.CATEGORY_BY_ID(category.id), {
          method: "DELETE",
        });

        if (res.ok) {
          fetchCategories();
          Swal.fire({
            title: "Deleted!",
            text: `${category.name} has been deleted.`,
            icon: "success",
            confirmButtonColor: "#1e40af",
          });
        } else {
          const errorData = await res.json();
          Swal.fire({
            title: "Error",
            text: errorData.message || "Failed to delete category.",
            icon: "error",
            confirmButtonColor: "#1e40af",
          });
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete category.",
          icon: "error",
          confirmButtonColor: "#1e40af",
        });
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const dataToExport =
        filteredCategories.length > 0 ? filteredCategories : categoriesList;

      if (dataToExport.length === 0) {
        Swal.fire({
          title: "No Data",
          text: "There is no data to export.",
          icon: "warning",
          confirmButtonColor: "#1e40af",
        });
        return;
      }

      const excelData = dataToExport.map((category, index) => ({
        No: index + 1,
        "Category ID": category.id,
        Name: category.name,
        Description: category.description || "No description",
        "Applications Count": category.applications
          ? category.applications.length
          : 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 5 }, // No
        { wch: 15 }, // Category ID
        { wch: 25 }, // Name
        { wch: 40 }, // Description
        { wch: 20 }, // Applications Count
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `Categories_Export_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

      Swal.fire({
        title: "Success!",
        text: `Data has been exported to ${filename}`,
        icon: "success",
        confirmButtonColor: "#1e40af",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Swal.fire({
        title: "Export Failed",
        text: "Failed to export data to Excel. Please try again.",
        icon: "error",
        confirmButtonColor: "#1e40af",
      });
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
            <div className="text-center">
              {/* Icon + Title */}
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-white">
                  <span className="text-white">Categories</span>{" "}
                  <span className="text-[#8FD9FB]">Management</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-white/80 mt-2">
                Manage all application categories in the system
              </p>
            </div>
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
                      Categories List
                    </h3>
                    <p
                      className={`text-sm text-gray-600 mt-1 ${poppins.className}`}
                    >
                      Manage all application categories
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-sm text-gray-900 ${poppins.className}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2 justify-between">
                      <button
                        className={`px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm text-gray-700 font-medium ${poppins.className}`}
                        onClick={fetchCategories}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={exportToExcel}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition ${poppins.className}`}
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>

                        <button
                          onClick={() => setShowAddModal(true)}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 bg-[#8FD9FB] rounded-lg hover:bg-[#7BC9EB] transition ${poppins.className}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add New Category
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
                  {filteredCategories.length} of {categoriesList.length}{" "}
                  Categories
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
                          Category
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Description
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentData.map((category) => (
                        <tr
                          key={category.id}
                          className="hover:bg-blue-50/30 transition-all duration-200 group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#8FD9FB] rounded-lg">
                                <Folder className="w-5 h-5 text-gray-800" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <button
                                  onClick={() => setSelectedCategory(category)}
                                  className={`text-sm font-semibold text-gray-900 hover:text-[#8FD9FB] transition-colors text-left group-hover:underline truncate ${poppins.className}`}
                                >
                                  {category.name}
                                </button>
                                <span
                                  className={`text-xs text-gray-500 ${poppins.className}`}
                                >
                                  ID: {category.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className} max-w-[200px] truncate block`}
                            >
                              {category.description || "No description"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedCategory(category)}
                                className="p-2 text-gray-400 hover:text-[#8FD9FB] hover:bg-[#8FD9FB]/10 rounded transition-all duration-200"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditCategory(category);
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                title="Delete Category"
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
                  {currentData.map((category) => (
                    <MobileCategoryCard key={category.id} category={category} />
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
                          {filteredCategories.length === 0
                            ? 0
                            : (currentPage - 1) * itemsPerPage + 1}
                          -
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredCategories.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold">
                          {filteredCategories.length}
                        </span>{" "}
                        Categories
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

        {/* Modal Detail Category */}
        {selectedCategory && (
          <CategoryDetailModal
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
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
                Add New Category
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter category description (optional)"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 resize-none"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                  />
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
                      if (!newCategory.name.trim()) {
                        Swal.fire({
                          title: "Validation Error",
                          text: "Please fill in category name.",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                        });
                        return;
                      }

                      const res = await fetch(API_ENDPOINTS.CATEGORIES, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          name: newCategory.name.trim(),
                          description: newCategory.description.trim() || null,
                        }),
                      });

                      if (res.ok) {
                        setShowAddModal(false);
                        setNewCategory({
                          name: "",
                          description: "",
                        });
                        fetchCategories();

                        await Swal.fire({
                          title: "Success!",
                          text: "New category has been successfully added.",
                          icon: "success",
                          confirmButtonColor: "#1e40af",
                        });
                      } else {
                        const errorData = await res.json();
                        Swal.fire({
                          title: "Error",
                          text: errorData.message || "Failed to save category.",
                          icon: "error",
                          confirmButtonColor: "#1e40af",
                        });
                      }
                    } catch (err) {
                      console.error("Error adding category:", err);
                      Swal.fire({
                        title: "Connection Error",
                        text: "Cannot connect to server. Please check if the server is running.",
                        icon: "error",
                        confirmButtonColor: "#1e40af",
                      });
                    }
                  }}
                  className="px-4 py-2.5 text-sm rounded-lg bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium"
                >
                  Save Category
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
                Edit Category
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter category description (optional)"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 resize-none"
                    rows="3"
                    value={editCategory.description}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        description: e.target.value,
                      })
                    }
                  />
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
                      if (!editCategory.name.trim()) {
                        Swal.fire({
                          title: "Validation Error",
                          text: "Please fill in category name.",
                          icon: "warning",
                          confirmButtonColor: "#1e40af",
                        });
                        return;
                      }

                      const res = await fetch(
                        API_ENDPOINTS.CATEGORY_BY_ID(editCategory.id),
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            name: editCategory.name.trim(),
                            description:
                              editCategory.description.trim() || null,
                          }),
                        }
                      );

                      if (res.ok) {
                        fetchCategories();
                        setShowEditModal(false);

                        Swal.fire({
                          title: "Success!",
                          text: "Category has been successfully updated.",
                          icon: "success",
                          confirmButtonColor: "#1e40af",
                        });
                      } else {
                        const errorData = await res.json();
                        Swal.fire({
                          title: "Error",
                          text:
                            errorData.message || "Failed to update category.",
                          icon: "error",
                          confirmButtonColor: "#1e40af",
                        });
                      }
                    } catch (error) {
                      console.error("Error updating category:", error);
                      Swal.fire({
                        title: "Connection Error",
                        text: "Cannot connect to server. Please check if the server is running.",
                        icon: "error",
                        confirmButtonColor: "#1e40af",
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

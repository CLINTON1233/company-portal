"use client";

import {
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  MoreVertical,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";
import * as XLSX from "xlsx";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function SuperAdminManagementUsersPage() {
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEntriesDropdown, setShowEntriesDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    badge: "",
    telp: "",
    departemen: "",
    role: "admin",
  });

  // Entries options
  const entriesOptions = [10, 25, 50, 100, 200, "All"];

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.USERS);
      const result = await response.json();

      if (result.status === "success") {
        setUsers(result.users);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load users",
        background: "#1f2937",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    if (value === "All") {
      setItemsPerPage(filteredUsers.length);
    } else {
      setItemsPerPage(value);
    }
    setCurrentPage(1);
    setShowEntriesDropdown(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const dataToExport = filteredUsers.length > 0 ? filteredUsers : users;

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

      const excelData = dataToExport.map((user, index) => ({
        No: index + 1,
        "User ID": user.id,
        Name: user.nama || "-",
        Email: user.email,
        Badge: user.badge || "-",
        Phone: user.telp || "-",
        Department: user.departemen || "-",
        Role: user.role,
        "Created Date": new Date(user.created_at).toLocaleDateString("en-US"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 5 }, // No
        { wch: 10 }, // User ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Badge
        { wch: 15 }, // Phone
        { wch: 20 }, // Department
        { wch: 15 }, // Role
        { wch: 15 }, // Created Date
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `Users_Export_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, filename);

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

  // Export all data
  const exportAllToExcel = () => {
    try {
      if (users.length === 0) {
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

      const excelData = users.map((user, index) => ({
        No: index + 1,
        "User ID": user.id,
        Name: user.nama || "-",
        Email: user.email,
        Badge: user.badge || "-",
        Phone: user.telp || "-",
        Department: user.departemen || "-",
        Role: user.role,
        "Created Date": new Date(user.created_at).toLocaleDateString("en-US"),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const columnWidths = [
        { wch: 5 },
        { wch: 10 },
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All Users");

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `All_Users_${timestamp}.xlsx`;

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

  // Handle add new user
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully!",
          background: "#1f2937",
          color: "#fff",
        });
        setShowAddModal(false);
        resetForm();
        fetchUsers();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create user",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  // Handle edit user
  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(
        `${API_ENDPOINTS.USERS}/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User updated successfully!",
          background: "#1f2937",
          color: "#fff",
        });
        setShowEditModal(false);
        resetForm();
        fetchUsers();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update user",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
            background: "#1f2937",
            color: "#fff",
          });
          fetchUsers();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete user",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      email: "",
      password: "",
      badge: "",
      telp: "",
      departemen: "",
      role: "admin",
    });
    setSelectedUser(null);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      nama: user.nama || "",
      email: user.email || "",
      password: "", // Kosongkan password untuk edit
      badge: user.badge || "",
      telp: user.telp || "",
      departemen: user.departemen || "",
      role: user.role || "admin",
    });
    setShowEditModal(true);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.departemen?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    logout();
  };

  // Show Entries Dropdown Component
  const ShowEntriesDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowEntriesDropdown(!showEntriesDropdown)}
        className={`flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 transition ${poppins.className}`}
      >
        Show {itemsPerPage === filteredUsers.length ? "All" : itemsPerPage}
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
                (option === "All" ? filteredUsers.length : option)
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

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-[#8FD9FB] rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 text-gray-800" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-semibold text-gray-900 truncate ${poppins.className}`}
              >
                {user.nama || "No Name"}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <button
              onClick={() => openEditModal(user)}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-all"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteUser(user.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Badge</span>
            <span className="text-gray-900">{user.badge || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone</span>
            <span className="text-gray-900">{user.telp || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Department</span>
            <span className="text-gray-900">{user.departemen || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === "superadmin"
                  ? "bg-purple-600 text-white"
                  : "bg-[#8FD9FB] text-gray-800"
              }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Created: {new Date(user.created_at).toLocaleDateString("en-US")}
          </span>
          <span className="text-xs text-gray-500">ID: {user.id}</span>
        </div>
      </div>
    );
  };

  // User Detail Modal
  const UserDetailModal = ({ user, onClose }) => {
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
            User Details
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
                    <Users className="w-4 h-4 text-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-gray-500 text-xs">Name</label>
                    <p className="font-semibold text-gray-900 truncate">
                      {user.nama || "No Name"}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Email</label>
                  <p className="font-semibold text-gray-900 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">Role</label>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "superadmin"
                        ? "bg-purple-600 text-white"
                        : "bg-[#8FD9FB] text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="min-w-0">
                  <label className="text-gray-500 text-xs">User ID</label>
                  <p className="font-semibold text-gray-900">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3
                className={`font-semibold text-gray-900 mb-2 text-sm ${poppins.className}`}
              >
                Contact Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-500 text-xs">Badge Number</label>
                  <p className="font-semibold text-gray-900">
                    {user.badge || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Phone</label>
                  <p className="font-semibold text-gray-900">
                    {user.telp || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs">Department</label>
                  <p className="font-semibold text-gray-900">
                    {user.departemen || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3
                className={`font-semibold text-gray-900 mb-2 text-sm ${poppins.className}`}
              >
                Account Information
              </h3>
              <div className="text-xs">
                <label className="text-gray-500 text-xs">Created Date</label>
                <p className="font-semibold text-gray-900">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
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
                openEditModal(user);
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
            <div className="text-center mt-0">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-white">
                  <span className="text-white">User</span>{" "}
                  <span className="text-[#8FD9FB]">Management</span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-white/80 mt-2">
                Manage all users and their roles in the system
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
                      Users List
                    </h3>
                    <p
                      className={`text-sm text-gray-600 mt-1 ${poppins.className}`}
                    >
                      Manage all system users and their roles
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, badge, or department..."
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-sm text-gray-900 ${poppins.className}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-2 justify-between">
                      <button
                        className={`px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm text-gray-700 font-medium ${poppins.className}`}
                        onClick={fetchUsers}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>

                      <div className="flex gap-2">
                        {/* Export Dropdown */}
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
                                ({filteredUsers.length})
                              </span>
                            </button>
                            <button
                              onClick={exportAllToExcel}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 border-t border-gray-100"
                            >
                              <Download className="w-3 h-3" />
                              Export All Data
                              <span className="text-xs text-gray-500 ml-auto">
                                ({users.length})
                              </span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={openAddModal}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 bg-[#8FD9FB] rounded-lg hover:bg-[#7BC9EB] transition ${poppins.className}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add New User
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
                  {filteredUsers.length} of {users.length} Users
                </span>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD9FB]"></div>
                </div>
              ) : !isMobile ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          User
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Email
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Badge
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Phone
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Department
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Role
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Created Date
                        </th>
                        <th
                          className={`px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${poppins.className}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentData.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-blue-50/30 transition-all duration-200 group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#8FD9FB] rounded-lg">
                                <Users className="w-5 h-5 text-gray-800" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className={`text-sm font-semibold text-gray-900 hover:text-[#8FD9FB] transition-colors text-left group-hover:underline truncate ${poppins.className}`}
                                >
                                  {user.nama || "No Name"}
                                </button>
                                <span
                                  className={`text-xs text-gray-500 ${poppins.className}`}
                                >
                                  ID: {user.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className} max-w-[120px] truncate block`}
                            >
                              {user.email}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {user.badge || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {user.telp || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {user.departemen || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "superadmin"
                                  ? "bg-purple-600 text-white"
                                  : "bg-[#8FD9FB] text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`text-sm text-gray-900 ${poppins.className}`}
                            >
                              {new Date(user.created_at).toLocaleDateString(
                                "en-US"
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 text-gray-400 hover:text-[#8FD9FB] hover:bg-[#8FD9FB]/10 rounded transition-all duration-200"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                title="Delete User"
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
                  {currentData.map((user) => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </div>
              )}

              {/* No Data State */}
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No users found</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Get started by adding a new user"}
                  </p>
                </div>
              )}

              {/* Pagination dengan Show Entries */}
              {(totalPages > 1 || itemsPerPage !== 10) &&
                filteredUsers.length > 0 && (
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
                            {filteredUsers.length === 0
                              ? 0
                              : (currentPage - 1) * itemsPerPage + 1}
                            -
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredUsers.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold">
                            {filteredUsers.length}
                          </span>{" "}
                          Users
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

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in relative mx-auto max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Add New User
              </h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="telp"
                    value={formData.telp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="departemen"
                    value={formData.departemen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fade-in relative mx-auto max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Edit User
              </h2>

              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="telp"
                    value={formData.telp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="departemen"
                    value={formData.departemen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD9FB] focus:border-[#8FD9FB] text-gray-800 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg bg-[#8FD9FB] text-gray-800 hover:bg-[#7BC9EB] transition font-medium"
                  >
                    Update User
                  </button>
                </div>
              </form>
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

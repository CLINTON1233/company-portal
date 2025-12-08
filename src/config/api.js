// config/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,

  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,

  // Applications
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLICATION_BY_ID: (id) => `${API_BASE_URL}/applications/${id}`,

  // Icons
  ICONS: `${API_BASE_URL}/icons`,

  // Uploads
  UPLOADS: `${API_BASE_URL}/uploads`,
};

// Helper function untuk build upload URL
export const getUploadUrl = (filename) => {
  return `${API_ENDPOINTS.UPLOADS}/${filename}`;
};

export default API_BASE_URL;

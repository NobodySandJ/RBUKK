// API Communication Layer
// Base URL configuration

// Otomatis deteksi environment:
// Jika localhost, gunakan http://localhost:3000/api
// Jika di Vercel/Production, gunakan relative path '/api'
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

console.log('API Base URL:', API_BASE_URL); // Debugging log

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper with error handling
const apiFetch = async (endpoint, options = {}) => {
  try {
    // Remove leading slash from endpoint if API_BASE_URL already has trailing slash or specific logic
    // But simplest way:
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    console.log(`Fetching: ${url}`); // Debugging log

    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like 404 HTML pages from Vercel if route wrong)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       throw new Error("Server returned non-JSON response. Check API URL.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Methods
const API = {
  // Auth endpoints
  auth: {
    register: (userData) => apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    login: (credentials) => apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
    getMe: () => apiFetch('/auth/me'),
    
    logout: () => apiFetch('/auth/logout', { method: 'POST' })
  },

  // Members endpoints
  members: {
    getAll: () => apiFetch('/members'),
    getById: (id) => apiFetch(`/members/${id}`)
  },

  // Products endpoints
  products: {
    getAll: (category) => {
      const query = category ? `?category=${category}` : '';
      return apiFetch(`/products${query}`);
    },
    getById: (id) => apiFetch(`/products/${id}`),
    getByCategory: (category) => apiFetch(`/products/category/${category}`)
  },

  // Orders endpoints
  orders: {
    create: (orderData) => apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    getMyOrders: () => apiFetch('/orders/my-orders')
  },

  // Schedule endpoints
  schedule: {
    getAll: () => apiFetch('/schedule'),
    getFeatured: () => apiFetch('/schedule/featured'),
    getByMonth: (month) => apiFetch(`/schedule/month/${month}`)
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
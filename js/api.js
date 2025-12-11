// API Communication Layer
// Base URL configuration - works for both local dev and Vercel production

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api'; // Relative path for production (Vercel)

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
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
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

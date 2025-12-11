// Authentication Module
// Handles login, register, and user session management

let currentUser = null;

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  setupAuthListeners();
});

// Check if user is logged in
const initAuth = async () => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      const response = await API.auth.getMe();
      if (response.success) {
        currentUser = response.data;
        updateUIForLoggedInUser();
      }
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
};

// Update UI when user is logged in
const updateUIForLoggedInUser = () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn && currentUser) {
    loginBtn.textContent = currentUser.full_name;
    loginBtn.classList.add('user-logged-in');
    
    // Add logout option on click
    loginBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm('Logout?')) {
        logout();
      }
    };
  }
};

// Setup auth modal listeners
const setupAuthListeners = () => {
  // Login button
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn && !currentUser) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal();
    });
  }

  // Auth tabs
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('auth-tab')) {
      switchAuthTab(e.target.dataset.tab);
    }
  });

  // Close modal
  document.addEventListener('click', (e) => {
    if (e.target.id === 'close-auth-modal' || e.target.id === 'auth-modal') {
      hideAuthModal();
    }
  });

  // Login form submit
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register form submit
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
};

// Show auth modal
const showAuthModal = () => {
  let modal = document.getElementById('auth-modal');
  
  if (!modal) {
    const template = document.getElementById('auth-modal-template');
    const clone = template.content.cloneNode(true);
    document.body.appendChild(clone);
    modal = document.getElementById('auth-modal');
    
    // Re-setup listeners after creating modal
    setupAuthListeners();
  }
  
  modal.classList.add('active');
};

// Hide auth modal
const hideAuthModal = () => {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Switch between login and register tabs
const switchAuthTab = (tab) => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabs = document.querySelectorAll('.auth-tab');
  
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
};

// Handle login
const handleLogin = async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  
  try {
    errorEl.textContent = '';
    
    const response = await API.auth.login({ email, password });
    
    if (response.success) {
      // Save token and user info
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      currentUser = response.data.user;
      
      // Update UI
      updateUIForLoggedInUser();
      hideAuthModal();
      
      // Show success message
      alert('Login berhasil! Selamat datang, ' + currentUser.full_name);
    }
  } catch (error) {
    errorEl.textContent = error.message || 'Login gagal. Silakan coba lagi.';
  }
};

// Handle register
const handleRegister = async (e) => {
  e.preventDefault();
  
  const full_name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');
  
  try {
    errorEl.textContent = '';
    
    // Validation
    if (password.length < 6) {
      errorEl.textContent = 'Password minimal 6 karakter';
      return;
    }
    
    const userData = { full_name, email, password };
    if (phone) userData.phone = phone;
    
    const response = await API.auth.register(userData);
    
    if (response.success) {
      // Save token and user info
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      currentUser = response.data.user;
      
      // Update UI
      updateUIForLoggedInUser();
      hideAuthModal();
      
      // Show success message
      alert('Registrasi berhasil! Selamat datang, ' + currentUser.full_name);
    }
  } catch (error) {
    errorEl.textContent = error.message || 'Registrasi gagal. Silakan coba lagi.';
  }
};

// Logout
const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  currentUser = null;
  
  // Reset UI
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.textContent = 'Login';
    loginBtn.classList.remove('user-logged-in');
    loginBtn.onclick = (e) => {
      e.preventDefault();
      showAuthModal();
    };
  }
  
  // Clear cart
  localStorage.removeItem('cart');
  updateCartCount();
  
  alert('Logout berhasil!');
};

// Check if user is authenticated (for protected actions)
const isAuthenticated = () => {
  return !!currentUser;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isAuthenticated, currentUser };
}

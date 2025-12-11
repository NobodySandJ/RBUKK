// Main JavaScript - Refresh Breeze Official Website
// Handles hero slider, navigation, dynamic content loading, and animations

// ============================================
// Initialize on page load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initNavigation();
  loadMembers();
  loadProducts();
  loadSchedule();
  initScrollAnimations();
  initShopTabs();
});

// ============================================
// Hero Slider
// ============================================
let currentSlide = 0;
let sliderInterval;

const initHeroSlider = () => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0) return;
  
  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetSliderInterval();
    });
  });
  
  // Auto-advance slider
  startSliderInterval();
};

const goToSlide = (index) => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  
  currentSlide = index;
};

const nextSlide = () => {
  const slides = document.querySelectorAll('.hero-slide');
  currentSlide = (currentSlide + 1) % slides.length;
  goToSlide(currentSlide);
};

const startSliderInterval = () => {
  sliderInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
};

const resetSliderInterval = () => {
  clearInterval(sliderInterval);
  startSliderInterval();
};

// ============================================
// Navigation
// ============================================
const initNavigation = () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.getElementById('navbar');
  
  // Hamburger menu toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close menu when clicking nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
    });
  });
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ============================================
// Load Members
// ============================================
const loadMembers = async () => {
  try {
    const response = await API.members.getAll();
    
    if (response.success && response.data) {
      renderMembers(response.data);
    }
  } catch (error) {
    console.error('Failed to load members:', error);
    // Show fallback content or error message
    document.getElementById('members-grid').innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: var(--dark-gray);">
        Failed to load members. Please try again later.
      </p>
    `;
  }
};

const renderMembers = (members) => {
  const grid = document.getElementById('members-grid');
  if (!grid) return;
  
  grid.innerHTML = members.map(member => `
    <div class="member-card glass-card" onclick="showMemberModal(${member.id})" data-member-id="${member.id}">
      <img src="${member.image_url || '/assets/images/placeholder.jpg'}" 
           alt="${member.name}">
      <div class="member-info">
        <div class="member-name">${member.name}</div>
        <div class="member-catchphrase">"${member.catchphrase}"</div>
      </div>
    </div>
  `).join('');
};

// Show member modal
window.showMemberModal = async (memberId) => {
  try {
    const response = await API.members.getById(memberId);
    
    if (response.success && response.data) {
      const member = response.data;
      
      let modal = document.getElementById('member-modal');
      
      if (!modal) {
        const template = document.getElementById('member-modal-template');
        const clone = template.content.cloneNode(true);
        document.body.appendChild(clone);
        modal = document.getElementById('member-modal');
        
        // Close button
        document.getElementById('close-member-modal')?.addEventListener('click', () => {
          modal.classList.remove('active');
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
          if (e.target.id === 'member-modal') {
            modal.classList.remove('active');
          }
        });
      }
      
      // Populate modal
      document.getElementById('modal-member-img').src = member.image_url || '/assets/images/placeholder.jpg';
      document.getElementById('modal-member-img').alt = member.name;
      document.getElementById('modal-member-name').textContent = member.name;
      document.getElementById('modal-member-position').textContent = member.position || '';
      document.getElementById('modal-member-catchphrase').textContent = `"${member.catchphrase}"`;
      document.getElementById('modal-member-bio').textContent = member.bio || 'Bio coming soon...';
      document.getElementById('modal-member-birthdate').textContent = member.birthdate ? new Date(member.birthdate).toLocaleDateString('id-ID') : 'N/A';
      
      const colorBadge = document.getElementById('modal-member-color');
      colorBadge.style.background = member.member_color;
      
      modal.classList.add('active');
    }
  } catch (error) {
    console.error('Failed to load member details:', error);
    alert('Failed to load member details');
  }
};

// ============================================
// Load Products
// ============================================
let allProducts = [];
let currentCategory = 'all';

const loadProducts = async () => {
  try {
    const response = await API.products.getAll();
    
    if (response.success && response.data) {
      allProducts = response.data;
      renderProducts(allProducts);
    }
  } catch (error) {
    console.error('Failed to load products:', error);
    document.getElementById('products-grid').innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: var(--dark-gray);">
        Failed to load products. Please try again later.
      </p>
    `;
  }
};

const renderProducts = (products) => {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  if (products.length === 0) {
    grid.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: var(--dark-gray);">
        No products available in this category.
      </p>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="product-card glass-card">
      <img src="${product.image_url || '/assets/images/placeholder.jpg'}" 
           alt="${product.name}" 
           class="product-image">
      <div class="product-name">${product.name}</div>
      <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
      <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
        Add to Cart
      </button>
    </div>
  `).join('');
};

// ============================================
// Shop Tabs
// ============================================
const initShopTabs = () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter products
      const category = btn.dataset.category;
      currentCategory = category;
      
      if (category === 'all') {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
      }
    });
  });
};

// ============================================
// Load Schedule
// ============================================
const loadSchedule = async () => {
  try {
    const response = await API.schedule.getAll();
    
    if (response.success && response.data) {
      renderSchedule(response.data);
    }
  } catch (error) {
    console.error('Failed to load schedule:', error);
    document.getElementById('schedule-container').innerHTML = `
      <p style="text-align: center; color: var(--dark-gray);">
        Failed to load schedule. Please try again later.
      </p>
    `;
  }
};

const renderSchedule = (events) => {
  const container = document.getElementById('schedule-container');
  if (!container) return;
  
  if (events.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--dark-gray);">
        No upcoming events scheduled.
      </p>
    `;
    return;
  }
  
  container.innerHTML = events.map(event => {
    const date = new Date(event.event_date);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    
    return `
      <div class="event-card glass-card">
        <div class="event-date-block">
          <div class="event-day">${day}</div>
          <div class="event-month">${month}</div>
        </div>
        <div class="event-details">
          <div class="event-title">${event.event_name}</div>
          ${event.event_type ? `<span class="event-type">${event.event_type}</span>` : ''}
          ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
          ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
};

// ============================================
// Scroll Animations
// ============================================
const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.8s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all sections and cards
  document.querySelectorAll('.section, .glass-card').forEach(el => {
    observer.observe(el);
  });
};

// ============================================
// Utility Functions
// ============================================

// Format currency
const formatCurrency = (amount) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Console message
console.log('%c🌊 Refresh Breeze Official Website', 'color: #00CED1; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with modern web technologies', 'color: #87CEEB; font-size: 12px;');

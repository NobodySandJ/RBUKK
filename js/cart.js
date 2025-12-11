// Shopping Cart Module
// Handles cart operations and checkout

let cart = [];

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCartCount();
  setupCartListeners();
});

// Load cart from localStorage
const loadCart = () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
};

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

// Add item to cart
const addToCart = (product) => {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
  }
  
  saveCart();
  
  // Show feedback
  showCartFeedback(`${product.name} ditambahkan ke keranjang!`);
};

// Remove item from cart
const removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
};

// Update item quantity
const updateQuantity = (productId, change) => {
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCart();
    }
  }
};

// Calculate cart total
const calculateTotal = () => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Update cart count badge
const updateCartCount = () => {
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
  }
};

// Show cart feedback
const showCartFeedback = (message) => {
  // Create temporary feedback element
  const feedback = document.createElement('div');
  feedback.className = 'cart-feedback';
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: linear-gradient(135deg, var(--primary-cyan), var(--sky-blue));
    color: white;
    padding: 15px 25px;
    border-radius: 50px;
    box-shadow: 0 4px 20px rgba(0, 206, 209, 0.4);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
};

// Setup cart listeners
const setupCartListeners = () => {
  // Cart button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', showCartModal);
  }

  // Close cart modal
  document.addEventListener('click', (e) => {
    if (e.target.id === 'close-cart-modal' || e.target.id === 'cart-modal') {
      hideCartModal();
    }
  });

  // Checkout button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-btn') {
      handleCheckout();
    }
  });
};

// Show cart modal
const showCartModal = () => {
  let modal = document.getElementById('cart-modal');
  
  if (!modal) {
    const template = document.getElementById('cart-modal-template');
    const clone = template.content.cloneNode(true);
    document.body.appendChild(clone);
    modal = document.getElementById('cart-modal');
  }
  
  renderCart();
  modal.classList.add('active');
};

// Hide cart modal
const hideCartModal = () => {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

// Render cart items
const renderCart = () => {
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartSummaryEl = document.getElementById('cart-summary');
  const cartTotalEl = document.getElementById('cart-total');
  
  if (!cartItemsEl) return;
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.style.display = 'block';
    cartSummaryEl.style.display = 'none';
    return;
  }
  
  cartEmptyEl.style.display = 'none';
  cartSummaryEl.style.display = 'block';
  
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image_url || '/assets/images/placeholder.jpg'}" 
           alt="${item.name}" 
           class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
  
  const total = calculateTotal();
  cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
};

// Handle checkout
const handleCheckout = async () => {
  // Check if user is logged in
  if (!isAuthenticated()) {
    hideCartModal();
    alert('Silakan login terlebih dahulu untuk checkout!');
    showAuthModal();
    return;
  }
  
  if (cart.length === 0) {
    alert('Keranjang belanja kosong!');
    return;
  }
  
  // Get shipping details
  const shipping_name = prompt('Nama Penerima:');
  if (!shipping_name) return;
  
  const shipping_phone = prompt('Nomor Telepon:');
  if (!shipping_phone) return;
  
  const shipping_address = prompt('Alamat Lengkap:');
  if (!shipping_address) return;
  
  const notes = prompt('Catatan (opsional):') || '';
  
  try {
    const orderData = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      })),
      shipping_name,
      shipping_phone,
      shipping_address,
      notes
    };
    
    const response = await API.orders.create(orderData);
    
    if (response.success) {
      // Clear cart
      cart = [];
      saveCart();
      hideCartModal();
      
      // Redirect to Midtrans payment
      alert('Order berhasil dibuat! Anda akan diarahkan ke halaman pembayaran.');
      window.open(response.data.payment_url, '_blank');
    }
  } catch (error) {
    alert('Checkout gagal: ' + error.message);
  }
};

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

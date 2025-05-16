let products= [];

//Fetch product data from API

async function fetchAllProduct() {
    const response = await fetch("https://ahammedshorif.github.io/ecommerce-api/C223161_C223194_product_api.json")
    const result = await response.json()
    
    products = result;
    console.log(products);
    
    renderProducts();

}
fetchAllProduct(); 

// Valid coupon codes
const coupons = {
    "SAMI": 20, // 20% off
    "TANVIR": 15, // 15% off
    "FREE": "shipping" // Free shipping
};

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.querySelector('.cart-count');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const discountEl = document.getElementById('discount');
const discountRow = document.getElementById('discount-row');
const totalEl = document.getElementById('total');
const couponInput = document.getElementById('coupon-code');
const applyButton = document.getElementById('apply-coupon');
const continueShoppingBtn = document.getElementById('continue-shopping');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Slider Elements
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentSlide = 0;
let appliedCoupon = null;

// Initialize the page
function init() {
    renderProducts();
    renderCart();
    updateCartCount();
    startSlider();
    
    // Event listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    continueShoppingBtn.addEventListener('click', toggleCart);
    applyButton.addEventListener('click', applyCoupon);
    hamburger.addEventListener('click', toggleMenu);
    
    prevBtn.addEventListener('click', () => {
        changeSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        changeSlide(currentSlide + 1);
    });
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-index'));
            changeSlide(slideIndex);
        });
    });
}

// Render products to the DOM
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="wishlist-btn" data-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${product.price.toFixed(2)}৳</p>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });

   // fetch product after dom load
     document.addEventListener("DOMContentLoaded", () => {
    fetchProduct();
    });
    
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Add event listeners to wishlist buttons
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', toggleWishlist);
    });
}

// Toggle wishlist status
function toggleWishlist(e) {
    const icon = e.currentTarget.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
    icon.classList.toggle('text-red-500');
}

// Add product to cart
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart UI
    renderCart();
    updateCartCount();
    
    // Open cart
    cartModal.classList.add('open');
}

// Render cart items
function renderCart() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your shopping bag is empty</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${item.price.toFixed(2)}৳</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        // Add event listeners to quantity buttons and remove buttons
        const minusButtons = document.querySelectorAll('.minus');
        const plusButtons = document.querySelectorAll('.plus');
        const removeButtons = document.querySelectorAll('.remove-item');
        
        minusButtons.forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });
        
        plusButtons.forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
        
        removeButtons.forEach(button => {
            button.addEventListener('click', removeItem);
        });
    }
    
    // Update cart totals
    updateCartTotals();
}

// Increase item quantity
function increaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += 1;
        saveCart();
        renderCart();
        updateCartCount();
    }
}

// Decrease item quantity
function decreaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity -= 1;
        
        if (item.quantity <= 0) {
            removeItem(e);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
}

// Remove item from cart
function removeItem(e) {
    const productId = parseInt(e.target.closest('.remove-item').getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    
    saveCart();
    renderCart();
    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    let shipping = subtotal > 0 ? 15 : 0; // $15 shipping fee if cart is not empty
    let discount = 0;
    
    // Apply coupon if valid
    if (appliedCoupon) {
        if (appliedCoupon === "shipping") {
            shipping = 0;
        } else {
            discount = (subtotal * appliedCoupon) / 100;
        }
    }
    
    const total = subtotal + shipping - discount;
    
    subtotalEl.textContent = `${subtotal.toFixed(2)}৳`;
    shippingEl.textContent = `${shipping.toFixed(2)}৳`;
    
    if (discount > 0) {
        discountRow.classList.add('active');
        discountEl.textContent = `-${discount.toFixed(2)}৳`;
    } else {
        discountRow.classList.remove('active');
    }
    
    totalEl.textContent = `${total.toFixed(2)}৳`;
}

// Apply coupon code
function applyCoupon() {
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (coupons.hasOwnProperty(couponCode)) {
        appliedCoupon = coupons[couponCode];
        alert(`Coupon "${couponCode}" applied successfully!`);
        updateCartTotals();
    } else {
        alert('Invalid coupon code');
    }
}

// Toggle cart visibility
function toggleCart() {
    cartModal.classList.toggle('open');
}

// Toggle mobile menu
function toggleMenu() {
    navLinks.classList.toggle('active');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Slider functions
function changeSlide(index) {
    // Handle wrapping
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }
    
    // Remove active class from current slide and dot
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    // Add active class to new slide and dot
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function startSlider() {
    // Set initial slide
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    // Auto-advance slides every 6 seconds
    setInterval(() => {
        changeSlide(currentSlide + 1);
    }, 6000);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

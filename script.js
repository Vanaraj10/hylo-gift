// Sample product data
const products = [
    {
        id: 1,
        name: "Corporate Notebook Set",
        price: "₹85",
        moq: "MOQ: 500",
        category: "corporate",
        subcategory: "stationery",
        keywords: ["notebook", "diary", "corporate", "writing"]
    },
    {
        id: 2,
        name: "Stainless Steel Water Bottle",
        price: "₹125",
        moq: "MOQ: 100",
        category: "corporate",
        subcategory: "bottles",
        keywords: ["bottle", "water", "steel", "corporate", "drink"]
    },
    {
        id: 3,
        name: "Premium Pen Set",
        price: "₹45",
        moq: "MOQ: 1000",
        category: "stationery",
        subcategory: "pens",
        keywords: ["pen", "writing", "stationery", "office"]
    },
    {
        id: 4,
        name: "Festival Gift Hamper",
        price: "₹250",
        moq: "MOQ: 200",
        category: "festival",
        subcategory: "hampers",
        keywords: ["festival", "hamper", "gift", "celebration"]
    },
    {
        id: 5,
        name: "Tech Accessories Kit",
        price: "₹180",
        moq: "MOQ: 300",
        category: "tech",
        subcategory: "accessories",
        keywords: ["tech", "accessories", "electronic", "gadget"]
    },
    {
        id: 6,
        name: "Promotional Tote Bag",
        price: "₹95",
        moq: "MOQ: 500",
        category: "promotional",
        subcategory: "bags",
        keywords: ["bag", "tote", "promotional", "carry"]
    },
    {
        id: 7,
        name: "Desk Calendar 2025",
        price: "₹65",
        moq: "MOQ: 1000",
        category: "stationery",
        subcategory: "calendars",
        keywords: ["calendar", "desk", "2025", "office"]
    },
    {
        id: 8,
        name: "Corporate Mug Set",
        price: "₹75",
        moq: "MOQ: 250",
        category: "corporate",
        subcategory: "mugs",
        keywords: ["mug", "coffee", "corporate", "ceramic"]
    },
    {
        id: 9,
        name: "USB Power Bank",
        price: "₹320",
        moq: "MOQ: 100",
        category: "tech",
        subcategory: "powerbank",
        keywords: ["powerbank", "usb", "battery", "charging"]
    },
    {
        id: 10,
        name: "Festive Decorative Items",
        price: "₹150",
        moq: "MOQ: 500",
        category: "festival",
        subcategory: "decorations",
        keywords: ["decoration", "festive", "ornament", "celebration"]
    },
    {
        id: 11,
        name: "Bluetooth Speaker",
        price: "₹450",
        moq: "MOQ: 50",
        category: "tech",
        subcategory: "audio",
        keywords: ["speaker", "bluetooth", "audio", "music"]
    },
    {
        id: 12,
        name: "Executive Diary 2025",
        price: "₹120",
        moq: "MOQ: 300",
        category: "corporate",
        subcategory: "diary",
        keywords: ["diary", "executive", "2025", "planner"]
    }
];

// Subcategory mapping
const subcategories = {
    corporate: ["stationery", "bottles", "mugs", "diary", "bags"],
    festival: ["hampers", "decorations", "sweets", "gifts"],
    stationery: ["pens", "calendars", "notebooks", "files"],
    promotional: ["bags", "keychains", "magnets", "banners"],
    tech: ["accessories", "powerbank", "audio", "cables"]
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const subcategoryFilter = document.getElementById('subcategoryFilter');
const productsGrid = document.getElementById('productsGrid');
const resultsCount = document.getElementById('resultsCount');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    updateResultsCount(products.length);
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Real-time search
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    // Category change
    categoryFilter.addEventListener('change', function() {
        updateSubcategories();
        applyFilters();
    });
    
    // Subcategory change
    subcategoryFilter.addEventListener('change', applyFilters);
    
    // Mobile menu toggle (if needed)
    setupMobileInteractions();
}

// Update subcategories based on selected category
function updateSubcategories() {
    const selectedCategory = categoryFilter.value;
    const subcategoryOptions = subcategories[selectedCategory] || [];
    
    // Clear existing options
    subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>';
    
    // Add new options
    subcategoryOptions.forEach(subcategory => {
        const option = document.createElement('option');
        option.value = subcategory;
        option.textContent = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
        subcategoryFilter.appendChild(option);
    });
}

// Apply filters to products
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSubcategory = subcategoryFilter.value;
    
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        // Subcategory filter
        const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
        
        return matchesSearch && matchesCategory && matchesSubcategory;
    });
    
    displayProducts(filteredProducts);
    updateResultsCount(filteredProducts.length);
}

// Display products in the grid
function displayProducts(productsToShow) {
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <div class="no-products-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.category}" data-subcategory="${product.subcategory}">
            <div class="product-image">
                <i class="fas fa-gift"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <div class="product-moq">${product.moq}</div>
            </div>
        </div>
    `).join('');
    
    // Add animation to newly loaded products
    animateProducts();
}

// Animate products on load
function animateProducts() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Update results count
function updateResultsCount(count) {
    const totalProducts = products.length;
    if (count === totalProducts) {
        resultsCount.textContent = `Showing all ${count} products`;
    } else {
        resultsCount.textContent = `Showing ${count} of ${totalProducts} products`;
    }
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup mobile interactions
function setupMobileInteractions() {
    // Add touch support for product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Mobile filter toggle
    createMobileFilterToggle();
}

// Create mobile filter toggle
function createMobileFilterToggle() {
    if (window.innerWidth <= 768) {
        const filterSection = document.querySelector('.filter-section');
        const searchWrapper = document.querySelector('.search-wrapper');
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-filter-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Show Filters';
        
        // Insert after search bar
        searchWrapper.insertBefore(toggleBtn, filterSection);
        
        // Hide filters initially on mobile
        filterSection.style.display = 'none';
        
        // Toggle functionality
        toggleBtn.addEventListener('click', function() {
            const isVisible = filterSection.style.display !== 'none';
            filterSection.style.display = isVisible ? 'none' : 'flex';
            this.innerHTML = isVisible ? 
                '<i class="fas fa-filter"></i> Show Filters' : 
                '<i class="fas fa-times"></i> Hide Filters';
        });
    }
}

// Smooth scrolling for navigation links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Recreate mobile filter toggle if needed
    const existingToggle = document.querySelector('.mobile-filter-toggle');
    if (existingToggle) {
        existingToggle.remove();
    }
    
    // Reset filter display
    const filterSection = document.querySelector('.filter-section');
    if (window.innerWidth > 768) {
        filterSection.style.display = 'flex';
    } else {
        createMobileFilterToggle();
    }
}, 250));

// Loading state management
function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading"></div>
            <p>Loading products...</p>
        </div>
    `;
}

// Add intersection observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .terms-card, .delivery-item, .moq-tier');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Performance optimization
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Preload critical images
        const criticalImages = ['logo.png'];
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    });
}

// Error handling for failed operations
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    // Could show user-friendly error message here
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is created
        // navigator.serviceWorker.register('/sw.js');
    });
}

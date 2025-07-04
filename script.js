// Sample product data
const products = [
    {
        id: 1,
        name: "Premium Corporate Diary",
        price: "₹45",
        category: "corporate",
        subcategory: "stationery",
        moq: "500",
        image: "",
        keywords: ["diary", "notebook", "corporate", "leather", "premium"]
    },
    {
        id: 2,
        name: "Stainless Steel Water Bottle",
        price: "₹120",
        category: "corporate",
        subcategory: "drinkware",
        moq: "200",
        image: "",
        keywords: ["bottle", "water", "steel", "corporate", "gift"]
    },
    {
        id: 3,
        name: "Wireless Bluetooth Earbuds",
        price: "₹350",
        category: "tech",
        subcategory: "audio",
        moq: "100",
        image: "",
        keywords: ["earbuds", "bluetooth", "wireless", "tech", "audio"]
    },
    {
        id: 4,
        name: "Bamboo Desk Organizer",
        price: "₹180",
        category: "corporate",
        subcategory: "office",
        moq: "300",
        image: "",
        keywords: ["organizer", "desk", "bamboo", "office", "eco"]
    },
    {
        id: 5,
        name: "LED Power Bank",
        price: "₹280",
        category: "tech",
        subcategory: "accessories",
        moq: "250",
        image: "",
        keywords: ["powerbank", "led", "charging", "tech", "portable"]
    },
    {
        id: 6,
        name: "Ceramic Coffee Mug Set",
        price: "₹95",
        category: "home",
        subcategory: "drinkware",
        moq: "400",
        image: "",
        keywords: ["mug", "coffee", "ceramic", "set", "home"]
    },
    {
        id: 7,
        name: "Diwali Gift Box",
        price: "₹200",
        category: "festival",
        subcategory: "traditional",
        moq: "100",
        image: "",
        keywords: ["diwali", "festival", "gift", "box", "traditional"]
    },
    {
        id: 8,
        name: "Premium Pen Set",
        price: "₹75",
        category: "stationery",
        subcategory: "writing",
        moq: "500",
        image: "",
        keywords: ["pen", "writing", "premium", "set", "corporate"]
    },
    {
        id: 9,
        name: "USB Flash Drive",
        price: "₹150",
        category: "tech",
        subcategory: "storage",
        moq: "200",
        image: "",
        keywords: ["usb", "flash", "drive", "storage", "tech"]
    },
    {
        id: 10,
        name: "Eco-Friendly Tote Bag",
        price: "₹85",
        category: "corporate",
        subcategory: "bags",
        moq: "300",
        image: "",
        keywords: ["bag", "tote", "eco", "friendly", "corporate"]
    },
    {
        id: 11,
        name: "Bluetooth Speaker",
        price: "₹450",
        category: "tech",
        subcategory: "audio",
        moq: "150",
        image: "",
        keywords: ["speaker", "bluetooth", "audio", "portable", "tech"]
    },
    {
        id: 12,
        name: "Custom Mousepad",
        price: "₹35",
        category: "tech",
        subcategory: "accessories",
        moq: "1000",
        image: "",
        keywords: ["mousepad", "custom", "computer", "tech", "desk"]
    },
    {
        id: 13,
        name: "Aroma Diffuser",
        price: "₹320",
        category: "home",
        subcategory: "wellness",
        moq: "200",
        image: "",
        keywords: ["diffuser", "aroma", "wellness", "home", "relaxation"]
    },
    {
        id: 14,
        name: "Christmas Ornament Set",
        price: "₹125",
        category: "festival",
        subcategory: "decoration",
        moq: "500",
        image: "",
        keywords: ["christmas", "ornament", "decoration", "festival", "set"]
    },
    {
        id: 15,
        name: "Smart Phone Stand",
        price: "₹65",
        category: "tech",
        subcategory: "accessories",
        moq: "600",
        image: "",
        keywords: ["phone", "stand", "smart", "holder", "tech"]
    },
    {
        id: 16,
        name: "Executive Planner",
        price: "₹110",
        category: "stationery",
        subcategory: "planning",
        moq: "300",
        image: "",
        keywords: ["planner", "executive", "calendar", "schedule", "business"]
    },
    {
        id: 17,
        name: "Laptop Cooling Pad",
        price: "₹380",
        category: "tech",
        subcategory: "computer",
        moq: "100",
        image: "",
        keywords: ["laptop", "cooling", "pad", "computer", "tech"]
    },
    {
        id: 18,
        name: "Scented Candle Set",
        price: "₹140",
        category: "home",
        subcategory: "decoration",
        moq: "250",
        image: "",
        keywords: ["candle", "scented", "home", "decoration", "relaxation"]
    }
];

// Category subcategory mapping
const subcategories = {
    corporate: ["office", "stationery", "drinkware", "bags", "accessories"],
    festival: ["traditional", "decoration", "gifts", "seasonal"],
    stationery: ["writing", "planning", "organization", "supplies"],
    tech: ["audio", "accessories", "storage", "computer", "mobile"],
    home: ["drinkware", "decoration", "wellness", "kitchen", "living"]
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const subcategoryFilter = document.getElementById('subcategoryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const productGrid = document.getElementById('productGrid');
const noProducts = document.getElementById('noProducts');

// State
let filteredProducts = [...products];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderProducts(products);
    setupEventListeners();
    
    // Add some visual feedback for loading
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    categoryFilter.addEventListener('change', handleCategoryChange);
    subcategoryFilter.addEventListener('change', filterProducts);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Debounce function for search
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

// Handle search input
function handleSearch() {
    filterProducts();
}

// Handle category change
function handleCategoryChange() {
    const selectedCategory = categoryFilter.value;
    updateSubcategoryOptions(selectedCategory);
    filterProducts();
}

// Update subcategory options based on selected category
function updateSubcategoryOptions(category) {
    subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>';
    
    if (category && subcategories[category]) {
        subcategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub.charAt(0).toUpperCase() + sub.slice(1);
            subcategoryFilter.appendChild(option);
        });
    }
}

// Filter products based on current filters
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSubcategory = subcategoryFilter.value;
    
    filteredProducts = products.filter(product => {
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
    
    renderProducts(filteredProducts);
}

// Clear all filters
function clearAllFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    subcategoryFilter.value = '';
    updateSubcategoryOptions('');
    filteredProducts = [...products];
    renderProducts(filteredProducts);
    
    // Add visual feedback
    clearFiltersBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clearFiltersBtn.style.transform = 'scale(1)';
    }, 150);
}

// Render products to the grid
function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productGrid.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }
    
    productGrid.style.display = 'grid';
    noProducts.style.display = 'none';
    
    productGrid.innerHTML = productsToRender.map(product => createProductCard(product)).join('');
    
    // Add stagger animation to product cards
    const cards = productGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Create individual product card HTML
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}" data-subcategory="${product.subcategory}">
            <div class="product-image">
                <i class="fas fa-gift"></i>
                <div class="moq-badge">MOQ: ${product.moq}</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <div class="product-category">${product.category} • ${product.subcategory}</div>
            </div>
        </div>
    `;
}

// Add intersection observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe sections for animations
    document.querySelectorAll('.delivery-info, .moq-info, .feature-card, .term-card').forEach(el => {
        observer.observe(el);
    });
};

// Initialize animations after DOM load
setTimeout(observeElements, 100);

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to delivery items
    document.querySelectorAll('.delivery-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
    
    // Add click animation to MOQ tiers
    document.querySelectorAll('.moq-tier').forEach(tier => {
        tier.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Add typing effect to search placeholder
    const searchPlaceholders = [
        "Search products... (e.g., diary, bottle, pen)",
        "Try searching for 'corporate gifts'...",
        "Find the perfect bulk items...",
        "Search by category or name..."
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        if (searchInput && document.activeElement !== searchInput) {
            placeholderIndex = (placeholderIndex + 1) % searchPlaceholders.length;
            searchInput.placeholder = searchPlaceholders[placeholderIndex];
        }
    }, 3000);
});

// Add smooth reveal animations
const addRevealAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .product-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .feature-card:hover .feature-icon,
        .term-card:hover .term-icon {
            transform: rotateY(180deg);
            transition: transform 0.6s ease;
        }
        
        .delivery-item:hover .delivery-icon {
            transform: scale(1.1) rotate(5deg);
        }
          .moq-tier:hover {
            box-shadow: 0 8px 25px rgba(26, 32, 44, 0.3);
        }
    `;
    document.head.appendChild(style);
};

addRevealAnimations();

// Performance optimization: Lazy loading for product images
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

// Add accessibility improvements
const addAccessibilityFeatures = () => {
    // Add keyboard navigation for product cards
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.classList.contains('product-card')) {
                e.target.click();
            }
        }
    });
      // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
        .product-card:focus,
        .delivery-item:focus,
        .moq-tier:focus,
        .feature-card:focus,
        .term-card:focus {
            outline: 2px solid #1a202c;
            outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
};

addAccessibilityFeatures();

// Add error handling for network issues
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // Could show a user-friendly error message here
});

// Export functions for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        products,
        filterProducts,
        createProductCard,
        clearAllFilters
    };
}

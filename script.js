// Fetch products from Supabase with pagination
const SUPABASE_URL = 'https://wpxgoxlfyscqgkppnnja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGdveGxmeXNjcWdrcHBubmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzg4NDAsImV4cCI6MjA2NzIxNDg0MH0.kJR8V_aZEFQ6EDNq4p0YVQjymGWnChRJCSW4cYeXqeA';
const PAGE_SIZE = 20;
let currentPage = 1;
let totalProducts = 0;
let supabaseClient;

async function initSupabase() {
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
        script.onload = () => {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            initializeApp();
        };
        document.head.appendChild(script);
    } else {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        initializeApp();
    }
}

async function initializeApp() {
    try {
        await Promise.all([
            loadCategories(),
            fetchAndRenderProducts()
        ]);
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadCategories() {
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categories) {
            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function fetchProducts(page = 1, search = '', category = '') {
    try {
        // If search is provided, get all products first (no pagination for search)
        // Otherwise use pagination for normal browsing
        let query = supabaseClient
            .from('products')
            .select(`
                *,
                categories:category_id(name),
                brands:brand_id(name)
            `, { count: 'exact' })
            .order('id', { ascending: false });

        // Apply category filter if specified
        if (category) {
            query = query.eq('category_id', category);
        }

        // For search, we need to get all data first, then filter
        if (search) {
            // Get all products to search through
            const { data: allData, count, error } = await query;
            if (error) throw error;

            const searchLower = search.toLowerCase();
            
            // Filter products that match search in name, category, or brand
            const filteredData = allData.filter(product => {
                const productName = product.product_name?.toLowerCase() || '';
                const categoryName = product.categories?.name?.toLowerCase() || '';
                const brandName = product.brands?.name?.toLowerCase() || '';
                
                return productName.includes(searchLower) || 
                       categoryName.includes(searchLower) || 
                       brandName.includes(searchLower);
            });

            // Apply pagination to filtered results
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE;
            const paginatedData = filteredData.slice(from, to);
            
            totalProducts = filteredData.length;
            return paginatedData;
        } else {
            // Normal pagination for browsing without search
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            
            query = query.range(from, to);
            const { data, count, error } = await query;
            if (error) throw error;
            
            totalProducts = count;
            return data;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function fetchAndRenderProducts(page = 1) {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const search = searchInput ? searchInput.value.trim() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    productsGrid.innerHTML = '<div class="loading">Loading...</div>';
    try {
        const products = await fetchProducts(page, search, category);
        renderProducts(products);
        renderPagination();
        resultsCount.textContent = `Showing ${products.length} of ${totalProducts} products`;
    } catch (e) {
        console.error('Error fetching products:', e);
        productsGrid.innerHTML = '<div class="no-products"><h3>Error loading products</h3></div>';
    }
}

let currentProducts = [];
let currentProductIndex = 0;
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let isSwipeGesture = false;

function renderProducts(products) {
    currentProducts = products; // Store products for modal navigation
    const productsGrid = document.getElementById('productsGrid');
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `<div class="no-products"><div class="no-products-icon"><i class="fas fa-search"></i></div><h3>No products found</h3><p>Try adjusting your search or filters</p></div>`;
        return;
    }
    
    // Get current search term for highlighting
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    productsGrid.innerHTML = products.map((product, index) => {
        const categoryName = product.categories?.name || 'Unknown Category';
        const brandName = product.brands?.name || 'Unknown Brand';
        
        // Highlight search matches
        const highlightText = (text, search) => {
            if (!search) return text;
            const regex = new RegExp(`(${search})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };
        
        const highlightedName = searchTerm ? highlightText(product.product_name, searchTerm) : product.product_name;
        const highlightedCategory = searchTerm ? highlightText(categoryName, searchTerm) : categoryName;
        const highlightedBrand = searchTerm ? highlightText(brandName, searchTerm) : brandName;
        
        return `
            <div class="product-card" data-category="${product.category_id}" onclick="openProductModal(${index})">
                <div class="product-image">
                    <img src="${product.product_image}" alt="${product.product_name}" style="width:100%;height:100%;object-fit:cover;" />
                </div>
                <div class="product-info">
                    <h3 class="product-name">${highlightedName}</h3>
                    <div class="product-meta">
                        <span class="product-brand">${highlightedBrand}</span>
                    </div>
                    <div class="product-price">₹${product.product_price}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateModalContent() {
    const product = currentProducts[currentProductIndex];
    
    if (!product) return;
    
    // Add a subtle fade effect during image change
    const modalImage = document.getElementById('modalProductImage');
    modalImage.style.opacity = '0.7';
    
    setTimeout(() => {
        // Update modal content
        modalImage.src = product.product_image;
        modalImage.alt = product.product_name;
        document.getElementById('modalProductName').textContent = product.product_name;
        document.getElementById('modalProductCategory').textContent = product.categories?.name || 'Unknown Category';
        document.getElementById('modalProductBrand').textContent = product.brands?.name || 'Unknown Brand';
        document.getElementById('modalProductPrice').textContent = `₹${product.product_price}`;
        
        // Handle discount
        const discountBadge = document.getElementById('modalProductDiscount');
        if (product.product_discount && product.product_discount > 0) {
            discountBadge.textContent = `${product.product_discount}% OFF`;
            discountBadge.style.display = 'inline-block';
        } else {
            discountBadge.style.display = 'none';
        }
        
        document.getElementById('modalProductDescription').textContent = product.product_description || 'No description available.';
        
        // Restore image opacity
        modalImage.style.opacity = '1';
    }, 150);
}

function openProductModal(index) {
    currentProductIndex = index;
    
    updateModalContent();
    
    // Show modal
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Update navigation buttons
    updateModalNavigation();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add touch event listeners for swiping (only once)
    setupModalTouchEvents();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
    
    // Remove touch event listeners
    removeModalTouchEvents();
}

function navigateProduct(direction) {
    const newIndex = currentProductIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentProducts.length) {
        currentProductIndex = newIndex;
        updateModalContent();
        updateModalNavigation();
    }
}

function updateModalNavigation() {
    const prevBtn = document.querySelector('.product-modal-nav.prev');
    const nextBtn = document.querySelector('.product-modal-nav.next');
    
    if (currentProductIndex <= 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.pointerEvents = 'none';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
    }
    
    if (currentProductIndex >= currentProducts.length - 1) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.pointerEvents = 'none';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
    }
}

// Touch/Swipe functionality - Enhanced for full modal area
let touchEventsAttached = false;

function setupModalTouchEvents() {
    // Prevent duplicate event listeners
    if (touchEventsAttached) {
        return;
    }
    
    const modalContent = document.querySelector('.product-modal-content');
    const modalBody = document.querySelector('.product-modal-body');
    
    // Add touch events to both modal content and body for better coverage
    modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    modalContent.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    modalBody.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalBody.addEventListener('touchend', handleTouchEnd, { passive: true });
    modalBody.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    touchEventsAttached = true;
}

function removeModalTouchEvents() {
    const modalContent = document.querySelector('.product-modal-content');
    const modalBody = document.querySelector('.product-modal-body');
    
    if (modalContent) {
        modalContent.removeEventListener('touchstart', handleTouchStart);
        modalContent.removeEventListener('touchend', handleTouchEnd);
        modalContent.removeEventListener('touchmove', handleTouchMove);
    }
    
    if (modalBody) {
        modalBody.removeEventListener('touchstart', handleTouchStart);
        modalBody.removeEventListener('touchend', handleTouchEnd);
        modalBody.removeEventListener('touchmove', handleTouchMove);
    }
    
    touchEventsAttached = false;
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX = 0;
    touchEndY = 0;
    isSwipeGesture = false;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const deltaX = Math.abs(currentX - touchStartX);
    const deltaY = Math.abs(currentY - touchStartY);
    
    // Determine if this is a horizontal swipe gesture
    if (deltaX > deltaY && deltaX > 20) {
        isSwipeGesture = true;
        e.preventDefault(); // Prevent scrolling during horizontal swipe
    }
}

function handleTouchEnd(e) {
    if (!touchStartX) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    // Only handle swipe if it was detected as a swipe gesture
    if (isSwipeGesture) {
        handleSwipe();
    }
    
    // Reset touch coordinates
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
    isSwipeGesture = false;
}

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - go to previous
            navigateProduct(-1);
        } else {
            // Swipe left - go to next
            navigateProduct(1);
        }
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('productModal');
    if (modal.classList.contains('active')) {
        switch(e.key) {
            case 'Escape':
                closeProductModal();
                break;
            case 'ArrowLeft':
                navigateProduct(-1);
                break;
            case 'ArrowRight':
                navigateProduct(1);
                break;
        }
    }
});

// Close modal when clicking outside content
document.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductModal();
    }
});

function renderPagination() {
    // Remove any existing pagination
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
    if (totalPages <= 1) return;
    
    const productsGrid = document.getElementById('productsGrid');
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    let paginationHtml = '<div class="pagination">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHtml += `<button class="pagination-btn" data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHtml += `<button class="pagination-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHtml += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `<button class="pagination-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += '<span class="pagination-ellipsis">...</span>';
        }
        paginationHtml += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHtml += `<button class="pagination-btn" data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHtml += '</div>';
    paginationContainer.innerHTML = paginationHtml;
    
    productsGrid.parentNode.insertBefore(paginationContainer, productsGrid.nextSibling);
    
    // Add event listeners
    paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.onclick = (e) => {
            const page = parseInt(e.target.closest('.pagination-btn').getAttribute('data-page'));
            if (page && page !== currentPage) {
                currentPage = page;
                fetchAndRenderProducts(currentPage);
            }
        };
    });
}

// Debounce function for search optimization
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

// Setup event listeners for search and filter
function setupProductEvents() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
      // Debounced search function - faster response for enhanced search
    const debouncedSearch = debounce(() => {
        currentPage = 1;
        fetchAndRenderProducts();
    }, 200);
    
    if (searchInput) {
        searchInput.addEventListener('input', debouncedSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentPage = 1;
                fetchAndRenderProducts();
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => { 
            currentPage = 1; 
            fetchAndRenderProducts(); 
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
    setupProductEvents();
});

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

// Handle window resize with debouncing
const handleResize = debounce(function() {
    // Recreate mobile filter toggle if needed
    const existingToggle = document.querySelector('.mobile-filter-toggle');
    if (existingToggle) {
        existingToggle.remove();
    }
    
    // Reset filter display
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        if (window.innerWidth > 768) {
            filterSection.style.display = 'flex';
        } else {
            createMobileFilterToggle();
        }
    }
}, 250);

window.addEventListener('resize', handleResize);

// Loading state management
function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading"></div>
            <p>Loading products...</p>
        </div>
    `;
}

// Mobile filter toggle functionality
function createMobileFilterToggle() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-filter-toggle';
    toggleBtn.innerHTML = `
        <i class="fas fa-filter"></i>
        <span>Filters</span>
        <i class="fas fa-chevron-down"></i>
    `;
    
    // Insert before filter section
    filterSection.parentNode.insertBefore(toggleBtn, filterSection);
    
    // Initially hide filters on mobile
    if (window.innerWidth <= 768) {
        filterSection.style.display = 'none';
    }
    
    // Toggle functionality
    toggleBtn.addEventListener('click', function() {
        const isHidden = filterSection.style.display === 'none';
        filterSection.style.display = isHidden ? 'flex' : 'none';
        
        const chevron = toggleBtn.querySelector('.fa-chevron-down');
        chevron.classList.toggle('fa-chevron-up', isHidden);
        chevron.classList.toggle('fa-chevron-down', !isHidden);
    });
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

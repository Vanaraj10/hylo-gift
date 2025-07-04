// Fetch products from Supabase with pagination
const SUPABASE_URL = 'https://wpxgoxlfyscqgkppnnja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGdveGxmeXNjcWdrcHBubmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzg4NDAsImV4cCI6MjA2NzIxNDg0MH0.kJR8V_aZEFQ6EDNq4p0YVQjymGWnChRJCSW4cYeXqeA';
const PAGE_SIZE = 16;
let currentPage = 1;
let totalProducts = 0;
let supabaseClient;

async function initSupabase() {
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
        script.onload = () => {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            fetchAndRenderProducts();
        };
        document.head.appendChild(script);
    } else {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        fetchAndRenderProducts();
    }
}

async function fetchProducts(page = 1, search = '', category = '') {
    let from = (page - 1) * PAGE_SIZE;
    let to = from + PAGE_SIZE - 1;
    let query = supabaseClient.from('products').select('*', { count: 'exact' }).order('id', { ascending: false }).range(from, to);
    if (search) {
        query = query.ilike('product_name', `%${search}%`);
    }
    if (category) {
        query = query.eq('product_category', category);
    }
    const { data, count, error } = await query;
    if (error) throw error;
    totalProducts = count;
    return data;
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
        productsGrid.innerHTML = '<div class="no-products"><h3>Error loading products</h3></div>';
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `<div class="no-products"><div class="no-products-icon"><i class="fas fa-search"></i></div><h3>No products found</h3><p>Try adjusting your search or filters</p></div>`;
        return;
    }
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.product_category}">
            <div class="product-image">
                <img src="${product.product_image}" alt="${product.product_name}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.product_name}</h3>
                <div class="product-price">₹${product.product_price}</div>
            </div>
        </div>
    `).join('');
}

function renderPagination() {
    const productsGrid = document.getElementById('productsGrid');
    let totalPages = Math.ceil(totalProducts / PAGE_SIZE);
    if (totalPages <= 1) return;
    let paginationHtml = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button class="pagination-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationHtml += '</div>';
    productsGrid.insertAdjacentHTML('afterend', paginationHtml);
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.onclick = (e) => {
            currentPage = parseInt(e.target.getAttribute('data-page'));
            fetchAndRenderProducts(currentPage);
        };
    });
}

// Setup event listeners for search and filter
function setupProductEvents() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; fetchAndRenderProducts(); });
    if (categoryFilter) categoryFilter.addEventListener('change', () => { currentPage = 1; fetchAndRenderProducts(); });
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

// admin.js - Enhanced Admin Panel with Categories and Brands Management
// --- CONFIGURE THESE ---
const SUPABASE_URL = 'https://wpxgoxlfyscqgkppnnja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGdveGxmeXNjcWdrcHBubmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzg4NDAsImV4cCI6MjA2NzIxNDg0MH0.kJR8V_aZEFQ6EDNq4p0YVQjymGWnChRJCSW4cYeXqeA';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dqfsza8e6/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'HyLoApp';

// --- Supabase Client ---
let supabase;
let editingId = null;
let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;
let totalProducts = 0;
let currentSearch = '';

// --- DOM Elements ---
const productForm = document.getElementById('productForm');
const productsTbody = document.getElementById('productsTbody');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const categorySelect = document.getElementById('productCategory');
const brandSelect = document.getElementById('productBrand');

// --- Initialize ---
function loadSupabase() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    script.onload = () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        initializeApp();
    };
    document.head.appendChild(script);
}

async function initializeApp() {
    try {
        await Promise.all([
            loadCategories(),
            loadBrands(),
            loadProducts()
        ]);        setupEventListeners();
        setupSearchListener();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Set up search input listener with debouncing
function setupSearchListener() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchImmediate();
            }
        });
    }
}

// --- Cloudinary Upload ---
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error('Image upload failed: ' + errText);
    }
    const data = await res.json();
    if (!data.secure_url) throw new Error('Cloudinary did not return a URL.');
    return data.secure_url;
}

// --- CATEGORY MANAGEMENT ---
async function loadCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        // Update dropdown
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
        
        // Update category list display
        updateCategoryList(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function updateCategoryList(categories) {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.innerHTML = categories.map(cat => `
        <span class="tag category-tag">
            <span class="tag-name" data-id="${cat.id}">${cat.name}</span>
            <button class="tag-edit" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')" title="Edit category">
                <i class="fas fa-edit"></i>
            </button>
            <button class="tag-delete" onclick="deleteCategory(${cat.id})" title="Delete category">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

async function addCategory() {
    const input = document.getElementById('newCategoryInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name }])
            .select()
            .single();
        
        if (error) throw error;
        
        input.value = '';
        await loadCategories();
        
        // Auto-select the new category
        categorySelect.value = data.id;
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category: ' + error.message);
    }
}

async function deleteCategory(id) {
    if (!confirm('Delete this category? This will affect all products using this category.')) return;
    
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category: ' + error.message);
    }
}

async function editCategory(id, currentName) {
    const newName = prompt('Edit category name:', currentName);
    
    if (!newName || !newName.trim()) {
        return; // User cancelled or entered empty name
    }
    
    if (newName.trim() === currentName) {
        return; // No changes made
    }
    
    try {
        const { error } = await supabase
            .from('categories')
            .update({ name: newName.trim() })
            .eq('id', id);
        
        if (error) throw error;
        
        await loadCategories();
        
    } catch (error) {
        console.error('Error updating category:', error);
        alert('Error updating category: ' + error.message);
    }
}

// --- BRAND MANAGEMENT ---
async function loadBrands() {
    try {
        const { data: brands, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        // Update dropdown
        brandSelect.innerHTML = '<option value="">Select Brand</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id;
            option.textContent = brand.name;
            brandSelect.appendChild(option);
        });
        
        // Update brand list display
        updateBrandList(brands);
        
        // Initialize collapsed state
        initializeBrandSectionState();
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

// Brand search functionality
function filterBrands(searchTerm) {
    const brandItems = document.querySelectorAll('.brand-item');
    const searchLower = searchTerm.toLowerCase();
    
    brandItems.forEach(item => {
        const brandName = item.querySelector('.brand-name').textContent.toLowerCase();
        
        if (brandName.includes(searchLower)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Show/hide brand search based on brand count
function toggleBrandSearch() {
    const brandSearch = document.getElementById('brandSearch');
    const brandCount = document.getElementById('brandCount');
    
    if (brandSearch && brandCount) {
        const count = parseInt(brandCount.textContent) || 0;
        if (count > 6) {
            brandSearch.style.display = 'block';
        } else {
            brandSearch.style.display = 'none';
        }
    }
}

// Enhanced updateBrandList function
function updateBrandList(brands) {
    const brandList = document.getElementById('brandList');
    const brandCount = document.getElementById('brandCount');
    
    if (!brandList) return;
    
    // Update brand count
    if (brandCount) {
        brandCount.textContent = brands.length;
    }
    
    // Toggle search visibility
    toggleBrandSearch();
    
    if (brands.length === 0) {
        brandList.innerHTML = `
            <div class="brand-list-empty">
                <i class="fas fa-trademark"></i>
                <p>No brands added yet</p>
                <small>Add your first brand using the form above</small>
            </div>
        `;
        return;
    }
    
    brandList.innerHTML = brands.map(brand => `
        <div class="brand-item" data-brand-id="${brand.id}" title="${brand.name}">
            <div class="brand-info">
                ${brand.logo ? 
                    `<img src="${brand.logo}" alt="${brand.name}" class="brand-logo-small">` : 
                    '<div class="brand-logo-placeholder"><i class="fas fa-image"></i></div>'
                }
                <span class="brand-name">${brand.name}</span>
            </div>
            <div class="brand-actions">
                <button class="action-btn edit-btn" onclick="editBrand(${brand.id}, '${brand.name.replace(/'/g, "\\'")}')" title="Edit brand name">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn upload-btn" onclick="uploadBrandLogo(${brand.id})" title="Upload/Change logo">
                    <i class="fas fa-upload"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteBrand(${brand.id})" title="Delete brand">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function addBrand() {
    const input = document.getElementById('newBrandInput');
    const logoInput = document.getElementById('newBrandLogo');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a brand name');
        return;
    }
    
    try {
        let logoUrl = null;
        
        // Upload logo if provided
        if (logoInput && logoInput.files && logoInput.files[0]) {
            try {
                logoUrl = await uploadImage(logoInput.files[0]);
            } catch (error) {
                console.error('Error uploading logo:', error);
                alert('Error uploading logo: ' + error.message);
                return;
            }
        }
        
        const { data, error } = await supabase
            .from('brands')
            .insert([{ name, logo: logoUrl }])
            .select()
            .single();
        
        if (error) throw error;
        
        input.value = '';
        if (logoInput) logoInput.value = '';
        await loadBrands();
        
        // Auto-select the new brand
        brandSelect.value = data.id;
    } catch (error) {
        console.error('Error adding brand:', error);
        alert('Error adding brand: ' + error.message);
    }
}

async function deleteBrand(id) {
    if (!confirm('Delete this brand? This will affect all products using this brand.')) return;
    
    try {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadBrands();
    } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Error deleting brand: ' + error.message);
    }
}

async function editBrand(id, currentName) {
    const newName = prompt('Edit brand name:', currentName);
    
    if (!newName || !newName.trim()) {
        return; // User cancelled or entered empty name
    }
    
    if (newName.trim() === currentName) {
        return; // No changes made
    }
    
    try {
        const { error } = await supabase
            .from('brands')
            .update({ name: newName.trim() })
            .eq('id', id);
        
        if (error) throw error;
        
        await loadBrands();
        
    } catch (error) {
        console.error('Error updating brand:', error);
        alert('Error updating brand: ' + error.message);
    }
}

async function uploadBrandLogo(brandId) {
    // Create a file input element dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Show loading state
            const brandItem = document.querySelector(`[data-brand-id="${brandId}"]`);
            if (brandItem) {
                brandItem.style.opacity = '0.6';
            }
            
            // Upload image to Cloudinary
            const logoUrl = await uploadImage(file);
            
            // Update brand in database
            const { error } = await supabase
                .from('brands')
                .update({ logo: logoUrl })
                .eq('id', brandId);
            
            if (error) throw error;
            
            // Reload brands to show updated logo
            await loadBrands();
            
            alert('Brand logo uploaded successfully!');
            
        } catch (error) {
            console.error('Error uploading brand logo:', error);
            alert('Error uploading logo: ' + error.message);
            
            // Reset loading state
            const brandItem = document.querySelector(`[data-brand-id="${brandId}"]`);
            if (brandItem) {
                brandItem.style.opacity = '1';
            }
        }
    };
    
    // Trigger file selection
    fileInput.click();
}

// --- PRODUCT MANAGEMENT ---
async function loadProducts(page = 1, search = '') {
    try {
        currentPage = page;
        currentSearch = search;
        
        const from = (page - 1) * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;
        
        productsTbody.innerHTML = '<tr><td colspan="9" class="loading">Loading products...</td></tr>';
        
        let query = supabase
            .from('products')
            .select(`
                *,
                categories:category_id(name),
                brands:brand_id(name)
            `, { count: 'exact' })
            .order('id', { ascending: false })
            .range(from, to);
            
        if (search) {
            query = query.ilike('product_name', `%${search}%`);
        }
        
        const { data, count, error } = await query;
        
        if (error) throw error;
        
        totalProducts = count;
        
        if (!data || data.length === 0) {
            productsTbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No products found</td></tr>';
            updatePagination();
            updateProductsInfo();
            return;
        }
          // Update desktop table
        productsTbody.innerHTML = data.map(product => `
            <tr>
                <td><img src="${product.product_image}" alt="${product.product_name}"></td>
                <td><strong>${product.product_name}</strong></td>
                <td><strong>₹${product.product_price}</strong></td>
                <td>${product.product_discount || 0}%</td>
                <td>${product.product_moq || 1}</td>
                <td><span class="tag" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${product.categories?.name || 'N/A'}</span></td>
                <td><span class="tag brand-tag" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${product.brands?.name || 'N/A'}</span></td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${product.product_description}">${product.product_description}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        updatePagination();
        updateProductsInfo();
        
    } catch (error) {
        console.error('Error loading products:', error);
        productsTbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--danger-color);">Error loading products</td></tr>';
        updatePagination();
        updateProductsInfo();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
            ${i}
        </button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

function updateProductsInfo() {
    const productsInfo = document.getElementById('productsInfo');
    if (!productsInfo) return;
    
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
    const end = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);
    
    if (totalProducts === 0) {
        productsInfo.textContent = 'No products found';
    } else {
        productsInfo.textContent = `Showing ${start}-${end} of ${totalProducts} products`;
    }
}

function changePage(page) {
    loadProducts(page, currentSearch);
}

// Search with debouncing
let searchTimeout;
function handleSearch() {
    const searchInput = document.getElementById('productSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    searchTimeout = setTimeout(() => {
        loadProducts(1, searchTerm);
    }, 300); // Wait 300ms after user stops typing
}

function handleSearchImmediate() {
    const searchInput = document.getElementById('productSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    loadProducts(1, searchTerm);
}

// --- Add/Update Product ---
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const categoryId = categorySelect.value;
    const brandId = brandSelect.value;
    
    if (!categoryId || !brandId) {
        alert('Please select both category and brand');
        return;
    }
      submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = editingId ? '<i class="fas fa-spinner fa-spin"></i> Updating...' : '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    try {        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
        const moq = parseInt(document.getElementById('productMOQ').value) || 1;
        const description = document.getElementById('productDescription').value.trim();
        
        let imageUrl = '';
        if (!editingId || document.getElementById('productImage').files[0]) {
            const file = document.getElementById('productImage').files[0];
            if (!file) throw new Error('Image required');
            imageUrl = await uploadImage(file);
        } else {
            imageUrl = document.getElementById('productImage').getAttribute('data-current-url');
        }
          const productData = {
            product_name: name,
            product_price: price,
            product_discount: discount,
            product_moq: moq,
            category_id: parseInt(categoryId),
            brand_id: parseInt(brandId),
            product_description: description,
            product_image: imageUrl
        };
        
        let res;
        if (editingId) {
            res = await supabase.from('products').update(productData).eq('id', editingId);
        } else {
            res = await supabase.from('products').insert([productData]);
        }
        
        if (res.error) throw new Error(res.error.message);
          productForm.reset();
        editingId = null;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
        await loadProducts();
        
    } catch (err) {
        console.error('Error saving product:', err);
        alert('Error: ' + err.message);
    } finally {
        submitBtn.innerHTML = editingId ? '<i class="fas fa-edit"></i> Update Product' : '<i class="fas fa-plus"></i> Add Product';
        submitBtn.disabled = false;
    }
}

// --- Edit/Delete Product Functions ---
async function editProduct(id) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
          // Fill form with product data
        document.getElementById('productName').value = data.product_name;
        document.getElementById('productPrice').value = data.product_price;
        document.getElementById('productDiscount').value = data.product_discount || 0;
        document.getElementById('productMOQ').value = data.product_moq || 1;
        document.getElementById('productCategory').value = data.category_id;
        document.getElementById('productBrand').value = data.brand_id;
        document.getElementById('productDescription').value = data.product_description;
        
        // Set current image URL for reference
        const imageInput = document.getElementById('productImage');
        imageInput.setAttribute('data-current-url', data.product_image);
        
        // Update form state
        editingId = id;
        submitBtn.innerHTML = '<i class="fas fa-edit"></i> Update Product';
        
        // Scroll to form
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Error loading product: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
}

// --- Reset Form ---
function resetForm() {
    productForm.reset();
    editingId = null;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    document.getElementById('productImage').setAttribute('required', 'required');
}

// --- COLLAPSIBLE BRAND SECTION ---
function toggleBrandSection() {
    const section = document.getElementById('brandManagementSection');
    const content = section.querySelector('.management-content');
    const icon = section.querySelector('.collapse-icon');
    
    section.classList.toggle('collapsed');
    
    if (section.classList.contains('collapsed')) {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        icon.style.transform = 'rotate(-90deg)';
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Initialize brand section collapse state
function initializeBrandSectionState() {
    setTimeout(() => {
        const brandCount = document.getElementById('brandCount');
        const section = document.getElementById('brandManagementSection');
        
        if (brandCount && section) {
            const count = parseInt(brandCount.textContent) || 0;
            // Auto-collapse if there are many brands (more than 8)
            if (count > 8) {
                section.classList.add('collapsed');
                const content = section.querySelector('.management-content');
                const icon = section.querySelector('.collapse-icon');
                
                if (content && icon) {
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    icon.style.transform = 'rotate(-90deg)';
                }
            }
        }
    }, 100);
}

// --- START APPLICATION ---
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', loadSupabase);
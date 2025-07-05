# HyLoApp - Bulk Gift Solution

## Overview
Modern, mobile-friendly product catalog with admin panel for bulk gift solutions. Built with Supabase for database and Cloudinary for image storage.

## Features
- **Dynamic Product Catalog**: Browse products with category and brand filtering
- **Admin Panel**: Complete CRUD operations for products, categories, and brands
- **Image Management**: Cloudinary integration for optimized image storage
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Updates**: Instant UI updates when managing data

## Setup Instructions

### 1. Database Setup
1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `setup_database.sql`
4. Run the script to create categories and brands tables

### 2. Admin Panel Features
- **Product Management**: Add, edit, delete products with image upload
- **Category Management**: Quick add/remove categories with "+" buttons
- **Brand Management**: Quick add/remove brands with "+" buttons
- **Auto-selection**: Newly created categories/brands are auto-selected

### 3. Frontend Features
- **Dynamic Filtering**: Categories and brands loaded from database
- **Search Functionality**: Search products by name
- **Responsive Design**: Optimized for mobile and desktop
- **Modern UI**: Clean, professional appearance

## File Structure
```
/
├── index.html          # Frontend catalog
├── script.js           # Frontend logic
├── styles.css          # Styling
├── admin/
│   ├── index.html      # Admin panel
│   └── admin.js        # Admin logic
├── setup_database.sql  # Database setup script
└── README.md           # This file
```

## Database Schema

### Products Table
- `id` (Primary Key)
- `product_name`
- `product_price`
- `product_discount`
- `product_description`
- `product_image` (Cloudinary URL)
- `category_id` (Foreign Key → categories.id)
- `brand_id` (Foreign Key → brands.id)

### Categories Table
- `id` (Primary Key)
- `name` (Unique)
- `created_at`

### Brands Table
- `id` (Primary Key)
- `name` (Unique)
- `created_at`

## Configuration

### Supabase Configuration
Update the following constants in both `script.js` and `admin/admin.js`:
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### Cloudinary Configuration
Update in `admin/admin.js`:
```javascript
const CLOUDINARY_URL = 'your-cloudinary-url';
const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';
```

## Usage

### Admin Panel
1. Open `admin/index.html`
2. Add categories and brands using the "+" buttons
3. Create products with proper category and brand assignment
4. Images are automatically uploaded to Cloudinary

### Frontend
1. Open `index.html`
2. Browse products with dynamic filtering
3. Search functionality works across product names
4. Mobile-responsive design adapts to all screen sizes

## Migration from Old Version
If you had products with hardcoded categories:
1. Run the database setup script
2. Manually update existing products to use category_id and brand_id
3. The new system will automatically populate dropdowns

## Support
For issues or questions, check the browser console for error messages and ensure all API keys are correctly configured.

// Test Database Connection and Permissions
// Open this in browser console or create a test HTML file

const SUPABASE_URL = 'https://wpxgoxlfyscqgkppnnja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGdveGxmeXNjcWdrcHBubmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzg4NDAsImV4cCI6MjA2NzIxNDg0MH0.kJR8V_aZEFQ6EDNq4p0YVQjymGWnChRJCSW4cYeXqeA';

// Load Supabase
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
script.onload = async () => {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Testing database connection...');
    
    // Test 1: Check if tables exist
    try {
        const { data: categories, error: catError } = await supabase.from('categories').select('*').limit(1);
        if (catError) {
            console.error('Categories table error:', catError);
        } else {
            console.log('✅ Categories table accessible:', categories);
        }
    } catch (e) {
        console.error('❌ Categories table failed:', e);
    }
    
    // Test 2: Try to insert a test category
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: 'Test Category ' + Date.now() }])
            .select();
        
        if (error) {
            console.error('❌ Insert failed:', error);
        } else {
            console.log('✅ Insert successful:', data);
            
            // Clean up test data
            await supabase.from('categories').delete().eq('id', data[0].id);
            console.log('✅ Cleanup successful');
        }
    } catch (e) {
        console.error('❌ Insert test failed:', e);
    }
};
document.head.appendChild(script);

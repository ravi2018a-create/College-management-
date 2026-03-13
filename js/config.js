// Supabase Configuration
const SUPABASE_URL = 'https://qumvgdhznkmlccexoawo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bXZnZGh6bmttbGNjZXhvYXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzODU5MTEsImV4cCI6MjA4ODk2MTkxMX0.fDK7bJMVyTWEgiq84EZ6lSscmHAgVSjKpDZ7iqjijFU';

// Database table names
const TABLES = {
    USERS: 'users',
    CHAIN: 'chain_management',
    DEPARTMENTS: 'departments',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
    BOOKS: 'library_books',
    BOOK_ISSUES: 'book_issues',
    HOSTELS: 'hostels',
    HOSTEL_ALLOCATIONS: 'hostel_allocations',
    FEES: 'fee_records',
    ADMISSIONS: 'admissions',
    SCHOLARSHIPS: 'scholarships',
    BENEFITS: 'benefits',
    REGISTRAR_STAFF: 'registrar_staff'
};

// Fee password for accounts module (change this in production)
const FEE_MODULE_PASSWORD = 'admin123';

// Demo mode for authentication - uses demo credentials
// Set to false only if you have created users in Supabase Auth
const DEMO_MODE = true;

let supabaseClient = null;

// Initialize Supabase client for database operations
try {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase database connected');
    }
} catch (error) {
    console.warn('Failed to initialize Supabase:', error);
}

// Export configuration
window.CMS_CONFIG = {
    supabase: supabaseClient,
    TABLES,
    FEE_MODULE_PASSWORD,
    DEMO_MODE
};

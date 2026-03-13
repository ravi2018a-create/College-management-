// Authentication Module

// Current user state
let currentUser = null;

// Demo users for testing - Each role has specific credentials
const DEMO_USERS = [
    { email: 'chairman@college.com', password: 'chairman123', name: 'Dr. Robert Smith', role: 'chairman' },
    { email: 'principal@college.com', password: 'principal123', name: 'Dr. Sarah Johnson', role: 'principal' },
    { email: 'registrar@college.com', password: 'registrar123', name: 'Mr. John Davis', role: 'registrar' },
    { email: 'hod@college.com', password: 'hod123', name: 'Dr. Anil Kumar', role: 'hod' },
    { email: 'teacher@college.com', password: 'teacher123', name: 'Prof. Emily Wilson', role: 'teacher' },
    { email: 'librarian@college.com', password: 'librarian123', name: 'Mrs. Mary Thomas', role: 'librarian' },
    { email: 'accountant@college.com', password: 'accountant123', name: 'Mr. James Anderson', role: 'accountant' },
    { email: 'warden@college.com', password: 'warden123', name: 'Mr. Rajesh Kumar', role: 'hostel_warden' },
    { email: 'admission@college.com', password: 'admission123', name: 'Ms. Priya Sharma', role: 'admission_staff' }
];

// Initialize authentication
function initAuth() {
    // Check for existing session
    const savedUser = localStorage.getItem('cms_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    if (!email || !password || !role) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        // Demo mode login - validate credentials and role
        const user = DEMO_USERS.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Check if selected role matches user's role
            if (user.role !== role) {
                showToast('Invalid role for this user. Use: ' + user.role, 'error');
                return;
            }
            
            currentUser = {
                id: generateId('USR'),
                email: user.email,
                name: user.name,
                role: user.role
            };
            
            localStorage.setItem('cms_user', JSON.stringify(currentUser));
            showToast('Welcome, ' + user.name + '!', 'success');
            showDashboard();
        } else {
            showToast('Invalid email or password', 'error');
        }
    } else {
        // Supabase authentication
        try {
            const { data, error } = await window.CMS_CONFIG.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                showToast(error.message, 'error');
                return;
            }
            
            // Get user profile
            const { data: profile, error: profileError } = await window.CMS_CONFIG.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            
            if (profileError) {
                console.error('Profile fetch error:', profileError);
            }
            
            currentUser = {
                id: data.user.id,
                email: email,
                name: profile?.name || email.split('@')[0],
                role: role
            };
            
            localStorage.setItem('cms_user', JSON.stringify(currentUser));
            showToast('Login successful!', 'success');
            showDashboard();
            
        } catch (err) {
            console.error('Login error:', err);
            showToast('Login failed. Please try again.', 'error');
        }
    }
}

// Handle logout
async function handleLogout() {
    if (!window.CMS_CONFIG.DEMO_MODE) {
        try {
            await window.CMS_CONFIG.supabase.auth.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        }
    }
    
    currentUser = null;
    localStorage.removeItem('cms_user');
    showToast('Logged out successfully', 'success');
    showLogin();
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainDashboard').style.display = 'flex';
    
    // Update user info in UI
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = capitalizeRole(currentUser.role);
    }
    
    // Initialize modules
    initializeModules();
}

// Show login
function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('mainDashboard').style.display = 'none';
}

// Capitalize role
function capitalizeRole(role) {
    return role.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user has role
function hasRole(roles) {
    if (!currentUser) return false;
    if (typeof roles === 'string') {
        return currentUser.role === roles;
    }
    return roles.includes(currentUser.role);
}

// Export auth functions
window.CMS_AUTH = {
    initAuth,
    handleLogin,
    handleLogout,
    getCurrentUser,
    hasRole,
    showDashboard,
    showLogin
};

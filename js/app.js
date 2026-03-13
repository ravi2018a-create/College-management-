// Main Application Script

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initAuth();
    
    // Setup navigation
    setupNavigation();
    
    // Setup responsive menu
    setupResponsiveMenu();
    
    // Setup tabs
    setupTabs();
    
    // Close modal on outside click
    document.getElementById('modalContainer').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get module name
            const moduleName = this.getAttribute('data-module');
            
            // Switch module
            switchModule(moduleName);
        });
    });
}

// Switch between modules
function switchModule(moduleName) {
    // Hide all modules
    const modules = document.querySelectorAll('.module');
    modules.forEach(mod => mod.classList.remove('active'));
    
    // Show selected module
    const selectedModule = document.getElementById(moduleName + 'Module');
    if (selectedModule) {
        selectedModule.classList.add('active');
    }
    
    // Update page title
    const pageTitles = {
        'dashboard': 'Dashboard',
        'chain': 'Chain Management',
        'departments': 'Department Management',
        'registrar': 'Registrar Office',
        'admission': 'Admission Cell',
        'students': 'Student Management',
        'teachers': 'Teacher Management',
        'library': 'Library Management',
        'hostel': 'Hostel Management',
        'accounts': 'Fee Management'
    };
    
    document.getElementById('pageTitle').textContent = pageTitles[moduleName] || 'Dashboard';
    
    // Load module data
    loadModuleData(moduleName);
    
    // Close sidebar on mobile
    if (window.innerWidth <= 992) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

// Load module-specific data
function loadModuleData(moduleName) {
    switch(moduleName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'chain':
            loadChainData();
            break;
        case 'departments':
            loadDepartmentsData();
            break;
        case 'registrar':
            loadRegistrarData();
            break;
        case 'admission':
            loadAdmissionData();
            break;
        case 'students':
            loadStudentsData();
            break;
        case 'teachers':
            loadTeachersData();
            break;
        case 'library':
            loadLibraryData();
            break;
        case 'hostel':
            loadHostelData();
            break;
        case 'accounts':
            // Don't auto-load, requires authentication
            break;
    }
}

// Initialize all modules
function initializeModules() {
    // Load dashboard by default
    loadDashboardData();
    loadChainData();
    loadDepartmentsData();
}

// Setup responsive menu toggle
function setupResponsiveMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
    }

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            if (sidebar) {
                sidebar.classList.remove('active');
            }
            sidebarOverlay.classList.remove('active');
        });
    }

    // Close sidebar when clicking nav item on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        });
    });
}

// Setup tabs
function setupTabs() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            const tabContainer = e.target.closest('.card-body');
            const tabName = e.target.getAttribute('data-tab');
            
            // Remove active from all tab buttons in this container
            tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active to clicked button
            e.target.classList.add('active');
            
            // Hide all tab panes in this container
            tabContainer.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Show selected tab pane
            const selectedPane = document.getElementById(tabName + 'Tab');
            if (selectedPane) {
                selectedPane.classList.add('active');
            }
        }
    });
}

// Global record management functions
let currentRecordType = '';
let currentRecordId = '';

function viewRecord(id) {
    console.log('View record:', id);
    showToast('View feature - Record ID: ' + id, 'success');
}

function editRecord(id) {
    console.log('Edit record:', id);
    showToast('Edit feature - Record ID: ' + id, 'success');
}

function deleteRecord(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        console.log('Delete record:', id);
        showToast('Record deleted successfully', 'success');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

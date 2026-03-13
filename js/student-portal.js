// Student Portal JavaScript

// Student State
let currentStudent = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initStudentPortal();
});

// Initialize Student Portal
function initStudentPortal() {
    setupEventListeners();
    checkStudentSession();
}

// Setup Event Listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('studentLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleStudentLogin);
    }

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.dataset.module;
            if (module) {
                switchModule(module);
                // Close sidebar on mobile after selecting
                if (window.innerWidth <= 992) {
                    const sidebar = document.querySelector('.sidebar');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (sidebar) sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                }
            }
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('studentLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.toggle('active');
                }
            }
        });
    }

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
            sidebarOverlay.classList.remove('active');
        });
    }
}

// Check if student is already logged in
function checkStudentSession() {
    const savedStudent = localStorage.getItem('currentStudent');
    if (savedStudent) {
        currentStudent = JSON.parse(savedStudent);
        showDashboard();
        loadAllModuleData();
    }
}

// Handle Student Login
async function handleStudentLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('studentEmail').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showToast('Please enter both Email and Password', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        // Try to find student in database
        if (typeof supabase !== 'undefined' && window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data: student, error } = await window.CMS_CONFIG.supabase
                .from('students')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (student) {
                // Check password from database (password_hash field) or accept default
                const validPassword = student.password_hash 
                    ? (password === student.password_hash) 
                    : (password === 'student123');
                    
                if (validPassword) {
                    currentStudent = student;
                    localStorage.setItem('currentStudent', JSON.stringify(student));
                    showDashboard();
                    loadAllModuleData();
                    showToast('Welcome back, ' + student.name + '!', 'success');
                } else {
                    showToast('Invalid password', 'error');
                }
            } else {
                showToast('Student not found. Please register first.', 'error');
            }
        } else {
            showToast('Database connection error. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('studentLoginSection').style.display = 'none';
    document.getElementById('studentDashboard').style.display = 'flex';
    
    // Update student name in header
    const studentNameEl = document.getElementById('studentName');
    if (studentNameEl && currentStudent) {
        studentNameEl.textContent = currentStudent.name;
    }
    
    // Show profile module by default
    switchModule('profile');
}

// Handle Logout
function handleLogout() {
    currentStudent = null;
    localStorage.removeItem('currentStudent');
    document.getElementById('studentDashboard').style.display = 'none';
    document.getElementById('studentLoginSection').style.display = 'flex';
    showToast('Logged out successfully', 'success');
}

// Switch Module
function switchModule(moduleName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === moduleName) {
            item.classList.add('active');
        }
    });

    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
        module.style.display = 'none';
    });

    // Show selected module
    const selectedModule = document.getElementById(moduleName + 'Module');
    if (selectedModule) {
        selectedModule.classList.add('active');
        selectedModule.style.display = 'block';
    }

    // Update header title
    const titles = {
        'profile': 'My Profile',
        'organization': 'College Organization',
        'fees': 'Fee Status',
        'library': 'Library',
        'hostel': 'Hostel',
        'scholarship': 'Scholarships',
        'notices': 'Notices',
        'staff': 'Staff Directory'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[moduleName] || 'Dashboard';
    }
    
    // Load module-specific data when switching
    if (moduleName === 'organization') {
        loadOrganizationData();
    } else if (moduleName === 'library') {
        loadLibraryCatalog();
    } else if (moduleName === 'hostel') {
        loadHostelOptions();
    } else if (moduleName === 'notices') {
        loadStudentNotices();
    }

    // Scroll to top of content area
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);
}

// Load All Module Data
function loadAllModuleData() {
    loadProfileData();
    loadOrganizationData();
    loadFeeData();
    loadLibraryData();
    loadLibraryCatalog();
    loadHostelData();
    loadHostelOptions();
    loadScholarshipData();
    loadNoticesData();
    loadStaffData();
}

// Load Profile Data
function loadProfileData() {
    if (!currentStudent) return;

    // Update profile header
    const profileName = document.getElementById('profileName');
    const profileId = document.getElementById('profileId');
    const profileDept = document.getElementById('profileDept');
    
    if (profileName) profileName.textContent = currentStudent.name || 'Student';
    if (profileId) profileId.textContent = currentStudent.student_id || 'N/A';
    if (profileDept) profileDept.textContent = currentStudent.department_name || currentStudent.department || 'Computer Science';

    // Update profile details (matching HTML element IDs)
    const details = {
        'infoName': currentStudent.name,
        'infoStudentId': currentStudent.student_id,
        'infoEmail': currentStudent.email,
        'infoPhone': currentStudent.phone || 'N/A',
        'infoDepartment': currentStudent.department_name || currentStudent.department || 'Computer Science',
        'infoYear': currentStudent.year ? 'Year ' + currentStudent.year : 'N/A',
        'infoHostel': currentStudent.hostel_status || 'Day Scholar',
        'infoFeeStatus': currentStudent.fee_status || 'Pending'
    };

    for (const [id, value] of Object.entries(details)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || 'N/A';
    }

    // Load quick stats
    loadQuickStats();
}

// Load Quick Stats
async function loadQuickStats() {
    // Demo stats (matching HTML element IDs)
    const booksIssued = document.getElementById('booksIssued');
    const feesDue = document.getElementById('feesDue');
    const scholarshipStatus = document.getElementById('scholarshipStatus');
    
    if (booksIssued) booksIssued.textContent = '2';
    if (feesDue) feesDue.textContent = '₹15,000';
    if (scholarshipStatus) scholarshipStatus.textContent = 'Merit';
}

// Load Fee Data
async function loadFeeData() {
    if (!currentStudent) return;

    try {
        let feeRecords = [];
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('fee_records')
                .select('*')
                .eq('student_id', currentStudent.student_id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                feeRecords = data;
            }
        }

        renderFeeData(feeRecords);
    } catch (error) {
        console.error('Error loading fees:', error);
        renderFeeData([]);
    }
}

// Render Fee Data
function renderFeeData(records) {
    let totalFee = 0;
    let totalPaid = 0;

    records.forEach(record => {
        totalFee += parseFloat(record.amount) || 0;
        totalPaid += parseFloat(record.paid_amount) || 0;
    });

    const totalDue = totalFee - totalPaid;

    // Update fee overview cards (use correct element IDs from HTML)
    const totalEl = document.getElementById('totalFeesAmount');
    const paidEl = document.getElementById('paidFeesAmount');
    const dueEl = document.getElementById('dueFeesAmount');
    if (totalEl) totalEl.textContent = formatCurrency(totalFee);
    if (paidEl) paidEl.textContent = formatCurrency(totalPaid);
    if (dueEl) dueEl.textContent = formatCurrency(totalDue);

    // Update status message
    const statusMessage = document.getElementById('feeStatusMessage');
    if (statusMessage) {
        if (totalDue <= 0) {
            statusMessage.className = 'fee-status-message success';
            statusMessage.innerHTML = '<i class="fas fa-check-circle"></i> All fees are paid. Your account is up to date.';
        } else if (totalDue < totalFee * 0.5) {
            statusMessage.className = 'fee-status-message warning';
            statusMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> You have pending fees. Please clear your dues before the deadline.';
        } else {
            statusMessage.className = 'fee-status-message danger';
            statusMessage.innerHTML = '<i class="fas fa-times-circle"></i> Significant fees pending. Please contact accounts department.';
        }
    }

    // Render fee details table
    const tbody = document.getElementById('feeDetailsTable');
    if (tbody) {
        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.fee_type || 'Tuition Fee'}</td>
                <td>${formatCurrency(record.amount)}</td>
                <td><span class="status-badge status-${record.status}">${record.status}</span></td>
            </tr>
        `).join('');
    }
}

// Load Library Data
async function loadLibraryData() {
    if (!currentStudent) return;

    try {
        let bookIssues = [];
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('book_issues')
                .select('*')
                .eq('student_id', currentStudent.student_id)
                .order('issue_date', { ascending: false });

            if (!error && data) {
                bookIssues = data;
            }
        }

        renderLibraryData(bookIssues);
    } catch (error) {
        console.error('Error loading library:', error);
        renderLibraryData([]);
    }
}

// Render Library Data
function renderLibraryData(bookIssues) {
    const currentBooks = bookIssues.filter(b => b.status === 'issued' || b.status === 'overdue');
    const overdueBooks = bookIssues.filter(b => b.status === 'overdue');

    // Update stats (use correct element IDs from HTML)
    const currentEl = document.getElementById('currentlyIssued');
    const overdueEl = document.getElementById('overdueBooks');
    const totalEl = document.getElementById('totalBorrowed');
    if (currentEl) currentEl.textContent = currentBooks.length;
    if (overdueEl) overdueEl.textContent = overdueBooks.length;
    if (totalEl) totalEl.textContent = bookIssues.length;

    // Render current books
    const currentBooksContainer = document.getElementById('issuedBooksTable');
    if (currentBooksContainer) {
        if (currentBooks.length === 0) {
            currentBooksContainer.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No books currently issued</td>
                </tr>
            `;
        } else {
            currentBooksContainer.innerHTML = currentBooks.map(book => `
                <tr>
                    <td>${book.library_books?.title || book.book_title || 'Unknown'}</td>
                    <td>${formatDate(book.issue_date)}</td>
                    <td>${formatDate(book.due_date)}</td>
                    <td><span class="status-badge status-${book.status}">${book.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // Render book history
    const historyContainer = document.getElementById('borrowHistoryTable');
    if (historyContainer) {
        const returnedBooks = bookIssues.filter(b => b.status === 'returned');
        if (returnedBooks.length === 0) {
            historyContainer.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No borrowing history</td>
                </tr>
            `;
        } else {
            historyContainer.innerHTML = returnedBooks.map(book => `
                <tr>
                    <td>${book.library_books?.title || book.book_title || 'Unknown'}</td>
                    <td>${formatDate(book.issue_date)}</td>
                    <td>${formatDate(book.return_date)}</td>
                    <td>${formatCurrency(book.fine || 0)}</td>
                </tr>
            `).join('');
        }
    }
}

// Load Hostel Data
async function loadHostelData() {
    if (!currentStudent) return;

    try {
        let hostelAllocation = null;
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('hostel_allocations')
                .select('*')
                .eq('student_id', currentStudent.student_id)
                .maybeSingle();

            if (!error && data) {
                hostelAllocation = data;
            }
        }

        renderHostelData(hostelAllocation);
    } catch (error) {
        console.error('Error loading hostel:', error);
        renderHostelData(null);
    }
}

// Render Hostel Data
function renderHostelData(allocation) {
    const container = document.getElementById('hostelDetails');
    
    if (!container) return;

    if (!allocation || !allocation.hostel_name) {
        container.innerHTML = `
            <div class="no-hostel-message">
                <i class="fas fa-home"></i>
                <h4>No Hostel Allocation</h4>
                <p>You are not currently allocated to any hostel room.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="hostel-info-card">
            <div class="hostel-info-header">
                <i class="fas fa-building"></i>
                <h3>${allocation.hostel_name || allocation.hostels?.name}</h3>
                <p>Room ${allocation.room_no || allocation.room_number}</p>
            </div>
            <div class="hostel-info-body">
                <div class="hostel-detail-item">
                    <label>Floor</label>
                    <span>${allocation.floor || 'N/A'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Bed Number</label>
                    <span>${allocation.bed_number || 'N/A'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Room Type</label>
                    <span>${allocation.hostel_type || allocation.hostels?.type || 'Standard'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Warden</label>
                    <span>${allocation.warden_name || allocation.hostels?.warden || 'N/A'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Warden Contact</label>
                    <span>${allocation.warden_phone || 'N/A'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Mess Type</label>
                    <span>${allocation.mess_type || 'Standard'}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Allocation Date</label>
                    <span>${formatDate(allocation.allocation_date)}</span>
                </div>
                <div class="hostel-detail-item">
                    <label>Monthly Fee</label>
                    <span>${formatCurrency(allocation.monthly_fee || 8000)}</span>
                </div>
            </div>
        </div>
    `;
}

// Load Scholarship Data
async function loadScholarshipData() {
    if (!currentStudent) return;

    try {
        let scholarships = [];
        let benefits = [];
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            // Load scholarships
            const { data: schData } = await window.CMS_CONFIG.supabase
                .from('scholarships')
                .select('*')
                .eq('student_id', currentStudent.student_id);

            if (schData) scholarships = schData;

            // Load benefits
            const { data: benData } = await window.CMS_CONFIG.supabase
                .from('benefits')
                .select('*')
                .eq('student_id', currentStudent.student_id);

            if (benData) benefits = benData;
        }

        renderScholarshipData(scholarships, benefits);
    } catch (error) {
        console.error('Error loading scholarships:', error);
        renderScholarshipData([], []);
    }
}

// Render Scholarship Data
function renderScholarshipData(scholarships, benefits) {
    // Render scholarships
    const scholarshipContainer = document.getElementById('scholarshipList');
    if (scholarshipContainer) {
        if (scholarships.length === 0) {
            scholarshipContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-award"></i>
                    <p>No scholarships applied</p>
                </div>
            `;
        } else {
            scholarshipContainer.innerHTML = scholarships.map(sch => `
                <div class="scholarship-card ${sch.status}">
                    <div class="scholarship-info">
                        <h4>${sch.name}</h4>
                        <p>${sch.description || sch.academic_year}</p>
                    </div>
                    <div class="scholarship-amount">
                        <div class="amount">${formatCurrency(sch.amount)}</div>
                        <span class="status-badge status-${sch.status}">${sch.status}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render benefits
    const benefitsContainer = document.getElementById('benefitsList');
    if (benefitsContainer) {
        if (benefits.length === 0) {
            benefitsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-gift"></i>
                    <p>No benefits availed</p>
                </div>
            `;
        } else {
            benefitsContainer.innerHTML = benefits.map(ben => `
                <div class="benefit-card">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h4>${ben.name}</h4>
                        <p>${ben.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load Notices Data
async function loadNoticesData() {
    try {
        let notices = [];
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('notices')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                notices = data;
            }
        }

        renderNoticesData(notices);
    } catch (error) {
        console.error('Error loading notices:', error);
        renderNoticesData([]);
    }
}

// Render Notices Data
function renderNoticesData(notices) {
    const container = document.getElementById('noticesList');
    
    if (!container) return;

    if (notices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn"></i>
                <p>No notices available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notices.map(notice => `
        <div class="notice-card ${notice.priority === 'urgent' ? 'important' : notice.priority === 'important' ? 'urgent' : ''}">
            <div class="notice-header">
                <h4>${notice.title}</h4>
                <span class="notice-date">${formatDate(notice.created_at)}</span>
            </div>
            <div class="notice-body">
                <p>${notice.content}</p>
            </div>
            <span class="notice-tag ${notice.category}">${notice.category}</span>
        </div>
    `).join('');
}

// Utility Functions
function formatCurrency(amount) {
    return '₹' + (parseFloat(amount) || 0).toLocaleString('en-IN');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles if not exist
    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .toast-success { background: #d4edda; color: #155724; }
            .toast-error { background: #f8d7da; color: #721c24; }
            .toast-info { background: #d1ecf1; color: #0c5460; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load Staff Directory Data
async function loadStaffData() {
    if (!currentStudent) return;

    const myDept = currentStudent.department;
    
    try {
        // Load Leadership (Chairman, Principal)
        let leadership = [];
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('chain_management')
                .select('*')
                .order('position');
            
            if (!error && data) {
                leadership = data;
            }
        }
        
        renderLeadership(leadership);

        // Load All Teachers
        let allTeachers = [];
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('teachers')
                .select('*')
                .order('department')
                .order('designation');
            
            if (!error && data) {
                allTeachers = data;
            }
        }

        // Load Departments
        let departments = [];
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('departments')
                .select('*');
            
            if (!error && data) {
                departments = data;
            }
        }

        // Separate teachers into my department and others
        const myDeptTeachers = allTeachers.filter(t => t.department === myDept);
        const otherTeachers = allTeachers.filter(t => t.department !== myDept);

        // Update my department name
        const myDeptInfo = departments.find(d => d.code === myDept);
        const myDeptNameEl = document.getElementById('myDeptName');
        if (myDeptNameEl) {
            myDeptNameEl.textContent = myDeptInfo ? myDeptInfo.name : myDept;
        }

        // Render my department staff (including HOD)
        renderMyDeptStaff(myDeptTeachers, myDeptInfo);

        // Render other departments
        renderOtherDeptStaff(otherTeachers, departments);

        // Load and render administrative staff
        let adminStaff = [];
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data: users, error } = await window.CMS_CONFIG.supabase
                .from('users')
                .select('*')
                .in('role', ['registrar', 'librarian', 'accountant', 'hostel_warden', 'admission_staff']);
            
            if (!error && users) {
                adminStaff = users;
            }
        }
        
        renderAdminStaff(adminStaff);

    } catch (error) {
        console.error('Error loading staff data:', error);
        renderLeadership([]);
        renderMyDeptStaff([], null);
        renderOtherDeptStaff([], []);
        renderAdminStaff([]);
    }
}

// Render Leadership
function renderLeadership(leadership) {
    const container = document.getElementById('leadershipList');
    if (!container) return;

    if (leadership.length === 0) {
        container.innerHTML = '<p class="text-center">No leadership info available</p>';
        return;
    }

    container.innerHTML = leadership.map(leader => `
        <div class="staff-card leadership">
            <div class="staff-avatar">
                <i class="fas fa-${leader.position === 'Chairman' ? 'crown' : 'user-tie'}"></i>
            </div>
            <div class="staff-info">
                <h4>${leader.name}</h4>
                <p class="staff-role">${leader.position}</p>
                <p class="staff-contact"><i class="fas fa-envelope"></i> ${leader.email || 'N/A'}</p>
                <p class="staff-contact"><i class="fas fa-phone"></i> ${leader.contact || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

// Render My Department Staff
function renderMyDeptStaff(teachers, deptInfo) {
    const container = document.getElementById('myDeptStaff');
    if (!container) return;

    if (teachers.length === 0) {
        container.innerHTML = '<p class="text-center">No teachers found in your department</p>';
        return;
    }

    // Sort by designation (HOD first)
    const sorted = [...teachers].sort((a, b) => {
        if (a.designation?.toLowerCase().includes('hod')) return -1;
        if (b.designation?.toLowerCase().includes('hod')) return 1;
        if (a.designation?.toLowerCase().includes('professor')) return -1;
        if (b.designation?.toLowerCase().includes('professor')) return 1;
        return 0;
    });

    container.innerHTML = sorted.map(teacher => `
        <div class="staff-card ${teacher.designation?.toLowerCase().includes('hod') ? 'hod' : ''}">
            <div class="staff-avatar">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="staff-info">
                <h4>${teacher.name}</h4>
                <p class="staff-role">${teacher.designation || 'Faculty'}</p>
                <p class="staff-contact"><i class="fas fa-envelope"></i> ${teacher.email || 'N/A'}</p>
                <p class="staff-contact"><i class="fas fa-phone"></i> ${teacher.contact || 'N/A'}</p>
                <p class="staff-subjects">${teacher.subjects || ''}</p>
            </div>
        </div>
    `).join('');
}

// Render Other Departments Staff
function renderOtherDeptStaff(teachers, departments) {
    const container = document.getElementById('otherDeptsStaff');
    if (!container) return;

    if (teachers.length === 0) {
        container.innerHTML = '<p class="text-center">No other department staff found</p>';
        return;
    }

    // Group teachers by department
    const grouped = {};
    teachers.forEach(teacher => {
        const dept = teacher.department || 'Other';
        if (!grouped[dept]) grouped[dept] = [];
        grouped[dept].push(teacher);
    });

    let html = '';
    for (const [deptCode, deptTeachers] of Object.entries(grouped)) {
        const deptInfo = departments.find(d => d.code === deptCode);
        const deptName = deptInfo ? deptInfo.name : deptCode;

        // Sort - HOD first
        const sorted = [...deptTeachers].sort((a, b) => {
            if (a.designation?.toLowerCase().includes('hod')) return -1;
            if (b.designation?.toLowerCase().includes('hod')) return 1;
            return 0;
        });

        html += `
            <div class="dept-section">
                <h4 class="dept-header"><i class="fas fa-building"></i> ${deptName}</h4>
                <div class="staff-grid">
                    ${sorted.map(teacher => `
                        <div class="staff-card ${teacher.designation?.toLowerCase().includes('hod') ? 'hod' : ''}">
                            <div class="staff-avatar">
                                <i class="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div class="staff-info">
                                <h4>${teacher.name}</h4>
                                <p class="staff-role">${teacher.designation || 'Faculty'}</p>
                                <p class="staff-contact"><i class="fas fa-envelope"></i> ${teacher.email || 'N/A'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Render Administrative Staff
function renderAdminStaff(staff) {
    const container = document.getElementById('adminStaffList');
    if (!container) return;

    if (staff.length === 0) {
        container.innerHTML = '<p class="text-center">No administrative staff found</p>';
        return;
    }

    const roleLabels = {
        'registrar': 'Registrar',
        'librarian': 'Librarian',
        'accountant': 'Accountant',
        'hostel_warden': 'Hostel Warden',
        'admission_staff': 'Admission Office'
    };

    const roleIcons = {
        'registrar': 'file-alt',
        'librarian': 'book',
        'accountant': 'calculator',
        'hostel_warden': 'home',
        'admission_staff': 'user-plus'
    };

    container.innerHTML = staff.map(person => `
        <div class="staff-card admin">
            <div class="staff-avatar">
                <i class="fas fa-${roleIcons[person.role] || 'user-tie'}"></i>
            </div>
            <div class="staff-info">
                <h4>${person.name}</h4>
                <p class="staff-role">${roleLabels[person.role] || person.role}</p>
                <p class="staff-contact"><i class="fas fa-envelope"></i> ${person.email || 'N/A'}</p>
                <p class="staff-contact"><i class="fas fa-phone"></i> ${person.contact || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

// ===== ORGANIZATION MODULE =====
let allOrgTeachers = [];
let allOrgStudents = [];

async function loadOrganizationData() {
    if (!window.CMS_CONFIG || !window.CMS_CONFIG.supabase) {
        console.warn('Supabase not available');
        return;
    }
    
    try {
        // Load chain management (all positions)
        const { data: chainData, error: chainError } = await window.CMS_CONFIG.supabase
            .from('chain_management')
            .select('*')
            .order('position');
        
        if (!chainError && chainData) {
            displayManagementHierarchy(chainData);
        } else {
            document.getElementById('managementHierarchy').innerHTML = '<div style="color: #95a5a6; padding: 20px;">No management data available</div>';
        }
        
        // Load departments
        const { data: departments, error: deptError } = await window.CMS_CONFIG.supabase
            .from('departments')
            .select('*')
            .order('code');
        
        if (!deptError && departments) {
            displayDepartmentCards(departments);
        }
        
        // Load teachers
        const { data: teachers, error: teacherError } = await window.CMS_CONFIG.supabase
            .from('teachers')
            .select('*')
            .order('department', { ascending: true });
        
        if (!teacherError && teachers) {
            allOrgTeachers = teachers;
            displayOrgTeachers(teachers);
            
            // Update department counts after teachers loaded
            if (departments) {
                updateDepartmentCounts(departments, teachers);
            }
        } else {
            document.getElementById('studentOrgTeachersTable').innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--gray);">No teachers found</td></tr>';
        }
        
        // Load students for counts
        const { data: students, error: studentError } = await window.CMS_CONFIG.supabase
            .from('students')
            .select('*');
        
        if (!studentError && students) {
            allOrgStudents = students;
            displayOrgStudents(students);
            
            // Update department counts with students
            if (departments) {
                updateDepartmentCounts(departments, teachers, students);
            }
        } else {
            document.getElementById('studentOrgStudentsTable').innerHTML = '<tr><td colspan="5" style="text-align:center; color:#95a5a6;">No students enrolled yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading organization data:', error);
    }
}

// Display management hierarchy with positions grouped horizontally
function displayManagementHierarchy(chainData) {
    const container = document.getElementById('managementHierarchy');
    if (!container) return;
    
    if (!chainData || chainData.length === 0) {
        container.innerHTML = '<div style="color: #95a5a6; padding: 20px;">No management data available</div>';
        return;
    }
    
    // Group by position
    const positionGroups = {};
    chainData.forEach(person => {
        const pos = person.position || 'Other';
        if (!positionGroups[pos]) {
            positionGroups[pos] = [];
        }
        positionGroups[pos].push(person);
    });
    
    // Define position order (top to bottom hierarchy)
    const positionOrder = ['Chairman', 'Vice Chairman', 'Principal', 'Vice Principal', 'Dean', 'Registrar', 'Other'];
    const sortedPositions = Object.keys(positionGroups).sort((a, b) => {
        const indexA = positionOrder.indexOf(a);
        const indexB = positionOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
    
    // Border colors for different positions
    const borderColors = {
        'Chairman': '#2c3e50',
        'Vice Chairman': '#34495e',
        'Principal': '#2980b9',
        'Vice Principal': '#3498db',
        'Dean': '#27ae60',
        'Registrar': '#8e44ad'
    };
    
    let html = '';
    
    sortedPositions.forEach((position, index) => {
        const people = positionGroups[position];
        const borderColor = borderColors[position] || '#7f8c8d';
        
        // Position level container
        html += `<div style="margin-bottom: 15px;">`;
        
        // People in this position - displayed horizontally
        html += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">`;
        
        people.forEach(person => {
            html += `
                <div style="background: white; border: 2px solid ${borderColor}; padding: 15px 25px; border-radius: 6px; min-width: 180px; max-width: 250px;">
                    <div style="color: #7f8c8d; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">${position}</div>
                    <div style="font-weight: 600; color: #2c3e50; font-size: 14px;">${person.name || 'N/A'}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 3px;">${person.email || '-'}</div>
                    ${person.contact ? `<div style="font-size: 11px; color: #7f8c8d;">${person.contact}</div>` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        
        // Add connecting line if not last position
        if (index < sortedPositions.length - 1) {
            html += `<div style="width: 2px; height: 15px; background: #bdc3c7; margin: 8px auto;"></div>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function displayDepartmentCards(departments) {
    const grid = document.getElementById('departmentsGrid');
    if (!grid) return;
    
    if (!departments || departments.length === 0) {
        grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 20px; color: #95a5a6;"><p>No departments found</p></div>';
        return;
    }
    
    grid.innerHTML = departments.map((dept) => `
        <div style="background: white; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px;">
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 12px;">
                <div style="font-weight: 600; color: #2c3e50; font-size: 14px; margin-bottom: 4px;">${dept.name || 'Unknown'}</div>
                <div style="font-size: 11px; color: #6c757d;">Department Code: ${dept.code || 'N/A'}</div>
            </div>
            <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; color: #6c757d; margin-bottom: 3px;">Head of Department</div>
                <div style="font-size: 13px; color: #495057; font-weight: 500;">${dept.hod || 'Not Assigned'}</div>
            </div>
            <div style="display: flex; gap: 15px; padding-top: 10px; border-top: 1px solid #e9ecef;">
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; color: #2c3e50;" id="dept-${dept.code}-teachers">0</div>
                    <div style="font-size: 10px; color: #6c757d; text-transform: uppercase;">Teachers</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; color: #2c3e50;" id="dept-${dept.code}-students">0</div>
                    <div style="font-size: 10px; color: #6c757d; text-transform: uppercase;">Students</div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateDepartmentCounts(departments, teachers, students) {
    departments.forEach(dept => {
        // Count teachers
        const teacherCount = teachers ? teachers.filter(t => t.department === dept.name || t.department === dept.code).length : 0;
        const teacherEl = document.getElementById(`dept-${dept.code}-teachers`);
        if (teacherEl) teacherEl.textContent = teacherCount;
        
        // Count students
        const studentCount = students ? students.filter(s => s.department === dept.name || s.department === dept.code).length : 0;
        const studentEl = document.getElementById(`dept-${dept.code}-students`);
        if (studentEl) studentEl.textContent = studentCount;
    });
}

function displayOrgTeachers(teachers) {
    const tbody = document.getElementById('studentOrgTeachersTable');
    if (!tbody) return;
    
    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--gray);">No teachers enrolled yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = teachers.map(t => `
        <tr>
            <td>${t.teacher_id}</td>
            <td><strong>${t.name}</strong></td>
            <td><span style="padding: 4px 12px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 12px; font-weight: 500;">${t.department}</span></td>
            <td>${t.designation}</td>
            <td>${t.contact || 'N/A'}</td>
        </tr>
    `).join('');
}

function displayOrgStudents(students) {
    const tbody = document.getElementById('studentOrgStudentsTable');
    if (!tbody) return;
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--gray);">No students enrolled yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(s => `
        <tr>
            <td>${s.student_id}</td>
            <td><strong>${s.name}</strong></td>
            <td><span style="padding: 4px 12px; background: #e8f5e9; color: #2e7d32; border-radius: 12px; font-size: 12px; font-weight: 500;">${s.department}</span></td>
            <td>Year ${s.year}</td>
            <td>${s.email}</td>
        </tr>
    `).join('');
}

function updateOrgDepartmentCounts(data, type) {
    const deptMap = {
        'CS': { teacher: 'studentCsTeacherCount', student: 'studentCsStudentCount' },
        'AIML': { teacher: 'studentAimlTeacherCount', student: 'studentAimlStudentCount' },
        'ECE': { teacher: 'studentEceTeacherCount', student: 'studentEceStudentCount' },
        'EE': { teacher: 'studentEeTeacherCount', student: 'studentEeStudentCount' }
    };
    
    // Count by department
    const counts = { CS: 0, AIML: 0, ECE: 0, EE: 0 };
    data.forEach(item => {
        if (counts.hasOwnProperty(item.department)) {
            counts[item.department]++;
        }
    });
    
    // Update UI
    Object.keys(deptMap).forEach(dept => {
        const elementId = deptMap[dept][type];
        const element = document.getElementById(elementId);
        if (element) {
            if (type === 'teacher') {
                element.textContent = `${counts[dept]} Teacher${counts[dept] !== 1 ? 's' : ''}`;
            } else {
                element.textContent = `${counts[dept]} Student${counts[dept] !== 1 ? 's' : ''}`;
            }
        }
    });
}

// ===== LIBRARY CATALOG MODULE =====
let allLibraryBooks = [];

async function loadLibraryCatalog() {
    if (!window.CMS_CONFIG || !window.CMS_CONFIG.supabase) {
        console.warn('Supabase not available');
        return;
    }
    
    try {
        const { data: books, error } = await window.CMS_CONFIG.supabase
            .from('library_books')
            .select('*')
            .order('title', { ascending: true });
        
        if (error) {
            console.error('Error loading books:', error);
            document.getElementById('bookCatalogTable').innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--gray);">Error loading books</td></tr>';
            return;
        }
        
        if (!books || books.length === 0) {
            document.getElementById('bookCatalogTable').innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--gray);">No books available in library</td></tr>';
            return;
        }
        
        allLibraryBooks = books;
        displayBookCatalog(books);
    } catch (error) {
        console.error('Error loading library catalog:', error);
    }
}

function displayBookCatalog(books) {
    const tbody = document.getElementById('bookCatalogTable');
    if (!tbody) return;
    
    tbody.innerHTML = books.map(book => {
        const available = book.available_copies || 0;
        const isAvailable = available > 0;
        
        return `
            <tr>
                <td>${book.book_id}</td>
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td>${book.subject || 'General'}</td>
                <td>
                    <span class="status-badge ${isAvailable ? 'status-active' : 'status-inactive'}">
                        ${available} / ${book.total_copies}
                    </span>
                </td>
                <td>
                    ${isAvailable 
                        ? `<button class="btn btn-primary btn-sm" onclick="requestBook('${book.book_id}', '${book.title.replace(/'/g, "\\'")}')">
                            <i class="fas fa-book-reader"></i> Book Now
                           </button>`
                        : `<span class="status-badge status-unavailable">Unavailable</span>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function filterBooks() {
    const searchInput = document.getElementById('bookSearchInput');
    if (!searchInput || !allLibraryBooks) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayBookCatalog(allLibraryBooks);
        return;
    }
    
    const filtered = allLibraryBooks.filter(book => 
        (book.title || '').toLowerCase().includes(searchTerm) ||
        (book.author || '').toLowerCase().includes(searchTerm) ||
        (book.subject || '').toLowerCase().includes(searchTerm) ||
        (book.book_id || '').toLowerCase().includes(searchTerm)
    );
    
    displayBookCatalog(filtered);
}

async function requestBook(bookId, bookTitle) {
    if (!currentStudent) {
        showToast('Please login first', 'error');
        return;
    }
    
    if (!window.CMS_CONFIG || !window.CMS_CONFIG.supabase) {
        showToast('Database not available', 'error');
        return;
    }
    
    if (!confirm(`Do you want to book "${bookTitle}"?`)) {
        return;
    }
    
    try {
        // Check if book is still available
        const { data: bookData, error: bookError } = await window.CMS_CONFIG.supabase
            .from('library_books')
            .select('available_copies')
            .eq('book_id', bookId)
            .single();
        
        if (bookError || !bookData || bookData.available_copies <= 0) {
            showToast('Book is no longer available', 'error');
            await loadLibraryCatalog();
            return;
        }
        
        // Create issue record
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
        
        const { error: issueError } = await window.CMS_CONFIG.supabase
            .from('book_issues')
            .insert({
                student_id: currentStudent.student_id,
                book_id: bookId,
                issue_date: issueDate.toISOString(),
                due_date: dueDate.toISOString(),
                status: 'issued'
            });
        
        if (issueError) {
            console.error('Error issuing book:', issueError);
            showToast('Error booking: ' + issueError.message, 'error');
            return;
        }
        
        // Update available copies
        const { error: updateError } = await window.CMS_CONFIG.supabase
            .from('library_books')
            .update({ available_copies: bookData.available_copies - 1 })
            .eq('book_id', bookId);
        
        if (updateError) {
            console.error('Error updating book count:', updateError);
        }
        
        showToast(`✅ Book "${bookTitle}" issued successfully! Due date: ${formatDate(dueDate.toISOString())}`, 'success');
        
        // Reload catalog and issued books
        await loadLibraryCatalog();
        await loadLibraryData();
    } catch (error) {
        console.error('Error requesting book:', error);
        showToast('Error booking. Please try again.', 'error');
    }
}

// ===== HOSTEL REQUEST MODULE =====
async function loadHostelOptions() {
    if (!currentStudent) return;
    
    try {
        // Check if student already has hostel allocation
        let hasAllocation = false;
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data: allocationData } = await window.CMS_CONFIG.supabase
                .from('hostel_allocations')
                .select('*')
                .eq('student_id', currentStudent.student_id)
                .maybeSingle();
            
            if (allocationData) {
                hasAllocation = true;
                renderHostelAllocation(allocationData);
            }
        }
        
        if (!hasAllocation) {
            renderNoHostelAllocation();
        }
        
        // Load available hostels
        await loadAvailableHostels();
        
        // Load hostel requests
        await loadHostelRequests();
    } catch (error) {
        console.error('Error loading hostel options:', error);
    }
}

function renderHostelAllocation(allocation) {
    const container = document.getElementById('hostelAllocationInfo');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 12px; text-align: center;">
            <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
            <h3>Hostel Allocated</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; text-align: left;">
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Hostel Name</p>
                    <p style="font-size: 16px; font-weight: 600;">${allocation.hostel_name || 'N/A'}</p>
                </div>
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Room Number</p>
                    <p style="font-size: 16px; font-weight: 600;">${allocation.room_no || allocation.room_number || 'N/A'}</p>
                </div>
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Floor</p>
                    <p style="font-size: 16px; font-weight: 600;">${allocation.floor || 'N/A'}</p>
                </div>
                <div>
                    <p style="font-size: 12px; opacity: 0.8;">Monthly Fee</p>
                    <p style="font-size: 16px; font-weight: 600;">${formatCurrency(allocation.monthly_fee || 8000)}</p>
                </div>
            </div>
        </div>
    `;
}

function renderNoHostelAllocation() {
    const container = document.getElementById('hostelAllocationInfo');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 30px; background: #f5f5f5; border-radius: 10px;">
            <i class="fas fa-home" style="font-size: 48px; color: #999; margin-bottom: 15px;"></i>
            <h4 style="color: #666;">No Hostel Allocated</h4>
            <p style="color: #888; font-size: 14px;">You can request hostel accommodation below</p>
        </div>
    `;
}

async function loadAvailableHostels() {
    const container = document.getElementById('hostelList');
    if (!container) return;
    
    // Demo hostels (in production, load from database)
    const hostels = [
        { 
            name: 'Boys Hostel A', 
            type: 'AC', 
            available: 15, 
            total: 120, 
            fee: 10000,
            facilities: 'AC Rooms, WiFi, Mess, Gym'
        },
        { 
            name: 'Boys Hostel B', 
            type: 'Non-AC', 
            available: 8, 
            total: 100, 
            fee: 7000,
            facilities: 'WiFi, Mess, Common Room'
        },
        { 
            name: 'Girls Hostel A', 
            type: 'AC', 
            available: 12, 
            total: 100, 
            fee: 10000,
            facilities: 'AC Rooms, WiFi, Mess, Gym'
        },
        { 
            name: 'Girls Hostel B', 
            type: 'Non-AC', 
            available: 15, 
            total: 80, 
            fee: 7000,
            facilities: 'WiFi, Mess, Reading Room'
        }
    ];
    
    container.innerHTML = hostels.map(hostel => `
        <div style="border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; background: white;">
            <h4 style="color: #333; margin-bottom: 10px;">
                <i class="fas fa-building"></i> ${hostel.name}
            </h4>
            <p style="font-size: 14px; color: #666; margin: 8px 0;">
                <strong>Type:</strong> ${hostel.type}
            </p>
            <p style="font-size: 14px; color: #666; margin: 8px 0;">
                <strong>Available Rooms:</strong> ${hostel.available} / ${hostel.total}
            </p>
            <p style="font-size: 14px; color: #666; margin: 8px 0;">
                <strong>Monthly Fee:</strong> ${formatCurrency(hostel.fee)}
            </p>
            <p style="font-size: 12px; color: #888; margin: 12px 0;">
                <i class="fas fa-check-circle"></i> ${hostel.facilities}
            </p>
            <button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="requestHostel('${hostel.name}', '${hostel.type}')">
                <i class="fas fa-paper-plane"></i> Request Hostel
            </button>
        </div>
    `).join('');
}

async function requestHostel(hostelName, hostelType) {
    if (!currentStudent) {
        showToast('Please login first', 'error');
        return;
    }
    
    if (!confirm(`Do you want to request accommodation at ${hostelName}?`)) {
        return;
    }
    
    try {
        // In production, save to database
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { error } = await window.CMS_CONFIG.supabase
                .from('hostel_requests')
                .insert({
                    student_id: currentStudent.student_id,
                    hostel_name: hostelName,
                    room_type: hostelType,
                    request_date: new Date().toISOString(),
                    status: 'pending'
                });
            
            if (error) {
                console.error('Error creating hostel request:', error);
                showToast('Error submitting request: ' + error.message, 'error');
                return;
            }
        }
        
        showToast(`✅ Hostel request for ${hostelName} submitted successfully!`, 'success');
        await loadHostelRequests();
    } catch (error) {
        console.error('Error requesting hostel:', error);
        showToast('Error submitting request. Please try again.', 'error');
    }
}

async function loadHostelRequests() {
    if (!currentStudent) return;
    
    const tbody = document.getElementById('hostelRequestsTable');
    if (!tbody) return;
    
    try {
        let requests = [];
        
        if (window.CMS_CONFIG && window.CMS_CONFIG.supabase) {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('hostel_requests')
                .select('*')
                .eq('student_id', currentStudent.student_id)
                .order('request_date', { ascending: false });
            
            if (!error && data) {
                requests = data;
            }
        }
        
        if (requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hostel requests yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = requests.map(req => `
            <tr>
                <td>${formatDate(req.request_date)}</td>
                <td>${req.hostel_name}</td>
                <td>${req.room_type}</td>
                <td><span class="status-badge status-${req.status}">${req.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading hostel requests:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Error loading requests</td></tr>';
    }
}

// ========== NOTICES MODULE ==========

async function loadStudentNotices() {
    const noticesList = document.getElementById('noticesList');
    
    if (!supabaseClient) {
        noticesList.innerHTML = '<p class="text-center" style="color:var(--gray);">Database connection unavailable</p>';
        return;
    }
    
    try {
        noticesList.innerHTML = '<p class="text-center" style="color:var(--gray);">Loading notices...</p>';
        
        // Get current date to filter out expired notices
        const currentDate = new Date().toISOString();
        
        // Fetch notices that are active and either not expired or have no expiry date
        // Also filter by target audience - show notices for "all" or "students"
        let query = supabaseClient
            .from('notices')
            .select('*')
            .eq('is_active', true)
            .or(`expiry_date.is.null,expiry_date.gt.${currentDate}`)
            .order('posted_date', { ascending: false });
        
        // If student has a department, also show department-specific notices
        if (currentStudent && currentStudent.department) {
            query = query.or(`target_audience.eq.all,target_audience.eq.students,and(target_audience.eq.department_specific,department.eq.${currentStudent.department})`);
        } else {
            query = query.in('target_audience', ['all', 'students']);
        }
        
        const { data: notices, error } = await query;
        
        if (error) {
            console.error('Error loading notices:', error);
            noticesList.innerHTML = '<p class="text-center" style="color:var(--danger);">Error loading notices</p>';
            return;
        }
        
        if (!notices || notices.length === 0) {
            noticesList.innerHTML = '<p class="text-center" style="color:var(--gray); padding:40px;">No notices available at the moment</p>';
            return;
        }
        
        // Display notices
        noticesList.innerHTML = notices.map(notice => {
            const postedDate = new Date(notice.posted_date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const expiryInfo = notice.expiry_date ? 
                `<p style="color:var(--danger); font-size:12px; margin-top:5px;"><i class="fas fa-clock"></i> Expires: ${new Date(notice.expiry_date).toLocaleDateString('en-IN')}</p>` : 
                '';
            
            const priorityColors = {
                'urgent': '#dc3545',
                'high': '#fd7e14',
                'normal': '#198754',
                'low': '#6c757d'
            };
            
            const priorityBadge = notice.priority !== 'normal' ? 
                `<span style="display:inline-block; padding:4px 12px; background:${priorityColors[notice.priority]}; color:white; border-radius:12px; font-size:11px; text-transform:uppercase; font-weight:600; margin-left:10px;">${notice.priority}</span>` : 
                '';
            
            return `
                <div class="notice-item" style="background:white; border:1px solid #e0e0e0; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:all 0.3s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                        <h4 style="color:var(--primary); font-size:18px; margin:0;">
                            <i class="fas fa-bullhorn" style="margin-right:8px;"></i>
                            ${notice.title}
                            ${priorityBadge}
                        </h4>
                    </div>
                    <div style="background:var(--light); padding:12px 15px; border-radius:8px; margin-bottom:12px;">
                        <p style="color:var(--dark-gray); font-size:13px; margin:0;">
                            <strong>Posted by:</strong> ${notice.posted_by} (${notice.posted_by_role.replace('_', ' ')}) &nbsp;|&nbsp; 
                            <strong>Date:</strong> ${postedDate}
                            ${notice.department ? ` &nbsp;|&nbsp; <strong>Department:</strong> ${notice.department}` : ''}
                        </p>
                        ${expiryInfo}
                    </div>
                    <div style="line-height:1.7; color:var(--dark); white-space:pre-wrap; padding:10px 0;">
                        ${notice.content}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading notices:', error);
        noticesList.innerHTML = '<p class="text-center" style="color:var(--danger);">Error loading notices</p>';
    }
}

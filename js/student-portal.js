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
        item.addEventListener('click', function() {
            const module = this.dataset.module;
            if (module) {
                switchModule(module);
                // Close sidebar on mobile after selecting
                if (window.innerWidth <= 768) {
                    document.querySelector('.sidebar')?.classList.remove('active');
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
                // Check demo students as fallback
                const demoStudent = getDemoStudent(email, password);
                if (demoStudent) {
                    currentStudent = demoStudent;
                    localStorage.setItem('currentStudent', JSON.stringify(demoStudent));
                    showDashboard();
                    loadAllModuleData();
                    showToast('Welcome back, ' + demoStudent.name + '!', 'success');
                } else {
                    showToast('Student not found. Please register first.', 'error');
                }
            }
        } else {
            // Demo mode
            const demoStudent = getDemoStudent(email, password);
            if (demoStudent) {
                currentStudent = demoStudent;
                localStorage.setItem('currentStudent', JSON.stringify(demoStudent));
                showDashboard();
                loadAllModuleData();
                showToast('Welcome back, ' + demoStudent.name + '!', 'success');
            } else {
                showToast('Invalid credentials. Try: john.smith@college.edu / student123', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Get Demo Student
function getDemoStudent(email, password) {
    const demoStudents = {
        'john.smith@college.edu': {
            id: 1,
            student_id: 'STU001',
            name: 'John Smith',
            email: 'john.smith@college.edu',
            phone: '9876543210',
            department_id: 1,
            department_name: 'Computer Science',
            department: 'CS',
            semester: 4,
            year: 2,
            batch: '2022-2026',
            gender: 'Male',
            dob: '2004-05-15',
            address: '123 Main Street, City',
            guardian_name: 'Robert Smith',
            guardian_phone: '9876543211',
            admission_date: '2022-07-15',
            status: 'active'
        },
        'sarah.johnson@college.edu': {
            id: 2,
            student_id: 'STU002',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@college.edu',
            phone: '9876543212',
            department_id: 2,
            department_name: 'Electronics',
            department: 'ECE',
            semester: 6,
            year: 3,
            batch: '2021-2025',
            gender: 'Female',
            dob: '2003-08-20',
            address: '456 Oak Avenue, City',
            guardian_name: 'Michael Johnson',
            guardian_phone: '9876543213',
            admission_date: '2021-07-10',
            status: 'active'
        }
    };

    if (demoStudents[email] && password === 'student123') {
        return demoStudents[email];
    }
    return null;
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
    document.querySelectorAll('.module-content').forEach(module => {
        module.style.display = 'none';
    });

    // Show selected module
    const selectedModule = document.getElementById(moduleName + 'Module');
    if (selectedModule) {
        selectedModule.style.display = 'block';
    }

    // Update header title
    const titles = {
        'profile': 'My Profile',
        'fees': 'Fee Status',
        'library': 'Library',
        'hostel': 'Hostel',
        'scholarship': 'Scholarships',
        'notices': 'Notices'
    };
    
    const moduleTitle = document.getElementById('moduleTitle');
    if (moduleTitle) {
        moduleTitle.textContent = titles[moduleName] || 'Dashboard';
    }
}

// Load All Module Data
function loadAllModuleData() {
    loadProfileData();
    loadFeeData();
    loadLibraryData();
    loadHostelData();
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

        // Use demo data if no records
        if (feeRecords.length === 0) {
            feeRecords = getDemoFeeRecords();
        }

        renderFeeData(feeRecords);
    } catch (error) {
        console.error('Error loading fees:', error);
        renderFeeData(getDemoFeeRecords());
    }
}

// Get Demo Fee Records
function getDemoFeeRecords() {
    return [
        {
            id: 1,
            fee_type: 'Tuition Fee',
            amount: 50000,
            paid_amount: 50000,
            status: 'paid',
            due_date: '2024-06-30',
            payment_date: '2024-06-15',
            semester: 'Semester 3'
        },
        {
            id: 2,
            fee_type: 'Tuition Fee',
            amount: 50000,
            paid_amount: 35000,
            status: 'partial',
            due_date: '2024-12-31',
            payment_date: '2024-10-15',
            semester: 'Semester 4'
        },
        {
            id: 3,
            fee_type: 'Library Fee',
            amount: 2000,
            paid_amount: 2000,
            status: 'paid',
            due_date: '2024-07-15',
            payment_date: '2024-07-10',
            semester: 'Annual'
        },
        {
            id: 4,
            fee_type: 'Lab Fee',
            amount: 5000,
            paid_amount: 0,
            status: 'pending',
            due_date: '2024-12-31',
            payment_date: null,
            semester: 'Semester 4'
        }
    ];
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
                .select(`
                    *,
                    books (title, author, isbn)
                `)
                .eq('student_id', currentStudent.student_id)
                .order('issue_date', { ascending: false });

            if (!error && data) {
                bookIssues = data;
            }
        }

        // Use demo data if no records
        if (bookIssues.length === 0) {
            bookIssues = getDemoBookIssues();
        }

        renderLibraryData(bookIssues);
    } catch (error) {
        console.error('Error loading library:', error);
        renderLibraryData(getDemoBookIssues());
    }
}

// Get Demo Book Issues
function getDemoBookIssues() {
    const today = new Date();
    const dueDate1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueDate2 = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    return [
        {
            id: 1,
            book_title: 'Introduction to Algorithms',
            book_author: 'Thomas H. Cormen',
            issue_date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: dueDate1.toISOString(),
            status: 'issued',
            books: { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848' }
        },
        {
            id: 2,
            book_title: 'Database System Concepts',
            book_author: 'Abraham Silberschatz',
            issue_date: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: dueDate2.toISOString(),
            status: 'overdue',
            books: { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159' }
        },
        {
            id: 3,
            book_title: 'Computer Networks',
            book_author: 'Andrew S. Tanenbaum',
            issue_date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            due_date: new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
            return_date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'returned',
            books: { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953' }
        }
    ];
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
                    <td>${book.books?.title || book.book_title || 'Unknown'}</td>
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
                    <td>${book.books?.title || book.book_title || 'Unknown'}</td>
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
                .select(`
                    *,
                    hostels (name, type, warden_name),
                    rooms (room_number, floor, capacity)
                `)
                .eq('student_id', currentStudent.student_id)
                .eq('status', 'active')
                .maybeSingle();

            if (!error && data) {
                hostelAllocation = data;
            }
        }

        // Use demo data if no allocation
        if (!hostelAllocation) {
            hostelAllocation = getDemoHostelAllocation();
        }

        renderHostelData(hostelAllocation);
    } catch (error) {
        console.error('Error loading hostel:', error);
        renderHostelData(getDemoHostelAllocation());
    }
}

// Get Demo Hostel Allocation
function getDemoHostelAllocation() {
    return {
        id: 1,
        hostel_name: 'Boys Hostel A',
        room_number: '204',
        floor: '2nd Floor',
        bed_number: 'B2',
        hostel_type: 'AC',
        warden_name: 'Mr. Rajesh Kumar',
        warden_phone: '9876543220',
        allocation_date: '2022-07-20',
        mess_type: 'Vegetarian',
        monthly_fee: 8000,
        hostels: { name: 'Boys Hostel A', type: 'AC', warden_name: 'Mr. Rajesh Kumar' },
        rooms: { room_number: '204', floor: '2nd Floor', capacity: 2 }
    };
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
                <p>Room ${allocation.room_number || allocation.rooms?.room_number}</p>
            </div>
            <div class="hostel-info-body">
                <div class="hostel-detail-item">
                    <label>Floor</label>
                    <span>${allocation.floor || allocation.rooms?.floor || 'N/A'}</span>
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
                    <span>${allocation.warden_name || allocation.hostels?.warden_name || 'N/A'}</span>
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

        // Use demo data if no records
        if (scholarships.length === 0) {
            scholarships = getDemoScholarships();
        }
        if (benefits.length === 0) {
            benefits = getDemoBenefits();
        }

        renderScholarshipData(scholarships, benefits);
    } catch (error) {
        console.error('Error loading scholarships:', error);
        renderScholarshipData(getDemoScholarships(), getDemoBenefits());
    }
}

// Get Demo Scholarships
function getDemoScholarships() {
    return [
        {
            id: 1,
            name: 'Merit Scholarship',
            amount: 25000,
            status: 'approved',
            academic_year: '2024-25',
            description: 'Awarded for academic excellence'
        },
        {
            id: 2,
            name: 'State Government Scholarship',
            amount: 15000,
            status: 'pending',
            academic_year: '2024-25',
            description: 'State-sponsored educational support'
        }
    ];
}

// Get Demo Benefits
function getDemoBenefits() {
    return [
        {
            id: 1,
            name: 'Bus Pass Concession',
            type: 'Transport',
            description: '50% discount on annual bus pass'
        },
        {
            id: 2,
            name: 'Book Bank Facility',
            type: 'Education',
            description: 'Free textbooks from library book bank'
        }
    ];
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

        // Use demo data if no records
        if (notices.length === 0) {
            notices = getDemoNotices();
        }

        renderNoticesData(notices);
    } catch (error) {
        console.error('Error loading notices:', error);
        renderNoticesData(getDemoNotices());
    }
}

// Get Demo Notices
function getDemoNotices() {
    const today = new Date();
    return [
        {
            id: 1,
            title: 'Mid-Semester Examination Schedule',
            content: 'Mid-semester examinations will be held from 15th to 22nd of this month. Please check your department notice board for the detailed timetable.',
            category: 'exam',
            priority: 'important',
            created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            title: 'Annual Sports Day Registration',
            content: 'Registration for Annual Sports Day events is now open. Interested students can register at the Sports Department before the 20th.',
            category: 'event',
            priority: 'normal',
            created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            title: 'Library Extended Hours',
            content: 'During examination period, the library will remain open from 8 AM to 10 PM. Make use of this extended timing for your exam preparation.',
            category: 'general',
            priority: 'normal',
            created_at: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            title: 'Fee Payment Deadline',
            content: 'Last date for fee payment without fine is 30th of this month. Students with pending fees are requested to clear their dues immediately.',
            category: 'important',
            priority: 'urgent',
            created_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
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
        
        if (leadership.length === 0) {
            leadership = getDemoLeadership();
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
        
        if (allTeachers.length === 0) {
            allTeachers = getDemoTeachers();
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
        
        if (departments.length === 0) {
            departments = getDemoDepartments();
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
        
        if (adminStaff.length === 0) {
            adminStaff = getDemoAdminStaff();
        }
        renderAdminStaff(adminStaff);

    } catch (error) {
        console.error('Error loading staff data:', error);
        // Use demo data on error
        renderLeadership(getDemoLeadership());
        renderMyDeptStaff(getDemoTeachers().filter(t => t.department === myDept), null);
        renderOtherDeptStaff(getDemoTeachers().filter(t => t.department !== myDept), getDemoDepartments());
        renderAdminStaff(getDemoAdminStaff());
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

// Demo Data Functions for Staff
function getDemoLeadership() {
    return [
        { position: 'Chairman', name: 'Dr. Robert Smith', email: 'chairman@college.edu', contact: '9876543210' },
        { position: 'Principal', name: 'Dr. Sarah Johnson', email: 'principal@college.edu', contact: '9876543211' }
    ];
}

function getDemoTeachers() {
    return [
        { name: 'Dr. Anil Kumar', email: 'anil.kumar@college.edu', contact: '9876543220', department: 'CS', designation: 'HOD & Professor', subjects: 'Data Structures, Algorithms' },
        { name: 'Prof. Meera Singh', email: 'meera.singh@college.edu', contact: '9876543221', department: 'CS', designation: 'Associate Professor', subjects: 'Database Systems' },
        { name: 'Mr. Rahul Verma', email: 'rahul.v@college.edu', contact: '9876543222', department: 'CS', designation: 'Assistant Professor', subjects: 'Web Development' },
        { name: 'Dr. Priya Mehta', email: 'priya.mehta@college.edu', contact: '9876543223', department: 'AIML', designation: 'HOD & Professor', subjects: 'Machine Learning, AI' },
        { name: 'Prof. Amit Sharma', email: 'amit.sharma@college.edu', contact: '9876543224', department: 'AIML', designation: 'Associate Professor', subjects: 'Deep Learning' },
        { name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@college.edu', contact: '9876543225', department: 'ECE', designation: 'HOD & Professor', subjects: 'Signal Processing' },
        { name: 'Prof. Neha Gupta', email: 'neha.gupta@college.edu', contact: '9876543226', department: 'ECE', designation: 'Associate Professor', subjects: 'VLSI Design' },
        { name: 'Dr. Sunita Verma', email: 'sunita.verma@college.edu', contact: '9876543227', department: 'EE', designation: 'HOD & Professor', subjects: 'Power Systems' }
    ];
}

function getDemoDepartments() {
    return [
        { code: 'CS', name: 'Computer Science', hod: 'Dr. Anil Kumar' },
        { code: 'AIML', name: 'AI & Machine Learning', hod: 'Dr. Priya Mehta' },
        { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Rajesh Sharma' },
        { code: 'EE', name: 'Electrical Engineering', hod: 'Dr. Sunita Verma' }
    ];
}

function getDemoAdminStaff() {
    return [
        { name: 'Mr. Suresh Kumar', role: 'registrar', email: 'registrar@college.edu', contact: '9876543230' },
        { name: 'Mrs. Anjali Sharma', role: 'librarian', email: 'library@college.edu', contact: '9876543231' },
        { name: 'Mr. Ramesh Gupta', role: 'accountant', email: 'accounts@college.edu', contact: '9876543232' },
        { name: 'Mr. Vijay Singh', role: 'hostel_warden', email: 'warden@college.edu', contact: '9876543233' },
        { name: 'Mrs. Priya Iyer', role: 'admission_staff', email: 'admissions@college.edu', contact: '9876543234' }
    ];
}

// Dashboard Module

// Demo data for dashboard
const DEMO_DASHBOARD_DATA = {
    totalStudents: 1250,
    totalTeachers: 85,
    totalDepartments: 4,
    totalBooks: 5420,
    recentAdmissions: [
        { name: 'Rahul Kumar', department: 'CS', date: '2026-03-10', status: 'Active' },
        { name: 'Priya Sharma', department: 'AIML', date: '2026-03-09', status: 'Active' },
        { name: 'Amit Singh', department: 'ECE', date: '2026-03-08', status: 'Active' },
        { name: 'Sneha Patel', department: 'EE', date: '2026-03-07', status: 'Active' }
    ],
    feePending: [
        { name: 'Vikram Joshi', department: 'CS', due: 25000 },
        { name: 'Anjali Reddy', department: 'AIML', due: 15000 },
        { name: 'Kiran Kumar', department: 'ECE', due: 35000 }
    ]
};

// Load dashboard data
async function loadDashboardData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayDashboardData(DEMO_DASHBOARD_DATA);
    } else {
        try {
            // Fetch counts from Supabase
            const [studentsRes, teachersRes, booksRes] = await Promise.all([
                window.CMS_CONFIG.supabase.from('students').select('id', { count: 'exact' }),
                window.CMS_CONFIG.supabase.from('teachers').select('id', { count: 'exact' }),
                window.CMS_CONFIG.supabase.from('library_books').select('id', { count: 'exact' })
            ]);
            
            // Fetch recent admissions
            const { data: admissions } = await window.CMS_CONFIG.supabase
                .from('admissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            
            // Fetch fee pending students
            const { data: feePending } = await window.CMS_CONFIG.supabase
                .from('fee_records')
                .select('*, students(*)')
                .gt('remaining_fees', 0)
                .limit(5);
            
            const data = {
                totalStudents: studentsRes.count || 0,
                totalTeachers: teachersRes.count || 0,
                totalDepartments: 4,
                totalBooks: booksRes.count || 0,
                recentAdmissions: admissions || [],
                feePending: feePending || []
            };
            
            displayDashboardData(data);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            displayDashboardData(DEMO_DASHBOARD_DATA);
        }
    }
}

// Display dashboard data
function displayDashboardData(data) {
    // Update stats
    document.getElementById('totalStudents').textContent = data.totalStudents;
    document.getElementById('totalTeachers').textContent = data.totalTeachers;
    document.getElementById('totalDepartments').textContent = data.totalDepartments;
    document.getElementById('totalBooks').textContent = data.totalBooks;
    
    // Update recent admissions table
    const admissionsTable = document.getElementById('recentAdmissions');
    if (data.recentAdmissions.length > 0) {
        admissionsTable.innerHTML = data.recentAdmissions.map(admission => `
            <tr>
                <td>${admission.name}</td>
                <td>${getDepartmentName(admission.department)}</td>
                <td>${formatDate(admission.date)}</td>
                <td>${createStatusBadge(admission.status)}</td>
            </tr>
        `).join('');
    } else {
        admissionsTable.innerHTML = '<tr><td colspan="4" class="text-center">No recent admissions</td></tr>';
    }
    
    // Update fee pending table
    const feePendingTable = document.getElementById('feePendingList');
    if (data.feePending.length > 0) {
        feePendingTable.innerHTML = data.feePending.map(record => `
            <tr>
                <td>${record.name}</td>
                <td>${getDepartmentName(record.department)}</td>
                <td class="text-danger">${formatCurrency(record.due)}</td>
            </tr>
        `).join('');
    } else {
        feePendingTable.innerHTML = '<tr><td colspan="3" class="text-center">No pending fees</td></tr>';
    }
}

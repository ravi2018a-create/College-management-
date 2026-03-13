// Dashboard Module

// Load dashboard data
async function loadDashboardData() {
    const emptyData = {
        totalStudents: 0,
        totalTeachers: 0,
        totalDepartments: 0,
        totalBooks: 0,
        recentAdmissions: [],
        feePending: []
    };
    
    try {
        // Fetch counts from Supabase
        const [studentsRes, teachersRes, booksRes, deptsRes] = await Promise.all([
            window.CMS_CONFIG.supabase.from('students').select('id', { count: 'exact' }),
            window.CMS_CONFIG.supabase.from('teachers').select('id', { count: 'exact' }),
            window.CMS_CONFIG.supabase.from('library_books').select('id', { count: 'exact' }),
            window.CMS_CONFIG.supabase.from('departments').select('id', { count: 'exact' })
        ]);
        
        const data = {
            totalStudents: studentsRes.count || 0,
            totalTeachers: teachersRes.count || 0,
            totalDepartments: deptsRes.count || 0,
            totalBooks: booksRes.count || 0,
            recentAdmissions: [],
            feePending: []
        };
        
        displayDashboardData(data);
    } catch (err) {
        console.error('Error loading dashboard:', err);
        displayDashboardData(emptyData);
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

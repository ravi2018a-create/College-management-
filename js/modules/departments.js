// Department Management Module

// Demo departments data
let DEMO_DEPARTMENTS = [
    {
        id: 'DEPT001',
        code: 'CS',
        name: 'Computer Science',
        hod: 'Dr. Anil Kumar',
        totalTeachers: 22,
        totalStudents: 320,
        established: 1995
    },
    {
        id: 'DEPT002',
        code: 'AIML',
        name: 'AI & Machine Learning',
        hod: 'Dr. Priya Mehta',
        totalTeachers: 18,
        totalStudents: 280,
        established: 2020
    },
    {
        id: 'DEPT003',
        code: 'ECE',
        name: 'Electronics & Communication',
        hod: 'Dr. Rajesh Sharma',
        totalTeachers: 25,
        totalStudents: 350,
        established: 1990
    },
    {
        id: 'DEPT004',
        code: 'EE',
        name: 'Electrical Engineering',
        hod: 'Dr. Sunita Verma',
        totalTeachers: 20,
        totalStudents: 300,
        established: 1988
    }
];

// Load departments data
async function loadDepartmentsData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayDepartmentsData(DEMO_DEPARTMENTS);
    } else {
        try {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('departments')
                .select('*');
            
            if (error) throw error;
            displayDepartmentsData(data || DEMO_DEPARTMENTS);
        } catch (err) {
            console.error('Error loading departments:', err);
            displayDepartmentsData(DEMO_DEPARTMENTS);
        }
    }
}

// Display departments data
function displayDepartmentsData(departments) {
    const grid = document.getElementById('departmentsGrid');
    
    if (departments.length > 0) {
        grid.innerHTML = departments.map(dept => `
            <div class="dept-card">
                <div class="dept-header">
                    <h4>${dept.name}</h4>
                    <p>Code: ${dept.code}</p>
                </div>
                <div class="dept-body">
                    <div class="dept-info">
                        <label>HOD</label>
                        <span>${dept.hod}</span>
                    </div>
                    <div class="dept-info">
                        <label>Teachers</label>
                        <span>${dept.totalTeachers}</span>
                    </div>
                    <div class="dept-info">
                        <label>Students</label>
                        <span>${dept.totalStudents}</span>
                    </div>
                    <div class="dept-info">
                        <label>Established</label>
                        <span>${dept.established}</span>
                    </div>
                </div>
                <div class="dept-footer">
                    <button class="btn btn-sm btn-secondary" onclick="viewDepartment('${dept.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editDepartment('${dept.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        grid.innerHTML = '<p class="text-center">No departments found</p>';
    }
}

// Open department modal
function openDepartmentModal(deptId = null) {
    const title = deptId ? 'Edit Department' : 'Add Department';
    const content = `
        <form id="departmentForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="deptCode">Department Code</label>
                    <input type="text" id="deptCode" required placeholder="e.g., CS">
                </div>
                <div class="form-group">
                    <label for="deptName">Department Name</label>
                    <input type="text" id="deptName" required placeholder="Full department name">
                </div>
            </div>
            <div class="form-group">
                <label for="deptHod">Head of Department (HOD)</label>
                <input type="text" id="deptHod" required placeholder="HOD name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="deptTeachers">Total Teachers</label>
                    <input type="number" id="deptTeachers" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="deptStudents">Total Students</label>
                    <input type="number" id="deptStudents" min="0" value="0">
                </div>
            </div>
            <div class="form-group">
                <label for="deptEstablished">Established Year</label>
                <input type="number" id="deptEstablished" min="1900" max="2026" placeholder="Year">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    document.getElementById('departmentForm').addEventListener('submit', handleDepartmentSubmit);
}

// Handle department form submission
async function handleDepartmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId('DEPT'),
        code: document.getElementById('deptCode').value.toUpperCase(),
        name: document.getElementById('deptName').value,
        hod: document.getElementById('deptHod').value,
        totalTeachers: parseInt(document.getElementById('deptTeachers').value) || 0,
        totalStudents: parseInt(document.getElementById('deptStudents').value) || 0,
        established: parseInt(document.getElementById('deptEstablished').value) || new Date().getFullYear()
    };
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_DEPARTMENTS.push(formData);
        showToast('Department added successfully', 'success');
        closeModal();
        loadDepartmentsData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('departments')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Department added successfully', 'success');
            closeModal();
            loadDepartmentsData();
        } catch (err) {
            console.error('Error saving department:', err);
            showToast('Error saving department', 'error');
        }
    }
}

// View department details
function viewDepartment(deptId) {
    const dept = DEMO_DEPARTMENTS.find(d => d.id === deptId);
    if (!dept) return;
    
    const content = `
        <div class="dept-details">
            <h4>${dept.name}</h4>
            <p><strong>Code:</strong> ${dept.code}</p>
            <p><strong>HOD:</strong> ${dept.hod}</p>
            <p><strong>Teachers:</strong> ${dept.totalTeachers}</p>
            <p><strong>Students:</strong> ${dept.totalStudents}</p>
            <p><strong>Established:</strong> ${dept.established}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    openModal('Department Details', content);
}

// Edit department
function editDepartment(deptId) {
    const dept = DEMO_DEPARTMENTS.find(d => d.id === deptId);
    if (!dept) return;
    
    openDepartmentModal(deptId);
    
    setTimeout(() => {
        document.getElementById('deptCode').value = dept.code;
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptHod').value = dept.hod;
        document.getElementById('deptTeachers').value = dept.totalTeachers;
        document.getElementById('deptStudents').value = dept.totalStudents;
        document.getElementById('deptEstablished').value = dept.established;
    }, 100);
}

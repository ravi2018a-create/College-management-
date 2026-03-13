// Students Module

// Live data storage
let currentStudents = [];

// Load students data
async function loadStudentsData() {
    try {
        const { data, error } = await window.CMS_CONFIG.supabase
            .from('students')
            .select('*')
            .order('name');
        
        if (error) throw error;
        currentStudents = data || [];
        displayStudentsData(currentStudents);
    } catch (err) {
        console.error('Error loading students:', err);
        displayStudentsData([]);
    }
}

// Display students data
function displayStudentsData(students) {
    const table = document.getElementById('studentsTable');
    
    if (students.length > 0) {
        table.innerHTML = students.map(stu => `
            <tr>
                <td>${stu.studentId}</td>
                <td>${stu.name}</td>
                <td>${getDepartmentName(stu.department)}</td>
                <td>${stu.year}${getYearSuffix(stu.year)} Year</td>
                <td>${stu.hostelStatus === 'Yes' ? '<span class="text-success">Yes</span>' : 'No'}</td>
                <td>${createFeeStatusBadge(stu.feeStatus)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewStudent('${stu.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editStudent('${stu.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent('${stu.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
    }
}

// Get year suffix
function getYearSuffix(year) {
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th' };
    return suffixes[year] || 'th';
}

// Create fee status badge
function createFeeStatusBadge(status) {
    const classes = {
        'Paid': 'paid',
        'Pending': 'pending',
        'Partial': 'pending'
    };
    return `<span class="status-badge ${classes[status] || ''}">${status}</span>`;
}

// Filter students
function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const deptFilter = document.getElementById('studentDeptFilter').value;
    const yearFilter = document.getElementById('studentYearFilter').value;
    
    let filtered = [...currentStudents];
    
    if (search) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search) || 
            s.studentId.toLowerCase().includes(search)
        );
    }
    
    if (deptFilter) {
        filtered = filtered.filter(s => s.department === deptFilter);
    }
    
    if (yearFilter) {
        filtered = filtered.filter(s => s.year.toString() === yearFilter);
    }
    
    displayStudentsData(filtered);
}

// Open student modal
function openStudentModal(stuId = null) {
    const title = stuId ? 'Edit Student' : 'Add Student';
    const content = `
        <form id="studentForm" class="modal-form">
            <div class="form-group">
                <label for="stuName">Full Name</label>
                <input type="text" id="stuName" required placeholder="Student full name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="stuEmail">Email</label>
                    <input type="email" id="stuEmail" required placeholder="Email address">
                </div>
                <div class="form-group">
                    <label for="stuPhone">Phone</label>
                    <input type="tel" id="stuPhone" required placeholder="10-digit number">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="stuDepartment">Department</label>
                    <select id="stuDepartment" required>
                        <option value="">Select Department</option>
                        <option value="CS">Computer Science</option>
                        <option value="AIML">AI & Machine Learning</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EE">Electrical Engineering</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="stuYear">Academic Year</label>
                    <select id="stuYear" required>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="stuHostel">Hostel Status</label>
                    <select id="stuHostel">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="stuFeeStatus">Fee Status</label>
                    <select id="stuFeeStatus">
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="stuAddress">Address</label>
                <textarea id="stuAddress" rows="2" placeholder="Complete address"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Student
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
}

// Handle student submission
async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const count = DEMO_STUDENTS.length + 1;
    const year = new Date().getFullYear();
    
    const formData = {
        id: generateId('STU'),
        studentId: `STU${year}${count.toString().padStart(3, '0')}`,
        name: document.getElementById('stuName').value,
        email: document.getElementById('stuEmail').value,
        phone: document.getElementById('stuPhone').value,
        department: document.getElementById('stuDepartment').value,
        year: parseInt(document.getElementById('stuYear').value),
        hostelStatus: document.getElementById('stuHostel').value,
        feeStatus: document.getElementById('stuFeeStatus').value,
        address: document.getElementById('stuAddress').value
    };
    
    if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }
    
    if (!validatePhone(formData.phone)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_STUDENTS.push(formData);
        showToast('Student added successfully!', 'success');
        closeModal();
        loadStudentsData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('students')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Student added successfully!', 'success');
            closeModal();
            loadStudentsData();
        } catch (err) {
            console.error('Error saving student:', err);
            showToast('Error saving student', 'error');
        }
    }
}

// View student details
function viewStudent(id) {
    const stu = DEMO_STUDENTS.find(s => s.id === id);
    if (!stu) return;
    
    const content = `
        <div class="student-details">
            <div class="student-header" style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-user-graduate" style="font-size: 48px; color: var(--primary-color);"></i>
                <h4 style="margin-top: 10px;">${stu.name}</h4>
                <p style="color: var(--secondary-color);">${stu.studentId}</p>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Department:</label>
                <span>${getDepartmentName(stu.department)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Academic Year:</label>
                <span>${stu.year}${getYearSuffix(stu.year)} Year</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Email:</label>
                <span>${stu.email}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Phone:</label>
                <span>${stu.phone}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Hostel:</label>
                <span>${stu.hostelStatus === 'Yes' ? '<span class="text-success">Resident</span>' : 'Day Scholar'}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Fee Status:</label>
                <span>${createFeeStatusBadge(stu.feeStatus)}</span>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-primary" onclick="editStudent('${stu.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
    `;
    
    openModal('Student Details', content);
}

// Edit student
function editStudent(id) {
    const stu = DEMO_STUDENTS.find(s => s.id === id);
    if (!stu) return;
    
    closeModal();
    openStudentModal(id);
    
    setTimeout(() => {
        document.getElementById('stuName').value = stu.name;
        document.getElementById('stuEmail').value = stu.email;
        document.getElementById('stuPhone').value = stu.phone;
        document.getElementById('stuDepartment').value = stu.department;
        document.getElementById('stuYear').value = stu.year;
        document.getElementById('stuHostel').value = stu.hostelStatus;
        document.getElementById('stuFeeStatus').value = stu.feeStatus;
        document.getElementById('stuAddress').value = stu.address || '';
    }, 100);
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        DEMO_STUDENTS = DEMO_STUDENTS.filter(s => s.id !== id);
        displayStudentsData(DEMO_STUDENTS);
        showToast('Student deleted successfully', 'success');
    }
}

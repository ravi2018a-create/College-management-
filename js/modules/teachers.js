// Teachers Module

// Demo teachers data
let DEMO_TEACHERS = [
    { id: 'TCH001', teacherId: 'TCH2020001', name: 'Dr. Anil Kumar', department: 'CS', subjects: 'Data Structures, Algorithms', designation: 'Professor', contact: '9876543300', email: 'anil@college.edu' },
    { id: 'TCH002', teacherId: 'TCH2018001', name: 'Dr. Priya Mehta', department: 'AIML', subjects: 'Machine Learning, Deep Learning', designation: 'Associate Professor', contact: '9876543301', email: 'priya@college.edu' },
    { id: 'TCH003', teacherId: 'TCH2015001', name: 'Dr. Rajesh Sharma', department: 'ECE', subjects: 'Digital Electronics, Microprocessors', designation: 'Professor', contact: '9876543302', email: 'rajesh@college.edu' },
    { id: 'TCH004', teacherId: 'TCH2019001', name: 'Dr. Sunita Verma', department: 'EE', subjects: 'Power Systems, Control Systems', designation: 'Professor', contact: '9876543303', email: 'sunita@college.edu' },
    { id: 'TCH005', teacherId: 'TCH2021001', name: 'Mr. Rahul Singh', department: 'CS', subjects: 'Web Development, Database', designation: 'Assistant Professor', contact: '9876543304', email: 'rahuls@college.edu' },
    { id: 'TCH006', teacherId: 'TCH2022001', name: 'Ms. Anjali Gupta', department: 'AIML', subjects: 'Python, NLP', designation: 'Assistant Professor', contact: '9876543305', email: 'anjali@college.edu' }
];

// Load teachers data
async function loadTeachersData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayTeachersData(DEMO_TEACHERS);
    } else {
        try {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('teachers')
                .select('*')
                .order('name');
            
            if (error) throw error;
            displayTeachersData(data || DEMO_TEACHERS);
        } catch (err) {
            console.error('Error loading teachers:', err);
            displayTeachersData(DEMO_TEACHERS);
        }
    }
}

// Display teachers data
function displayTeachersData(teachers) {
    const table = document.getElementById('teachersTable');
    
    if (teachers.length > 0) {
        table.innerHTML = teachers.map(tch => `
            <tr>
                <td>${tch.teacherId}</td>
                <td>${tch.name}</td>
                <td>${getDepartmentName(tch.department)}</td>
                <td>${tch.subjects}</td>
                <td>${tch.designation}</td>
                <td>${tch.contact}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewTeacher('${tch.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editTeacher('${tch.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteTeacher('${tch.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No teachers found</td></tr>';
    }
}

// Filter teachers
function filterTeachers() {
    const deptFilter = document.getElementById('teacherDeptFilter').value;
    
    let filtered = [...DEMO_TEACHERS];
    
    if (deptFilter) {
        filtered = filtered.filter(t => t.department === deptFilter);
    }
    
    displayTeachersData(filtered);
}

// Open teacher modal
function openTeacherModal(tchId = null) {
    const title = tchId ? 'Edit Teacher' : 'Add Teacher';
    const content = `
        <form id="teacherForm" class="modal-form">
            <div class="form-group">
                <label for="tchName">Full Name</label>
                <input type="text" id="tchName" required placeholder="Teacher full name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="tchEmail">Email</label>
                    <input type="email" id="tchEmail" required placeholder="Email address">
                </div>
                <div class="form-group">
                    <label for="tchContact">Contact</label>
                    <input type="tel" id="tchContact" required placeholder="10-digit number">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="tchDepartment">Department</label>
                    <select id="tchDepartment" required>
                        <option value="">Select Department</option>
                        <option value="CS">Computer Science</option>
                        <option value="AIML">AI & Machine Learning</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EE">Electrical Engineering</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tchDesignation">Designation</label>
                    <select id="tchDesignation" required>
                        <option value="">Select Designation</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="tchSubjects">Subjects (comma separated)</label>
                <input type="text" id="tchSubjects" required placeholder="e.g., Data Structures, Algorithms">
            </div>
            <div class="form-group">
                <label for="tchQualification">Qualification</label>
                <input type="text" id="tchQualification" placeholder="e.g., Ph.D. in Computer Science">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Teacher
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    document.getElementById('teacherForm').addEventListener('submit', handleTeacherSubmit);
}

// Handle teacher submission
async function handleTeacherSubmit(e) {
    e.preventDefault();
    
    const count = DEMO_TEACHERS.length + 1;
    const year = new Date().getFullYear();
    
    const formData = {
        id: generateId('TCH'),
        teacherId: `TCH${year}${count.toString().padStart(3, '0')}`,
        name: document.getElementById('tchName').value,
        email: document.getElementById('tchEmail').value,
        contact: document.getElementById('tchContact').value,
        department: document.getElementById('tchDepartment').value,
        designation: document.getElementById('tchDesignation').value,
        subjects: document.getElementById('tchSubjects').value,
        qualification: document.getElementById('tchQualification').value
    };
    
    if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email', 'error');
        return;
    }
    
    if (!validatePhone(formData.contact)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_TEACHERS.push(formData);
        showToast('Teacher added successfully!', 'success');
        closeModal();
        loadTeachersData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('teachers')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Teacher added successfully!', 'success');
            closeModal();
            loadTeachersData();
        } catch (err) {
            console.error('Error saving teacher:', err);
            showToast('Error saving teacher', 'error');
        }
    }
}

// View teacher details
function viewTeacher(id) {
    const tch = DEMO_TEACHERS.find(t => t.id === id);
    if (!tch) return;
    
    const content = `
        <div class="teacher-details">
            <div class="teacher-header" style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-chalkboard-teacher" style="font-size: 48px; color: var(--primary-color);"></i>
                <h4 style="margin-top: 10px;">${tch.name}</h4>
                <p style="color: var(--secondary-color);">${tch.designation}</p>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Teacher ID:</label>
                <span>${tch.teacherId}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Department:</label>
                <span>${getDepartmentName(tch.department)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Subjects:</label>
                <span>${tch.subjects}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Email:</label>
                <span>${tch.email}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Contact:</label>
                <span>${tch.contact}</span>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-primary" onclick="editTeacher('${tch.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
    `;
    
    openModal('Teacher Details', content);
}

// Edit teacher
function editTeacher(id) {
    const tch = DEMO_TEACHERS.find(t => t.id === id);
    if (!tch) return;
    
    closeModal();
    openTeacherModal(id);
    
    setTimeout(() => {
        document.getElementById('tchName').value = tch.name;
        document.getElementById('tchEmail').value = tch.email;
        document.getElementById('tchContact').value = tch.contact;
        document.getElementById('tchDepartment').value = tch.department;
        document.getElementById('tchDesignation').value = tch.designation;
        document.getElementById('tchSubjects').value = tch.subjects;
        document.getElementById('tchQualification').value = tch.qualification || '';
    }, 100);
}

// Delete teacher
function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        DEMO_TEACHERS = DEMO_TEACHERS.filter(t => t.id !== id);
        displayTeachersData(DEMO_TEACHERS);
        showToast('Teacher deleted successfully', 'success');
    }
}

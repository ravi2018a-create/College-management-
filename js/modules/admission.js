// Admission Module

// Demo admissions data
let DEMO_ADMISSIONS = [
    { id: 'ADM001', admissionNo: 'ADM2026001', name: 'Rahul Kumar', department: 'CS', year: 2026, date: '2026-03-10', status: 'Active', email: 'rahul@email.com', phone: '9876543210' },
    { id: 'ADM002', admissionNo: 'ADM2026002', name: 'Priya Sharma', department: 'AIML', year: 2026, date: '2026-03-09', status: 'Active', email: 'priya@email.com', phone: '9876543211' },
    { id: 'ADM003', admissionNo: 'ADM2026003', name: 'Amit Singh', department: 'ECE', year: 2026, date: '2026-03-08', status: 'Active', email: 'amit@email.com', phone: '9876543212' },
    { id: 'ADM004', admissionNo: 'ADM2026004', name: 'Sneha Patel', department: 'EE', year: 2026, date: '2026-03-07', status: 'Active', email: 'sneha@email.com', phone: '9876543213' },
    { id: 'ADM005', admissionNo: 'ADM2025001', name: 'Vikram Joshi', department: 'CS', year: 2025, date: '2025-07-15', status: 'Active', email: 'vikram@email.com', phone: '9876543214' }
];

// Load admission data
async function loadAdmissionData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayAdmissionData(DEMO_ADMISSIONS);
    } else {
        try {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('admissions')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) throw error;
            displayAdmissionData(data || DEMO_ADMISSIONS);
        } catch (err) {
            console.error('Error loading admissions:', err);
            displayAdmissionData(DEMO_ADMISSIONS);
        }
    }
}

// Display admission data
function displayAdmissionData(admissions) {
    const table = document.getElementById('admissionTable');
    
    if (admissions.length > 0) {
        table.innerHTML = admissions.map(adm => `
            <tr>
                <td>${adm.admissionNo}</td>
                <td>${adm.name}</td>
                <td>${getDepartmentName(adm.department)}</td>
                <td>${adm.year}</td>
                <td>${formatDate(adm.date)}</td>
                <td>${createStatusBadge(adm.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewAdmission('${adm.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editAdmission('${adm.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteAdmission('${adm.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No admission records</td></tr>';
    }
}

// Filter admissions
function filterAdmissions() {
    const yearFilter = document.getElementById('admissionYearFilter').value;
    const deptFilter = document.getElementById('admissionDeptFilter').value;
    
    let filtered = [...DEMO_ADMISSIONS];
    
    if (yearFilter) {
        filtered = filtered.filter(a => a.year.toString() === yearFilter);
    }
    
    if (deptFilter) {
        filtered = filtered.filter(a => a.department === deptFilter);
    }
    
    displayAdmissionData(filtered);
}

// Open admission modal
function openAdmissionModal(admId = null) {
    const title = admId ? 'Edit Admission' : 'New Admission';
    const content = `
        <form id="admissionForm" class="modal-form">
            <div class="form-group">
                <label for="admName">Student Name</label>
                <input type="text" id="admName" required placeholder="Full name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="admEmail">Email</label>
                    <input type="email" id="admEmail" required placeholder="Email address">
                </div>
                <div class="form-group">
                    <label for="admPhone">Phone</label>
                    <input type="tel" id="admPhone" required placeholder="10-digit number">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="admDepartment">Department</label>
                    <select id="admDepartment" required>
                        <option value="">Select Department</option>
                        <option value="CS">Computer Science</option>
                        <option value="AIML">AI & Machine Learning</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EE">Electrical Engineering</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="admYear">Admission Year</label>
                    <select id="admYear" required>
                        <option value="">Select Year</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026" selected>2026</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="admDate">Admission Date</label>
                    <input type="date" id="admDate" required>
                </div>
                <div class="form-group">
                    <label for="admStatus">Status</label>
                    <select id="admStatus" required>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="admAddress">Address</label>
                <textarea id="admAddress" rows="2" placeholder="Complete address"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Admission
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    
    // Set today's date as default
    document.getElementById('admDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('admissionForm').addEventListener('submit', handleAdmissionSubmit);
}

// Handle admission submission
async function handleAdmissionSubmit(e) {
    e.preventDefault();
    
    const year = document.getElementById('admYear').value;
    const count = DEMO_ADMISSIONS.filter(a => a.year.toString() === year).length + 1;
    
    const formData = {
        id: generateId('ADM'),
        admissionNo: `ADM${year}${count.toString().padStart(3, '0')}`,
        name: document.getElementById('admName').value,
        email: document.getElementById('admEmail').value,
        phone: document.getElementById('admPhone').value,
        department: document.getElementById('admDepartment').value,
        year: parseInt(year),
        date: document.getElementById('admDate').value,
        status: document.getElementById('admStatus').value,
        address: document.getElementById('admAddress').value
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
        DEMO_ADMISSIONS.unshift(formData);
        
        // Also create a student record
        if (typeof DEMO_STUDENTS !== 'undefined') {
            DEMO_STUDENTS.push({
                id: generateId('STU'),
                studentId: `STU${year}${count.toString().padStart(3, '0')}`,
                name: formData.name,
                department: formData.department,
                year: 1,
                email: formData.email,
                phone: formData.phone,
                hostelStatus: 'No',
                feeStatus: 'Pending'
            });
        }
        
        showToast('Admission registered successfully!', 'success');
        closeModal();
        loadAdmissionData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('admissions')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Admission registered successfully!', 'success');
            closeModal();
            loadAdmissionData();
        } catch (err) {
            console.error('Error saving admission:', err);
            showToast('Error saving admission', 'error');
        }
    }
}

// View admission details
function viewAdmission(id) {
    const adm = DEMO_ADMISSIONS.find(a => a.id === id);
    if (!adm) return;
    
    const content = `
        <div class="admission-details">
            <div class="detail-row">
                <label>Admission No:</label>
                <span>${adm.admissionNo}</span>
            </div>
            <div class="detail-row">
                <label>Name:</label>
                <span>${adm.name}</span>
            </div>
            <div class="detail-row">
                <label>Email:</label>
                <span>${adm.email}</span>
            </div>
            <div class="detail-row">
                <label>Phone:</label>
                <span>${adm.phone}</span>
            </div>
            <div class="detail-row">
                <label>Department:</label>
                <span>${getDepartmentName(adm.department)}</span>
            </div>
            <div class="detail-row">
                <label>Admission Date:</label>
                <span>${formatDate(adm.date)}</span>
            </div>
            <div class="detail-row">
                <label>Status:</label>
                <span>${createStatusBadge(adm.status)}</span>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-primary" onclick="printAdmission('${adm.id}')">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
    `;
    
    openModal('Admission Details', content);
}

// Edit admission
function editAdmission(id) {
    const adm = DEMO_ADMISSIONS.find(a => a.id === id);
    if (!adm) return;
    
    openAdmissionModal(id);
    
    setTimeout(() => {
        document.getElementById('admName').value = adm.name;
        document.getElementById('admEmail').value = adm.email;
        document.getElementById('admPhone').value = adm.phone;
        document.getElementById('admDepartment').value = adm.department;
        document.getElementById('admYear').value = adm.year;
        document.getElementById('admDate').value = adm.date;
        document.getElementById('admStatus').value = adm.status;
        document.getElementById('admAddress').value = adm.address || '';
    }, 100);
}

// Delete admission
function deleteAdmission(id) {
    if (confirm('Are you sure you want to delete this admission?')) {
        DEMO_ADMISSIONS = DEMO_ADMISSIONS.filter(a => a.id !== id);
        displayAdmissionData(DEMO_ADMISSIONS);
        showToast('Admission deleted successfully', 'success');
    }
}

// Print admission
function printAdmission(id) {
    showToast('Print feature - Generating admission letter...', 'success');
}

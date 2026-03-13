// Registrar Module

// Demo registrar data
let DEMO_DCC_STAFF = [
    { id: 'DCC001', name: 'Mohan Rao', role: 'Senior Clerk', contact: '9876543220' },
    { id: 'DCC002', name: 'Lakshmi Devi', role: 'Records Manager', contact: '9876543221' }
];

let DEMO_SCHOLARSHIPS = [
    { id: 'SCH001', studentName: 'Rahul Kumar', studentId: 'STU001', type: 'Merit Scholarship', amount: 50000, status: 'Approved' },
    { id: 'SCH002', studentName: 'Priya Sharma', studentId: 'STU002', type: 'Need-Based', amount: 30000, status: 'Pending' }
];

let DEMO_BENEFITS = [
    { id: 'BEN001', studentName: 'Amit Singh', studentId: 'STU003', type: 'Book Allowance', description: 'Annual book grant', status: 'Active' },
    { id: 'BEN002', studentName: 'Sneha Patel', studentId: 'STU004', type: 'Transport', description: 'Bus pass subsidy', status: 'Active' }
];

// Load registrar data
async function loadRegistrarData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayDCCStaff(DEMO_DCC_STAFF);
        displayScholarships(DEMO_SCHOLARSHIPS);
        displayBenefits(DEMO_BENEFITS);
    } else {
        try {
            const [staffRes, scholarshipsRes, benefitsRes] = await Promise.all([
                window.CMS_CONFIG.supabase.from('registrar_staff').select('*'),
                window.CMS_CONFIG.supabase.from('scholarships').select('*'),
                window.CMS_CONFIG.supabase.from('benefits').select('*')
            ]);
            
            displayDCCStaff(staffRes.data || DEMO_DCC_STAFF);
            displayScholarships(scholarshipsRes.data || DEMO_SCHOLARSHIPS);
            displayBenefits(benefitsRes.data || DEMO_BENEFITS);
        } catch (err) {
            console.error('Error loading registrar data:', err);
            displayDCCStaff(DEMO_DCC_STAFF);
            displayScholarships(DEMO_SCHOLARSHIPS);
            displayBenefits(DEMO_BENEFITS);
        }
    }
}

// Display DCC Staff
function displayDCCStaff(staff) {
    const table = document.getElementById('dccStaffTable');
    
    if (staff.length > 0) {
        table.innerHTML = staff.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.role}</td>
                <td>${s.contact}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editStaff('${s.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteStaff('${s.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="4" class="text-center">No records found</td></tr>';
    }
}

// Display Scholarships
function displayScholarships(scholarships) {
    const table = document.getElementById('scholarshipTable');
    
    if (scholarships.length > 0) {
        table.innerHTML = scholarships.map(s => `
            <tr>
                <td>${s.studentName}</td>
                <td>${s.type}</td>
                <td>${formatCurrency(s.amount)}</td>
                <td>${createStatusBadge(s.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewScholarship('${s.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editScholarship('${s.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="5" class="text-center">No records found</td></tr>';
    }
}

// Display Benefits
function displayBenefits(benefits) {
    const table = document.getElementById('benefitsTable');
    
    if (benefits.length > 0) {
        table.innerHTML = benefits.map(b => `
            <tr>
                <td>${b.studentName}</td>
                <td>${b.type}</td>
                <td>${b.description}</td>
                <td>${createStatusBadge(b.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editBenefit('${b.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteBenefit('${b.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="5" class="text-center">No records found</td></tr>';
    }
}

// Open staff modal
function openStaffModal(type = 'dcc') {
    const content = `
        <form id="staffForm" class="modal-form">
            <div class="form-group">
                <label for="staffName">Full Name</label>
                <input type="text" id="staffName" required placeholder="Enter full name">
            </div>
            <div class="form-group">
                <label for="staffRole">Role</label>
                <select id="staffRole" required>
                    <option value="">Select Role</option>
                    <option value="Senior Clerk">Senior Clerk</option>
                    <option value="Junior Clerk">Junior Clerk</option>
                    <option value="Records Manager">Records Manager</option>
                    <option value="Data Entry Operator">Data Entry Operator</option>
                </select>
            </div>
            <div class="form-group">
                <label for="staffContact">Contact Number</label>
                <input type="tel" id="staffContact" required placeholder="10-digit number">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>
    `;
    
    openModal('Add Staff Member', content);
    document.getElementById('staffForm').addEventListener('submit', handleStaffSubmit);
}

// Handle staff submission
async function handleStaffSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId('DCC'),
        name: document.getElementById('staffName').value,
        role: document.getElementById('staffRole').value,
        contact: document.getElementById('staffContact').value
    };
    
    try {
        const { error } = await window.CMS_CONFIG.supabase
            .from('registrar_staff')
            .insert(formData);
        
        if (error) throw error;
        
        showToast('Staff member added successfully', 'success');
        closeModal();
        loadRegistrarData();
    } catch (err) {
        console.error('Error saving staff:', err);
        showToast('Error saving record', 'error');
    }
}

// Open scholarship modal
function openScholarshipModal() {
    const content = `
        <form id="scholarshipForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="schStudentId">Student ID</label>
                    <input type="text" id="schStudentId" required placeholder="Student ID">
                </div>
                <div class="form-group">
                    <label for="schStudentName">Student Name</label>
                    <input type="text" id="schStudentName" required placeholder="Student name">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="schType">Scholarship Type</label>
                    <select id="schType" required>
                        <option value="">Select Type</option>
                        <option value="Merit Scholarship">Merit Scholarship</option>
                        <option value="Need-Based">Need-Based</option>
                        <option value="Sports Scholarship">Sports Scholarship</option>
                        <option value="Government Scholarship">Government Scholarship</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="schAmount">Amount (₹)</label>
                    <input type="number" id="schAmount" required min="0" placeholder="Amount">
                </div>
            </div>
            <div class="form-group">
                <label for="schStatus">Status</label>
                <select id="schStatus" required>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>
    `;
    
    openModal('Add Scholarship', content);
    document.getElementById('scholarshipForm').addEventListener('submit', handleScholarshipSubmit);
}

// Handle scholarship submission
async function handleScholarshipSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId('SCH'),
        studentId: document.getElementById('schStudentId').value,
        studentName: document.getElementById('schStudentName').value,
        type: document.getElementById('schType').value,
        amount: parseFloat(document.getElementById('schAmount').value),
        status: document.getElementById('schStatus').value
    };
    
    try {
        const { error } = await window.CMS_CONFIG.supabase
            .from('scholarships')
            .insert(formData);
        
        if (error) throw error;
        
        showToast('Scholarship added successfully', 'success');
        closeModal();
        loadRegistrarData();
    } catch (err) {
        console.error('Error saving scholarship:', err);
        showToast('Error saving record', 'error');
    }
}

// Open benefit modal
function openBenefitModal() {
    const content = `
        <form id="benefitForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="benStudentId">Student ID</label>
                    <input type="text" id="benStudentId" required placeholder="Student ID">
                </div>
                <div class="form-group">
                    <label for="benStudentName">Student Name</label>
                    <input type="text" id="benStudentName" required placeholder="Student name">
                </div>
            </div>
            <div class="form-group">
                <label for="benType">Benefit Type</label>
                <select id="benType" required>
                    <option value="">Select Type</option>
                    <option value="Book Allowance">Book Allowance</option>
                    <option value="Transport">Transport Subsidy</option>
                    <option value="Hostel Fee Waiver">Hostel Fee Waiver</option>
                    <option value="Laptop Grant">Laptop Grant</option>
                </select>
            </div>
            <div class="form-group">
                <label for="benDescription">Description</label>
                <textarea id="benDescription" rows="3" placeholder="Description"></textarea>
            </div>
            <div class="form-group">
                <label for="benStatus">Status</label>
                <select id="benStatus" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save
                </button>
            </div>
        </form>
    `;
    
    openModal('Add Benefit', content);
    document.getElementById('benefitForm').addEventListener('submit', handleBenefitSubmit);
}

// Handle benefit submission
async function handleBenefitSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId('BEN'),
        studentId: document.getElementById('benStudentId').value,
        studentName: document.getElementById('benStudentName').value,
        type: document.getElementById('benType').value,
        description: document.getElementById('benDescription').value,
        status: document.getElementById('benStatus').value
    };
    
    try {
        const { error } = await window.CMS_CONFIG.supabase
            .from('benefits')
            .insert(formData);
        
        if (error) throw error;
        
        showToast('Benefit added successfully', 'success');
        closeModal();
        loadRegistrarData();
    } catch (err) {
        console.error('Error saving benefit:', err);
        showToast('Error saving record', 'error');
    }
}

// View scholarship details
async function viewScholarship(id) {
    try {
        const { data: scholarship, error } = await window.CMS_CONFIG.supabase
            .from('scholarships')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        if (!scholarship) {
            showToast('Scholarship not found', 'error');
            return;
        }
        
        const content = `
            <div class="scholarship-details">
                <p><strong>Student:</strong> ${scholarship.studentName}</p>
                <p><strong>Type:</strong> ${scholarship.type}</p>
                <p><strong>Amount:</strong> ${formatCurrency(scholarship.amount)}</p>
                <p><strong>Status:</strong> ${createStatusBadge(scholarship.status)}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        `;
        
        openModal('Scholarship Details', content);
    } catch (err) {
        console.error('Error fetching scholarship:', err);
        showToast('Error loading scholarship details', 'error');
    }
}

// Edit and delete stubs
function editStaff(id) { showToast('Edit staff: ' + id); }
async function deleteStaff(id) { 
    if (confirm('Delete this staff member?')) {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('registrar_staff')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            showToast('Staff member deleted', 'success');
            loadRegistrarData();
        } catch (err) {
            console.error('Error deleting staff:', err);
            showToast('Error deleting staff member', 'error');
        }
    }
}
function editScholarship(id) { showToast('Edit scholarship: ' + id); }
function editBenefit(id) { showToast('Edit benefit: ' + id); }
async function deleteBenefit(id) {
    if (confirm('Delete this benefit?')) {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('benefits')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            showToast('Benefit deleted', 'success');
            loadRegistrarData();
        } catch (err) {
            console.error('Error deleting benefit:', err);
            showToast('Error deleting benefit', 'error');
        }
    }
}

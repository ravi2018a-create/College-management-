// Hostel Module

// Live data storage
let currentHostels = [];
let currentAllocations = [];
let currentHostelRequests = [];

// Helper: get current admin user from localStorage (cms_user key)
function getAdminUser() {
    try {
        return JSON.parse(localStorage.getItem('cms_user') || sessionStorage.getItem('user') || '{}');
    } catch (e) {
        return {};
    }
}

// Original hostel form HTML (to restore after allocation/details modals)
const HOSTEL_FORM_HTML = `
    <form id="hostelForm" class="modal-form">
        <input type="hidden" id="hostelId">
        <div class="form-row">
            <div class="form-group">
                <label>Hostel Name <span style="color:red;">*</span></label>
                <input type="text" id="hostelName" required placeholder="Enter hostel name">
            </div>
            <div class="form-group">
                <label>Type <span style="color:red;">*</span></label>
                <select id="hostelType" required>
                    <option value="">Select Type</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Total Rooms <span style="color:red;">*</span></label>
                <input type="number" id="hostelTotalRooms" required min="1" placeholder="e.g., 100">
            </div>
            <div class="form-group">
                <label>Fee per Month (₹)</label>
                <input type="number" id="hostelFee" min="0" placeholder="e.g., 15000">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Warden Name</label>
                <input type="text" id="hostelWardenName" placeholder="e.g., Mr. Rajesh Kumar">
            </div>
            <div class="form-group">
                <label>Warden Contact</label>
                <input type="tel" id="hostelWardenContact" placeholder="e.g., 9876543210">
            </div>
        </div>
        <div class="form-row full">
            <div class="form-group">
                <label>Facilities</label>
                <textarea id="hostelFacilities" rows="3" placeholder="e.g., AC Rooms, WiFi, Mess, Gym, Laundry"></textarea>
            </div>
        </div>
    </form>
`;

// Restore hostel modal to its original form state
function restoreHostelModal() {
    const modalBody = document.getElementById('hostelModal').querySelector('.modal-body');
    modalBody.innerHTML = HOSTEL_FORM_HTML;
    // Restore footer buttons
    const modalFooter = document.getElementById('hostelModal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="btn" onclick="closeModal('hostelModal')">Cancel</button>
        <button class="btn btn-primary" onclick="saveHostel()">Save Hostel</button>
    `;
}

// Helper: check if current user can manage hostels
function canManageHostel() {
    const user = getAdminUser();
    return user.role && ['admin', 'chairman', 'principal', 'hostel_warden'].includes(user.role);
}
async function loadHostelData() {
    try {
        const [hostelsRes, allocationsRes] = await Promise.all([
            window.CMS_CONFIG.supabase.from('hostels').select('*'),
            window.CMS_CONFIG.supabase.from('hostel_allocations').select('*')
        ]);
        
        currentHostels = hostelsRes.data || [];
        currentAllocations = allocationsRes.data || [];
        
        displayHostelData(currentHostels);
        displayAllocationData(currentAllocations);
        updateHostelStats();
        
        // Also load hostel requests
        loadHostelRequests();
    } catch (err) {
        console.error('Error loading hostel data:', err);
        displayHostelData([]);
        displayAllocationData([]);
        updateHostelStats();
    }
}

// Update hostel statistics
function updateHostelStats() {
    const totalHostels = currentHostels.length;
    const totalRooms = currentHostels.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
    const totalOccupied = currentHostels.reduce((sum, h) => sum + (h.occupied || 0), 0);
    
    // Update statistics cards
    const totalHostelsEl = document.getElementById('totalHostelsCount');
    const totalRoomsEl = document.getElementById('totalRoomsCount');
    const occupiedRoomsEl = document.getElementById('occupiedRoomsCount');
    
    if (totalHostelsEl) totalHostelsEl.textContent = totalHostels;
    if (totalRoomsEl) totalRoomsEl.textContent = totalRooms;
    if (occupiedRoomsEl) occupiedRoomsEl.textContent = totalOccupied;
}

// Display hostel data
function displayHostelData(hostels) {
    const table = document.getElementById('hostelTableBody');
    if (!table) return;
    
    if (hostels.length > 0) {
        table.innerHTML = hostels.map(hostel => {
            const vacant = hostel.total_rooms - (hostel.occupied || 0);
            const wardenName = hostel.warden_name || hostel.warden || 'Not Assigned';
            const wardenContact = hostel.warden_contact || hostel.contact || '';
            // Check if current user can edit/delete hostels
            const canEdit = canManageHostel();
            
            return `
            <tr>
                <td>${hostel.name}</td>
                <td><span class="status-badge ${hostel.type === 'Boys' ? 'active' : 'approved'}">${hostel.type}</span></td>
                <td>${hostel.total_rooms}</td>
                <td>${hostel.occupied || 0}</td>
                <td>${vacant}</td>
                <td>${wardenName}<br><small style="color: #666;">${wardenContact}</small></td>
                ${canEdit ? `
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="viewHostelStudents('${hostel.id}')" title="View Students" style="color:#0984e3;">
                            <i class="fas fa-users"></i>
                        </button>
                        <button class="action-btn edit" onclick="editHostel('${hostel.id}')" title="Edit Hostel">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteHostel('${hostel.id}')" title="Delete Hostel">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>` : '<td>-</td>'}
            </tr>`;
        }).join('');
    } else {
        const canEdit = canManageHostel();
        const colspan = canEdit ? '7' : '6';
        table.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; color:var(--gray);">No hostels found</td></tr>`;
    }
}

// Display allocation data
function displayAllocationData(allocations) {
    const table = document.getElementById('allocationTable');
    if (!table) return;
    
    if (allocations.length > 0) {
        table.innerHTML = allocations.map(alloc => `
            <tr>
                <td>${alloc.student_name || alloc.studentName || 'N/A'}</td>
                <td>${alloc.student_id || alloc.studentId || 'N/A'}</td>
                <td>${alloc.hostel_name || alloc.hostelName || 'N/A'}</td>
                <td>${alloc.room_no || alloc.roomNo || 'N/A'}</td>
                <td>${formatDate(alloc.allocation_date || alloc.allocationDate)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editAllocation('${alloc.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deallocateRoom('${alloc.id}')" title="Deallocate">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="6" class="text-center">No allocations found</td></tr>';
    }
}

// Search/filter allocations
function searchAllocations() {
    const searchInput = document.getElementById('allocationSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayAllocationData(currentAllocations);
        return;
    }
    
    const filtered = currentAllocations.filter(alloc => {
        const studentName = (alloc.student_name || alloc.studentName || '').toLowerCase();
        const studentId = (alloc.student_id || alloc.studentId || '').toLowerCase();
        const hostelName = (alloc.hostel_name || alloc.hostelName || '').toLowerCase();
        const roomNo = (alloc.room_no || alloc.roomNo || '').toLowerCase();
        
        return studentName.includes(searchTerm) || 
               studentId.includes(searchTerm) || 
               hostelName.includes(searchTerm) || 
               roomNo.includes(searchTerm);
    });
    
    displayAllocationData(filtered);
}

// Open hostel modal
function openHostelModal(hostelId = null) {
    // Always restore the form first (in case allocation/details modal replaced it)
    restoreHostelModal();
    
    // Clear form
    document.getElementById('hostelForm').reset();
    document.getElementById('hostelId').value = hostelId || '';
    
    // Set modal title
    const title = hostelId ? 'Edit Hostel' : 'Add Hostel';
    document.getElementById('hostelModalTitle').textContent = title;
    
    // If editing, populate form with existing data
    if (hostelId) {
        const hostel = currentHostels.find(h => String(h.id) === String(hostelId));
        if (hostel) {
            document.getElementById('hostelName').value = hostel.name || '';
            document.getElementById('hostelType').value = hostel.type || '';
            document.getElementById('hostelTotalRooms').value = hostel.total_rooms || '';
            document.getElementById('hostelWardenName').value = hostel.warden_name || hostel.warden || '';
            document.getElementById('hostelWardenContact').value = hostel.warden_contact || hostel.contact || '';
            document.getElementById('hostelFacilities').value = hostel.facilities || '';
            document.getElementById('hostelFee').value = hostel.fee_per_month || '';
        }
    }
    
    // Open the modal
    document.getElementById('hostelModal').classList.add('active');
}

// Handle hostel submission
async function handleHostelSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId('HST'),
        name: document.getElementById('hostelName').value,
        type: document.getElementById('hostelType').value,
        totalRooms: parseInt(document.getElementById('hostelRooms').value),
        occupied: 0,
        warden: document.getElementById('hostelWarden').value,
        contact: document.getElementById('hostelContact').value
    };
    
    if (!validatePhone(formData.contact)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_HOSTELS.push(formData);
        showToast('Hostel added successfully!', 'success');
        closeModal();
        loadHostelData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('hostels')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Hostel added successfully!', 'success');
            closeModal();
            loadHostelData();
        } catch (err) {
            console.error('Error saving hostel:', err);
            showToast('Error saving hostel', 'error');
        }
    }
}

// Open allocation modal
function openAllocationModal() {
    const availableHostels = currentHostels.filter(h => (h.total_rooms - (h.occupied || 0)) > 0);
    
    // Use the existing hostel modal but change its content
    document.getElementById('hostelModalTitle').textContent = 'Allocate Room';
    const modalBody = document.getElementById('hostelModal').querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="allocationForm" class="modal-form">
            <div class="form-group">
                <label for="allocStudentId">Student ID <span style="color:red;">*</span></label>
                <input type="text" id="allocStudentId" required placeholder="Enter Student ID">
            </div>
            <div class="form-group">
                <label for="allocStudentName">Student Name <span style="color:red;">*</span></label>
                <input type="text" id="allocStudentName" required placeholder="Student name">
            </div>
            <div class="form-group">
                <label for="allocHostel">Select Hostel <span style="color:red;">*</span></label>
                <select id="allocHostel" required>
                    <option value="">Select Hostel</option>
                    ${availableHostels.map(h => 
                        `<option value="${h.id}" data-name="${h.name}">${h.name} (Available: ${h.total_rooms - (h.occupied || 0)})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="allocRoom">Room Number <span style="color:red;">*</span></label>
                <input type="text" id="allocRoom" required placeholder="e.g., A-101">
            </div>
            <div class="form-group">
                <label for="allocDate">Allocation Date <span style="color:red;">*</span></label>
                <input type="date" id="allocDate" required>
            </div>
        </form>
    `;
    
    // Update footer buttons
    const modalFooter = document.getElementById('hostelModal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn" onclick="closeAllocationModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitAllocation()">
            <i class="fas fa-bed"></i> Allocate Room
        </button>
    `;
    
    // Set today's date as default
    document.getElementById('allocDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('hostelModal').classList.add('active');
}

// Close allocation modal and restore hostel form
function closeAllocationModal() {
    document.getElementById('hostelModal').classList.remove('active');
    restoreHostelModal();
}

// Submit allocation
function submitAllocation() {
    const form = document.getElementById('allocationForm');
    if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        handleAllocationSubmit(event);
    }
}

// Handle allocation submission
async function handleAllocationSubmit(e) {
    if (e) e.preventDefault();
    
    const hostelSelect = document.getElementById('allocHostel');
    const hostelId = parseInt(hostelSelect.value);
    const hostelName = hostelSelect.options[hostelSelect.selectedIndex].dataset.name;
    
    const hostel = currentHostels.find(h => h.id === hostelId);
    
    if (!hostel || (hostel.occupied || 0) >= hostel.total_rooms) {
        showToast('No rooms available in selected hostel', 'error');
        return;
    }
    
    const allocationData = {
        student_id: document.getElementById('allocStudentId').value.trim(),
        student_name: document.getElementById('allocStudentName').value.trim(),
        hostel_id: hostelId,
        hostel_name: hostelName,
        room_no: document.getElementById('allocRoom').value.trim(),
        allocation_date: document.getElementById('allocDate').value
    };
    
    // Validation
    if (!allocationData.student_id || !allocationData.student_name || !allocationData.room_no) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    try {
        // Check if student already has an allocation
        const existingAlloc = currentAllocations.find(a => 
            a.student_id.toLowerCase() === allocationData.student_id.toLowerCase()
        );
        
        if (existingAlloc) {
            showToast(`Student ${allocationData.student_id} is already allocated to ${existingAlloc.hostel_name}, Room ${existingAlloc.room_no}`, 'error');
            return;
        }
        
        // Check for duplicate room number in same hostel
        const duplicateRoom = currentAllocations.find(a => 
            a.hostel_name === hostelName && 
            a.room_no.toLowerCase() === allocationData.room_no.toLowerCase()
        );
        
        if (duplicateRoom) {
            showToast(`Room ${allocationData.room_no} in ${hostelName} is already allocated to ${duplicateRoom.student_name}`, 'error');
            return;
        }
        // Insert allocation record
        const { error: allocError } = await window.CMS_CONFIG.supabase
            .from('hostel_allocations')
            .insert([allocationData]);
        
        if (allocError) throw allocError;
        
        // Update hostel occupied count
        const newOccupied = (hostel.occupied || 0) + 1;
        const { error: updateError } = await window.CMS_CONFIG.supabase
            .from('hostels')
            .update({ occupied: newOccupied })
            .eq('id', hostelId);
        
        if (updateError) throw updateError;
        
        showToast('Room allocated successfully!', 'success');
        closeAllocationModal();
        loadHostelData();
        
    } catch (err) {
        console.error('Error allocating room:', err);
        showToast('Error allocating room: ' + err.message, 'error');
    }
}

// View hostel details
function viewHostel(id) {
    const hostel = currentHostels.find(h => String(h.id) === String(id));
    if (!hostel) {
        showToast('Hostel not found', 'error');
        return;
    }
    
    const vacancy = hostel.total_rooms - (hostel.occupied || 0);
    const occupancyPercent = Math.round(((hostel.occupied || 0) / hostel.total_rooms) * 100);
    const wardenName = hostel.warden_name || hostel.warden || 'Not Assigned';
    const wardenContact = hostel.warden_contact || hostel.contact || 'N/A';
    
    // Create temporary modal for hostel details
    const content = `
        <div class="hostel-details" style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas ${hostel.type === 'Boys' ? 'fa-male' : 'fa-female'}" 
                   style="font-size: 48px; color: ${hostel.type === 'Boys' ? '#0984e3' : '#e84393'};"></i>
                <h4 style="margin-top: 10px;">${hostel.name}</h4>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Type:</label>
                <span>${hostel.type} Hostel</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Total Rooms:</label>
                <span>${hostel.total_rooms}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Occupied:</label>
                <span>${hostel.occupied || 0} (${occupancyPercent}%)</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Vacant:</label>
                <span style="color: #28a745; font-weight: bold;">${vacancy}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Warden:</label>
                <span>${wardenName}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Contact:</label>
                <span>${wardenContact}</span>
            </div>
            ${hostel.facilities ? `
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #eee;">
                <label>Facilities:</label>
                <span style="text-align: right; max-width: 60%;">${hostel.facilities}</span>
            </div>` : ''}
            ${hostel.fee_per_month ? `
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Monthly Fee:</label>
                <span>₹${hostel.fee_per_month.toLocaleString()}</span>
            </div>` : ''}
        </div>
    `;
    
    // Use the existing hostel modal
    document.getElementById('hostelModalTitle').textContent = 'Hostel Details';
    const modalBody = document.getElementById('hostelModal').querySelector('.modal-body');
    modalBody.innerHTML = content;
    const modalFooter = document.getElementById('hostelModal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="closeHostelDetailsModal()">Close</button>
    `;
    document.getElementById('hostelModal').classList.add('active');
}

// View all students in a specific hostel
function viewHostelStudents(hostelId) {
    const hostel = currentHostels.find(h => String(h.id) === String(hostelId));
    if (!hostel) {
        showToast('Hostel not found', 'error');
        return;
    }
    
    const students = currentAllocations.filter(a => a.hostel_id === hostel.id || a.hostel_name === hostel.name);
    
    const studentsHtml = students.length > 0 ? `
        <table class="table" style="margin-top:15px;">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Room No</th>
                    <th>Since</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(s => `
                    <tr>
                        <td>${s.student_name}</td>
                        <td>${s.student_id}</td>
                        <td><strong>${s.room_no}</strong></td>
                        <td>${formatDate(s.allocation_date)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p style="text-align:center;color:#888;padding:20px;">No students allocated yet</p>';
    
    const content = `
        <div class="hostel-students" style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas ${hostel.type === 'Boys' ? 'fa-male' : 'fa-female'}" 
                   style="font-size: 48px; color: ${hostel.type === 'Boys' ? '#0984e3' : '#e84393'};"></i>
                <h4 style="margin-top: 10px;">${hostel.name}</h4>
                <p style="color:#666;">Occupied: ${students.length} / ${hostel.total_rooms} rooms</p>
            </div>
            ${studentsHtml}
        </div>
    `;
    
    // Use the existing hostel modal
    document.getElementById('hostelModalTitle').textContent = 'Students in ' + hostel.name;
    const modalBody = document.getElementById('hostelModal').querySelector('.modal-body');
    modalBody.innerHTML = content;
    const modalFooter = document.getElementById('hostelModal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="closeHostelDetailsModal()">Close</button>
    `;
    document.getElementById('hostelModal').classList.add('active');
}

// Close hostel details modal and restore form
function closeHostelDetailsModal() {
    document.getElementById('hostelModal').classList.remove('active');
    restoreHostelModal();
}

// Edit hostel
function editHostel(id) {
    const hostel = currentHostels.find(h => String(h.id) === String(id));
    if (!hostel) {
        showToast('Hostel not found', 'error');
        return;
    }
    
    // Open modal with hostel data
    openHostelModal(id);
}

// Delete hostel
async function deleteHostel(id) {
    if (!confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
        return;
    }
    
    try {
        const result = await window.CMS_CONFIG.supabase
            .from('hostels')
            .delete()
            .eq('id', id);
            
        if (result.error) {
            console.error('Error deleting hostel:', result.error);
            showToast('Error deleting hostel: ' + result.error.message, 'error');
            return;
        }
        
        showToast('Hostel deleted successfully!', 'success');
        loadHostelData(); // Reload the data
        
    } catch (error) {
        console.error('Error deleting hostel:', error);
        showToast('Error deleting hostel', 'error');
    }
}

// Edit allocation
function editAllocation(id) {
    const allocation = currentAllocations.find(a => String(a.id) === String(id));
    if (!allocation) {
        showToast('Allocation not found', 'error');
        return;
    }
    
    const availableHostels = currentHostels.filter(h => 
        h.name === allocation.hostel_name || (h.total_rooms - (h.occupied || 0)) > 0
    );
    
    // Use the existing hostel modal but change its content
    document.getElementById('hostelModalTitle').textContent = 'Edit Room Allocation';
    const modalBody = document.getElementById('hostelModal').querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="editAllocationForm" class="modal-form">
            <input type="hidden" id="editAllocId" value="${allocation.id}">
            <input type="hidden" id="editOldHostelId" value="${allocation.hostel_id}">
            <div class="form-group">
                <label for="editAllocStudentId">Student ID</label>
                <input type="text" id="editAllocStudentId" value="${allocation.student_id}" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label for="editAllocStudentName">Student Name</label>
                <input type="text" id="editAllocStudentName" value="${allocation.student_name}" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label for="editAllocHostel">Select Hostel <span style="color:red;">*</span></label>
                <select id="editAllocHostel" required>
                    ${availableHostels.map(h => 
                        `<option value="${h.id}" data-name="${h.name}" ${h.id === allocation.hostel_id ? 'selected' : ''}>${h.name} (Available: ${h.total_rooms - (h.occupied || 0)})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="editAllocRoom">Room Number <span style="color:red;">*</span></label>
                <input type="text" id="editAllocRoom" value="${allocation.room_no}" required placeholder="e.g., A-101">
            </div>
            <div class="form-group">
                <label for="editAllocDate">Allocation Date</label>
                <input type="date" id="editAllocDate" value="${allocation.allocation_date}" required>
            </div>
        </form>
    `;
    
    // Update footer buttons
    const modalFooter = document.getElementById('hostelModal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn" onclick="closeEditAllocationModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitEditAllocation()">
            <i class="fas fa-save"></i> Update Allocation
        </button>
    `;
    
    document.getElementById('hostelModal').classList.add('active');
}

// Close edit allocation modal
function closeEditAllocationModal() {
    document.getElementById('hostelModal').classList.remove('active');
    restoreHostelModal();
}

// Submit edit allocation
async function submitEditAllocation() {
    const allocId = document.getElementById('editAllocId').value;
    const oldHostelId = parseInt(document.getElementById('editOldHostelId').value);
    const newHostelId = parseInt(document.getElementById('editAllocHostel').value);
    const hostelSelect = document.getElementById('editAllocHostel');
    const hostelName = hostelSelect.options[hostelSelect.selectedIndex].dataset.name;
    const roomNo = document.getElementById('editAllocRoom').value.trim();
    const allocationDate = document.getElementById('editAllocDate').value;
    
    if (!roomNo) {
        showToast('Please enter room number', 'error');
        return;
    }
    
    try {
        // Check for duplicate room in the same hostel (excluding current allocation)
        const duplicateRoom = currentAllocations.find(a => 
            String(a.id) !== String(allocId) &&
            a.hostel_name === hostelName && 
            a.room_no.toLowerCase() === roomNo.toLowerCase()
        );
        
        if (duplicateRoom) {
            showToast(`Room ${roomNo} in ${hostelName} is already allocated to ${duplicateRoom.student_name}`, 'error');
            return;
        }
        
        // Update allocation
        const { error: updateError } = await window.CMS_CONFIG.supabase
            .from('hostel_allocations')
            .update({
                hostel_id: newHostelId,
                hostel_name: hostelName,
                room_no: roomNo,
                allocation_date: allocationDate
            })
            .eq('id', allocId);
        
        if (updateError) throw updateError;
        
        // If hostel changed, update occupied counts
        if (oldHostelId !== newHostelId) {
            // Decrease old hostel
            const oldHostel = currentHostels.find(h => h.id === oldHostelId);
            if (oldHostel) {
                await window.CMS_CONFIG.supabase
                    .from('hostels')
                    .update({ occupied: Math.max(0, (oldHostel.occupied || 0) - 1) })
                    .eq('id', oldHostelId);
            }
            
            // Increase new hostel
            const newHostel = currentHostels.find(h => h.id === newHostelId);
            if (newHostel) {
                await window.CMS_CONFIG.supabase
                    .from('hostels')
                    .update({ occupied: (newHostel.occupied || 0) + 1 })
                    .eq('id', newHostelId);
            }
        }
        
        showToast('Allocation updated successfully!', 'success');
        closeEditAllocationModal();
        loadHostelData();
    } catch (err) {
        console.error('Error updating allocation:', err);
        showToast('Error updating allocation: ' + err.message, 'error');
    }
}

// Save hostel (Add/Edit)
async function saveHostel() {
    const hostelId = document.getElementById('hostelId').value;
    const existingHostel = hostelId ? currentHostels.find(h => String(h.id) === String(hostelId)) : null;
    const wardenName = document.getElementById('hostelWardenName').value.trim() || null;
    const wardenContact = document.getElementById('hostelWardenContact').value.trim() || null;
    
    const hostelData = {
        name: document.getElementById('hostelName').value.trim(),
        type: document.getElementById('hostelType').value,
        total_rooms: parseInt(document.getElementById('hostelTotalRooms').value),
        warden_name: wardenName,
        warden_contact: wardenContact,
        facilities: document.getElementById('hostelFacilities').value.trim() || null,
        fee_per_month: document.getElementById('hostelFee').value ? parseInt(document.getElementById('hostelFee').value) : null
    };

    if (!hostelId) {
        hostelData.occupied = 0;
    }

    // Validation
    if (!hostelData.name) {
        showToast('Please enter hostel name', 'error');
        return;
    }
    
    if (!hostelData.type) {
        showToast('Please select hostel type', 'error');
        return;
    }
    
    if (!hostelData.total_rooms || hostelData.total_rooms < 1) {
        showToast('Please enter valid number of rooms', 'error');
        return;
    }

    if (hostelId && existingHostel && existingHostel.occupied > hostelData.total_rooms) {
        showToast('Total rooms cannot be less than currently occupied rooms', 'error');
        return;
    }

    if (hostelId && existingHostel && typeof existingHostel.occupied === 'number') {
        hostelData.occupied = existingHostel.occupied;
    }

    const persistHostel = async (payload) => {
        if (hostelId) {
            return await window.CMS_CONFIG.supabase
                .from('hostels')
                .update(payload)
                .eq('id', hostelId);
        }

        return await window.CMS_CONFIG.supabase
            .from('hostels')
            .insert([payload]);
    };

    try {
        let result = await persistHostel(hostelData);

        // If any column is missing, retry with progressively fewer columns
        if (result.error && (result.error.code === 'PGRST204' || result.error.status === 400)) {
            console.warn('Schema mismatch, retrying with fewer columns:', result.error.message);
            
            const corePayload = {
                name: hostelData.name,
                type: hostelData.type,
                total_rooms: hostelData.total_rooms,
                occupied: hostelData.occupied ?? 0
            };

            // Try 1: core + warden/contact (schema.sql column names)
            result = await persistHostel({ ...corePayload, warden: wardenName, contact: wardenContact });

            // Try 2: core + warden_name/warden_contact (add_hostels.sql column names)
            if (result.error && (result.error.code === 'PGRST204' || result.error.status === 400)) {
                result = await persistHostel({ ...corePayload, warden_name: wardenName, warden_contact: wardenContact });
            }

            // Try 3: core columns only
            if (result.error && (result.error.code === 'PGRST204' || result.error.status === 400)) {
                result = await persistHostel(corePayload);
            }
        }

        if (result.error) {
            console.error('Error saving hostel:', result.error);
            if (result.error.code === '42501' || result.error.message?.includes('policy') || result.status === 401) {
                showToast('Permission denied. Run this in Supabase SQL Editor: ALTER TABLE hostels DISABLE ROW LEVEL SECURITY;', 'error');
            } else {
                showToast('Error saving hostel: ' + result.error.message, 'error');
            }
            return;
        }

        showToast(hostelId ? 'Hostel updated successfully!' : 'Hostel added successfully!', 'success');
        closeModal('hostelModal');
        loadHostelData(); // Reload the data
        
    } catch (error) {
        console.error('Error saving hostel:', error);
        showToast('Error saving hostel', 'error');
    }
}

// Deallocate room
async function deallocateRoom(id) {
    if (!confirm('Are you sure you want to deallocate this room?')) {
        return;
    }
    
    try {
        // Find the allocation to get hostel info
        const allocation = currentAllocations.find(a => a.id === parseInt(id));
        if (!allocation) {
            showToast('Allocation not found', 'error');
            return;
        }
        
        // Delete allocation record
        const { error: deleteError } = await window.CMS_CONFIG.supabase
            .from('hostel_allocations')
            .delete()
            .eq('id', id);
        
        if (deleteError) throw deleteError;
        
        // Update hostel occupied count
        const hostel = currentHostels.find(h => h.id === allocation.hostel_id);
        if (hostel) {
            const newOccupied = Math.max(0, (hostel.occupied || 0) - 1);
            const { error: updateError } = await window.CMS_CONFIG.supabase
                .from('hostels')
                .update({ occupied: newOccupied })
                .eq('id', hostel.id);
            
            if (updateError) throw updateError;
        }
        
        showToast('Room deallocated successfully', 'success');
        loadHostelData();
        
    } catch (error) {
        console.error('Error deallocating room:', error);
        showToast('Error deallocating room: ' + error.message, 'error');
    }
}

// ========== HOSTEL REQUESTS MANAGEMENT ==========

// Load hostel requests from database
async function loadHostelRequests() {
    try {
        const { data, error } = await window.CMS_CONFIG.supabase
            .from('hostel_requests')
            .select('*')
            .order('request_date', { ascending: false });
        
        if (error) throw error;
        
        currentHostelRequests = data || [];
        
        // Update pending count
        const pendingCount = currentHostelRequests.filter(r => r.status === 'pending').length;
        const pendingEl = document.getElementById('pendingRequestsCount');
        if (pendingEl) pendingEl.textContent = pendingCount;
        
        // Display with current filter
        filterHostelRequests();
    } catch (err) {
        console.error('Error loading hostel requests:', err);
        const tbody = document.getElementById('hostelRequestsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--gray);">Error loading requests</td></tr>';
        }
    }
}

// Filter and display hostel requests
function filterHostelRequests() {
    const filterEl = document.getElementById('requestStatusFilter');
    const filter = filterEl ? filterEl.value : 'all';
    
    let filtered = currentHostelRequests;
    if (filter !== 'all') {
        filtered = currentHostelRequests.filter(r => r.status === filter);
    }
    
    displayHostelRequests(filtered);
}

// Display hostel requests in table
function displayHostelRequests(requests) {
    const tbody = document.getElementById('hostelRequestsTableBody');
    if (!tbody) return;
    
    const canManage = canManageHostel();
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--gray);">No hostel requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = requests.map(req => {
        const statusColors = {
            'pending': '#ffa502',
            'approved': '#2ed573',
            'rejected': '#ff4757',
            'cancelled': '#a4b0be'
        };
        const statusColor = statusColors[req.status] || '#a4b0be';
        const requestDate = req.request_date ? new Date(req.request_date).toLocaleDateString('en-IN') : 'N/A';
        
        let actionBtns = '';
        if (canManage && req.status === 'pending') {
            actionBtns = `
                <div class="action-btns" style="display:flex;gap:4px;">
                    <button class="action-btn" onclick="approveHostelRequest('${req.id}')" title="Approve" style="color:#2ed573;border:1px solid #2ed573;border-radius:4px;padding:4px 8px;background:white;cursor:pointer;">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn" onclick="rejectHostelRequest('${req.id}')" title="Reject" style="color:#ff4757;border:1px solid #ff4757;border-radius:4px;padding:4px 8px;background:white;cursor:pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
        } else if (req.status === 'approved') {
            actionBtns = `<small style="color:#888;">By: ${req.reviewed_by || 'Admin'}</small>`;
        } else if (req.status === 'rejected') {
            actionBtns = `<small style="color:#888;">By: ${req.reviewed_by || 'Admin'}</small>`;
        } else {
            actionBtns = '-';
        }
        
        return `
            <tr>
                <td>${req.student_name || 'N/A'}<br><small style="color:#888;">${req.student_email || ''}</small></td>
                <td>${req.student_id || 'N/A'}</td>
                <td>${req.department || 'N/A'}</td>
                <td>${req.hostel_name || 'N/A'}</td>
                <td><span class="status-badge ${req.hostel_type === 'Boys' ? 'active' : 'approved'}">${req.hostel_type || 'N/A'}</span></td>
                <td>${requestDate}</td>
                <td><span style="background:${statusColor};color:white;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">${(req.status || 'pending').toUpperCase()}</span></td>
                <td>${actionBtns}</td>
            </tr>`;
    }).join('');
}

// Approve hostel request
async function approveHostelRequest(requestId) {
    // Find the request details
    const request = currentHostelRequests.find(r => String(r.id) === String(requestId));
    if (!request) {
        showToast('Request not found', 'error');
        return;
    }
    
    // Prompt for room number
    const roomNo = prompt(`Assign room number for ${request.student_name} at ${request.hostel_name}:`, 'A-101');
    if (roomNo === null) return; // User clicked cancel
    if (!roomNo.trim()) {
        showToast('Please enter a room number', 'error');
        return;
    }
    
    const currentUser = getAdminUser();
    
    try {
        // 1. Update request status to approved
        const { error: requestUpdateError } = await window.CMS_CONFIG.supabase
            .from('hostel_requests')
            .update({
                status: 'approved',
                remarks: 'Room ' + roomNo.trim() + ' allocated',
                reviewed_by: currentUser.name || currentUser.email || 'Admin',
                reviewed_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);
        
        if (requestUpdateError) throw requestUpdateError;
        
        // 2. Find the hostel and check availability
        const hostel = currentHostels.find(h => h.name === request.hostel_name);
        if (!hostel) {
            throw new Error(`Hostel "${request.hostel_name}" not found`);
        }
        
        const currentOccupied = hostel.occupied || 0;
        const availableRooms = hostel.total_rooms - currentOccupied;
        
        if (availableRooms <= 0) {
            throw new Error(`No rooms available in ${request.hostel_name}`);
        }
        
        // 3. Check for duplicate room and existing allocation
        const duplicateRoom = currentAllocations.find(a => 
            a.hostel_name === request.hostel_name && 
            a.room_no.toLowerCase() === roomNo.trim().toLowerCase()
        );
        
        if (duplicateRoom) {
            throw new Error(`Room ${roomNo.trim()} is already allocated to ${duplicateRoom.student_name}`);
        }
        
        const existingAlloc = currentAllocations.find(a => 
            a.student_id.toLowerCase() === request.student_id.toLowerCase()
        );
        
        if (existingAlloc) {
            throw new Error(`Student already has allocation in ${existingAlloc.hostel_name}, Room ${existingAlloc.room_no}`);
        }
        
        // 4. Create hostel allocation record
        const allocationData = {
            student_id: request.student_id,
            student_name: request.student_name,
            hostel_name: request.hostel_name,
            hostel_id: hostel.id,
            room_no: roomNo.trim(),
            allocation_date: new Date().toISOString().split('T')[0]
        };
        
        const { error: allocError } = await window.CMS_CONFIG.supabase
            .from('hostel_allocations')
            .insert([allocationData]);
        
        if (allocError) {
            throw new Error('Failed to create allocation: ' + allocError.message);
        }
        
        // 5. Update hostel occupied count (reduce available seats by 1)
        const newOccupied = currentOccupied + 1;
        const { data: hostelUpdateData, error: hostelUpdateError } = await window.CMS_CONFIG.supabase
            .from('hostels')
            .update({ occupied: newOccupied })
            .eq('id', hostel.id)
            .select();
        
        if (hostelUpdateError) {
            console.error('Failed to update hostel occupied count:', hostelUpdateError);
            showToast('Warning: Allocation created but hostel count not updated. Please refresh.', 'warning');
        } else {
            console.log('Hostel occupied count updated:', hostelUpdateData);
        }
        
        showToast(`Approved! Room ${roomNo.trim()} at ${request.hostel_name} allocated to ${request.student_name}. Refreshing...`, 'success');
        
        // Force reload data from database
        await loadHostelData();
    } catch (err) {
        console.error('Error approving request:', err);
        showToast('Error approving request: ' + err.message, 'error');
    }
}

// Reject hostel request
async function rejectHostelRequest(requestId) {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User clicked cancel
    
    const currentUser = getAdminUser();
    
    try {
        const { error } = await window.CMS_CONFIG.supabase
            .from('hostel_requests')
            .update({
                status: 'rejected',
                remarks: reason || 'Rejected by admin',
                reviewed_by: currentUser.name || currentUser.email || 'Admin',
                reviewed_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);
        
        if (error) throw error;
        
        showToast('Hostel request rejected.', 'success');
        loadHostelRequests();
    } catch (err) {
        console.error('Error rejecting request:', err);
        showToast('Error rejecting request: ' + err.message, 'error');
    }
}

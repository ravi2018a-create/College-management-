// Hostel Module

// Live data storage
let currentHostels = [];
let currentAllocations = [];

// Load hostel data
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
            const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
            const canEdit = currentUser.role && ['admin', 'chairman', 'principal', 'hostel_warden'].includes(currentUser.role);
            
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
        const canEdit = JSON.parse(sessionStorage.getItem('user') || '{}').role && ['admin', 'chairman', 'principal', 'hostel_warden'].includes(JSON.parse(sessionStorage.getItem('user') || '{}').role);
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

// Open hostel modal
function openHostelModal(hostelId = null) {
    // Clear form
    document.getElementById('hostelForm').reset();
    document.getElementById('hostelId').value = hostelId || '';
    
    // Set modal title
    const title = hostelId ? 'Edit Hostel' : 'Add Hostel';
    document.getElementById('hostelModalTitle').textContent = title;
    
    // If editing, populate form with existing data
    if (hostelId) {
        const hostel = currentHostels.find(h => h.id === parseInt(hostelId));
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
    document.getElementById('hostelForm').style.display = 'none';
    document.getElementById('hostelModal').querySelector('.modal-body').innerHTML = `
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
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeAllocationModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitAllocation()">
                <i class="fas fa-bed"></i> Allocate Room
            </button>
        </div>
    `;
    
    // Set today's date as default
    document.getElementById('allocDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('hostelModal').classList.add('active');
}

// Close allocation modal and restore hostel form
function closeAllocationModal() {
    document.getElementById('hostelModal').classList.remove('active');
    // Restore the hostel form
    document.getElementById('hostelForm').style.display = 'block';
    document.getElementById('hostelModal').querySelector('.modal-body').innerHTML = `
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
    const hostel = currentHostels.find(h => h.id === parseInt(id));
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
    document.getElementById('hostelForm').style.display = 'none';
    document.getElementById('hostelModal').querySelector('.modal-body').innerHTML = content + `
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeHostelDetailsModal()">Close</button>
        </div>
    `;
    document.getElementById('hostelModal').classList.add('active');
}

// Close hostel details modal and restore form
function closeHostelDetailsModal() {
    document.getElementById('hostelModal').classList.remove('active');
    // Restore the form
    document.getElementById('hostelForm').style.display = 'block';
    document.getElementById('hostelModal').querySelector('.modal-body').innerHTML = `
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
}

// Edit hostel
function editHostel(id) {
    const hostel = currentHostels.find(h => h.id === parseInt(id));
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
    showToast('Edit allocation: ' + id);
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

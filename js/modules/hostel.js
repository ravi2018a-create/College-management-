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
    
    if (allocations.length > 0) {
        table.innerHTML = allocations.map(alloc => `
            <tr>
                <td>${alloc.studentName}</td>
                <td>${alloc.studentId}</td>
                <td>${alloc.hostelName}</td>
                <td>${alloc.roomNo}</td>
                <td>${formatDate(alloc.allocationDate)}</td>
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
    const content = `
        <form id="allocationForm" class="modal-form">
            <div class="form-group">
                <label for="allocStudentId">Student ID</label>
                <input type="text" id="allocStudentId" required placeholder="Enter Student ID">
            </div>
            <div class="form-group">
                <label for="allocStudentName">Student Name</label>
                <input type="text" id="allocStudentName" required placeholder="Student name">
            </div>
            <div class="form-group">
                <label for="allocHostel">Select Hostel</label>
                <select id="allocHostel" required>
                    <option value="">Select Hostel</option>
                    ${DEMO_HOSTELS.filter(h => h.occupied < h.totalRooms).map(h => 
                        `<option value="${h.id}" data-name="${h.name}">${h.name} (Available: ${h.totalRooms - h.occupied})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="allocRoom">Room Number</label>
                <input type="text" id="allocRoom" required placeholder="e.g., A-101">
            </div>
            <div class="form-group">
                <label for="allocDate">Allocation Date</label>
                <input type="date" id="allocDate" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-bed"></i> Allocate Room
                </button>
            </div>
        </form>
    `;
    
    openModal('Allocate Room', content);
    document.getElementById('allocDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('allocationForm').addEventListener('submit', handleAllocationSubmit);
}

// Handle allocation submission
async function handleAllocationSubmit(e) {
    e.preventDefault();
    
    const hostelSelect = document.getElementById('allocHostel');
    const hostelId = hostelSelect.value;
    const hostelName = hostelSelect.options[hostelSelect.selectedIndex].dataset.name;
    
    const hostel = DEMO_HOSTELS.find(h => h.id === hostelId);
    
    if (!hostel || hostel.occupied >= hostel.totalRooms) {
        showToast('No rooms available in selected hostel', 'error');
        return;
    }
    
    const formData = {
        id: generateId('ALLOC'),
        studentId: document.getElementById('allocStudentId').value,
        studentName: document.getElementById('allocStudentName').value,
        hostelId: hostelId,
        hostelName: hostelName,
        roomNo: document.getElementById('allocRoom').value,
        allocationDate: document.getElementById('allocDate').value
    };
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        // Increase occupied count
        hostel.occupied++;
        
        DEMO_ALLOCATIONS.push(formData);
        showToast('Room allocated successfully!', 'success');
        closeModal();
        loadHostelData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('hostel_allocations')
                .insert(formData);
            
            if (error) throw error;
            
            // Update hostel occupied count
            await window.CMS_CONFIG.supabase
                .from('hostels')
                .update({ occupied: hostel.occupied + 1 })
                .eq('id', hostelId);
            
            showToast('Room allocated successfully!', 'success');
            closeModal();
            loadHostelData();
        } catch (err) {
            console.error('Error allocating room:', err);
            showToast('Error allocating room', 'error');
        }
    }
}

// View hostel details
function viewHostel(id) {
    const hostel = DEMO_HOSTELS.find(h => h.id === id);
    if (!hostel) return;
    
    const vacancy = hostel.totalRooms - hostel.occupied;
    const occupancyPercent = Math.round((hostel.occupied / hostel.totalRooms) * 100);
    
    const content = `
        <div class="hostel-details">
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
                <span>${hostel.totalRooms}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Occupied:</label>
                <span>${hostel.occupied} (${occupancyPercent}%)</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Vacant:</label>
                <span class="text-success">${vacancy}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Warden:</label>
                <span>${hostel.warden}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Contact:</label>
                <span>${hostel.contact}</span>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    openModal('Hostel Details', content);
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

    const mapSchemaFallbackPayload = (payload, errorMessage) => {
        const nextPayload = { ...payload };

        if (errorMessage.includes("'facilities'")) {
            delete nextPayload.facilities;
        }

        if (errorMessage.includes("'fee_per_month'")) {
            delete nextPayload.fee_per_month;
        }

        if (errorMessage.includes("'warden_name'")) {
            delete nextPayload.warden_name;
            nextPayload.warden = wardenName;
        }

        if (errorMessage.includes("'warden_contact'")) {
            delete nextPayload.warden_contact;
            nextPayload.contact = wardenContact;
        }

        return nextPayload;
    };

    try {
        let result = await persistHostel(hostelData);

        if (result.error && result.error.code === 'PGRST204') {
            const fallbackPayload = mapSchemaFallbackPayload(hostelData, result.error.message || '');
            result = await persistHostel(fallbackPayload);
        }

        if (result.error) {
            console.error('Error saving hostel:', result.error);
            showToast('Error saving hostel: ' + result.error.message, 'error');
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
function deallocateRoom(id) {
    if (confirm('Are you sure you want to deallocate this room?')) {
        const alloc = DEMO_ALLOCATIONS.find(a => a.id === id);
        if (alloc) {
            const hostel = DEMO_HOSTELS.find(h => h.id === alloc.hostelId);
            if (hostel) hostel.occupied--;
        }
        
        DEMO_ALLOCATIONS = DEMO_ALLOCATIONS.filter(a => a.id !== id);
        displayAllocationData(DEMO_ALLOCATIONS);
        displayHostelData(DEMO_HOSTELS);
        updateHostelStats();
        showToast('Room deallocated successfully', 'success');
    }
}

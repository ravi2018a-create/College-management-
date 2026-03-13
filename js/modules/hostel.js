// Hostel Module

// Demo hostel data
let DEMO_HOSTELS = [
    { id: 'HST001', name: 'Block A - Boys Hostel', type: 'Boys', totalRooms: 100, occupied: 85, warden: 'Mr. Rajendra Kumar', contact: '9876543400' },
    { id: 'HST002', name: 'Block B - Boys Hostel', type: 'Boys', totalRooms: 80, occupied: 72, warden: 'Mr. Suresh Patil', contact: '9876543401' },
    { id: 'HST003', name: 'Block C - Girls Hostel', type: 'Girls', totalRooms: 120, occupied: 95, warden: 'Mrs. Lakshmi Devi', contact: '9876543402' },
    { id: 'HST004', name: 'Block D - Girls Hostel', type: 'Girls', totalRooms: 60, occupied: 48, warden: 'Mrs. Sunita Sharma', contact: '9876543403' }
];

let DEMO_ALLOCATIONS = [
    { id: 'ALLOC001', studentId: 'STU001', studentName: 'Rahul Kumar', hostelId: 'HST001', hostelName: 'Block A - Boys Hostel', roomNo: 'A-101', allocationDate: '2025-07-15' },
    { id: 'ALLOC002', studentId: 'STU003', studentName: 'Amit Singh', hostelId: 'HST002', hostelName: 'Block B - Boys Hostel', roomNo: 'B-205', allocationDate: '2025-07-20' },
    { id: 'ALLOC003', studentId: 'STU004', studentName: 'Sneha Patel', hostelId: 'HST003', hostelName: 'Block C - Girls Hostel', roomNo: 'C-112', allocationDate: '2025-07-18' },
    { id: 'ALLOC004', studentId: 'STU007', studentName: 'Kiran Kumar', hostelId: 'HST001', hostelName: 'Block A - Boys Hostel', roomNo: 'A-305', allocationDate: '2024-07-10' }
];

// Load hostel data
async function loadHostelData() {
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayHostelData(DEMO_HOSTELS);
        displayAllocationData(DEMO_ALLOCATIONS);
        updateHostelStats();
    } else {
        try {
            const [hostelsRes, allocationsRes] = await Promise.all([
                window.CMS_CONFIG.supabase.from('hostels').select('*'),
                window.CMS_CONFIG.supabase.from('hostel_allocations').select('*')
            ]);
            
            displayHostelData(hostelsRes.data || DEMO_HOSTELS);
            displayAllocationData(allocationsRes.data || DEMO_ALLOCATIONS);
            updateHostelStats();
        } catch (err) {
            console.error('Error loading hostel data:', err);
            displayHostelData(DEMO_HOSTELS);
            displayAllocationData(DEMO_ALLOCATIONS);
            updateHostelStats();
        }
    }
}

// Update hostel statistics
function updateHostelStats() {
    const boysHostels = DEMO_HOSTELS.filter(h => h.type === 'Boys');
    const girlsHostels = DEMO_HOSTELS.filter(h => h.type === 'Girls');
    
    document.getElementById('boysHostelCount').textContent = boysHostels.length;
    document.getElementById('boysStudentCount').textContent = boysHostels.reduce((sum, h) => sum + h.occupied, 0);
    
    document.getElementById('girlsHostelCount').textContent = girlsHostels.length;
    document.getElementById('girlsStudentCount').textContent = girlsHostels.reduce((sum, h) => sum + h.occupied, 0);
}

// Display hostel data
function displayHostelData(hostels) {
    const table = document.getElementById('hostelsTable');
    
    if (hostels.length > 0) {
        table.innerHTML = hostels.map(hostel => `
            <tr>
                <td>${hostel.name}</td>
                <td><span class="status-badge ${hostel.type === 'Boys' ? 'active' : 'approved'}">${hostel.type}</span></td>
                <td>${hostel.totalRooms}</td>
                <td>${hostel.occupied}/${hostel.totalRooms}</td>
                <td>${hostel.warden}</td>
                <td>${hostel.contact}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewHostel('${hostel.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editHostel('${hostel.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteHostel('${hostel.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No hostels found</td></tr>';
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
    const title = hostelId ? 'Edit Hostel' : 'Add Hostel';
    const content = `
        <form id="hostelForm" class="modal-form">
            <div class="form-group">
                <label for="hostelName">Hostel Name</label>
                <input type="text" id="hostelName" required placeholder="Enter hostel name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="hostelType">Type</label>
                    <select id="hostelType" required>
                        <option value="">Select Type</option>
                        <option value="Boys">Boys Hostel</option>
                        <option value="Girls">Girls Hostel</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="hostelRooms">Total Rooms</label>
                    <input type="number" id="hostelRooms" min="1" required placeholder="Number of rooms">
                </div>
            </div>
            <div class="form-group">
                <label for="hostelWarden">Warden Name</label>
                <input type="text" id="hostelWarden" required placeholder="Warden name">
            </div>
            <div class="form-group">
                <label for="hostelContact">Warden Contact</label>
                <input type="tel" id="hostelContact" required placeholder="10-digit number">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Hostel
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    document.getElementById('hostelForm').addEventListener('submit', handleHostelSubmit);
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
    const hostel = DEMO_HOSTELS.find(h => h.id === id);
    if (!hostel) return;
    
    openHostelModal(id);
    
    setTimeout(() => {
        document.getElementById('hostelName').value = hostel.name;
        document.getElementById('hostelType').value = hostel.type;
        document.getElementById('hostelRooms').value = hostel.totalRooms;
        document.getElementById('hostelWarden').value = hostel.warden;
        document.getElementById('hostelContact').value = hostel.contact;
    }, 100);
}

// Delete hostel
function deleteHostel(id) {
    if (confirm('Are you sure you want to delete this hostel?')) {
        DEMO_HOSTELS = DEMO_HOSTELS.filter(h => h.id !== id);
        displayHostelData(DEMO_HOSTELS);
        updateHostelStats();
        showToast('Hostel deleted successfully', 'success');
    }
}

// Edit allocation
function editAllocation(id) {
    showToast('Edit allocation: ' + id);
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

// Chain Management Module

// Load chain data
async function loadChainData() {
    try {
        const { data, error } = await window.CMS_CONFIG.supabase
            .from('chain_management')
            .select('*');
        
        if (error) throw error;
        
        const chainData = {};
        (data || []).forEach(record => {
            chainData[record.position.toLowerCase()] = record;
        });
        
        displayChainData(chainData);
    } catch (err) {
        console.error('Error loading chain data:', err);
        displayChainData({});
    }
}

// Display chain data
function displayChainData(data) {
    // Update hierarchy chart
    document.getElementById('chairmanName').textContent = data.chairman?.name || 'Not Assigned';
    document.getElementById('principalName').textContent = data.principal?.name || 'Not Assigned';
    
    // Update chain table
    const chainTable = document.getElementById('chainTable');
    const positions = [data.chairman, data.principal].filter(Boolean);
    
    if (positions.length > 0) {
        chainTable.innerHTML = positions.map(record => `
            <tr>
                <td><strong>${record.position}</strong></td>
                <td>${record.name}</td>
                <td>${record.contact}</td>
                <td>${record.email}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editChainRecord('${record.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Open chain modal
function openChainModal(recordId = null) {
    const title = recordId ? 'Edit Administration Record' : 'Add Administration Record';
    const content = `
        <form id="chainForm" class="modal-form">
            <div class="form-group">
                <label for="chainPosition">Position</label>
                <select id="chainPosition" required>
                    <option value="">Select Position</option>
                    <option value="Chairman">Chairman</option>
                    <option value="Principal">Principal</option>
                </select>
            </div>
            <div class="form-group">
                <label for="chainName">Full Name</label>
                <input type="text" id="chainName" required placeholder="Enter full name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="chainContact">Contact Number</label>
                    <input type="tel" id="chainContact" required placeholder="10-digit number">
                </div>
                <div class="form-group">
                    <label for="chainEmail">Email</label>
                    <input type="email" id="chainEmail" required placeholder="Email address">
                </div>
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
    
    // Setup form submission
    document.getElementById('chainForm').addEventListener('submit', handleChainSubmit);
}

// Handle chain form submission
async function handleChainSubmit(e) {
    e.preventDefault();
    
    const formData = {
        position: document.getElementById('chainPosition').value,
        name: document.getElementById('chainName').value,
        contact: document.getElementById('chainContact').value,
        email: document.getElementById('chainEmail').value
    };
    
    if (!validatePhone(formData.contact)) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_CHAIN_DATA[formData.position.toLowerCase()] = {
            id: generateId('CHRN'),
            ...formData
        };
        showToast('Record saved successfully', 'success');
        closeModal();
        loadChainData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('chain_management')
                .upsert(formData, { onConflict: 'position' });
            
            if (error) throw error;
            
            showToast('Record saved successfully', 'success');
            closeModal();
            loadChainData();
        } catch (err) {
            console.error('Error saving chain record:', err);
            showToast('Error saving record', 'error');
        }
    }
}

// Edit chain record
function editChainRecord(id) {
    // Find record and populate form
    const record = DEMO_CHAIN_DATA.chairman?.id === id ? DEMO_CHAIN_DATA.chairman : DEMO_CHAIN_DATA.principal;
    
    openChainModal(id);
    
    setTimeout(() => {
        document.getElementById('chainPosition').value = record.position;
        document.getElementById('chainName').value = record.name;
        document.getElementById('chainContact').value = record.contact;
        document.getElementById('chainEmail').value = record.email;
    }, 100);
}

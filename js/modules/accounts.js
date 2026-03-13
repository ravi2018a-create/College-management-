// Accounts / Fee Management Module

// Demo fee data
let DEMO_FEES = [
    { id: 'FEE001', studentId: 'STU001', studentName: 'Rahul Kumar', department: 'CS', year: 2, totalFees: 120000, paid: 120000, remaining: 0, status: 'Paid' },
    { id: 'FEE002', studentId: 'STU002', studentName: 'Priya Sharma', department: 'AIML', year: 2, totalFees: 130000, paid: 130000, remaining: 0, status: 'Paid' },
    { id: 'FEE003', studentId: 'STU003', studentName: 'Amit Singh', department: 'ECE', year: 3, totalFees: 115000, paid: 80000, remaining: 35000, status: 'Pending' },
    { id: 'FEE004', studentId: 'STU004', studentName: 'Sneha Patel', department: 'EE', year: 1, totalFees: 125000, paid: 125000, remaining: 0, status: 'Paid' },
    { id: 'FEE005', studentId: 'STU005', studentName: 'Vikram Joshi', department: 'CS', year: 3, totalFees: 120000, paid: 95000, remaining: 25000, status: 'Pending' },
    { id: 'FEE006', studentId: 'STU006', studentName: 'Anjali Reddy', department: 'AIML', year: 4, totalFees: 130000, paid: 115000, remaining: 15000, status: 'Partial' },
    { id: 'FEE007', studentId: 'STU007', studentName: 'Kiran Kumar', department: 'ECE', year: 4, totalFees: 115000, paid: 80000, remaining: 35000, status: 'Pending' }
];

let feeModuleAuthenticated = false;

// Open fee authentication modal
function openFeeAuthModal() {
    const content = `
        <form id="feeAuthForm" class="modal-form">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-shield-alt" style="font-size: 48px; color: var(--primary-color);"></i>
                <h4 style="margin-top: 10px;">Secure Access Required</h4>
                <p style="color: var(--secondary-color);">Enter the password to access financial records</p>
            </div>
            <div class="form-group">
                <label for="feePassword">Password</label>
                <input type="password" id="feePassword" required placeholder="Enter password">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-unlock"></i> Authenticate
                </button>
            </div>
        </form>
    `;
    
    openModal('Authentication Required', content);
    document.getElementById('feeAuthForm').addEventListener('submit', handleFeeAuth);
}

// Handle fee authentication
function handleFeeAuth(e) {
    e.preventDefault();
    
    const password = document.getElementById('feePassword').value;
    
    if (password === window.CMS_CONFIG.FEE_MODULE_PASSWORD) {
        feeModuleAuthenticated = true;
        closeModal();
        showToast('Authentication successful!', 'success');
        showFeeContent();
        loadFeeData();
    } else {
        showToast('Invalid password. Please try again.', 'error');
    }
}

// Show fee content
function showFeeContent() {
    document.getElementById('feeAuthRequired').style.display = 'none';
    document.getElementById('feeContent').style.display = 'block';
}

// Load fee data
async function loadFeeData() {
    if (!feeModuleAuthenticated) return;
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        displayFeeData(DEMO_FEES);
        updateFeeStats();
    } else {
        try {
            const { data, error } = await window.CMS_CONFIG.supabase
                .from('fee_records')
                .select('*')
                .order('studentName');
            
            if (error) throw error;
            displayFeeData(data || DEMO_FEES);
            updateFeeStats();
        } catch (err) {
            console.error('Error loading fee data:', err);
            displayFeeData(DEMO_FEES);
            updateFeeStats();
        }
    }
}

// Update fee statistics
function updateFeeStats() {
    const totalCollected = DEMO_FEES.reduce((sum, f) => sum + f.paid, 0);
    const totalPending = DEMO_FEES.reduce((sum, f) => sum + f.remaining, 0);
    
    document.getElementById('totalCollected').textContent = formatCurrency(totalCollected);
    document.getElementById('totalPending').textContent = formatCurrency(totalPending);
}

// Display fee data
function displayFeeData(fees) {
    const table = document.getElementById('feeTable');
    
    if (fees.length > 0) {
        table.innerHTML = fees.map(fee => `
            <tr class="${fee.status === 'Pending' ? 'fee-pending-row' : ''}">
                <td>${fee.studentName}</td>
                <td>${getDepartmentName(fee.department)}</td>
                <td>${fee.year}${getYearSuffix(fee.year)} Year</td>
                <td>${formatCurrency(fee.totalFees)}</td>
                <td class="text-success">${formatCurrency(fee.paid)}</td>
                <td class="${fee.remaining > 0 ? 'text-danger' : ''}">${formatCurrency(fee.remaining)}</td>
                <td>${createFeeStatusBadge(fee.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewFeeDetails('${fee.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${fee.remaining > 0 ? `
                        <button class="action-btn edit" onclick="openPaymentModal('${fee.id}')" title="Record Payment">
                            <i class="fas fa-money-bill"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="8" class="text-center">No fee records</td></tr>';
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

// Filter fees
function filterFees() {
    const deptFilter = document.getElementById('feeDeptFilter').value;
    const statusFilter = document.getElementById('feeStatusFilter').value;
    
    let filtered = [...DEMO_FEES];
    
    if (deptFilter) {
        filtered = filtered.filter(f => f.department === deptFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(f => f.status.toLowerCase() === statusFilter);
    }
    
    displayFeeData(filtered);
}

// View fee details
function viewFeeDetails(id) {
    const fee = DEMO_FEES.find(f => f.id === id);
    if (!fee) return;
    
    const warningMessage = fee.remaining > 0 ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <i class="fas fa-exclamation-triangle text-warning"></i>
            <strong>Fee Pending:</strong> Student has outstanding dues of ${formatCurrency(fee.remaining)}.
            <br><small>Services may be restricted until fees are cleared.</small>
        </div>
    ` : '';
    
    const content = `
        <div class="fee-details">
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-user-graduate" style="font-size: 48px; color: var(--primary-color);"></i>
                <h4 style="margin-top: 10px;">${fee.studentName}</h4>
                <p style="color: var(--secondary-color);">${fee.studentId}</p>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Department:</label>
                <span>${getDepartmentName(fee.department)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Year:</label>
                <span>${fee.year}${getYearSuffix(fee.year)} Year</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Total Fees:</label>
                <span>${formatCurrency(fee.totalFees)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Paid Amount:</label>
                <span class="text-success">${formatCurrency(fee.paid)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <label>Due Amount:</label>
                <span class="${fee.remaining > 0 ? 'text-danger' : 'text-success'}">${formatCurrency(fee.remaining)}</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 10px 0;">
                <label>Status:</label>
                <span>${createFeeStatusBadge(fee.status)}</span>
            </div>
            ${warningMessage}
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            ${fee.remaining > 0 ? `
            <button type="button" class="btn btn-success" onclick="openPaymentModal('${fee.id}')">
                <i class="fas fa-money-bill"></i> Record Payment
            </button>
            ` : ''}
        </div>
    `;
    
    openModal('Fee Details', content);
}

// Open payment modal
function openPaymentModal(id) {
    const fee = DEMO_FEES.find(f => f.id === id);
    if (!fee) return;
    
    closeModal();
    
    const content = `
        <form id="paymentForm" class="modal-form">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Student:</strong> ${fee.studentName}</p>
                <p><strong>Due Amount:</strong> <span class="text-danger">${formatCurrency(fee.remaining)}</span></p>
            </div>
            <div class="form-group">
                <label for="paymentAmount">Payment Amount (₹)</label>
                <input type="number" id="paymentAmount" min="1" max="${fee.remaining}" required 
                       placeholder="Enter amount" value="${fee.remaining}">
            </div>
            <div class="form-group">
                <label for="paymentMode">Payment Mode</label>
                <select id="paymentMode" required>
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="DD">Demand Draft</option>
                </select>
            </div>
            <div class="form-group">
                <label for="paymentRef">Reference Number (Optional)</label>
                <input type="text" id="paymentRef" placeholder="Transaction/Cheque number">
            </div>
            <div class="form-group">
                <label for="paymentDate">Payment Date</label>
                <input type="date" id="paymentDate" required>
            </div>
            <div class="form-group">
                <label for="paymentRemarks">Remarks (Optional)</label>
                <textarea id="paymentRemarks" rows="2" placeholder="Any additional notes"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-check"></i> Record Payment
                </button>
            </div>
        </form>
    `;
    
    openModal('Record Payment', content);
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('paymentForm').addEventListener('submit', (e) => handlePaymentSubmit(e, id));
}

// Handle payment submission
async function handlePaymentSubmit(e, feeId) {
    e.preventDefault();
    
    const fee = DEMO_FEES.find(f => f.id === feeId);
    if (!fee) return;
    
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    
    if (paymentAmount <= 0 || paymentAmount > fee.remaining) {
        showToast('Invalid payment amount', 'error');
        return;
    }
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        // Update fee record
        fee.paid += paymentAmount;
        fee.remaining -= paymentAmount;
        
        if (fee.remaining <= 0) {
            fee.status = 'Paid';
            fee.remaining = 0;
        } else if (fee.paid > 0) {
            fee.status = 'Partial';
        }
        
        // Also update student fee status if DEMO_STUDENTS exists
        if (typeof DEMO_STUDENTS !== 'undefined') {
            const student = DEMO_STUDENTS.find(s => s.studentId === fee.studentId);
            if (student) {
                student.feeStatus = fee.status;
            }
        }
        
        showToast(`Payment of ${formatCurrency(paymentAmount)} recorded successfully!`, 'success');
        closeModal();
        loadFeeData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('fee_records')
                .update({
                    paid: fee.paid + paymentAmount,
                    remaining: fee.remaining - paymentAmount,
                    status: (fee.remaining - paymentAmount) <= 0 ? 'Paid' : 'Partial'
                })
                .eq('id', feeId);
            
            if (error) throw error;
            
            showToast(`Payment of ${formatCurrency(paymentAmount)} recorded successfully!`, 'success');
            closeModal();
            loadFeeData();
        } catch (err) {
            console.error('Error recording payment:', err);
            showToast('Error recording payment', 'error');
        }
    }
}

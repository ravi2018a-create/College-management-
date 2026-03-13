// Utility Functions

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast ' + type;
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Generate unique ID
function generateId(prefix = 'ID') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}${random}`.toUpperCase();
}

// Get department full name
function getDepartmentName(code) {
    const departments = {
        'CS': 'Computer Science',
        'AIML': 'AI & Machine Learning',
        'ECE': 'Electronics & Communication',
        'EE': 'Electrical Engineering'
    };
    return departments[code] || code;
}


// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

// Create table row
function createTableRow(data, columns) {
    let row = '<tr>';
    columns.forEach(col => {
        row += `<td>${data[col] || '-'}</td>`;
    });
    row += '</tr>';
    return row;
}

// Create action buttons
function createActionButtons(id, actions = ['view', 'edit', 'delete']) {
    let buttons = '<div class="action-btns">';
    
    if (actions.includes('view')) {
        buttons += `<button class="action-btn view" onclick="viewRecord('${id}')" title="View">
            <i class="fas fa-eye"></i>
        </button>`;
    }
    if (actions.includes('edit')) {
        buttons += `<button class="action-btn edit" onclick="editRecord('${id}')" title="Edit">
            <i class="fas fa-edit"></i>
        </button>`;
    }
    if (actions.includes('delete')) {
        buttons += `<button class="action-btn delete" onclick="deleteRecord('${id}')" title="Delete">
            <i class="fas fa-trash"></i>
        </button>`;
    }
    
    buttons += '</div>';
    return buttons;
}

// Create status badge
function createStatusBadge(status) {
    const statusClass = {
        'active': 'active',
        'inactive': 'inactive',
        'paid': 'paid',
        'pending': 'pending',
        'partial': 'pending',
        'approved': 'approved',
        'blocked': 'blocked',
        'overdue': 'overdue'
    };
    
    return `<span class="status-badge ${statusClass[status.toLowerCase()] || ''}">${status}</span>`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utilities
window.CMS_UTILS = {
    showToast,
    formatCurrency,
    formatDate,
    generateId,
    getDepartmentName,
    validateEmail,
    validatePhone,
    createTableRow,
    createActionButtons,
    createStatusBadge,
    debounce
};

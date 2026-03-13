// Library Module

// Live data storage
let currentBooks = [];
let currentIssuedBooks = [];
let currentReturns = [];

// Load library data
async function loadLibraryData() {
    try {
        const [booksRes, issuedRes, returnsRes] = await Promise.all([
            window.CMS_CONFIG.supabase.from('library_books').select('*'),
            window.CMS_CONFIG.supabase.from('book_issues').select('*').eq('status', 'Active'),
            window.CMS_CONFIG.supabase.from('book_returns').select('*')
        ]);
        
        currentBooks = booksRes.data || [];
        currentIssuedBooks = issuedRes.data || [];
        currentReturns = returnsRes.data || [];
        
        displayBooksData(currentBooks);
        displayIssuedBooksData(currentIssuedBooks);
        displayReturnsData(currentReturns);
    } catch (err) {
        console.error('Error loading library data:', err);
        displayBooksData([]);
        displayIssuedBooksData([]);
        displayReturnsData([]);
    }
}

// Display books data
function displayBooksData(books) {
    const table = document.getElementById('booksTable');
    
    if (books.length > 0) {
        table.innerHTML = books.map(book => `
            <tr>
                <td>${book.bookId}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.subject}</td>
                <td>${getDepartmentName(book.department)}</td>
                <td>${book.available > 0 ? `<span class="text-success">${book.available}/${book.total}</span>` : '<span class="text-danger">0</span>'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn view" onclick="viewBook('${book.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editBook('${book.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteBook('${book.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No books found</td></tr>';
    }
}

// Display issued books data
function displayIssuedBooksData(issued) {
    const table = document.getElementById('issuedBooksTable');
    
    if (issued.length > 0) {
        table.innerHTML = issued.map(iss => `
            <tr>
                <td>${iss.issueId}</td>
                <td>${iss.bookTitle}</td>
                <td>${iss.studentName}</td>
                <td>${formatDate(iss.issueDate)}</td>
                <td>${formatDate(iss.dueDate)}</td>
                <td>${createStatusBadge(iss.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-success" onclick="returnBook('${iss.id}')" title="Return">
                            <i class="fas fa-undo"></i> Return
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="7" class="text-center">No issued books</td></tr>';
    }
}

// Display returns data
function displayReturnsData(returns) {
    const table = document.getElementById('returnsTable');
    
    if (returns.length > 0) {
        table.innerHTML = returns.map(ret => `
            <tr>
                <td>${ret.returnId}</td>
                <td>${ret.bookTitle}</td>
                <td>${ret.studentName}</td>
                <td>${formatDate(ret.issueDate)}</td>
                <td>${formatDate(ret.returnDate)}</td>
                <td>${ret.fine > 0 ? `<span class="text-danger">${formatCurrency(ret.fine)}</span>` : '<span class="text-success">₹0</span>'}</td>
            </tr>
        `).join('');
    } else {
        table.innerHTML = '<tr><td colspan="6" class="text-center">No return records</td></tr>';
    }
}

// Filter books
function filterBooks() {
    const search = document.getElementById('bookSearch').value.toLowerCase();
    const deptFilter = document.getElementById('bookDeptFilter').value;
    const yearFilter = document.getElementById('bookYearFilter').value;
    
    let filtered = [...currentBooks];
    
    if (search) {
        filtered = filtered.filter(b => 
            b.title.toLowerCase().includes(search) || 
            b.author.toLowerCase().includes(search) ||
            b.subject.toLowerCase().includes(search)
        );
    }
    
    if (deptFilter) {
        filtered = filtered.filter(b => b.department === deptFilter);
    }
    
    if (yearFilter) {
        filtered = filtered.filter(b => b.year.toString() === yearFilter);
    }
    
    displayBooksData(filtered);
}

// Open book modal
function openBookModal(bookId = null) {
    const title = bookId ? 'Edit Book' : 'Add Book';
    const content = `
        <form id="bookForm" class="modal-form">
            <div class="form-group">
                <label for="bookTitle">Book Title</label>
                <input type="text" id="bookTitle" required placeholder="Enter book title">
            </div>
            <div class="form-group">
                <label for="bookAuthor">Author</label>
                <input type="text" id="bookAuthor" required placeholder="Author name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="bookSubject">Subject</label>
                    <input type="text" id="bookSubject" required placeholder="Subject">
                </div>
                <div class="form-group">
                    <label for="bookDept">Department</label>
                    <select id="bookDept" required>
                        <option value="">Select Department</option>
                        <option value="CS">Computer Science</option>
                        <option value="AIML">AI & Machine Learning</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EE">Electrical Engineering</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="bookYear">Year</label>
                    <select id="bookYear">
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bookTotal">Total Copies</label>
                    <input type="number" id="bookTotal" min="1" required placeholder="Total copies">
                </div>
            </div>
            <div class="form-group">
                <label for="bookISBN">ISBN (Optional)</label>
                <input type="text" id="bookISBN" placeholder="ISBN number">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Save Book
                </button>
            </div>
        </form>
    `;
    
    openModal(title, content);
    document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);
}

// Handle book submission
async function handleBookSubmit(e) {
    e.preventDefault();
    
    const count = DEMO_BOOKS.length + 1;
    const total = parseInt(document.getElementById('bookTotal').value);
    
    const formData = {
        id: generateId('BK'),
        bookId: `BK${new Date().getFullYear()}${count.toString().padStart(3, '0')}`,
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        subject: document.getElementById('bookSubject').value,
        department: document.getElementById('bookDept').value,
        year: parseInt(document.getElementById('bookYear').value),
        total: total,
        available: total,
        isbn: document.getElementById('bookISBN').value
    };
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        DEMO_BOOKS.push(formData);
        showToast('Book added successfully!', 'success');
        closeModal();
        loadLibraryData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('library_books')
                .insert(formData);
            
            if (error) throw error;
            
            showToast('Book added successfully!', 'success');
            closeModal();
            loadLibraryData();
        } catch (err) {
            console.error('Error saving book:', err);
            showToast('Error saving book', 'error');
        }
    }
}

// Open issue book modal
function openIssueBookModal() {
    const content = `
        <form id="issueBookForm" class="modal-form">
            <div class="form-group">
                <label for="issueBookId">Select Book</label>
                <select id="issueBookId" required>
                    <option value="">Select a book</option>
                    ${DEMO_BOOKS.filter(b => b.available > 0).map(b => 
                        `<option value="${b.id}">${b.title} (Available: ${b.available})</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="issueStudentId">Student ID</label>
                <input type="text" id="issueStudentId" required placeholder="Enter Student ID">
            </div>
            <div class="form-group">
                <label for="issueStudentName">Student Name</label>
                <input type="text" id="issueStudentName" required placeholder="Student name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="issueDate">Issue Date</label>
                    <input type="date" id="issueDate" required>
                </div>
                <div class="form-group">
                    <label for="issueDueDate">Due Date</label>
                    <input type="date" id="issueDueDate" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-hand-holding"></i> Issue Book
                </button>
            </div>
        </form>
    `;
    
    openModal('Issue Book', content);
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    document.getElementById('issueDate').value = today;
    document.getElementById('issueDueDate').value = dueDate.toISOString().split('T')[0];
    
    document.getElementById('issueBookForm').addEventListener('submit', handleIssueBookSubmit);
}

// Handle issue book submission
async function handleIssueBookSubmit(e) {
    e.preventDefault();
    
    const bookId = document.getElementById('issueBookId').value;
    const book = DEMO_BOOKS.find(b => b.id === bookId);
    
    if (!book || book.available <= 0) {
        showToast('Book not available', 'error');
        return;
    }
    
    const count = DEMO_ISSUED_BOOKS.length + 1;
    
    const formData = {
        id: generateId('ISS'),
        issueId: `ISS${new Date().getFullYear()}${count.toString().padStart(3, '0')}`,
        bookId: bookId,
        bookTitle: book.title,
        studentId: document.getElementById('issueStudentId').value,
        studentName: document.getElementById('issueStudentName').value,
        issueDate: document.getElementById('issueDate').value,
        dueDate: document.getElementById('issueDueDate').value,
        status: 'Active'
    };
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        // Decrease available count
        book.available--;
        
        DEMO_ISSUED_BOOKS.push(formData);
        showToast('Book issued successfully!', 'success');
        closeModal();
        loadLibraryData();
    } else {
        try {
            const { error } = await window.CMS_CONFIG.supabase
                .from('book_issues')
                .insert(formData);
            
            if (error) throw error;
            
            // Update book availability
            await window.CMS_CONFIG.supabase
                .from('library_books')
                .update({ available: book.available - 1 })
                .eq('id', bookId);
            
            showToast('Book issued successfully!', 'success');
            closeModal();
            loadLibraryData();
        } catch (err) {
            console.error('Error issuing book:', err);
            showToast('Error issuing book', 'error');
        }
    }
}

// Return book
function returnBook(issueId) {
    const issue = DEMO_ISSUED_BOOKS.find(i => i.id === issueId);
    if (!issue) return;
    
    const content = `
        <form id="returnBookForm" class="modal-form">
            <div class="return-info">
                <p><strong>Book:</strong> ${issue.bookTitle}</p>
                <p><strong>Student:</strong> ${issue.studentName}</p>
                <p><strong>Issue Date:</strong> ${formatDate(issue.issueDate)}</p>
                <p><strong>Due Date:</strong> ${formatDate(issue.dueDate)}</p>
            </div>
            <div class="form-group">
                <label for="returnDate">Return Date</label>
                <input type="date" id="returnDate" required>
            </div>
            <div class="form-group">
                <label for="returnFine">Fine Amount (₹)</label>
                <input type="number" id="returnFine" min="0" value="0">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-check"></i> Confirm Return
                </button>
            </div>
        </form>
    `;
    
    openModal('Return Book', content);
    document.getElementById('returnDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('returnBookForm').addEventListener('submit', (e) => handleReturnBook(e, issueId));
}

// Handle return book
async function handleReturnBook(e, issueId) {
    e.preventDefault();
    
    const issue = DEMO_ISSUED_BOOKS.find(i => i.id === issueId);
    const book = DEMO_BOOKS.find(b => b.id === issue.bookId);
    
    const returnData = {
        id: generateId('RET'),
        returnId: `RET${new Date().getFullYear()}${(DEMO_RETURNS.length + 1).toString().padStart(3, '0')}`,
        bookId: issue.bookId,
        bookTitle: issue.bookTitle,
        studentId: issue.studentId,
        studentName: issue.studentName,
        issueDate: issue.issueDate,
        returnDate: document.getElementById('returnDate').value,
        fine: parseFloat(document.getElementById('returnFine').value) || 0
    };
    
    if (window.CMS_CONFIG.DEMO_MODE) {
        // Increase available count
        if (book) book.available++;
        
        // Remove from issued
        DEMO_ISSUED_BOOKS = DEMO_ISSUED_BOOKS.filter(i => i.id !== issueId);
        
        // Add to returns
        DEMO_RETURNS.unshift(returnData);
        
        showToast('Book returned successfully!', 'success');
        closeModal();
        loadLibraryData();
    }
}

// View, edit, delete book functions
function viewBook(id) {
    const book = DEMO_BOOKS.find(b => b.id === id);
    if (!book) return;
    
    const content = `
        <div class="book-details" style="text-align: center;">
            <i class="fas fa-book" style="font-size: 48px; color: var(--primary-color); margin-bottom: 15px;"></i>
            <h4>${book.title}</h4>
            <p style="color: var(--secondary-color);">by ${book.author}</p>
        </div>
        <div style="margin-top: 20px;">
            <p><strong>Subject:</strong> ${book.subject}</p>
            <p><strong>Department:</strong> ${getDepartmentName(book.department)}</p>
            <p><strong>Year:</strong> ${book.year}${getYearSuffix ? getYearSuffix(book.year) : ''} Year</p>
            <p><strong>Available:</strong> ${book.available}/${book.total} copies</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    openModal('Book Details', content);
}

function editBook(id) { showToast('Edit book feature: ' + id); }

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        DEMO_BOOKS = DEMO_BOOKS.filter(b => b.id !== id);
        displayBooksData(DEMO_BOOKS);
        showToast('Book deleted successfully', 'success');
    }
}

function getYearSuffix(year) {
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd', 4: 'th' };
    return suffixes[year] || 'th';
}

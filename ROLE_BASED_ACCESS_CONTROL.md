# Role-Based Access Control (RBAC) Documentation

## Overview
The College Management System now implements comprehensive Role-Based Access Control (RBAC) to ensure users only access features and data appropriate to their role and responsibilities.

## User Roles & Access Levels

### 1. Chairman (Highest Authority)
**Login:** chairman@college.edu / chairman123

**Access:**
- ✅ All Modules (Full Access)
- ✅ Dashboard (All statistics)
- ✅ Chain Management (View entire hierarchy)
- ✅ Departments (All departments)
- ✅ Registrar
- ✅ Admission Cell
- ✅ Students (View, Add, Edit, Delete)
- ✅ Teachers (View, Add, Edit, Delete)
- ✅ Library (View, Add, Edit, Delete)
- ✅ Hostel (View, Add, Edit)
- ✅ Accounts (View, Edit)

**Data Scope:** All departments and all data

---

### 2. Principal
**Login:** principal@college.edu / principal123

**Access:**
- ✅ All Modules
- ✅ Dashboard (College-wide statistics)
- ✅ Chain Management
- ✅ Departments (All departments)
- ✅ Registrar
- ✅ Admission Cell
- ✅ Students (View, Add, Edit, Delete)
- ✅ Teachers (View, Add, Edit)
- ✅ Library (View only)
- ✅ Hostel (View, Edit)
- ✅ Accounts (View only)

**Data Scope:** All departments and all data

---

### 3. Registrar
**Login:** registrar@college.edu / registrar123

**Access:**
- ✅ Dashboard (Overview statistics)
- ✅ Chain Management (View only)
- ✅ Departments (View all)
- ✅ Students (View, Add, Edit, Delete)
- ✅ Teachers (View, Add, Edit)
- ❌ Library
- ❌ Hostel
- ❌ Accounts

**Data Scope:** All departments

---

### 4. Head of Department (HOD)
**Login:** hod.cs@college.edu / hod123  
**Department:** Computer Science

**Access:**
- ✅ Dashboard (Department-specific statistics)
- ✅ Departments (View their department only)
- ✅ Students (View & Edit their department students only)
- ✅ Teachers (View & Edit their department teachers only)
- ❌ Chain Management
- ❌ Registrar
- ❌ Admission Cell
- ❌ Library
- ❌ Hostel
- ❌ Accounts

**Data Scope:** Their department only (Computer Science)

**Dashboard Stats:**
- Computer Science Students count
- Computer Science Teachers count
- Department info

---

### 5. Teacher
**Login:** teacher@college.edu / teacher123  
**Department:** Computer Science

**Access:**
- ✅ Dashboard (Limited statistics)
- ✅ Students (View their department students only - No edit/delete)
- ✅ Library (View only - Can browse books)
- ❌ All other modules

**Data Scope:** Their department only (Computer Science)

**Dashboard Stats:**
- Computer Science Students count
- Computer Science Teachers count

---

### 6. Librarian
**Login:** library@college.edu / librarian123

**Access:**
- ✅ Dashboard (Library-focused statistics)
- ✅ Library (Full access - View, Add, Edit, Delete books)
- ✅ Students (View only - For book issue tracking)
- ❌ All other modules

**Data Scope:** All library data

**Dashboard Stats:**
- Total Library Books
- Issued Books count
- Overdue Books count

---

### 7. Accountant
**Login:** accounts@college.edu / accountant123

**Access:**
- ✅ Dashboard (Finance-focused statistics)
- ✅ Accounts (Full access - View, Add, Edit fee records)
- ✅ Students (View only - For fee tracking)
- ❌ All other modules

**Data Scope:** All financial records

**Dashboard Stats:**
- Total Fee Collection
- Pending Fees
- Total Students count

---

### 8. Hostel Warden
**Login:** warden@college.edu / warden123

**Access:**
- ✅ Dashboard (Hostel-focused statistics)
- ✅ Hostel (Full access - View, Add, Edit allocations)
- ✅ Students (View only - For hostel allocation)
- ❌ All other modules

**Data Scope:** All hostel data

**Dashboard Stats:**
- Total Hostel Students
- Pending Hostel Requests
- Available Rooms

---

### 9. Admission Staff
**Login:** admissions@college.edu / admission123

**Access:**
- ✅ Dashboard (Admission statistics)
- ✅ Admission Cell (Full access)
- ✅ Students (View, Add - For new admissions)
- ❌ All other modules

**Data Scope:** All admission records

---

## Technical Implementation

### Permission Matrix Structure
```javascript
const ROLE_PERMISSIONS = {
    roleName: {
        modules: [],      // Array of accessible module names
        canEdit: [],      // Array of modules where user can edit/add
        canDelete: [],    // Array of modules where user can delete
        dataScope: 'all' or 'department'  // Data visibility scope
    }
}
```

### Key Functions

#### 1. `applyRoleBasedAccess()`
- Called when user logs in
- Filters navigation items based on role permissions
- Shows/hides Add buttons based on edit permissions
- Updates dashboard statistics for role-specific view

#### 2. `canEdit(module)`
- Returns boolean indicating if current user can edit/add in the module
- Used to show/hide "Add" buttons and "Edit" buttons in tables

#### 3. `canDelete(module)`
- Returns boolean indicating if current user can delete from the module
- Used to show/hide "Delete" buttons in tables

#### 4. `getDataScope()`
- Returns 'all' or 'department' based on user's role
- Used in data loading functions to filter by department

### Data Filtering

#### Department-Based Filtering
HODs and Teachers see only their department's data:

```javascript
// In loadStudents() and loadTeachers()
if (getDataScope() === 'department' && currentUser.department) {
    query = query.eq('department', currentUser.department);
}
```

### UI Element Visibility

#### Navigation Items
```javascript
// Hide/show based on permissions.modules
if (permissions.modules.includes(module)) {
    navItem.style.display = 'flex';
} else {
    navItem.style.display = 'none';
}
```

#### Action Buttons
```javascript
// Add buttons
addStudentBtn.style.display = canEdit('students') ? 'inline-flex' : 'none';

// Edit/Delete buttons in tables
${canEditStudents ? `<button>Edit</button>` : ''}
${canDeleteStudents ? `<button>Delete</button>` : ''}
```

---

## Testing Scenarios

### Test 1: Chairman Access
1. Login as chairman@college.edu
2. Verify all navigation items are visible
3. Verify all Add/Edit/Delete buttons are visible
4. Verify can see all departments' data

### Test 2: HOD Limited Access
1. Login as hod.cs@college.edu
2. Verify only Dashboard, Departments, Students, Teachers are visible
3. Navigate to Students - verify only Computer Science students shown
4. Navigate to Teachers - verify only Computer Science teachers shown
5. Verify can Edit but cannot Delete

### Test 3: Teacher Read-Only
1. Login as teacher@college.edu
2. Verify only Dashboard, Students, Library visible
3. Navigate to Students - verify no Edit or Delete buttons
4. Verify Add Student button is hidden
5. Verify only Computer Science students shown

### Test 4: Librarian Specialized Access
1. Login as library@college.edu
2. Verify only Dashboard, Library, Students visible
3. Navigate to Library - verify Add/Edit/Delete buttons available
4. Navigate to Students - verify no Edit/Delete buttons (view only)
5. Verify library-focused dashboard stats

### Test 5: Accountant Financial Focus
1. Login as accounts@college.edu
2. Verify only Dashboard, Accounts, Students visible
3. Navigate to Accounts - verify full edit access
4. Navigate to Students - verify view-only access
5. Verify finance-focused dashboard stats

---

## Security Considerations

### Current Implementation
- ✅ Client-side role validation
- ✅ Navigation filtering
- ✅ UI button visibility control
- ✅ Department-based data filtering
- ✅ Role-specific dashboard customization

### Recommended Enhancements
- 🔒 Add server-side validation in Supabase Row-Level Security (RLS)
- 🔒 Implement department field in users table
- 🔒 Add audit logging for sensitive operations
- 🔒 Implement session timeout and re-authentication
- 🔒 Add two-factor authentication for admin roles

---

## Common Use Cases

### Adding a New Role
1. Add user to `DEMO_USERS` array with role and department
2. Add permissions to `ROLE_PERMISSIONS` object
3. Test navigation visibility
4. Test data access and filtering
5. Update this documentation

### Modifying Role Permissions
1. Update `ROLE_PERMISSIONS` for the specific role
2. Test affected user workflows
3. Document changes

### Department-Specific Access
For roles needing department filtering:
- Set `dataScope: 'department'` in permissions
- Ensure user object has `department` field
- Data loading functions automatically apply filter

---

## Troubleshooting

### Issue: User sees all modules
**Solution:** Check `ROLE_PERMISSIONS` has correct role name and modules array

### Issue: HOD sees other departments' data
**Solution:** Verify user has `department` field and `dataScope: 'department'`

### Issue: Add buttons not showing for authorized role
**Solution:** Check `canEdit` array includes the module name

### Issue: Dashboard stats incorrect for role
**Solution:** Check `updateDashboardForRole()` handles the specific role

---

## Changelog

### Version 1.0 (March 2026)
- ✅ Initial RBAC implementation
- ✅ 9 user roles with distinct permissions
- ✅ Department-based data filtering
- ✅ Role-specific dashboard customization
- ✅ Dynamic UI element visibility
- ✅ Comprehensive documentation

---

## Support & Maintenance

For questions or issues with RBAC:
1. Check this documentation for role-specific access
2. Review `ROLE_PERMISSIONS` matrix in index.html
3. Test with different role credentials
4. Verify database has required fields (department, etc.)

**Note:** All sensitive operations should eventually be protected with server-side validation using Supabase Row-Level Security policies.

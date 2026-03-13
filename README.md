# College Management System (CMS)

A comprehensive web-based College Management System built with HTML, CSS, JavaScript, and Supabase backend.

## Features

### 1. Chain Management
- Hierarchical view of college administration
- Manage Chairman and Principal details
- Visual organization chart

### 2. Department Management
- Four departments: CS, AI/ML, ECE, EE
- Manage HOD, teachers count, and student enrollment
- Department-wise statistics

### 3. Registrar Module
- DCC Staff management
- Scholarship tracking
- Benefits and document management

### 4. Admission Cell
- New student registration
- Generate admission numbers
- Track admission status
- Filter by year and department

### 5. Student Management
- Complete student records
- Track academic year
- Hostel and fee status
- Search and filter capabilities

### 6. Teacher Management
- Faculty information
- Department and subject assignments
- Designation tracking

### 7. Library Management
- Book catalog with department/subject categorization
- Book issue and return system
- Track availability and overdue books
- Fine calculation

### 8. Hostel Management
- Boys and Girls hostel tracking
- Room allocation system
- Warden details
- Occupancy statistics

### 9. Accounts / Fee Management
- **Password Protected** for security
- Total fee tracking per student
- Payment recording
- Due amount alerts
- Service restriction for pending fees

### 10. Student Portal
- Separate portal for students
- View profile and academic details
- Fee status and payment history
- Library books issued/returned
- Hostel allocation details
- Scholarship and benefits information
- College notices and announcements

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Font Awesome 6
- **Styling**: Custom CSS with CSS Variables

## Project Structure

```
College_Management/
├── index.html              # Main admin application
├── student-portal.html     # Student portal
├── css/
│   ├── style.css          # Admin styles
│   └── student-portal.css # Student portal styles
├── js/
│   ├── config.js          # Supabase configuration
│   ├── auth.js            # Authentication module
│   ├── utils.js           # Utility functions
│   ├── app.js             # Main application logic
│   ├── student-portal.js  # Student portal logic
│   └── modules/
│       ├── dashboard.js   # Dashboard module
│       ├── chain.js       # Chain management
│       ├── departments.js # Department management
│       ├── registrar.js   # Registrar module
│       ├── admission.js   # Admission cell
│       ├── students.js    # Student management
│       ├── teachers.js    # Teacher management
│       ├── library.js     # Library management
│       ├── hostel.js      # Hostel management
│       └── accounts.js    # Fee management
├── database/
│   ├── schema.sql         # Supabase database schema
│   └── setup-users.sql    # User registration SQL
└── README.md              # This file
```

## Setup Instructions

### Quick Start (Demo Mode)

The application works in demo mode by default with sample data. Just open `index.html` in a browser.

**Admin Panel Credentials (by Role):**

| Role | Email | Password |
|------|-------|----------|
| Chairman | chairman@college.com | chairman123 |
| Principal | principal@college.com | principal123 |
| Registrar | registrar@college.com | registrar123 |
| HOD | hod@college.com | hod123 |
| Teacher | teacher@college.com | teacher123 |
| Librarian | librarian@college.com | librarian123 |
| Accountant | accountant@college.com | accountant123 |
| Hostel Warden | warden@college.com | warden123 |
| Admission Staff | admission@college.com | admission123 |

**Student Portal Credentials:**

| Email | Password |
|-------|----------|
| john.smith@college.edu | student123 |
| sarah.johnson@college.edu | student123 |

**Fee Module Password:** `admin123`

---

## Real Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned
4. Copy your **Project URL** and **Anon Key** from Settings > API

### Step 2: Setup Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and run the contents of `database/schema.sql`
3. This creates all required tables, indexes, and sample data

### Step 3: Register Users

Run `database/setup-users.sql` in Supabase SQL Editor to:
- Add password field to users/students tables
- Register admin users (Chairman, Principal, HOD, etc.)
- Register sample students
- Enable public read access for staff directory

**Registered Admin Users:**

| Role | Email | Password |
|------|-------|----------|
| Chairman | chairman@college.edu | chairman123 |
| Principal | principal@college.edu | principal123 |
| Registrar | registrar@college.edu | registrar123 |
| HOD | hod.cs@college.edu | hod123 |
| Teacher | teacher@college.edu | teacher123 |
| Librarian | library@college.edu | librarian123 |
| Accountant | accounts@college.edu | accountant123 |
| Hostel Warden | warden@college.edu | warden123 |
| Admission | admissions@college.edu | admission123 |

**Registered Students:**

| Student ID | Email | Password |
|------------|-------|----------|
| STU2024001 | john.smith@college.edu | student123 |
| STU2024002 | sarah.johnson@college.edu | student123 |
| STU2024003 | rahul.verma@college.edu | student123 |
| STU2024004 | priya.sharma@college.edu | student123 |

### Step 4: Configure Application

Edit `js/config.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const DEMO_MODE = false;  // Set to false for real data
```

### Step 5: Adding More Users

**Add Admin User:**
```sql
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('newemail@college.edu', 'User Name', 'teacher', '9876543299', 'password123');
```

**Add Student:**
```sql
INSERT INTO students (student_id, name, email, phone, department, year, password_hash) VALUES 
('STU2024005', 'New Student', 'student@college.edu', '9876543300', 'CS', 1, 'student123');
```

**Add Teacher:**
```sql
INSERT INTO teachers (teacher_id, name, email, contact, department, designation, subjects) VALUES 
('TCH001', 'Prof. Name', 'prof@college.edu', '9876543301', 'CS', 'Assistant Professor', 'Subject1, Subject2');
```

---

## Student Portal Features

### Staff Directory
Students can view all college staff:
1. **College Leadership** - Chairman & Principal
2. **My Department** - HOD and teachers (priority view)
3. **Other Departments** - Faculty from all departments
4. **Administrative Staff** - Registrar, Librarian, Accountant, Warden

## Security Features

- Role-based access control
- Password-protected financial records
- Session management with localStorage
- Row Level Security (RLS) in Supabase

## User Roles

| Role | Access Level |
|------|--------------|
| Chairman | Full access |
| Principal | Full access |
| Registrar | Registrar module, Students |
| HOD | Department, Teachers, Students |
| Teacher | Students (read) |
| Librarian | Library module |
| Accountant | Accounts module (with password) |
| Hostel Warden | Hostel module |
| Admission Staff | Admission, Students |

## Customization

### Change Fee Module Password
Edit `js/config.js`:
```javascript
const FEE_MODULE_PASSWORD = 'your-new-password';
```

### Add New Departments
1. Add to `database/schema.sql`
2. Update department select options in respective HTML forms

### Modify Fee Structure
Update the `DEMO_FEES` array in `js/modules/accounts.js`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## License

This project is for educational purposes.

## Support

For issues or questions, please create an issue in the repository.

---

**Note:** This is a demo application. For production use, implement proper security measures, server-side validation, and comprehensive error handling.

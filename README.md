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
│   └── schema.sql         # Supabase database schema
└── README.md              # This file
```

## Setup Instructions

### Demo Mode (No Supabase Required)

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

### With Supabase Backend

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

2. **Setup Database**
   - Go to SQL Editor in Supabase
   - Copy and run the contents of `database/schema.sql`
   - This creates all required tables, indexes, and sample data

3. **Configure the Application**
   - Open `js/config.js`
   - Replace `YOUR_SUPABASE_URL` with your project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon/public key

   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. **Setup Authentication (Optional)**
   - In Supabase, go to Authentication > Settings
   - Configure email provider or other auth methods
   - Create users in Authentication > Users

5. **Deploy**
   - Host on any static file server
   - Options: GitHub Pages, Netlify, Vercel, or any web server

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

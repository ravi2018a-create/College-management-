# Notice Board System Documentation

## Overview
The College Management System now includes a comprehensive Notice Board feature that allows teachers, administrators, and staff to post announcements that are visible to students through the Student Portal.

---

## Features

### Admin Portal - Notice Posting
- **Who Can Post:** All staff roles (Teachers, HODs, Principals, Librarians, Accountants, etc.)
- **Role-Based Access:** Notice module visibility controlled by RBAC
- **Rich Notice Options:**
  - Title and detailed content
  - Priority levels (Urgent, High, Normal, Low)
  - Target audience selection
  - Department-specific notices
  - Optional expiry dates
- **Notice Management:**
  - View all posted notices in table format
  - View detailed notice information
  - Soft delete notices (chairman and principal can delete)

### Student Portal - Notice Viewing
- **Automatic Filtering:** Students see only relevant notices
- **Smart Display:**
  - Shows notices for "all" audience
  - Shows student-specific notices
  - Shows their department notices
  - Filters out expired notices
- **Visual Design:**
  - Priority badges (color-coded)
  - Posted by information
  - Expiry date warnings
  - Clean, card-based layout

---

## Database Schema

### Table: `notices`

```sql
CREATE TABLE notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by VARCHAR(255) NOT NULL,
    posted_by_role VARCHAR(50) NOT NULL,
    posted_by_email VARCHAR(255),
    department VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    target_audience VARCHAR(50) DEFAULT 'all',
    posted_date TIMESTAMP DEFAULT NOW(),
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Columns Explained

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique notice identifier |
| `title` | VARCHAR(255) | Notice headline |
| `content` | TEXT | Full notice content |
| `posted_by` | VARCHAR(255) | Name of person posting |
| `posted_by_role` | VARCHAR(50) | Role of poster (teacher, hod, etc.) |
| `posted_by_email` | VARCHAR(255) | Email of poster |
| `department` | VARCHAR(100) | Department (for department-specific notices) |
| `priority` | VARCHAR(20) | urgent \| high \| normal \| low |
| `target_audience` | VARCHAR(50) | all \| students \| teachers \| department_specific |
| `posted_date` | TIMESTAMP | When notice was posted |
| `expiry_date` | TIMESTAMP | Optional expiration date |
| `is_active` | BOOLEAN | Soft delete flag |
| `created_at` | TIMESTAMP | Record creation time |

### Indexes

```sql
CREATE INDEX idx_notices_posted_date ON notices(posted_date DESC);
CREATE INDEX idx_notices_department ON notices(department);
CREATE INDEX idx_notices_target_audience ON notices(target_audience);
CREATE INDEX idx_notices_is_active ON notices(is_active);
```

---

## Role-Based Permissions

### Who Can Post Notices?

| Role | Can Post | Can Delete | Notes |
|------|----------|------------|-------|
| Chairman | ✅ | ✅ | Full access to all notices |
| Principal | ✅ | ✅ | Full access to all notices |
| Registrar | ✅ | ❌ | Can post, cannot delete |
| HOD | ✅ | ❌ | Can post department-specific notices |
| Teacher | ✅ | ❌ | Can post notices to students |
| Librarian | ✅ | ❌ | Can post library-related notices |
| Accountant | ✅ | ❌ | Can post fee-related notices |
| Hostel Warden | ✅ | ❌ | Can post hostel-related notices |
| Admission Staff | ✅ | ❌ | Can post admission-related notices |

### Permission Implementation

Updated `ROLE_PERMISSIONS` in index.html:
```javascript
chairman: {
    modules: [..., 'notices'],
    canEdit: [..., 'notices'],
    canDelete: [..., 'notices']
}
// Similar for all roles with 'notices' in modules and canEdit arrays
```

---

## User Workflows

### Admin Posting a Notice

1. Login to admin portal with any staff role
2. Navigate to "Notice Board" in sidebar
3. Click "Post Notice" button (top right)
4. Fill in notice form:
   - **Title:** Short headline (required)
   - **Content:** Detailed message (required)
   - **Priority:** Select urgency level
   - **Target Audience:** Choose who should see it
   - **Expiry Date:** Optional end date
5. Click "Post Notice"
6. Notice appears in table and becomes visible to students immediately

### Teacher Posting Department Notice

1. Login as teacher (e.g., teacher@college.edu / teacher123)
2. Go to Notice Board
3. Create notice with:
   - Target Audience: "My Department Only"
   - Priority as needed
4. Only students in teacher's department will see it

### Student Viewing Notices

1. Login to Student Portal
2. Navigate to "Notices" in sidebar
3. See all relevant notices:
   - General announcements
   - Student-specific notices
   - Their department notices
4. Expired notices are automatically hidden
5. Priority notices highlighted with color badges

---

## Priority Levels & Colors

### Admin Portal Display

| Priority | Badge Color | CSS Class | Use Case |
|----------|-------------|-----------|----------|
| Urgent | Red | status-inactive | Immediate attention needed |
| High | Yellow/Orange | status-pending | Important but not critical |
| Normal | Green | status-active | Regular announcements |
| Low | Green | status-active | General information |

### Student Portal Display

| Priority | Background Color | Badge Text |
|----------|-----------------|------------|
| Urgent | #dc3545 (Red) | URGENT |
| High | #fd7e14 (Orange) | HIGH |
| Normal | #198754 (Green) | Normal (not shown) |
| Low | #6c757d (Gray) | LOW |

---

## Target Audience Options

### 1. All (Students & Staff)
- Visible to everyone in both admin and student portals
- Use for: College-wide announcements, holidays, events

### 2. Students Only
- Visible only in student portal
- Use for: Exam schedules, assignment deadlines, student events

### 3. Teachers Only
- Visible only in admin portal
- Use for: Faculty meetings, internal communications

### 4. My Department Only
- Filtered by poster's department
- Visible to students/staff in that department
- Use for: Department-specific events, HOD announcements

---

## API Functions

### Admin Portal (index.html)

#### `async loadNotices()`
- Fetches all active notices from Supabase
- Displays in table format with actions
- Shows delete button only for authorized roles

#### `async saveNotice()`
- Validates form input
- Inserts notice into database
- Uses current user's name, role, and department
- Reloads notice list after successful post

#### `async viewNotice(noticeId)`
- Fetches single notice details
- Creates modal popup with full content
- Formats dates and displays metadata

#### `async deleteNotice(noticeId)`
- Soft deletes notice (sets is_active = false)
- Requires confirmation
- Only available to authorized roles

### Student Portal (js/student-portal.js)

#### `async loadStudentNotices()`
- Fetches notices filtered by:
  - Active status
  - Not expired
  - Target audience (all, students, or student's department)
- Displays in card format with priority badges
- Shows posted by information
- Formats content with proper spacing

---

## Testing Instructions

### Test 1: Teacher Posts Student Notice

1. **Login:** teacher@college.edu / teacher123
2. **Navigate:** Notice Board
3. **Create Notice:**
   ```
   Title: Computer Science Department Event
   Content: Annual Tech Fest on March 20th. All CS students must attend.
   Priority: High
   Target: My Department Only
   ```
4. **Verify Admin:** Notice appears in admin table
5. **Verify Student:**
   - Login as CS student (john.smith@college.edu)
   - Navigate to Notices
   - Should see the announcement with HIGH badge

### Test 2: Principal Posts Urgent Notice

1. **Login:** principal@college.edu / principal123
2. **Post Notice:**
   ```
   Title: College Closed Tomorrow
   Content: Due to extreme weather, college will remain closed on March 14th.
   Priority: Urgent
   Target: All (Students & Staff)
   Expiry: March 15, 2026
   ```
3. **Verify:** 
   - Red URGENT badge visible
   - Appears for all students
   - Auto-expires after March 15

### Test 3: Accountant Posts Fee Reminder

1. **Login:** accounts@college.edu / accountant123
2. **Post Notice:**
   ```
   Title: Last Date for Fee Payment
   Content: Please clear all pending fees by March 31st to avoid late charges.
   Priority: High
   Target: Students Only
   ```
3. **Verify:** Only students see this notice

### Test 4: Delete Notice (Chairman Only)

1. **Login:** chairman@college.edu / chairman123
2. **Navigate:** Notice Board
3. **Click:** Delete button on any notice
4. **Confirm:** Notice disappears
5. **Verify:** No longer visible in student portal

---

## CSS Styling

### Notice Cards (Student Portal)

```css
.notice-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.3s;
}

.notice-item:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
```

### Priority Badges

```css
.priority-badge-urgent {
    background: #dc3545;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}
```

---

## Database Migration

Run this SQL in Supabase SQL Editor:

```sql
-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by VARCHAR(255) NOT NULL,
    posted_by_role VARCHAR(50) NOT NULL,
    posted_by_email VARCHAR(255),
    department VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    target_audience VARCHAR(50) DEFAULT 'all',
    posted_date TIMESTAMP DEFAULT NOW(),
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notices_posted_date ON notices(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_department ON notices(department);
CREATE INDEX IF NOT EXISTS idx_notices_target_audience ON notices(target_audience);
CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active);

-- Enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE notices IS 'Notice board for announcements visible to students and staff';
COMMENT ON COLUMN notices.priority IS 'Priority: urgent, high, normal, low';
COMMENT ON COLUMN notices.target_audience IS 'Target: all, students, teachers, department_specific';
```

---

## Common Use Cases

### 1. Holiday Announcement
```
Title: Gandhi Jayanti Holiday
Content: College will remain closed on October 2nd in observance of Gandhi Jayanti.
Priority: Normal
Target: All
Expiry: October 3, 2026
```

### 2. Exam Schedule
```
Title: Mid-Semester Exams Starting
Content: Mid-sem exams will begin on April 1st. Please check your individual timetables.
Priority: High
Target: Students Only
Expiry: April 15, 2026
```

### 3. Library Notice
```
Title: Library Maintenance
Content: Main library will be closed for maintenance on March 16-17. Digital resources remain available.
Priority: Normal
Target: All
Expiry: March 18, 2026
```

### 4. Department-Specific
```
Title: CS Department Workshop
Content: Python workshop on March 20th at 2 PM in Lab 301. Attendance mandatory for Year 2 students.
Priority: High
Target: My Department Only
```

---

## Troubleshooting

### Issue: Notices not visible to students
**Solutions:**
- Check `is_active` is true in database
- Verify `target_audience` includes 'all' or 'students'
- Ensure notice is not expired
- Check database connection in student portal

### Issue: Cannot post notice
**Solutions:**
- Verify user has 'notices' in `ROLE_PERMISSIONS.modules`
- Check database connection
- Ensure all required fields are filled
- Check browser console for errors

### Issue: Department notices not filtering correctly
**Solutions:**
- Verify user has `department` field in session
- Check SQL query includes department filter
- Ensure `target_audience` is 'department_specific'

---

## Future Enhancements

### Possible Features
- 📧 Email notifications when notice is posted
- 📱 Push notifications for urgent notices
- 🔔 Unread notice counter
- 📎 File attachments to notices
- 📊 Notice analytics (views, reads)
- ⭐ Important notice pinning
- 🔍 Notice search functionality
- 📅 Calendar integration for events
- 👍 Student acknowledgment/read receipts
- 💬 Comments on notices

---

## Security Considerations

### Current Implementation
- ✅ Frontend role validation
- ✅ Soft delete (preserves history)
- ✅ Timestamp auditing
- ✅ Target audience filtering
- ✅ Department-based access

### Recommended Enhancements
- 🔒 Supabase RLS policies for notices table
- 🔒 Server-side validation of poster's role
- 🔒 Rate limiting on notice creation
- 🔒 HTML sanitization for content
- 🔒 Audit log for deleted notices

---

## Changelog

### Version 1.0 (March 2026)
- ✅ Initial notice board implementation
- ✅ Admin portal posting functionality
- ✅ Student portal viewing functionality
- ✅ Role-based posting permissions
- ✅ Priority levels with color coding
- ✅ Target audience filtering
- ✅ Department-specific notices
- ✅ Expiry date functionality
- ✅ Soft delete capability
- ✅ Comprehensive documentation

---

## Support

For questions or issues with the Notice Board:
1. Review this documentation
2. Check database schema in `database_migration.sql`
3. Verify role permissions in index.html
4. Test with different user roles
5. Check browser console for errors

**Database:** Supabase PostgreSQL  
**Frontend:** Vanilla JavaScript  
**Authentication:** Client-side role-based

---

**Happy Announcing! 📢**

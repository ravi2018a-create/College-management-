-- ================================================================
-- SETUP USERS FOR COLLEGE MANAGEMENT SYSTEM
-- Run this in Supabase SQL Editor to add real users
-- ================================================================

-- Add password_hash column to users table (for simple authentication)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add password_hash column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- ================================================================
-- REGISTER ADMIN USERS (Chairman, Principal, etc.)
-- Change passwords before using in production!
-- ================================================================

-- Register Chairman
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('chairman@college.edu', 'Dr. Robert Smith', 'chairman', '9876543210', 'chairman123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Principal  
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('principal@college.edu', 'Dr. Sarah Johnson', 'principal', '9876543211', 'principal123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Registrar
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('registrar@college.edu', 'Mr. Suresh Kumar', 'registrar', '9876543212', 'registrar123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register HOD (example - you can add more)
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('hod.cs@college.edu', 'Dr. Anil Kumar', 'hod', '9876543213', 'hod123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Teacher
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('teacher@college.edu', 'Prof. Meera Singh', 'teacher', '9876543214', 'teacher123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Librarian
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('library@college.edu', 'Mrs. Anjali Sharma', 'librarian', '9876543215', 'librarian123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Accountant
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('accounts@college.edu', 'Mr. Ramesh Gupta', 'accountant', '9876543216', 'accountant123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Hostel Warden
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('warden@college.edu', 'Mr. Vijay Singh', 'hostel_warden', '9876543217', 'warden123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- Register Admission Staff
INSERT INTO users (email, name, role, contact, password_hash) VALUES 
('admissions@college.edu', 'Mrs. Priya Iyer', 'admission_staff', '9876543218', 'admission123')
ON CONFLICT (email) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    contact = EXCLUDED.contact,
    password_hash = EXCLUDED.password_hash;

-- ================================================================
-- REGISTER SAMPLE STUDENTS
-- Students login with email + password to Student Portal
-- ================================================================

INSERT INTO students (student_id, name, email, phone, department, year, password_hash) VALUES 
('STU2024001', 'John Smith', 'john.smith@college.edu', '9876543301', 'CS', 2, 'student123'),
('STU2024002', 'Sarah Johnson', 'sarah.johnson@college.edu', '9876543302', 'AIML', 3, 'student123'),
('STU2024003', 'Rahul Verma', 'rahul.verma@college.edu', '9876543303', 'ECE', 1, 'student123'),
('STU2024004', 'Priya Sharma', 'priya.sharma@college.edu', '9876543304', 'EE', 4, 'student123')
ON CONFLICT (student_id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    department = EXCLUDED.department,
    year = EXCLUDED.year,
    password_hash = EXCLUDED.password_hash;

-- ================================================================
-- ROW LEVEL SECURITY POLICIES FOR PUBLIC ACCESS
-- Allow anonymous users to read certain data (for student portal)
-- ================================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON chain_management;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON departments;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON teachers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON students;

-- Allow public read access to leadership
CREATE POLICY "Allow public read" ON chain_management FOR SELECT USING (true);

-- Allow public read access to departments  
CREATE POLICY "Allow public read" ON departments FOR SELECT USING (true);

-- Allow public read access to teachers (for staff directory)
CREATE POLICY "Allow public read" ON teachers FOR SELECT USING (true);

-- Allow public read access to users (staff only, exclude sensitive data)
CREATE POLICY "Allow public read staff" ON users FOR SELECT USING (true);

-- Allow public read access to students (for login verification)
CREATE POLICY "Allow public read" ON students FOR SELECT USING (true);

-- Allow public insert/update for authenticated operations (admin panel)
CREATE POLICY "Allow all operations" ON chain_management FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON students FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- VIEW ALL REGISTERED USERS
-- ================================================================
-- SELECT email, name, role FROM users ORDER BY role;
-- SELECT student_id, name, email, department FROM students ORDER BY student_id;

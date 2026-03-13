-- College Management System - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('chairman', 'principal', 'registrar', 'hod', 'teacher', 'librarian', 'accountant', 'hostel_warden', 'admission_staff')),
    contact VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chain Management Table (Chairman, Principal)
CREATE TABLE IF NOT EXISTS chain_management (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    position VARCHAR(50) NOT NULL UNIQUE CHECK (position IN ('Chairman', 'Principal')),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(15),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hod VARCHAR(255),
    total_teachers INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    established INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(10) REFERENCES departments(code),
    year INTEGER CHECK (year BETWEEN 1 AND 4),
    hostel_status VARCHAR(5) DEFAULT 'No' CHECK (hostel_status IN ('Yes', 'No')),
    fee_status VARCHAR(20) DEFAULT 'Pending' CHECK (fee_status IN ('Paid', 'Pending', 'Partial')),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact VARCHAR(15),
    department VARCHAR(10) REFERENCES departments(code),
    designation VARCHAR(50),
    subjects TEXT,
    qualification VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admission_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(10) REFERENCES departments(code),
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Cancelled')),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registrar Staff Table
CREATE TABLE IF NOT EXISTS registrar_staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    contact VARCHAR(15),
    staff_type VARCHAR(50) DEFAULT 'dcc' CHECK (staff_type IN ('dcc', 'scholarship', 'benefits')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scholarships Table
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Benefits Table
CREATE TABLE IF NOT EXISTS benefits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Library Books Table
CREATE TABLE IF NOT EXISTS library_books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    department VARCHAR(10) REFERENCES departments(code),
    year INTEGER CHECK (year BETWEEN 1 AND 4),
    isbn VARCHAR(20),
    total INTEGER DEFAULT 1,
    available INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book Issues Table
CREATE TABLE IF NOT EXISTS book_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id VARCHAR(20) UNIQUE NOT NULL,
    book_id VARCHAR(20) REFERENCES library_books(book_id),
    book_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Overdue', 'Returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book Returns Table
CREATE TABLE IF NOT EXISTS book_returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    return_id VARCHAR(20) UNIQUE NOT NULL,
    book_id VARCHAR(20) REFERENCES library_books(book_id),
    book_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    return_date DATE NOT NULL,
    fine DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Boys', 'Girls')),
    total_rooms INTEGER NOT NULL,
    occupied INTEGER DEFAULT 0,
    warden VARCHAR(255),
    contact VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Allocations Table
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    hostel_id UUID REFERENCES hostels(id),
    hostel_name VARCHAR(255) NOT NULL,
    room_no VARCHAR(20) NOT NULL,
    allocation_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fee Records Table
CREATE TABLE IF NOT EXISTS fee_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    department VARCHAR(10) REFERENCES departments(code),
    year INTEGER CHECK (year BETWEEN 1 AND 4),
    total_fees DECIMAL(12, 2) NOT NULL,
    paid DECIMAL(12, 2) DEFAULT 0,
    remaining DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fee_record_id UUID REFERENCES fee_records(id),
    student_id VARCHAR(20) REFERENCES students(student_id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(50),
    reference_no VARCHAR(100),
    payment_date DATE NOT NULL,
    remarks TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notices Table (for Student Portal)
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'exam', 'event', 'important', 'holiday')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers', 'staff')),
    department VARCHAR(10) REFERENCES departments(code),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (code, name, hod, total_teachers, total_students, established) VALUES
    ('CS', 'Computer Science', 'Dr. Anil Kumar', 22, 320, 1995),
    ('AIML', 'AI & Machine Learning', 'Dr. Priya Mehta', 18, 280, 2020),
    ('ECE', 'Electronics & Communication', 'Dr. Rajesh Sharma', 25, 350, 1990),
    ('EE', 'Electrical Engineering', 'Dr. Sunita Verma', 20, 300, 1988)
ON CONFLICT (code) DO NOTHING;

-- Insert default chain management
INSERT INTO chain_management (position, name, contact, email) VALUES
    ('Chairman', 'Dr. Robert Smith', '9876543210', 'chairman@college.edu'),
    ('Principal', 'Dr. Sarah Johnson', '9876543211', 'principal@college.edu')
ON CONFLICT (position) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);
CREATE INDEX IF NOT EXISTS idx_students_fee_status ON students(fee_status);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_books_department ON library_books(department);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON fee_records(status);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_hostel ON hostel_allocations(hostel_id);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chain_management_updated_at BEFORE UPDATE ON chain_management FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrar_staff_updated_at BEFORE UPDATE ON registrar_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON library_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_issues_updated_at BEFORE UPDATE ON book_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostel_allocations_updated_at BEFORE UPDATE ON hostel_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_records_updated_at BEFORE UPDATE ON fee_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrar_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allow all operations for now)
-- In production, you should create more specific policies based on user roles

CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON chain_management FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON departments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON teachers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON admissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON registrar_staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON scholarships FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON benefits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON library_books FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON book_issues FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON book_returns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON hostels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON hostel_allocations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON fee_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON payment_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON notices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for anon users on notices" ON notices FOR SELECT USING (is_active = true);

-- Additional helpful views

-- View: Students with fee pending
CREATE OR REPLACE VIEW v_fee_pending_students AS
SELECT 
    s.student_id,
    s.name,
    s.department,
    s.year,
    f.total_fees,
    f.paid,
    f.remaining
FROM students s
JOIN fee_records f ON s.student_id = f.student_id
WHERE f.remaining > 0;

-- View: Library books availability by department
CREATE OR REPLACE VIEW v_books_by_department AS
SELECT 
    department,
    COUNT(*) as total_titles,
    SUM(total) as total_copies,
    SUM(available) as available_copies
FROM library_books
GROUP BY department;

-- View: Hostel occupancy summary
CREATE OR REPLACE VIEW v_hostel_occupancy AS
SELECT 
    type,
    COUNT(*) as hostel_count,
    SUM(total_rooms) as total_rooms,
    SUM(occupied) as occupied_rooms,
    SUM(total_rooms) - SUM(occupied) as vacant_rooms,
    ROUND(SUM(occupied)::numeric / SUM(total_rooms) * 100, 2) as occupancy_percentage
FROM hostels
GROUP BY type;

COMMENT ON TABLE students IS 'Stores all student information';
COMMENT ON TABLE teachers IS 'Stores all teacher/faculty information';
COMMENT ON TABLE library_books IS 'Library book catalog';
COMMENT ON TABLE fee_records IS 'Student fee tracking - password protected module';

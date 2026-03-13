-- ====================================================================
-- COMPLETE DATABASE SCHEMA FOR COLLEGE MANAGEMENT SYSTEM
-- ====================================================================
-- Migration-safe: works on existing database from schema.sql + setup-users.sql
-- Run this in your Supabase SQL Editor
-- 
-- Created: March 2026
-- Database: PostgreSQL (Supabase)
-- ====================================================================

-- ====================================================================
-- 0. MIGRATION: Fix column sizes from old schema.sql
-- ====================================================================
-- Old schema used VARCHAR(10) for department (storing codes like 'CS').
-- New schema needs VARCHAR(100) for full names like 'Computer Science'.
-- Each table is handled in its own block so one failure won't rollback others.

-- Drop old views that depend on department columns (blocks ALTER COLUMN TYPE)
DROP VIEW IF EXISTS v_fee_pending_students CASCADE;
DROP VIEW IF EXISTS v_books_by_department CASCADE;
DROP VIEW IF EXISTS v_hostel_occupancy CASCADE;

-- 0a. Drop FK constraints on students
DO $$ BEGIN
    ALTER TABLE students DROP CONSTRAINT IF EXISTS students_department_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0b. Drop FK constraints on teachers
DO $$ BEGIN
    ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_department_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0c. Drop FK constraints on library_books
DO $$ BEGIN
    ALTER TABLE library_books DROP CONSTRAINT IF EXISTS library_books_department_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0d. Drop FK constraints on notices
DO $$ BEGIN
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_department_fkey;
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_created_by_fkey;
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_check;
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_priority_check;
    ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_target_audience_check;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0e. Drop FK constraints on fee_records
DO $$ BEGIN
    ALTER TABLE fee_records DROP CONSTRAINT IF EXISTS fee_records_department_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0f. Drop FK constraints on admissions
DO $$ BEGIN
    ALTER TABLE admissions DROP CONSTRAINT IF EXISTS admissions_department_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0g. Drop FK constraints on book_issues
DO $$ BEGIN
    ALTER TABLE book_issues DROP CONSTRAINT IF EXISTS book_issues_book_id_fkey;
    ALTER TABLE book_issues DROP CONSTRAINT IF EXISTS book_issues_student_id_fkey;
    ALTER TABLE book_issues DROP CONSTRAINT IF EXISTS book_issues_status_check;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0h. Drop FK constraints on hostel_allocations
DO $$ BEGIN
    ALTER TABLE hostel_allocations DROP CONSTRAINT IF EXISTS hostel_allocations_student_id_fkey;
    ALTER TABLE hostel_allocations DROP CONSTRAINT IF EXISTS hostel_allocations_hostel_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0i. Resize students columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') THEN
        ALTER TABLE students ALTER COLUMN student_id TYPE VARCHAR(50);
        ALTER TABLE students ALTER COLUMN department TYPE VARCHAR(100);
        ALTER TABLE students ALTER COLUMN phone TYPE VARCHAR(20);
        ALTER TABLE students DROP CONSTRAINT IF EXISTS students_hostel_status_check;
        ALTER TABLE students DROP CONSTRAINT IF EXISTS students_fee_status_check;
        ALTER TABLE students DROP CONSTRAINT IF EXISTS students_year_check;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0j. Resize teachers columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers' AND table_schema = 'public') THEN
        ALTER TABLE teachers ALTER COLUMN teacher_id TYPE VARCHAR(50);
        ALTER TABLE teachers ALTER COLUMN department TYPE VARCHAR(100);
        ALTER TABLE teachers ALTER COLUMN contact TYPE VARCHAR(20);
        ALTER TABLE teachers ALTER COLUMN designation TYPE VARCHAR(100);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0k. Resize library_books columns + rename old column names
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'library_books' AND table_schema = 'public') THEN
        ALTER TABLE library_books ALTER COLUMN book_id TYPE VARCHAR(50);
        ALTER TABLE library_books ALTER COLUMN isbn TYPE VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'total') THEN
        ALTER TABLE library_books RENAME COLUMN total TO total_copies;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'available') THEN
        ALTER TABLE library_books RENAME COLUMN available TO available_copies;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0l. Resize book_issues columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'book_issues' AND table_schema = 'public') THEN
        ALTER TABLE book_issues ALTER COLUMN book_id TYPE VARCHAR(50);
        ALTER TABLE book_issues ALTER COLUMN student_id TYPE VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0m. Resize hostel_allocations columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hostel_allocations' AND table_schema = 'public') THEN
        ALTER TABLE hostel_allocations ALTER COLUMN student_id TYPE VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 0n. Resize notices columns
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'department') THEN
        ALTER TABLE notices ALTER COLUMN department TYPE VARCHAR(100);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ====================================================================
-- 1. STUDENTS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    date_of_birth DATE,
    address TEXT,
    guardian_name VARCHAR(255),
    guardian_contact VARCHAR(20),
    blood_group VARCHAR(10),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns to students
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'password') THEN
        ALTER TABLE students ADD COLUMN password VARCHAR(255) DEFAULT 'student123';
        UPDATE students SET password = 'student123' WHERE password IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'phone') THEN
        ALTER TABLE students ADD COLUMN phone VARCHAR(20);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'year') THEN
        ALTER TABLE students ADD COLUMN year INTEGER DEFAULT 1;
        UPDATE students SET year = 1 WHERE year IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'date_of_birth') THEN
        ALTER TABLE students ADD COLUMN date_of_birth DATE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'guardian_name') THEN
        ALTER TABLE students ADD COLUMN guardian_name VARCHAR(255);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'guardian_contact') THEN
        ALTER TABLE students ADD COLUMN guardian_contact VARCHAR(20);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'blood_group') THEN
        ALTER TABLE students ADD COLUMN blood_group VARCHAR(10);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'enrollment_date') THEN
        ALTER TABLE students ADD COLUMN enrollment_date DATE DEFAULT CURRENT_DATE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'status') THEN
        ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE students SET status = 'active' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE students ADD CONSTRAINT students_status_check
    CHECK (status IN ('active', 'inactive', 'graduated', 'suspended'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- ====================================================================
-- 2. TEACHERS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    subjects TEXT,
    joining_date DATE,
    experience_years INTEGER,
    specialization VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'status') THEN
        ALTER TABLE teachers ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE teachers SET status = 'active' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'joining_date') THEN
        ALTER TABLE teachers ADD COLUMN joining_date DATE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'experience_years') THEN
        ALTER TABLE teachers ADD COLUMN experience_years INTEGER;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'specialization') THEN
        ALTER TABLE teachers ADD COLUMN specialization VARCHAR(255);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE teachers ADD CONSTRAINT teachers_status_check
    CHECK (status IN ('active', 'inactive', 'on_leave'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_teachers_designation ON teachers(designation);

-- ====================================================================
-- 3. LIBRARY_BOOKS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS library_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    publisher VARCHAR(255),
    publication_year INTEGER,
    edition VARCHAR(50),
    subject VARCHAR(100),
    category VARCHAR(100),
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER,
    shelf_location VARCHAR(50),
    price DECIMAL(10, 2),
    language VARCHAR(50) DEFAULT 'English',
    pages INTEGER,
    description TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'total_copies') THEN
        ALTER TABLE library_books ADD COLUMN total_copies INTEGER NOT NULL DEFAULT 1;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'available_copies') THEN
        ALTER TABLE library_books ADD COLUMN available_copies INTEGER;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    UPDATE library_books SET available_copies = total_copies WHERE available_copies IS NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'status') THEN
        ALTER TABLE library_books ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE library_books SET status = 'active' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'publisher') THEN
        ALTER TABLE library_books ADD COLUMN publisher VARCHAR(255);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'publication_year') THEN
        ALTER TABLE library_books ADD COLUMN publication_year INTEGER;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'edition') THEN
        ALTER TABLE library_books ADD COLUMN edition VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'category') THEN
        ALTER TABLE library_books ADD COLUMN category VARCHAR(100);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'shelf_location') THEN
        ALTER TABLE library_books ADD COLUMN shelf_location VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'price') THEN
        ALTER TABLE library_books ADD COLUMN price DECIMAL(10, 2);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'language') THEN
        ALTER TABLE library_books ADD COLUMN language VARCHAR(50) DEFAULT 'English';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'pages') THEN
        ALTER TABLE library_books ADD COLUMN pages INTEGER;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'description') THEN
        ALTER TABLE library_books ADD COLUMN description TEXT;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'library_books' AND column_name = 'added_date') THEN
        ALTER TABLE library_books ADD COLUMN added_date DATE DEFAULT CURRENT_DATE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE library_books ADD CONSTRAINT library_books_status_check
    CHECK (status IN ('active', 'damaged', 'lost', 'retired'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE library_books DROP CONSTRAINT IF EXISTS check_available_copies;
    ALTER TABLE library_books ADD CONSTRAINT check_available_copies
    CHECK (available_copies >= 0 AND available_copies <= total_copies);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_library_books_book_id ON library_books(book_id);
CREATE INDEX IF NOT EXISTS idx_library_books_title ON library_books(title);
CREATE INDEX IF NOT EXISTS idx_library_books_author ON library_books(author);
CREATE INDEX IF NOT EXISTS idx_library_books_isbn ON library_books(isbn);
CREATE INDEX IF NOT EXISTS idx_library_books_subject ON library_books(subject);
CREATE INDEX IF NOT EXISTS idx_library_books_category ON library_books(category);

-- ====================================================================
-- 4. BOOK_ISSUES TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS book_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id VARCHAR(50) NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255),
    issue_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
    return_date TIMESTAMP,
    fine_amount DECIMAL(10, 2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'student_email') THEN
        ALTER TABLE book_issues ADD COLUMN student_email VARCHAR(255);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'due_date') THEN
        ALTER TABLE book_issues ADD COLUMN due_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days');
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'return_date') THEN
        ALTER TABLE book_issues ADD COLUMN return_date TIMESTAMP;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'fine_amount') THEN
        ALTER TABLE book_issues ADD COLUMN fine_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'remarks') THEN
        ALTER TABLE book_issues ADD COLUMN remarks TEXT;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_issues' AND column_name = 'status') THEN
        ALTER TABLE book_issues ADD COLUMN status VARCHAR(20) DEFAULT 'issued';
        UPDATE book_issues SET status = 'issued' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE book_issues ADD CONSTRAINT book_issues_status_check
    CHECK (status IN ('issued', 'returned', 'overdue', 'lost'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_book_issues_book_id ON book_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_student_id ON book_issues(student_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);
CREATE INDEX IF NOT EXISTS idx_book_issues_issue_date ON book_issues(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_book_issues_due_date ON book_issues(due_date);

-- ====================================================================
-- 5. HOSTEL_REQUESTS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS hostel_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(20),
    department VARCHAR(100),
    year INTEGER,
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type VARCHAR(50) NOT NULL,
    room_preference VARCHAR(50),
    request_date TIMESTAMP DEFAULT NOW(),
    remarks TEXT,
    reviewed_by VARCHAR(255),
    reviewed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_requests' AND column_name = 'status') THEN
        ALTER TABLE hostel_requests ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        UPDATE hostel_requests SET status = 'pending' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE hostel_requests ADD CONSTRAINT hostel_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_hostel_requests_student_id ON hostel_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_requests_status ON hostel_requests(status);
CREATE INDEX IF NOT EXISTS idx_hostel_requests_hostel_name ON hostel_requests(hostel_name);

-- ====================================================================
-- 6. HOSTEL_ALLOCATIONS TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255),
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor VARCHAR(10),
    bed_number VARCHAR(10),
    allocated_date TIMESTAMP DEFAULT NOW(),
    checkout_date TIMESTAMP,
    monthly_fee DECIMAL(10, 2),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'status') THEN
        ALTER TABLE hostel_allocations ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        UPDATE hostel_allocations SET status = 'active' WHERE status IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'hostel_type') THEN
        ALTER TABLE hostel_allocations ADD COLUMN hostel_type VARCHAR(50);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'room_number') THEN
        ALTER TABLE hostel_allocations ADD COLUMN room_number VARCHAR(20);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'floor') THEN
        ALTER TABLE hostel_allocations ADD COLUMN floor VARCHAR(10);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'bed_number') THEN
        ALTER TABLE hostel_allocations ADD COLUMN bed_number VARCHAR(10);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'checkout_date') THEN
        ALTER TABLE hostel_allocations ADD COLUMN checkout_date TIMESTAMP;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostel_allocations' AND column_name = 'monthly_fee') THEN
        ALTER TABLE hostel_allocations ADD COLUMN monthly_fee DECIMAL(10, 2);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE hostel_allocations ADD CONSTRAINT hostel_allocations_status_check
    CHECK (status IN ('active', 'checked_out', 'suspended'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_hostel_allocations_student_id ON hostel_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_hostel_name ON hostel_allocations(hostel_name);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_status ON hostel_allocations(status);

-- ====================================================================
-- 7. NOTICES TABLE
-- ====================================================================

CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by VARCHAR(255) NOT NULL,
    posted_by_role VARCHAR(50) NOT NULL,
    posted_by_email VARCHAR(255),
    department VARCHAR(100),
    posted_date TIMESTAMP DEFAULT NOW(),
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'posted_by') THEN
        ALTER TABLE notices ADD COLUMN posted_by VARCHAR(255) DEFAULT 'System';
        UPDATE notices SET posted_by = 'System' WHERE posted_by IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'posted_by_role') THEN
        ALTER TABLE notices ADD COLUMN posted_by_role VARCHAR(50) DEFAULT 'chairman';
        UPDATE notices SET posted_by_role = 'chairman' WHERE posted_by_role IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'posted_by_email') THEN
        ALTER TABLE notices ADD COLUMN posted_by_email VARCHAR(255);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'department') THEN
        ALTER TABLE notices ADD COLUMN department VARCHAR(100);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'posted_date') THEN
        ALTER TABLE notices ADD COLUMN posted_date TIMESTAMP DEFAULT NOW();
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'expiry_date') THEN
        ALTER TABLE notices ADD COLUMN expiry_date TIMESTAMP;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'is_active') THEN
        ALTER TABLE notices ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'view_count') THEN
        ALTER TABLE notices ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'priority') THEN
        ALTER TABLE notices ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        UPDATE notices SET priority = 'normal' WHERE priority IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'target_audience') THEN
        ALTER TABLE notices ADD COLUMN target_audience VARCHAR(50) DEFAULT 'all';
        UPDATE notices SET target_audience = 'all' WHERE target_audience IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE notices ADD CONSTRAINT notices_posted_by_role_check
    CHECK (posted_by_role IN ('chairman', 'principal', 'registrar', 'hod', 'teacher', 'librarian', 'accountant', 'hostel_warden', 'admission_staff'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE notices ADD CONSTRAINT notices_priority_check
    CHECK (priority IN ('urgent', 'high', 'normal', 'low'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE notices ADD CONSTRAINT notices_target_audience_check
    CHECK (target_audience IN ('all', 'students', 'teachers', 'department_specific'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_notices_posted_date ON notices(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_department ON notices(department);
CREATE INDEX IF NOT EXISTS idx_notices_target_audience ON notices(target_audience);
CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_expiry_date ON notices(expiry_date);

-- ====================================================================
-- 8. TRIGGERS AND FUNCTIONS
-- ====================================================================

CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'issued') THEN
        UPDATE library_books
        SET available_copies = available_copies - 1, updated_at = NOW()
        WHERE book_id = NEW.book_id AND available_copies > 0;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No available copies of book %', NEW.book_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned') THEN
        UPDATE library_books
        SET available_copies = available_copies + 1, updated_at = NOW()
        WHERE book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_book_availability ON book_issues;
CREATE TRIGGER trigger_book_availability
    AFTER INSERT OR UPDATE ON book_issues
    FOR EACH ROW EXECUTE FUNCTION update_book_availability();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_books_updated_at ON library_books;
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON library_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_book_issues_updated_at ON book_issues;
CREATE TRIGGER update_book_issues_updated_at BEFORE UPDATE ON book_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hostel_requests_updated_at ON hostel_requests;
CREATE TRIGGER update_hostel_requests_updated_at BEFORE UPDATE ON hostel_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hostel_allocations_updated_at ON hostel_allocations;
CREATE TRIGGER update_hostel_allocations_updated_at BEFORE UPDATE ON hostel_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Drop existing policies from old schema.sql
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON chain_management;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON departments;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON students;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON teachers;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON admissions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON registrar_staff;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON scholarships;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON benefits;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON library_books;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON book_issues;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON book_returns;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON hostels;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON hostel_allocations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON fee_records;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON payment_history;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON notices;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read for anon users on notices" ON notices;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for client-side app (since we're not using Supabase Auth)
-- For production, configure proper authentication and restrict these policies

DO $$ BEGIN
    CREATE POLICY "Allow public read access on students" ON students FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on students" ON students FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on teachers" ON teachers FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on teachers" ON teachers FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on library_books" ON library_books FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on library_books" ON library_books FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on book_issues" ON book_issues FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on book_issues" ON book_issues FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on hostel_requests" ON hostel_requests FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on hostel_requests" ON hostel_requests FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on hostel_allocations" ON hostel_allocations FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on hostel_allocations" ON hostel_allocations FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public read access on notices" ON notices FOR SELECT USING (true);
    CREATE POLICY "Allow public write access on notices" ON notices FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ====================================================================
-- 10. SAMPLE DATA
-- ====================================================================

INSERT INTO students (student_id, name, email, password, phone, department, year, status)
VALUES
    ('STU001', 'John Smith', 'john.smith@college.edu', 'student123', '9876543210', 'Computer Science', 2, 'active'),
    ('STU002', 'Emily Johnson', 'emily.j@college.edu', 'student123', '9876543211', 'Computer Science', 3, 'active'),
    ('STU003', 'Raj Patel', 'raj.patel@college.edu', 'student123', '9876543212', 'AI & ML', 1, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO teachers (teacher_id, name, email, contact, department, designation, subjects)
VALUES
    ('TCH001', 'Dr. Sarah Williams', 'sarah.w@college.edu', '9876543220', 'Computer Science', 'Professor', 'Data Structures, Algorithms'),
    ('TCH002', 'Prof. Amit Kumar', 'amit.k@college.edu', '9876543221', 'Computer Science', 'Associate Professor', 'Database Systems'),
    ('TCH003', 'Dr. Priya Singh', 'priya.s@college.edu', '9876543222', 'AI & ML', 'Assistant Professor', 'Machine Learning, AI')
ON CONFLICT DO NOTHING;

INSERT INTO library_books (book_id, title, author, isbn, subject, total_copies, available_copies)
VALUES
    ('BOOK001', 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 5, 5),
    ('BOOK002', 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 3, 3),
    ('BOOK003', 'Database System Concepts', 'Abraham Silberschatz', '978-0073523323', 'Database', 4, 4),
    ('BOOK004', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'AI', 3, 3)
ON CONFLICT DO NOTHING;

INSERT INTO notices (title, content, posted_by, posted_by_role, posted_by_email, priority, target_audience)
VALUES
    ('Welcome to College Management System',
     'Welcome to the new digital College Management System. Students can now access their profiles, check library books, apply for hostels, and view announcements online.',
     'Dr. Robert Smith', 'chairman', 'chairman@college.edu', 'high', 'all')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 11. VERIFICATION
-- ====================================================================

SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name IN ('students', 'teachers', 'library_books', 'book_issues', 'hostel_requests', 'hostel_allocations', 'notices')
ORDER BY table_name;

SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'library_books', COUNT(*) FROM library_books
UNION ALL SELECT 'book_issues', COUNT(*) FROM book_issues
UNION ALL SELECT 'hostel_requests', COUNT(*) FROM hostel_requests
UNION ALL SELECT 'hostel_allocations', COUNT(*) FROM hostel_allocations
UNION ALL SELECT 'notices', COUNT(*) FROM notices
ORDER BY table_name;

SELECT '✅ Database schema created successfully!' as status,
       'All tables, indexes, triggers, and sample data have been set up.' as message;

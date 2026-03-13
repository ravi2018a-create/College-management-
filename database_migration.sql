-- Database Migration Script for College Management System
-- Run these SQL commands in your Supabase SQL Editor

-- =================================================================
-- 1. Add missing 'available_copies' column to library_books table
-- =================================================================

-- Check if column exists and add if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'library_books' 
        AND column_name = 'available_copies'
    ) THEN
        ALTER TABLE library_books 
        ADD COLUMN available_copies INTEGER;
        
        -- Set available_copies equal to total_copies for existing records
        UPDATE library_books 
        SET available_copies = total_copies 
        WHERE available_copies IS NULL;
        
        -- Add constraint to ensure available_copies doesn't exceed total_copies
        ALTER TABLE library_books 
        ADD CONSTRAINT check_available_copies 
        CHECK (available_copies >= 0 AND available_copies <= total_copies);
        
        RAISE NOTICE 'Column available_copies added successfully';
    ELSE
        RAISE NOTICE 'Column available_copies already exists';
    END IF;
END $$;

-- =================================================================
-- 2. Verify and create book_issues table
-- =================================================================

CREATE TABLE IF NOT EXISTS book_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id VARCHAR(50) NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    issue_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP DEFAULT (NOW() + INTERVAL '14 days'),
    return_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_book_issues_book_id ON book_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_student_id ON book_issues(student_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);

COMMENT ON TABLE book_issues IS 'Tracks library book issues and returns';

-- =================================================================
-- 3. Verify and create hostel_requests table
-- =================================================================

CREATE TABLE IF NOT EXISTS hostel_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type VARCHAR(50) NOT NULL,
    request_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hostel_requests_student_id ON hostel_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_requests_status ON hostel_requests(status);

COMMENT ON TABLE hostel_requests IS 'Student hostel accommodation requests';

-- =================================================================
-- 4. Verify and create hostel_allocations table
-- =================================================================

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    hostel_name VARCHAR(100) NOT NULL,
    hostel_type VARCHAR(50) NOT NULL,
    room_number VARCHAR(20),
    floor VARCHAR(10),
    allocated_date TIMESTAMP DEFAULT NOW(),
    checkout_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hostel_allocations_student_id ON hostel_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_status ON hostel_allocations(status);

COMMENT ON TABLE hostel_allocations IS 'Approved hostel room allocations';

-- =================================================================
-- 5. Add department column to users (if implementing user management)
-- =================================================================

-- Note: Uncomment if you have a users table for authentication
/*
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'department'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN department VARCHAR(100);
        
        RAISE NOTICE 'Column department added to users table';
    ELSE
        RAISE NOTICE 'Column department already exists in users table';
    END IF;
END $$;
*/

-- =================================================================
-- 6. Create trigger to update available_copies when book is issued
-- =================================================================

CREATE OR REPLACE FUNCTION update_book_availability() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'issued') THEN
        -- Decrease available copies when book is issued
        UPDATE library_books 
        SET available_copies = available_copies - 1 
        WHERE book_id = NEW.book_id 
        AND available_copies > 0;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned') THEN
        -- Increase available copies when book is returned
        UPDATE library_books 
        SET available_copies = available_copies + 1 
        WHERE book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_book_availability ON book_issues;
CREATE TRIGGER trigger_book_availability
    AFTER INSERT OR UPDATE ON book_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_book_availability();

-- =================================================================
-- 7. Add sample data verification
-- =================================================================

-- Check if tables have the required structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name IN ('library_books', 'book_issues', 'hostel_requests', 'hostel_allocations')
ORDER BY 
    table_name, ordinal_position;

-- =================================================================
-- 8. Row-Level Security (RLS) Policies (Recommended for Production)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;

-- Example: Allow all authenticated users to read students
-- Modify these policies based on your authentication setup
/*
CREATE POLICY "Allow authenticated read on students" 
ON students FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow HOD to manage their department students" 
ON students FOR ALL 
TO authenticated 
USING (
    department = (SELECT department FROM users WHERE id = auth.uid())
);
*/

-- =================================================================
-- Migration Complete
-- =================================================================

-- Verify migration
SELECT 
    'Migration completed successfully. Please verify all tables and columns.' as status;

-- Show table counts
SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'library_books', COUNT(*) FROM library_books
UNION ALL
SELECT 'book_issues', COUNT(*) FROM book_issues
UNION ALL
SELECT 'hostel_requests', COUNT(*) FROM hostel_requests
UNION ALL
SELECT 'hostel_allocations', COUNT(*) FROM hostel_allocations;

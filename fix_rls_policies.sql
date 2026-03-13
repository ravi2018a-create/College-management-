-- ====================================================================
-- FIX RLS POLICIES FOR COLLEGE MANAGEMENT SYSTEM
-- ====================================================================
-- This fixes the 401 Unauthorized errors by adding permissive RLS policies
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Drop existing policies if they exist
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on students" ON students;
    DROP POLICY IF EXISTS "Allow public write access on students" ON students;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on teachers" ON teachers;
    DROP POLICY IF EXISTS "Allow public write access on teachers" ON teachers;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on library_books" ON library_books;
    DROP POLICY IF EXISTS "Allow public write access on library_books" ON library_books;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on book_issues" ON book_issues;
    DROP POLICY IF EXISTS "Allow public write access on book_issues" ON book_issues;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on hostel_requests" ON hostel_requests;
    DROP POLICY IF EXISTS "Allow public write access on hostel_requests" ON hostel_requests;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on hostel_allocations" ON hostel_allocations;
    DROP POLICY IF EXISTS "Allow public write access on hostel_allocations" ON hostel_allocations;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public read access on notices" ON notices;
    DROP POLICY IF EXISTS "Allow public write access on notices" ON notices;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Create permissive policies for client-side app
-- NOTE: These are permissive for development. For production, integrate proper Supabase Auth

CREATE POLICY "Allow public read access on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public write access on students" ON students FOR ALL USING (true);

CREATE POLICY "Allow public read access on teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow public write access on teachers" ON teachers FOR ALL USING (true);

CREATE POLICY "Allow public read access on library_books" ON library_books FOR SELECT USING (true);
CREATE POLICY "Allow public write access on library_books" ON library_books FOR ALL USING (true);

CREATE POLICY "Allow public read access on book_issues" ON book_issues FOR SELECT USING (true);
CREATE POLICY "Allow public write access on book_issues" ON book_issues FOR ALL USING (true);

CREATE POLICY "Allow public read access on hostel_requests" ON hostel_requests FOR SELECT USING (true);
CREATE POLICY "Allow public write access on hostel_requests" ON hostel_requests FOR ALL USING (true);

CREATE POLICY "Allow public read access on hostel_allocations" ON hostel_allocations FOR SELECT USING (true);
CREATE POLICY "Allow public write access on hostel_allocations" ON hostel_allocations FOR ALL USING (true);

CREATE POLICY "Allow public read access on notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Allow public write access on notices" ON notices FOR ALL USING (true);

SELECT '✅ RLS policies created successfully!' as status,
       'You should now be able to access all tables without 401 errors.' as message;

-- Run this in your Supabase SQL Editor to remove all books
-- if you want to start with empty library

DELETE FROM library_books;
DELETE FROM book_issues; 
DELETE FROM book_returns;

-- This will make the count show 0 instead of 15
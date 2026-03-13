-- Create empty hostel table structure for your Supabase database
-- Run this in your Supabase SQL Editor

-- Create hostels table if it doesn't exist
CREATE TABLE IF NOT EXISTS hostels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'Boys' or 'Girls'
    total_rooms INTEGER NOT NULL,
    occupied INTEGER DEFAULT 0,
    warden_name VARCHAR(100),
    warden_contact VARCHAR(20),
    facilities TEXT,
    fee_per_month INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create hostel allocations table
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    hostel_id INTEGER REFERENCES hostels(id),
    room_number VARCHAR(10),
    allocated_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Note: No default data inserted - start with empty hostel system
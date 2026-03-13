-- Add HOD designations to existing teachers or add new HODs
-- Run this in your Supabase SQL Editor

-- Option 1: Update existing teachers to make them HODs
UPDATE teachers 
SET designation = 'HOD & Professor'
WHERE teacher_id = 'TCH004' AND name = 'raviranjan';

-- Option 2: Add new HOD teachers for each department
INSERT INTO teachers (teacher_id, name, department, designation, email, contact, subjects) VALUES
('TCH006', 'Dr. Priya Sharma', 'CS', 'HOD Computer Science', 'priya.sharma@college.edu', '9876543210', 'Data Structures, Algorithms'),
('TCH007', 'Dr. Amit Kumar', 'AIML', 'HOD AI & ML', 'amit.kumar@college.edu', '9876543211', 'Machine Learning, AI'),
('TCH008', 'Dr. Rajesh Gupta', 'ECE', 'HOD Electronics', 'rajesh.gupta@college.edu', '9876543212', 'Digital Electronics, VLSI'),
('TCH009', 'Dr. Sunita Singh', 'EE', 'HOD Electrical', 'sunita.singh@college.edu', '9876543213', 'Power Systems, Control Systems');

-- Option 3: If you prefer to update designation format for all
UPDATE teachers SET designation = 'HOD & ' || designation WHERE teacher_id IN ('TCH004', 'TCH005');
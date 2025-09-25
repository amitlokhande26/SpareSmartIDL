-- Simple SpareSmart Schema - Focus on Lines → Machines → Parts hierarchy
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS lines CASCADE;
DROP TABLE IF EXISTS checkweighers CASCADE;

-- Create lines table
CREATE TABLE lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    capacity INTEGER,
    efficiency DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create machines table
CREATE TABLE machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    line_id UUID REFERENCES lines(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parts table
CREATE TABLE parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    description TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    location VARCHAR(100),
    cost DECIMAL(10,2),
    last_checked DATE,
    next_due DATE,
    others TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checkweighers table
CREATE TABLE checkweighers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    line_id UUID REFERENCES lines(id) ON DELETE CASCADE,
    last_calibrated DATE,
    next_due DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lines_updated_at BEFORE UPDATE ON lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkweighers_updated_at BEFORE UPDATE ON checkweighers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkweighers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on lines" ON lines FOR ALL USING (true);
CREATE POLICY "Allow all operations on machines" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations on parts" ON parts FOR ALL USING (true);
CREATE POLICY "Allow all operations on checkweighers" ON checkweighers FOR ALL USING (true);

-- Insert your original lines
INSERT INTO lines (name, description, location, capacity, efficiency) VALUES
('Canning Line 1', 'Main canning production line', 'Floor 1', 1000, 95.5),
('Canning Line 2', 'Secondary canning production line', 'Floor 1', 1000, 95.5),
('Kegging Line', 'Kegging production line', 'Floor 2', 500, 88.2),
('Bottling Line 1', 'Primary bottling line', 'Floor 2', 800, 92.0),
('Bottling Line 2', 'Secondary bottling line', 'Floor 2', 800, 92.0);

-- Insert machines for Canning Line 2 (your original sequence)
INSERT INTO machines (name, line_id, description, status, location) 
SELECT 
    'Depal', id, 'Depalletizing machine', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Carbonator', id, 'Carbonation system', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Filler', id, 'Filling machine', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Seamer', id, 'Seaming machine', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'X-Ray', id, 'X-Ray inspection system', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Printers', id, 'Printing system', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Westrock', id, 'Packaging system', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Cluster Checkweigher', id, 'Cluster checkweigher', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Fibre King', id, 'Packaging machine', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Palletiser', id, 'Palletizing system', 'active', 'Canning Line 2'
FROM lines WHERE name = 'Canning Line 2';

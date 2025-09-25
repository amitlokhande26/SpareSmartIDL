-- SpareSmart Inventory Management Database Schema
-- Run this in your Supabase SQL editor

-- Note: JWT secret is automatically managed by Supabase

-- Create tables
CREATE TABLE IF NOT EXISTS parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    supplier VARCHAR(100),
    cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    location VARCHAR(100),
    line_id UUID REFERENCES lines(id),
    installation_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    location VARCHAR(100),
    capacity INTEGER,
    efficiency DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkweighers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    location VARCHAR(100),
    line_id UUID REFERENCES lines(id),
    accuracy DECIMAL(5,3),
    max_weight DECIMAL(10,3),
    min_weight DECIMAL(10,3),
    last_calibrated DATE,
    next_due DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_status ON parts(status);

CREATE INDEX IF NOT EXISTS idx_machines_name ON machines(name);
CREATE INDEX IF NOT EXISTS idx_machines_model ON machines(model);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

CREATE INDEX IF NOT EXISTS idx_lines_name ON lines(name);
CREATE INDEX IF NOT EXISTS idx_lines_status ON lines(status);

CREATE INDEX IF NOT EXISTS idx_checkweighers_name ON checkweighers(name);
CREATE INDEX IF NOT EXISTS idx_checkweighers_model ON checkweighers(model);
CREATE INDEX IF NOT EXISTS idx_checkweighers_status ON checkweighers(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_parts_updated_at ON parts;
DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;
DROP TRIGGER IF EXISTS update_lines_updated_at ON lines;
DROP TRIGGER IF EXISTS update_checkweighers_updated_at ON checkweighers;

-- Create triggers for updated_at
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lines_updated_at BEFORE UPDATE ON lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkweighers_updated_at BEFORE UPDATE ON checkweighers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkweighers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations on parts" ON parts;
DROP POLICY IF EXISTS "Allow all operations on machines" ON machines;
DROP POLICY IF EXISTS "Allow all operations on lines" ON lines;
DROP POLICY IF EXISTS "Allow all operations on checkweighers" ON checkweighers;

-- Create policies (allow all operations for now - customize based on your needs)
CREATE POLICY "Allow all operations on parts" ON parts FOR ALL USING (true);
CREATE POLICY "Allow all operations on machines" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations on lines" ON lines FOR ALL USING (true);
CREATE POLICY "Allow all operations on checkweighers" ON checkweighers FOR ALL USING (true);

-- Insert sample data
-- Insert lines first
INSERT INTO lines (name, description, location, capacity, efficiency) VALUES
('Canning Line 1', 'Main canning production line', 'Floor 1', 1000, 95.5),
('Canning Line 2', 'Secondary canning production line', 'Floor 1', 1000, 95.5),
('Kegging Line', 'Kegging production line', 'Floor 2', 500, 88.2),
('Bottling Line 1', 'Primary bottling line', 'Floor 2', 800, 92.0),
('Bottling Line 2', 'Secondary bottling line', 'Floor 2', 800, 92.0);

-- Insert machines for Canning Line 2
INSERT INTO machines (name, model, manufacturer, serial_number, description, location, status, line_id) 
SELECT 
    'Depal', 'DP-100', 'Bosch', 'DP100-001', 'Depalletizing machine', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Carbonator', 'CB-200', 'Krones', 'CB200-001', 'Carbonation system', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Filler', 'FL-300', 'Krones', 'FL300-001', 'Filling machine', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Seamer', 'SM-400', 'Krones', 'SM400-001', 'Seaming machine', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'X-Ray', 'XR-500', 'Eagle', 'XR500-001', 'X-Ray inspection system', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Printers', 'PR-600', 'Videojet', 'PR600-001', 'Printing system', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Westrock', 'WR-700', 'Westrock', 'WR700-001', 'Packaging system', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Cluster Checkweigher', 'CC-800', 'Ishida', 'CC800-001', 'Cluster checkweigher', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Fibre King', 'FK-900', 'Fibre King', 'FK900-001', 'Packaging machine', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2'
UNION ALL
SELECT 
    'Palletiser', 'PL-1000', 'Krones', 'PL1000-001', 'Palletizing system', 'Canning Line 2', 'active', id
FROM lines WHERE name = 'Canning Line 2';

INSERT INTO parts (name, part_number, description, category, manufacturer, cost, stock_quantity, min_stock_level) VALUES
('Motor Bearing', 'MB-001', 'High-speed motor bearing for production line', 'Mechanical', 'SKF', 45.50, 25, 5),
('Conveyor Belt', 'CB-002', 'Rubber conveyor belt 2m length', 'Conveyor', 'Habasit', 125.00, 8, 2),
('Sensor Proximity', 'SP-003', 'Inductive proximity sensor 24V', 'Electrical', 'Sick', 85.75, 15, 3);

-- Insert checkweighers for Canning Line 2
INSERT INTO checkweighers (name, model, manufacturer, serial_number, description, accuracy, max_weight, min_weight, line_id, last_calibrated, next_due) 
SELECT 
    'Cluster Checkweigher', 'CC-800', 'Ishida', 'CC800-001', 'Cluster checkweigher for Canning Line 2', 0.1, 5000.0, 1.0, id, '2024-01-15', '2024-07-15'
FROM lines WHERE name = 'Canning Line 2';

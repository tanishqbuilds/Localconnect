-- ==============================================================================
-- ADVANCED DATABASE MANAGEMENT SYSTEMS (ADBMS) MIGRATION SCRIPT
-- Application: LocalConnect
-- ==============================================================================
-- This script extends the existing Supabase schema to demonstrate advanced
-- database concepts such as spatial queries, temporal tables, JSON/XML handling,
-- NoSQL document structures, graph queries, query optimization, and RBAC security.
-- ==============================================================================

-- 1. DISTRIBUTED DATABASE DESIGN (Logical Fragmentation)
-- While Supabase is a centralized PostgreSQL instance, we can demonstrate horizontal
-- fragmentation logically using PostgreSQL partitioning.
-- Note: As we cannot easily convert the existing `complaints` table to a partitioned 
-- table without dropping it, this is a demonstrative structure of how complaints 
-- are logically fragmented by geographic regions (city).

-- Create a schema outline for replication-friendly, fragmented design
CREATE TABLE IF NOT EXISTS complaints_partitioned (
    complaint_id UUID DEFAULT gen_random_uuid(),
    category_ref UUID NOT NULL,
    description TEXT NOT NULL,
    location_ref UUID NOT NULL,
    city VARCHAR(255) NOT NULL, -- Partition Key
    status complaint_status DEFAULT 'Pending',
    priority complaint_priority DEFAULT 'Medium',
    created_by UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (complaint_id, city)
) PARTITION BY LIST (city);

-- Create horizontal partitions for specific regions
CREATE TABLE complaints_mumbai PARTITION OF complaints_partitioned FOR VALUES IN ('Mumbai');
CREATE TABLE complaints_delhi PARTITION OF complaints_partitioned FOR VALUES IN ('Delhi');
CREATE TABLE complaints_others PARTITION OF complaints_partitioned DEFAULT;

-- Tables like `categories` and `locations` can act as logically replicated reference 
-- tables on each distributed node.


-- 2. QUERY OPTIMIZATION (Indexing)
-- Creating B-Tree indexes on frequently queried columns to reduce cost of joins and selections
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_ref);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(location_ref);
CREATE INDEX IF NOT EXISTS idx_complaints_created_by ON complaints(created_by);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_officer ON complaints(assigned_officer);

-- Example Optimized Query demonstrating execution plan cost reduction:
-- EXPLAIN ANALYZE 
-- SELECT c.complaint_id, c.description, l.area, u.name 
-- FROM complaints c 
-- JOIN locations l ON c.location_ref = l.location_id 
-- JOIN users u ON c.created_by = u.user_id 
-- WHERE c.status = 'Pending' AND c.priority = 'High';


-- 3. XML AND JSON INTEROPERABILITY
-- Add JSONB metadata to handle semi-structured data (tags, device info)
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Function to export complaint data as JSON
CREATE OR REPLACE FUNCTION export_complaint_json(c_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT row_to_json(c) 
        FROM (
            SELECT complaint_id, description, status, priority, metadata 
            FROM complaints 
            WHERE complaint_id = c_id
        ) c
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export complaint data as XML
CREATE OR REPLACE FUNCTION export_complaint_xml(c_id UUID)
RETURNS XML AS $$
BEGIN
    RETURN (
        SELECT query_to_xml(
            format('SELECT complaint_id, description, status, priority FROM complaints WHERE complaint_id = %L', c_id), 
            true, false, ''
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. NOSQL-STYLE DOCUMENT STORAGE
-- Creating a table to store event logs dynamically (NoSQL format in relational DB)
CREATE TABLE IF NOT EXISTS complaint_activity_logs (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL, -- Document oriented storage payload
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- GIN Index for blazing fast queries on JSONB document keys/values
CREATE INDEX IF NOT EXISTS idx_activity_logs_data ON complaint_activity_logs USING GIN (event_data);


-- 5. TEMPORAL DATABASE FEATURES
-- Adding tracking timestamps to the main table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Table to store historical changes continuously
CREATE TABLE IF NOT EXISTS complaint_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    previous_status complaint_status,
    new_status complaint_status,
    changed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    change_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to automatically track status changes in history
CREATE OR REPLACE FUNCTION trace_complaint_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by)
        VALUES (NEW.complaint_id, OLD.status, NEW.status, auth.uid());
        
        IF NEW.status = 'Resolved' THEN
            NEW.resolved_at = timezone('utc'::text, now());
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_complaint_status_change ON complaints;
CREATE TRIGGER on_complaint_status_change
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE PROCEDURE trace_complaint_history();


-- 6. SPATIAL DATABASE QUERIES (Using Numeric data types for Geographic computations)
-- Adding coordinates to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Creating a Haversine distance function (Earth radius = 6371 km)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    x float = 69.1 * (lat2 - lat1);
    y float = 69.1 * (lon2 - lon1) * cos(lat1 / 57.3);
BEGIN
    RETURN sqrt(x * x + y * y) * 1.60934; -- Returns distance in Kilometers
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example Spatial Query: Find complaints within 5km radius of a given lat/lon
-- SELECT c.description, l.area, calculate_distance(l.latitude, l.longitude, 19.0760, 72.8777) as dist_km
-- FROM complaints c
-- JOIN locations l ON c.location_ref = l.location_id
-- WHERE calculate_distance(l.latitude, l.longitude, 19.0760, 72.8777) < 5.0;


-- 7. GRAPH RELATIONSHIPS
-- Users following users represents directed graph edges.
-- Finding friends-of-friends or mutual connections can be done via graph traversal logic.
-- The underlying 'follows' table handles this:
-- (follower -> following = Nodes and Directed Edges)

-- Example Graph Query: Get 2nd degree connections (Friends of Friends)
-- SELECT DISTINCT f2.following as suggested_friend
-- FROM follows f1
-- JOIN follows f2 ON f1.following = f2.follower
-- WHERE f1.follower = 'USER_ID' AND f2.following != 'USER_ID';


-- 8. ADVANCED ACCESS CONTROLS (Discretionary & Role-Based Access)

-- Admin Role Creation (Discretionary Access Control)
-- In a real scenario, roles are manipulated at PostgreSQL level
-- DO $$
-- BEGIN
--    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin_role') THEN
--       CREATE ROLE admin_role;
--    END IF;
-- END
-- $$;

-- GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO admin_role;
-- REVOKE ALL ON complaints FROM PUBLIC;

-- RLS Update Examples
-- Citizen RLS restricted tightly to ownership
DROP POLICY IF EXISTS "Users can see all complaints" ON complaints;

CREATE POLICY "Citizens view own, Officers view all" ON complaints
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM officers WHERE user_id = auth.uid())
);

-- Example Advanced Role-Based Access Control
CREATE POLICY "Officers manage locations" ON locations
FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'officer')
);

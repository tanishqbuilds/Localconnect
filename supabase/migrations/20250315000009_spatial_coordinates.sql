-- ==============================================================================
-- ADD LATITUDE/LONGITUDE TO LOCATIONS FOR MAP & SPATIAL QUERIES
-- ==============================================================================

-- These columns support the Haversine spatial query already documented in
-- README_ADBMS.md under "Spatial Database Features"
ALTER TABLE locations ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

-- Create a spatial index on coordinates for faster radius queries
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update the existing calculate_distance() function with Haversine formula
-- (creates if not already exists from adbms migration)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  R CONSTANT NUMERIC := 6371; -- Earth radius in km
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat / 2) ^ 2 + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon / 2) ^ 2;
  c := 2 * ASIN(SQRT(a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for complaints with coordinates (for map queries)
CREATE OR REPLACE VIEW complaints_with_location AS
SELECT
  c.complaint_id,
  c.description,
  c.status,
  c.priority,
  c.created_at,
  c.image_url,
  c.tagged_officers,
  cat.category_name,
  l.area,
  l.city,
  l.state,
  l.pincode,
  l.latitude,
  l.longitude
FROM complaints c
JOIN locations l ON l.location_id = c.location_ref
JOIN categories cat ON cat.category_id = c.category_ref;

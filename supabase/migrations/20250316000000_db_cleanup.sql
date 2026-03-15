-- Final cleanup migration to remove all legacy module database components

-- 1. Drop Triggers related to removed modules (if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'infrastructure_feedback') THEN
        DROP TRIGGER IF EXISTS on_feedback_added ON public.infrastructure_feedback;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resources') THEN
        DROP TRIGGER IF EXISTS on_resource_added ON public.resources;
    END IF;
END $$;

-- 2. Update reputation function to remove infra feedback logic
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Identify the user based on the table's column name
    IF TG_TABLE_NAME = 'proposal_votes' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'help_requests' AND NEW.status = 'Resolved' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'safety_reports' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'complaints' THEN target_user_id := NEW.user_id;
    END IF;

    -- Basic logic: Add points for civic participation
    IF (TG_OP = 'INSERT') THEN
        IF target_user_id IS NOT NULL THEN
            UPDATE users SET reputation_score = reputation_score + 10 WHERE user_id = target_user_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'help_requests' AND NEW.status = 'Resolved' AND OLD.status != 'Resolved') THEN
        -- Bonus points for resolving a help request
        UPDATE users SET reputation_score = reputation_score + 50 WHERE user_id = NEW.user_ref;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update locality_stats view to remove infra rating
DROP MATERIALIZED VIEW IF EXISTS locality_stats;
CREATE MATERIALIZED VIEW locality_stats AS
SELECT 
    l.city,
    l.area,
    COUNT(DISTINCT c.complaint_id) as total_complaints,
    COUNT(DISTINCT p.proposal_id) as total_proposals,
    COUNT(DISTINCT e.event_id) as total_events
FROM locations l
LEFT JOIN complaints c ON c.location_ref = l.location_id
LEFT JOIN proposals p ON p.locality = l.city
LEFT JOIN events e ON e.location_ref = l.location_id
GROUP BY l.city, l.area;

-- 4. Drop legay tables
DROP TABLE IF EXISTS public.infrastructure_feedback CASCADE;
DROP TABLE IF EXISTS public.resource_requests CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.project_updates CASCADE;
DROP TABLE IF EXISTS public.civic_projects CASCADE;
DROP TABLE IF EXISTS public.lost_found_items CASCADE;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

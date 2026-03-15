-- Final refinement of the reputation system logic
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Identify the user based on the table's column name
    IF TG_TABLE_NAME = 'proposal_votes' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'infrastructure_feedback' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'help_requests' AND NEW.status = 'Resolved' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'safety_reports' THEN target_user_id := NEW.user_ref;
    ELSIF TG_TABLE_NAME = 'complaints' THEN target_user_id := NEW.user_id; -- Note: complaints uses user_id
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

-- Map reputations to even more tables
DROP TRIGGER IF EXISTS on_complaint_added ON complaints;
CREATE TRIGGER on_complaint_added AFTER INSERT ON complaints FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

DROP TRIGGER IF EXISTS on_safety_report_added ON safety_reports;
CREATE TRIGGER on_safety_report_added AFTER INSERT ON safety_reports FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

-- Refresh the schema
NOTIFY pgrst, 'reload schema';

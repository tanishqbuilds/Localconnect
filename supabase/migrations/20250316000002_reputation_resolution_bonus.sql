-- Resilient reputation trigger function version 2
-- Fixed to support 'created_by' column and resolution bonuses for standard complaints
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
    new_json JSONB;
    old_json JSONB;
BEGIN
    new_json := to_jsonb(NEW);
    
    -- Safely extract user reference regardless of column naming conventions
    target_user_id := COALESCE(
        (new_json->>'user_ref')::UUID, 
        (new_json->>'user_id')::UUID,
        (new_json->>'created_by')::UUID
    );

    -- 1. AWARD ON INSERT (Reporting/Creating)
    IF (TG_OP = 'INSERT') THEN
        IF target_user_id IS NOT NULL THEN
            UPDATE users SET reputation_score = reputation_score + 10 WHERE user_id = target_user_id;
        END IF;
    
    -- 2. AWARD ON RESOLUTION (Status changed to 'Resolved')
    ELSIF (TG_OP = 'UPDATE') THEN
        old_json := to_jsonb(OLD);
        
        -- Handle Help Requests (Bonus +50)
        IF (TG_TABLE_NAME = 'help_requests') THEN
            IF (new_json->>'status' = 'Resolved' AND (old_json->>'status' != 'Resolved')) THEN
                IF target_user_id IS NOT NULL THEN
                    UPDATE users SET reputation_score = reputation_score + 50 WHERE user_id = target_user_id;
                END IF;
            END IF;
        
        -- Handle Complaints (Bonus +20)
        ELSIF (TG_TABLE_NAME = 'complaints') THEN
            IF (new_json->>'status' = 'Resolved' AND (old_json->>'status' != 'Resolved')) THEN
                IF target_user_id IS NOT NULL THEN
                    UPDATE users SET reputation_score = reputation_score + 20 WHERE user_id = target_user_id;
                END IF;
            END IF;
        
        -- Handle Safety Reports (Bonus +20)
        ELSIF (TG_TABLE_NAME = 'safety_reports') THEN
            IF (new_json->>'status' = 'Resolved' AND (old_json->>'status' != 'Resolved')) THEN
                IF target_user_id IS NOT NULL THEN
                    UPDATE users SET reputation_score = reputation_score + 20 WHERE user_id = target_user_id;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure Update Triggers are attached to relevant tables
DROP TRIGGER IF EXISTS on_complaint_updated ON complaints;
CREATE TRIGGER on_complaint_updated AFTER UPDATE ON complaints FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

DROP TRIGGER IF EXISTS on_safety_report_updated ON safety_reports;
CREATE TRIGGER on_safety_report_updated AFTER UPDATE ON safety_reports FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

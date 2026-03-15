-- Resilient reputation trigger function to handle polymorphic table structures
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
DECLARE
    target_user_id UUID;
    new_json JSONB;
BEGIN
    new_json := to_jsonb(NEW);
    
    -- Safely extract user reference regardless of whether the column is 'user_ref' or 'user_id'
    -- This prevents compile-time errors for records that don't have one of the fields
    target_user_id := COALESCE(
        (new_json->>'user_ref')::UUID, 
        (new_json->>'user_id')::UUID
    );

    -- Basic logic: Add points for civic participation on new entries
    IF (TG_OP = 'INSERT') THEN
        IF target_user_id IS NOT NULL THEN
            UPDATE users SET reputation_score = reputation_score + 10 WHERE user_id = target_user_id;
        END IF;
    
    -- Special case for resolving help requests (Bonus +50)
    ELSIF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'help_requests') THEN
        IF (new_json->>'status' = 'Resolved' AND (to_jsonb(OLD)->>'status' != 'Resolved')) THEN
            IF target_user_id IS NOT NULL THEN
                UPDATE users SET reputation_score = reputation_score + 50 WHERE user_id = target_user_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- ADD CITY/STATE TO USERS TABLE FOR LOCALITY FILTERING
-- ==============================================================================

-- Add city and state to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Maharashtra';

-- Update handle_new_user trigger to also store city/state in users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role, phone, city, state)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Citizen'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    COALESCE(new.raw_user_meta_data->>'state', 'Maharashtra')
  );

  -- If officer role, create officer entry with all fields
  IF (new.raw_user_meta_data->>'role' = 'officer') THEN
    INSERT INTO public.officers (
      user_id, department, designation,
      id_document_url, additional_document_url,
      is_approved, officer_type, state, city, badge_number
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'department', 'General'),
      COALESCE(new.raw_user_meta_data->>'designation', 'Officer'),
      new.raw_user_meta_data->>'id_document_url',
      new.raw_user_meta_data->>'additional_document_url',
      false,
      CASE
        WHEN new.raw_user_meta_data->>'officer_type' IS NOT NULL
        THEN (new.raw_user_meta_data->>'officer_type')::officer_type
        ELSE 'Municipal Worker'::officer_type
      END,
      COALESCE(new.raw_user_meta_data->>'state', 'Maharashtra'),
      new.raw_user_meta_data->>'city',
      new.raw_user_meta_data->>'badge_number'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

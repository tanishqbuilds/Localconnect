-- ==============================================================================
-- OFFICER ROLES, LOCALITY (MAHARASHTRA) & COMPLAINT TAGGING MIGRATION
-- ==============================================================================

-- 1. Add officer_type enum
DO $$ BEGIN
  CREATE TYPE officer_type AS ENUM (
    'Police',
    'Municipal Worker',
    'Nagarsevak',
    'MLA',
    'Cyber Cell',
    'Fire Brigade',
    'Health Officer',
    'PWD Engineer',
    'Water Supply Officer',
    'Revenue Officer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add officer_type, state, city columns to officers table
ALTER TABLE officers ADD COLUMN IF NOT EXISTS officer_type officer_type DEFAULT 'Municipal Worker';
ALTER TABLE officers ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Maharashtra';
ALTER TABLE officers ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE officers ADD COLUMN IF NOT EXISTS badge_number VARCHAR(50);

-- 3. Add state field to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Maharashtra';

-- 4. Add tagged_officers (array of officer UUIDs) and state to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS tagged_officers UUID[];
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Maharashtra';

-- 5. Add more categories for broader coverage
INSERT INTO categories (category_name) VALUES
('noise complaint'),
('illegal construction'),
('traffic'),
('stray animals'),
('tree/park maintenance'),
('cybercrime'),
('domestic violence'),
('eve teasing'),
('drainage/sewage'),
('fire hazard')
ON CONFLICT (category_name) DO NOTHING;

-- 6. Update handle_new_user trigger to include new officer fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Citizen'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role)
  );

  -- If officer role, create officer entry with all new fields
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
      COALESCE((new.raw_user_meta_data->>'officer_type')::officer_type, 'Municipal Worker'::officer_type),
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

-- 7. RLS: Allow any logged-in user to insert locations (needed for complaint filing)
DO $$ BEGIN
  CREATE POLICY "Any authenticated user can insert locations" ON locations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

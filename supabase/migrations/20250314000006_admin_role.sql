-- ==============================================================================
-- ADMIN ROLE & OFFICER APPROVAL MIGRATION
-- ==============================================================================

-- 1. Add 'admin' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Add is_approved column to officers table
ALTER TABLE officers ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 3. Add document columns to officers table
ALTER TABLE officers ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE officers ADD COLUMN IF NOT EXISTS additional_document_url TEXT;

-- 4. Backfill existing officers as approved
UPDATE officers SET is_approved = true WHERE is_approved = false;

-- 5. Update trigger to handle document URLs during signup
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

  -- If officer role, create officer entry with documents
  IF (new.raw_user_meta_data->>'role' = 'officer') THEN
    INSERT INTO public.officers (user_id, department, designation, id_document_url, additional_document_url, is_approved)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'department', 'General'),
      COALESCE(new.raw_user_meta_data->>'designation', 'Officer'),
      new.raw_user_meta_data->>'id_document_url',
      new.raw_user_meta_data->>'additional_document_url',
      false
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

-- 4. RLS policies for admin access

-- Admins can view all complaints (they already can via the existing "Citizens view own, Officers view all" policy,
-- but let's add an explicit admin policy for clarity)
CREATE POLICY "Admins can view all complaints" ON complaints
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can update complaints
CREATE POLICY "Admins can update complaints" ON complaints
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can update officers (for approval)
CREATE POLICY "Admins can update officers" ON officers
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can delete officers (for rejection)
CREATE POLICY "Admins can delete officers" ON officers
FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can delete users (for officer rejection cleanup)
CREATE POLICY "Admins can delete users" ON users
FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can view all posts
CREATE POLICY "Admins can view all posts" ON posts
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments" ON comments
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
);

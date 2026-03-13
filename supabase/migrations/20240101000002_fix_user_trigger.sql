-- Fix the handle_new_user trigger to include phone mapping.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Citizen'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
    new.raw_user_meta_data->>'phone'
  );
  
  -- If officer role, create officer entry
  IF (new.raw_user_meta_data->>'role' = 'officer') THEN
    INSERT INTO public.officers (user_id, department, designation)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'department', 'General'),
      COALESCE(new.raw_user_meta_data->>'designation', 'Officer')
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill missing users created before the first db push
INSERT INTO public.users (user_id, email, name, role, phone)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Citizen'), 
    COALESCE((raw_user_meta_data->>'role')::user_role, 'citizen'::user_role),
    raw_user_meta_data->>'phone'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone;

-- Backfill missing officers
INSERT INTO public.officers (user_id, department, designation)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'department', 'General'), 
    COALESCE(raw_user_meta_data->>'designation', 'Officer')
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'officer'
ON CONFLICT (user_id) DO NOTHING;

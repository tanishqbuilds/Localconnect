-- Fix the handle_new_user trigger to include phone mapping safely resolving types.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Citizen'),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role),
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

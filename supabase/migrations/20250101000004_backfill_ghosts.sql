-- Force backfilling any ghost users that were somehow bypassed when triggers errored out
INSERT INTO public.users (user_id, email, name, role, phone)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Citizen'), 
    COALESCE((raw_user_meta_data->>'role')::public.user_role, 'citizen'::public.user_role),
    raw_user_meta_data->>'phone'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET 
    phone = EXCLUDED.phone, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role;

INSERT INTO public.officers (user_id, department, designation)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'department', 'General'), 
    COALESCE(raw_user_meta_data->>'designation', 'Officer')
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'officer'
ON CONFLICT (user_id) DO NOTHING;

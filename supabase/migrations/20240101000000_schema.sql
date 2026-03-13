-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom enum types
CREATE TYPE user_role AS ENUM ('citizen', 'officer');
CREATE TYPE complaint_status AS ENUM ('Pending', 'In Progress', 'Resolved');
CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High');

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role user_role DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Officers Table
CREATE TABLE officers (
    officer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories Table
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert categories
INSERT INTO categories (category_name) VALUES
('sanitation'),
('roads'),
('electricity'),
('water supply'),
('public safety');

-- Locations Table
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Complaints Table
CREATE TABLE complaints (
    complaint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_ref UUID NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    status complaint_status DEFAULT 'Pending',
    priority complaint_priority DEFAULT 'Medium',
    created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_officer UUID REFERENCES officers(officer_id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Status Updates Table
CREATE TABLE status_updates (
    update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_ref UUID NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    updated_by UUID NOT NULL REFERENCES officers(officer_id) ON DELETE RESTRICT,
    update_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts Table
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    media TEXT,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments Table
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_ref UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    commented_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Likes Table
CREATE TABLE likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_ref UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_ref, post_ref)
);

-- Follows Table
CREATE TABLE follows (
    follower UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    following UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower, following)
);

-- Create a trigger function to insert into users table when a new auth.user is created
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies (Basic Policies, update as needed)
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile." ON users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view officers" ON officers FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);

CREATE POLICY "Users can see all complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Users can create complaints" ON complaints FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Officers can update complaints" ON complaints FOR UPDATE USING (EXISTS (SELECT 1 FROM officers WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view status updates" ON status_updates FOR SELECT USING (true);
CREATE POLICY "Officers can create status updates" ON status_updates FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM officers WHERE user_id = auth.uid() AND officer_id = updated_by));

CREATE POLICY "Everyone can see posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_ref);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_ref);

CREATE POLICY "Everyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_ref);

CREATE POLICY "Everyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_ref);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_ref);

CREATE POLICY "Everyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower);

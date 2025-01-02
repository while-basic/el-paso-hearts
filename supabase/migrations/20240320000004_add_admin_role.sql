-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_admin_user(TEXT, TEXT, TEXT);

-- Drop existing table and recreate
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    birthdate DATE NOT NULL DEFAULT '1990-01-01'::date,
    gender TEXT NOT NULL DEFAULT 'other',
    bio TEXT NOT NULL DEFAULT '',
    interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    location TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create admin user
DO $$
DECLARE
    admin_id UUID := uuid_generate_v4();
BEGIN
    -- Insert admin user directly
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at,
        confirmation_token
    )
    VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'mr.christophercelaya@gmail.com',
        crypt('ccl309412', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Admin User"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW(),
        encode(gen_random_bytes(32), 'hex')
    );

    -- Create admin profile
    INSERT INTO public.profiles (
        id,
        full_name,
        role,
        birthdate,
        gender,
        bio,
        interests,
        location,
        created_at,
        updated_at
    )
    VALUES (
        admin_id,
        'Admin User',
        'admin',
        '1990-01-01'::date,
        'other',
        'System Administrator',
        ARRAY[]::text[],
        'El Paso, TX',
        NOW(),
        NOW()
    );
END $$; 
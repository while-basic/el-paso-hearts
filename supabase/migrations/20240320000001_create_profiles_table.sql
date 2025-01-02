-- Create profiles table with extended fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT DEFAULT '',
    birthdate DATE DEFAULT CURRENT_DATE,
    gender TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    location TEXT DEFAULT 'El Paso, TX',
    avatar_url TEXT,
    occupation TEXT,
    education TEXT,
    looking_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    height TEXT,
    languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (new.id);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add new columns to profiles table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS occupation TEXT,
    ADD COLUMN IF NOT EXISTS education TEXT,
    ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS height TEXT,
    ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at timestamp
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
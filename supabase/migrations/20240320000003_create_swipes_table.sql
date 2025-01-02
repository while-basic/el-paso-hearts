-- Create swipes table
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(swiper_id, swiped_id)
);

-- Enable Row Level Security
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON public.swipes;

-- Create unified policy for all operations
CREATE POLICY "Users can manage their own swipes"
    ON public.swipes
    FOR ALL
    USING (auth.uid() = swiper_id)
    WITH CHECK (auth.uid() = swiper_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_swipes_updated_at()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = timezone('utc'::text, now());
        NEW.updated_at = timezone('utc'::text, now());
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_swipes_updated_at ON public.swipes;

CREATE TRIGGER handle_swipes_updated_at
    BEFORE INSERT OR UPDATE ON public.swipes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_swipes_updated_at();

-- Create function to check for matches
DROP FUNCTION IF EXISTS public.check_match(uuid, uuid);
CREATE OR REPLACE FUNCTION public.check_match(swiper uuid, swiped uuid)
RETURNS boolean AS $$
DECLARE
    is_match boolean;
BEGIN
    -- Check if both users have liked each other
    SELECT EXISTS (
        SELECT 1
        FROM public.swipes s1
        JOIN public.swipes s2 ON s1.swiper_id = s2.swiped_id 
            AND s1.swiped_id = s2.swiper_id
        WHERE s1.swiper_id = swiper 
            AND s1.swiped_id = swiped
            AND s1.action = 'like'
            AND s2.action = 'like'
    ) INTO is_match;
    
    -- If it's a match, create a match record
    IF is_match THEN
        INSERT INTO public.matches (user_id, matched_user_id, status)
        VALUES 
            (swiper, swiped, 'matched'),
            (swiped, swiper, 'matched')
        ON CONFLICT (user_id, matched_user_id) 
        DO UPDATE SET status = 'matched', updated_at = timezone('utc'::text, now());
    END IF;
    
    RETURN is_match;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_potential_matches(uuid);

-- Create function to get potential matches
CREATE FUNCTION public.get_potential_matches(input_user_id uuid)
RETURNS TABLE (
    id uuid,
    full_name text,
    birthdate date,
    gender text,
    bio text,
    interests text[],
    location text,
    avatar_url text,
    age integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.birthdate,
        p.gender,
        p.bio,
        p.interests,
        p.location,
        p.avatar_url,
        DATE_PART('year', AGE(CURRENT_DATE, p.birthdate))::integer as age
    FROM public.profiles p
    WHERE p.id != input_user_id
    AND p.id NOT IN (
        -- Exclude users already swiped
        SELECT s.swiped_id 
        FROM public.swipes s
        WHERE s.swiper_id = input_user_id
    )
    AND p.id NOT IN (
        -- Exclude existing matches
        SELECT m.matched_user_id 
        FROM public.matches m
        WHERE m.user_id = input_user_id
    )
    ORDER BY p.created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
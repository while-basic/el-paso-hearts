-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, matched_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create their own matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Create function to check for mutual matches
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS trigger AS $$
BEGIN
    -- If this is a new 'accepted' match, check for mutual match
    IF NEW.status = 'accepted' THEN
        -- Check if there's a corresponding match from the other user
        IF EXISTS (
            SELECT 1 FROM matches
            WHERE user_id = NEW.matched_user_id
            AND matched_user_id = NEW.user_id
            AND status = 'accepted'
        ) THEN
            -- Create a notification for both users (you'll need to create a notifications table)
            -- This is where you'd add notification logic
            PERFORM pg_notify(
                'new_mutual_match',
                json_build_object(
                    'user_id', NEW.user_id,
                    'matched_user_id', NEW.matched_user_id
                )::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for checking mutual matches
CREATE TRIGGER check_mutual_match_trigger
    AFTER INSERT OR UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION check_mutual_match();

-- Create function to prevent self-matching
CREATE OR REPLACE FUNCTION prevent_self_match()
RETURNS trigger AS $$
BEGIN
    IF NEW.user_id = NEW.matched_user_id THEN
        RAISE EXCEPTION 'Cannot match with yourself';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent self-matching
CREATE TRIGGER prevent_self_match_trigger
    BEFORE INSERT OR UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION prevent_self_match();

-- Create function to get potential matches
CREATE OR REPLACE FUNCTION get_potential_matches(user_id UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    birthdate DATE,
    gender TEXT,
    bio TEXT,
    interests TEXT[],
    location TEXT,
    avatar_url TEXT,
    occupation TEXT,
    education TEXT,
    languages TEXT[],
    match_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_interests AS (
        SELECT interests FROM profiles WHERE id = user_id
    ),
    user_preferences AS (
        SELECT gender, location FROM profiles WHERE id = user_id
    )
    SELECT 
        p.id,
        p.full_name,
        p.birthdate,
        p.gender,
        p.bio,
        p.interests,
        p.location,
        p.avatar_url,
        p.occupation,
        p.education,
        p.languages,
        -- Calculate match score based on various factors
        (
            -- Interest overlap (40% weight)
            (COALESCE(ARRAY_LENGTH(ARRAY(
                SELECT UNNEST(p.interests)
                INTERSECT
                SELECT UNNEST((SELECT interests FROM user_interests))
            ), 1), 0)::FLOAT / 
            GREATEST(ARRAY_LENGTH(p.interests, 1), 1)) * 0.4 +
            
            -- Location match (30% weight)
            CASE WHEN p.location = (SELECT location FROM user_preferences) THEN 0.3 ELSE 0 END +
            
            -- Language overlap (30% weight)
            (COALESCE(ARRAY_LENGTH(ARRAY(
                SELECT UNNEST(p.languages)
                INTERSECT
                SELECT UNNEST((SELECT languages FROM profiles WHERE id = user_id))
            ), 1), 0)::FLOAT / 
            GREATEST(ARRAY_LENGTH(p.languages, 1), 1)) * 0.3
        ) as match_score
    FROM profiles p
    WHERE p.id != user_id
    AND NOT EXISTS (
        -- Exclude users already matched with
        SELECT 1 FROM matches m
        WHERE (m.user_id = user_id AND m.matched_user_id = p.id)
        OR (m.matched_user_id = user_id AND m.user_id = p.id)
    )
    ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
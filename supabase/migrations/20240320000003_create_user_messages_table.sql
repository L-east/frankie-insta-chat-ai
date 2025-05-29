-- Create user_messages table
CREATE TABLE IF NOT EXISTS public.user_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_messages INTEGER NOT NULL DEFAULT 0,
    used_messages INTEGER NOT NULL DEFAULT 0,
    last_purchase_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON public.user_messages(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own message counts
CREATE POLICY "Users can view their own message counts"
    ON public.user_messages
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to update their own message counts
CREATE POLICY "Users can update their own message counts"
    ON public.user_messages
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own message counts
CREATE POLICY "Users can insert their own message counts"
    ON public.user_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.initialize_user_messages();

-- Create function to initialize user messages
CREATE OR REPLACE FUNCTION public.initialize_user_messages()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_messages (user_id, total_messages, used_messages)
    VALUES (NEW.id, 10, 0); -- Start with 10 free messages
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically initialize user messages on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_messages(); 
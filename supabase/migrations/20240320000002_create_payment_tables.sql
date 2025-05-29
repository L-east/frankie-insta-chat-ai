-- Create payment_intents table
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_provider TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    messages_purchased INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON public.payment_intents(user_id);

-- Enable Row Level Security
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payment intents
CREATE POLICY "Users can view their own payment intents"
    ON public.payment_intents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own payment intents
CREATE POLICY "Users can insert their own payment intents"
    ON public.payment_intents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own payment intents
CREATE POLICY "Users can update their own payment intents"
    ON public.payment_intents
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 
-- Verify payment_intents table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'payment_intents'
    ) THEN
        RAISE EXCEPTION 'payment_intents table does not exist';
    END IF;
END $$;

-- Verify user_messages table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_messages'
    ) THEN
        RAISE EXCEPTION 'user_messages table does not exist';
    END IF;
END $$;

-- Verify RLS policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'payment_intents' 
        AND policyname = 'Users can view their own payment intents'
    ) THEN
        RAISE EXCEPTION 'Missing RLS policy for payment_intents view';
    END IF;
END $$;

-- Verify indexes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'payment_intents' 
        AND indexname = 'idx_payment_intents_user_id'
    ) THEN
        RAISE EXCEPTION 'Missing index on payment_intents';
    END IF;
END $$; 
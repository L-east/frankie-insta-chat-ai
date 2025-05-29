-- Create payment_intents table
CREATE TABLE payment_intents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    paypal_order_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    messages_count INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_messages table
CREATE TABLE user_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('free', 'purchased')),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);
CREATE INDEX idx_user_messages_user_id ON user_messages(user_id);
CREATE INDEX idx_user_messages_valid_until ON user_messages(valid_until);

-- Add RLS policies
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Payment intents policies
CREATE POLICY "Users can view their own payment intents"
    ON payment_intents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment intents"
    ON payment_intents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User messages policies
CREATE POLICY "Users can view their own messages"
    ON user_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
    ON user_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id); 
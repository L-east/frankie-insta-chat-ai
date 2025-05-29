ALTER TABLE profiles ADD COLUMN total_messages_allocated INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN total_messages_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN total_messages_pending INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN lifetime_messages_allocated INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN lifetime_messages_used INTEGER DEFAULT 0; 
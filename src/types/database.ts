export interface PaymentIntent {
  id: string;
  user_id: string;
  paypal_order_id: string;
  amount: number;
  messages_count: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UserMessage {
  id: string;
  user_id: string;
  amount: number;
  type: 'free' | 'purchased';
  valid_until: string;
  created_at: string;
}

// Update Database interface
export interface Database {
  // ... existing tables ...
  payment_intents: {
    Row: PaymentIntent;
    Insert: Omit<PaymentIntent, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<PaymentIntent, 'id'>>;
  };
  user_messages: {
    Row: UserMessage;
    Insert: Omit<UserMessage, 'id' | 'created_at'>;
    Update: Partial<Omit<UserMessage, 'id'>>;
  };
} 
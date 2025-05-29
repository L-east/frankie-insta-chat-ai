import express from 'express';
import { supabase } from '@/integrations/supabase/client';
import paypal from '@paypal/checkout-server-sdk';

// PayPal client configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

const router = express.Router();

// Create payment endpoint
router.post('/create-payment', async (req, res) => {
  try {
    const { package: selectedPackage, userId } = req.body;

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: selectedPackage.price.toFixed(2)
        },
        description: `Frankie AI ${selectedPackage.count} Messages`
      }]
    });

    const order = await client.execute(request);

    // Store payment intent in database
    const { error } = await supabase.from('payment_intents').insert({
      user_id: userId,
      paypal_order_id: order.result.id,
      amount: selectedPackage.price,
      messages_count: selectedPackage.count,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    // Return PayPal approval URL
    const approvalUrl = order.result.links.find(
      (link: any) => link.rel === 'approve'
    ).href;

    res.json({ paymentUrl: approvalUrl });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Payment status endpoint
router.get('/payment-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get latest payment intent for user
    const { data: paymentIntent, error } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!paymentIntent) {
      return res.json({ status: 'not_found' });
    }

    // If payment is already completed, return status
    if (paymentIntent.status === 'completed') {
      return res.json({ status: 'completed' });
    }

    // Check PayPal order status
    const request = new paypal.orders.OrdersGetRequest(paymentIntent.paypal_order_id);
    const order = await client.execute(request);

    if (order.result.status === 'COMPLETED') {
      // Update payment intent status
      await supabase
        .from('payment_intents')
        .update({ status: 'completed' })
        .eq('id', paymentIntent.id);

      // Add messages to user's account
      await supabase
        .from('user_messages')
        .insert({
          user_id: userId,
          amount: paymentIntent.messages_count,
          type: 'purchased',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      return res.json({ status: 'completed' });
    }

    res.json({ status: paymentIntent.status });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

export default router; 
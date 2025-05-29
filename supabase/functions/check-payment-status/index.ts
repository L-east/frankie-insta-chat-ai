import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('Missing userId')
    }

    // Get the latest payment intent for the user
    const { data: paymentIntent, error: dbError } = await supabaseClient
      .from('payment_intents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to fetch payment status')
    }

    if (!paymentIntent) {
      return new Response(
        JSON.stringify({ status: 'not_found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // For testing, simulate payment completion
    // In production, this would check with PayPal API
    if (paymentIntent.status === 'pending') {
      // Simulate payment completion after 30 seconds
      const paymentAge = Date.now() - new Date(paymentIntent.created_at).getTime()
      if (paymentAge > 30000) {
        // Update payment status
        await supabaseClient
          .from('payment_intents')
          .update({ status: 'completed' })
          .eq('id', paymentIntent.id)

        // Update user's message count
        const { data: userMessages } = await supabaseClient
          .from('user_messages')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (userMessages) {
          await supabaseClient
            .from('user_messages')
            .update({
              total_messages: userMessages.total_messages + paymentIntent.messages_purchased,
              last_purchase_date: new Date().toISOString()
            })
            .eq('id', userMessages.id)
        }

        return new Response(
          JSON.stringify({ status: 'completed' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    }

    return new Response(
      JSON.stringify({ status: paymentIntent.status }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 
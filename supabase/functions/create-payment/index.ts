import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PRICING_CONFIG } from '../_shared/pricing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { package: selectedPackage, userId } = await req.json()

    if (!selectedPackage || !userId) {
      throw new Error('Missing required fields')
    }

    const { data: paymentIntent, error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert({
        user_id: userId,
        payment_provider: 'paypal',
        payment_id: `paypal_${Date.now()}`,
        amount: selectedPackage.price,
        currency: 'USD',
        messages_purchased: selectedPackage.count,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to create payment intent')
    }

    const paymentUrl = `https://www.paypal.com/checkoutnow?token=${paymentIntent.id}`

    return new Response(
      JSON.stringify({
        paymentUrl,
        paymentIntent
      }),
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
import { supabase } from '@/integrations/supabase/client';
import { PRICING_CONFIG } from '@/services/personaService';

async function testPaymentIntegration() {
  try {
    // Test create-payment function
    console.log('Testing create-payment function...');
    const { data: createData, error: createError } = await supabase.functions.invoke('create-payment', {
      body: {
        package: PRICING_CONFIG.PACKAGES[0],
        userId: 'test-user-id'
      }
    });

    if (createError) throw createError;
    console.log('Create payment response:', createData);

    // Test check-payment-status function
    console.log('\nTesting check-payment-status function...');
    const { data: statusData, error: statusError } = await supabase.functions.invoke('check-payment-status', {
      body: { userId: 'test-user-id' }
    });

    if (statusError) throw statusError;
    console.log('Check status response:', statusData);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testPaymentIntegration(); 
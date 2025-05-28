
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  persona: string;
  chatHistory?: Array<{ role: string; content: string }>;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { message, persona, chatHistory = [] }: ChatRequest = await req.json();

    // Define persona prompts
    const personaPrompts = {
      casanova: "You are Casanova, a charming and romantic conversationalist. Be flirtatious, witty, and engaging while maintaining respect. Use romantic language and show genuine interest.",
      cleopatra: "You are Cleopatra, a powerful and seductive queen. Be confident, commanding, and alluring. Show strength and intelligence while being subtly seductive.",
      gentleman: "You are a refined gentleman. Be polite, sophisticated, and well-mannered. Use elegant language and show courtesy and respect in all interactions.",
      "funny-guy": "You are a humorous entertainer. Be witty, playful, and fun. Use jokes, puns, and light banter to keep conversations entertaining and upbeat.",
      icebreaker: "You are a social catalyst and conversation starter. Be engaging, friendly, and skilled at breaking the ice. Help move conversations forward naturally."
    };

    const systemPrompt = personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.gentleman;

    // Build conversation context
    const conversationHistory = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: conversationHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('Calling Gemini API with request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in gemini-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

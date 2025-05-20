
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Initialize Gemini API (user needs to set their API key)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.route('/generate-response', methods=['POST'])
def generate_response():
    try:
        data = request.json
        
        if not GEMINI_API_KEY:
            return jsonify({
                'error': 'GEMINI_API_KEY not set. Please set the environment variable.'
            }), 500
            
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Extract info from request
        persona = data.get('persona', {})
        messages = data.get('messages', [])
        custom_instructions = data.get('custom_instructions', '')
        
        # Format chat history for context
        chat_context = ""
        for msg in messages:
            sender = "User" if msg.get('sender') == 'user' else "Other person"
            chat_context += f"{sender}: {msg.get('content', '')}\n"
            
        # Create prime directive based on persona and custom instructions
        prime_directive = f"""
        You are roleplaying as {persona.get('name', 'an AI assistant')}.
        
        Character traits: {persona.get('description', '')}
        Behavior pattern: {persona.get('behaviorSnapshot', '')}
        
        Custom instructions: {custom_instructions}
        
        Respond to the chat in a natural, conversational way that matches the persona.
        Keep responses concise and engaging.
        """
        
        # Generate response using Gemini
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([
            "Follow the instructions given in the prime directive, process the text for context and reply to the chat:",
            prime_directive,
            f"Chat context:\n{chat_context}"
        ])
        
        return jsonify({
            'response': response.text,
            'persona_id': persona.get('id')
        })
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Initialize Gemini API with the provided key
GEMINI_API_KEY = "AIzaSyB-PQSc44zaSflQyuUiclLjiB7B-5koTMw"
genai.configure(api_key=GEMINI_API_KEY)

# Store active conversations
active_conversations = defaultdict(dict)

@app.route('/process-text', methods=['POST'])
def process_text():
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Extract info from request
        chat_id = data.get('chat_id')
        persona = data.get('persona', {})
        messages = json.loads(data.get('text', '[]'))
        custom_instructions = data.get('prime_directive', '')
        
        # Get or create chat history for this conversation
        if chat_id not in active_conversations:
            model = genai.GenerativeModel("gemini-2.0-flash")
            chat = model.start_chat(history=[])
            active_conversations[chat_id] = {
                'chat': chat,
                'persona': persona,
                'custom_instructions': custom_instructions
            }
        
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
        
        # Get the chat instance for this conversation
        chat = active_conversations[chat_id]['chat']
        
        # Add system message with prime directive if this is a new conversation
        if not active_conversations[chat_id].get('initialized'):
            chat.send_message(prime_directive)
            active_conversations[chat_id]['initialized'] = True
        
        # Add chat context
        chat.send_message(f"Chat context:\n{chat_context}")
        
        # Generate response
        response = chat.send_message("Based on the above context and instructions, generate a natural, engaging response that matches the persona.")
        
        return jsonify({
            'processed_text': response.text,
            'persona_id': persona.get('id'),
            'chat_id': chat_id
        })
        
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/end-conversation', methods=['POST'])
def end_conversation():
    try:
        data = request.json
        chat_id = data.get('chat_id')
        
        if chat_id in active_conversations:
            del active_conversations[chat_id]
            return jsonify({'success': True})
        
        return jsonify({'error': 'Conversation not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

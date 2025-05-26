import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from collections import defaultdict
import time

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
        print(data)
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Extract info from request
        chat_id = data.get('chat_id')
        persona = data.get('persona', {})
        text = data.get('text', '')
        custom_instructions = data.get('prime_directive', '')
        
        # Get or create chat history for this conversation
        if chat_id not in active_conversations:
            model = genai.GenerativeModel("gemini-2.0-flash")
            chat = model.start_chat(history=[])
            active_conversations[chat_id] = {
                'chat': chat,
                'persona': persona,
                'custom_instructions': custom_instructions,
                'start_time': time.time(),
                'messages_sent': 0,
                'status': 'active'
            }
        
        # Update conversation tracking
        active_conversations[chat_id]['messages_sent'] += 1
        active_conversations[chat_id]['last_activity_time'] = time.time()
        
        # Create prime directive based on persona and custom instructions
        prime_directive = f"""
        You are roleplaying as {persona.get('name', 'a human')}.
        
        Character traits: {persona.get('description', '')}
        Behavior pattern: {persona.get('behaviorSnapshot', '')}
        
        Custom instructions: {custom_instructions}
        
        Respond to the chat in a natural, conversational way that matches the persona.
        Keep responses concise and engaging. Answer in less than 15 words.
        """
        print(prime_directive)
        # Get the chat instance for this conversation
        chat = active_conversations[chat_id]['chat']
        
        # Add system message with prime directive if this is a new conversation
        if not active_conversations[chat_id].get('initialized'):
            chat.send_message(prime_directive)
            active_conversations[chat_id]['initialized'] = True
        
        # Format the text with role information
        formatted_text = f"Chat context:\n{text}"
        
        # Send the formatted text to the model
        response = chat.send_message(formatted_text)
        
        print(formatted_text)
        print(response.text)
        return jsonify({
            'processed_text': response.text,
            'persona_id': persona.get('id'),
            'chat_id': chat_id,
            'status': 'active',
            'time_elapsed': (time.time() - active_conversations[chat_id]['start_time']) / 60,
            'messages_sent': active_conversations[chat_id]['messages_sent']
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
            # Update status before removing
            result = {
                'success': True,
                'messages_sent': active_conversations[chat_id].get('messages_sent', 0),
                'time_elapsed': (time.time() - active_conversations[chat_id].get('start_time', time.time())) / 60
            }
            del active_conversations[chat_id]
            return jsonify(result)
        
        return jsonify({'error': 'Conversation not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

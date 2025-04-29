from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)

# Файл для хранения сообщений
MESSAGES_FILE = 'messages.json'

# Загрузка сообщений из файла
def load_messages():
    if not os.path.exists(MESSAGES_FILE):
        return []
    
    with open(MESSAGES_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

# Сохранение сообщений в файл
def save_messages(messages):
    with open(MESSAGES_FILE, 'w') as f:
        json.dump(messages, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'success': False})
    
    messages = load_messages()
    messages.append({
        'id': len(messages) + 1,
        'text': data['message'],
        'timestamp': datetime.now().isoformat()
    })
    save_messages(messages)
    
    return jsonify({'success': True})

@app.route('/get_messages')
def get_messages():
    messages = load_messages()
    return jsonify({'messages': messages})

if __name__ == '__main__':
    app.run(debug=True)

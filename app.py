from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)

# Файл для хранения сообщений
MESSAGES_FILE = 'messages.json'

# Загружаем сообщения из файла
def load_messages():
    if not os.path.exists(MESSAGES_FILE):
        return []
    
    with open(MESSAGES_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

# Сохраняем сообщения в файл
def save_messages(messages):
    with open(MESSAGES_FILE, 'w') as f:
        json.dump(messages, f)

# Главная страница
@app.route('/')
def index():
    return render_template('index.html')

# Отправка сообщения
@app.route('/send', methods=['POST'])
def send():
    data = request.get_json()
    username = data.get('username')
    message = data.get('message')
    
    if username and message:
        messages = load_messages()
        messages.append({
            'username': username,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        save_messages(messages)
        
        return jsonify({'status': 'ok'})
    
    return jsonify({'status': 'error'}), 400

# Получение сообщений
@app.route('/get_messages')
def get_messages():
    messages = load_messages()
    return jsonify(messages)

if __name__ == '__main__':
    app.run(debug=True)

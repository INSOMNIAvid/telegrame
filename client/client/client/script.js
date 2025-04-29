document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username');
    const setNameButton = document.getElementById('set-name');
    
    // Подключаемся к серверу Socket.io
    const socket = io();
    
    let username = localStorage.getItem('messenger_username') || 'Аноним';
    usernameInput.value = username;
    
    // Установка имени пользователя
    setNameButton.addEventListener('click', function() {
        const newUsername = usernameInput.value.trim();
        if (newUsername) {
            username = newUsername;
            localStorage.setItem('messenger_username', username);
            alert('Имя сохранено!');
        }
    });
    
    // Отправка сообщения по кнопке
    sendButton.addEventListener('click', sendMessage);
    
    // Отправка сообщения по Enter (но не Shift+Enter)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Получение сообщений от сервера
    socket.on('message', function(data) {
        const isSent = data.sender === username;
        addMessage(data.sender, data.text, isSent, data.timestamp);
    });
    
    // Загрузка истории сообщений
    socket.on('messageHistory', function(messages) {
        messages.forEach(msg => {
            const isSent = msg.sender === username;
            addMessage(msg.sender, msg.text, isSent, msg.timestamp);
        });
    });
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            // Отправляем сообщение на сервер
            socket.emit('sendMessage', {
                sender: username,
                text: messageText
            });
            
            messageInput.value = '';
        }
    }
    
    function addMessage(sender, text, isSent, timestamp) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isSent ? 'sent' : 'received');
        
        const infoElement = document.createElement('div');
        infoElement.classList.add('message-info');
        infoElement.textContent = `${sender}, ${new Date(timestamp).toLocaleTimeString()}`;
        
        const textElement = document.createElement('div');
        textElement.textContent = text;
        
        messageElement.appendChild(infoElement);
        messageElement.appendChild(textElement);
        messagesContainer.appendChild(messageElement);
        
        // Прокрутка к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Запрос истории сообщений при загрузке
    socket.emit('getHistory');
});
document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usernameInput = document.getElementById('username');
    const setNameButton = document.getElementById('set-name');
    
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
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            addMessage(username, messageText, true);
            messageInput.value = '';
            
            // В реальном приложении здесь был бы вызов API для отправки сообщения
            // и получение ответа от другого пользователя
            
            // Имитация ответа (для демонстрации)
            setTimeout(() => {
                addMessage('Собеседник', 'Это автоматический ответ. В реальном приложении здесь было бы сообщение другого пользователя.', false);
            }, 1000);
        }
    }
    
    function addMessage(sender, text, isSent) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isSent ? 'sent' : 'received');
        
        const infoElement = document.createElement('div');
        infoElement.classList.add('message-info');
        infoElement.textContent = `${sender}, ${new Date().toLocaleTimeString()}`;
        
        const textElement = document.createElement('div');
        textElement.textContent = text;
        
        messageElement.appendChild(infoElement);
        messageElement.appendChild(textElement);
        messagesContainer.appendChild(messageElement);
        
        // Прокрутка к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Приветственное сообщение
    addMessage('Система', 'Добро пожаловать в простой мессенджер! Начните общение, отправив сообщение.', false);
});

document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesContainer = document.getElementById('messages');
    const usernameInput = document.getElementById('username');
    
    // Функция для добавления нового сообщения в чат
    function addMessage(sender, text, isMyMessage = false) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        if (isMyMessage) {
            messageElement.style.backgroundColor = '#dcf8c6';
        }
        
        const senderElement = document.createElement('div');
        senderElement.className = 'sender';
        senderElement.textContent = sender;
        
        const textElement = document.createElement('div');
        textElement.className = 'text';
        textElement.textContent = text;
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);
        messagesContainer.appendChild(messageElement);
        
        // Прокрутка к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Функция для отправки сообщения на сервер
    function sendMessage() {
        const message = messageInput.value.trim();
        const username = usernameInput.value.trim();
        
        if (message && username) {
            // Добавляем сообщение сразу в чат
            addMessage(username, message, true);
            
            // Отправляем на сервер
            fetch('/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    message: message
                })
            });
            
            // Очищаем поле ввода
            messageInput.value = '';
        }
    }
    
    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Функция для проверки новых сообщений
    function checkForNewMessages() {
        fetch('/get_messages')
            .then(response => response.json())
            .then(messages => {
                // Очищаем контейнер (для простоты, в реальном приложении нужно хранить ID последнего сообщения)
                messagesContainer.innerHTML = '';
                
                // Добавляем все сообщения
                messages.forEach(msg => {
                    const isMyMessage = msg.username === usernameInput.value.trim();
                    addMessage(msg.username, msg.message, isMyMessage);
                });
            });
    }
    
    // Проверяем новые сообщения каждую секунду
    setInterval(checkForNewMessages, 1000);
    
    // Первоначальная загрузка сообщений
    checkForNewMessages();
});

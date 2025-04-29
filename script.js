document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // Имя пользователя (можно запросить при входе)
    const username = "Пользователь " + Math.floor(Math.random() * 1000);
    
    // Функция для добавления сообщения в чат
    function addMessage(content, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isSent ? 'sent' : 'received');
        
        const senderSpan = document.createElement('span');
        senderSpan.style.fontWeight = 'bold';
        senderSpan.textContent = isSent ? 'Вы' : username;
        
        const contentSpan = document.createElement('span');
        contentSpan.textContent = content;
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(document.createElement('br'));
        messageDiv.appendChild(contentSpan);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Отправка сообщения при нажатии кнопки
    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            
            // Имитация ответа (в реальном приложении здесь был бы обмен с сервером)
            setTimeout(() => {
                addMessage("Это автоматический ответ на ваше сообщение: " + message, false);
            }, 1000);
        }
    });
    
    // Отправка сообщения при нажатии Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // Приветственное сообщение
    setTimeout(() => {
        addMessage("Добро пожаловать в чат! Начните общение, отправив сообщение.", false);
    }, 500);
});
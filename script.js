document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.getElementById('messages');
    
    // Функция для добавления сообщения в чат
    function addMessage(text, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isSent ? 'sent' : 'received');
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Отправка сообщения
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            
            // Отправка на сервер
            fetch('/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.error('Ошибка при отправке сообщения');
                }
            });
            
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
    
    // Опрос сервера для получения новых сообщений
    function pollMessages() {
        fetch('/get_messages')
            .then(response => response.json())
            .then(data => {
                if (data.messages && data.messages.length > 0) {
                    data.messages.forEach(msg => {
                        if (!document.querySelector(`[data-id="${msg.id}"]`)) {
                            addMessage(msg.text, false);
                        }
                    });
                }
                setTimeout(pollMessages, 1000); // Опрос каждую секунду
            })
            .catch(error => {
                console.error('Ошибка при получении сообщений:', error);
                setTimeout(pollMessages, 5000); // Повтор через 5 сек при ошибке
            });
    }
    
    // Начать опрос сообщений
    pollMessages();
});

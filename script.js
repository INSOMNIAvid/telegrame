document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Функция для добавления сообщения в чат
    function addMessage(text, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isSent ? 'sent' : 'received');
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Обработчик нажатия кнопки отправки
    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            
            // Имитация ответа (в реальном приложении здесь был бы запрос на сервер)
            setTimeout(() => {
                addMessage('Это автоматический ответ', false);
            }, 1000);
        }
    });
    
    // Отправка сообщения по нажатию Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
});

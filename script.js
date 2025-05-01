// Открытие/закрытие чата
document.getElementById('start-chat').addEventListener('click', openChat);
document.getElementById('hero-chat').addEventListener('click', openChat);
document.getElementById('close-chat').addEventListener('click', closeChat);

function openChat() {
    document.getElementById('chat-container').style.display = 'flex';
}

function closeChat() {
    document.getElementById('chat-container').style.display = 'none';
}

// Имитация ИИ-бота
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message === '') return;

    // Добавляем сообщение пользователя
    const chatMessages = document.getElementById('chat-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);

    // Очищаем поле ввода
    userInput.value = '';

    // Прокрутка вниз
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Имитация ответа бота (можно заменить на реальный API)
    setTimeout(() => {
        const botResponses = [
            "Расскажите подробнее, что вас беспокоит?",
            "Как вы себя чувствуете в этой ситуации?",
            "Попробуйте технику глубокого дыхания: вдох на 4 счёта, задержка на 4, выдох на 6.",
            "Ваши чувства абсолютно нормальны. Давайте разберёмся вместе.",
            "Что обычно помогает вам успокоиться?"
        ];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerHTML = `<p>${randomResponse}</p>`;
        chatMessages.appendChild(botMessage);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

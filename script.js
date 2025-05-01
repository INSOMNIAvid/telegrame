// Конфигурация API
const OPENAI_API_KEY = "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"; // Замените на свой ключ
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// DOM-элементы
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const closeModal = document.querySelector('.close');
const guestLogin = document.getElementById('guestLogin');
const startChatBtn = document.getElementById('startChatBtn');
const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// История диалога
let conversationHistory = [
    {
        role: "system",
        content: "Ты - виртуальный психолог MindHelper. Поддерживай пользователя, задавай уточняющие вопросы. Будь empathetic. Говори на 'ты'."
    }
];

// Показ/скрытие модального окна
authBtn.addEventListener('click', () => authModal.style.display = 'block');
closeModal.addEventListener('click', () => authModal.style.display = 'none');

// Гостевая аутентификация
guestLogin.addEventListener('click', () => {
    authModal.style.display = 'none';
    localStorage.setItem('isAuthenticated', 'true');
    addBotMessage("Привет! Я MindHelper. Напиши, что тебя беспокоит.");
});

// Начать чат
startChatBtn.addEventListener('click', () => {
    if (localStorage.getItem('isAuthenticated')) {
        chatSection.classList.remove('hidden');
        if (conversationHistory.length <= 1) {
            addBotMessage("Привет! Я MindHelper. Напиши, что тебя беспокоит.");
        }
    } else {
        authModal.style.display = 'block';
    }
});

// Отправка сообщения
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Добавляем сообщение в историю
    conversationHistory.push({ role: "user", content: message });

    try {
        // Получаем ответ от ИИ
        const aiResponse = await getAIResponse(conversationHistory);
        addBotMessage(aiResponse);
        conversationHistory.push({ role: "assistant", content: aiResponse });
    } catch (error) {
        console.error("Ошибка API OpenAI:", error);
        addBotMessage("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }

    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
}

// Запрос к OpenAI API
async function getAIResponse(messages) {
    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 150
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Добавление сообщений в чат
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user-message');
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Обработчики событий
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Инициализация
if (localStorage.getItem('isAuthenticated')) {
    startChatBtn.click();
}

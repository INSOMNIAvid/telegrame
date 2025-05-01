document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const chatContainer = document.getElementById('chat-container');
    const startChatBtn = document.getElementById('start-chat');
    const heroChatBtn = document.getElementById('hero-chat');
    const closeChatBtn = document.getElementById('close-chat');
    const clearChatBtn = document.getElementById('clear-chat');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const quickQuestions = document.querySelectorAll('.quick-question');
    const moodSelector = document.getElementById('mood-selector');
    const moodModal = document.getElementById('mood-modal');
    const closeModal = document.querySelector('.close-modal');
    const moodOptions = document.querySelectorAll('.mood-option');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    // Состояние чата
    let chatHistory = JSON.parse(localStorage.getItem('mindbot_chat_history')) || [];
    let currentMood = null;

    // Инициализация чата
    function initChat() {
        // Загрузка истории чата
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                addMessageToChat(msg.text, msg.sender);
            });
        } else {
            // Приветственное сообщение
            setTimeout(() => {
                addBotMessage("Привет! Я MindBot — ваш виртуальный психолог. Я здесь, чтобы помочь вам разобраться в ваших чувствах и мыслях. О чём вы хотели бы поговорить?");
            }, 500);
        }
    }

    // Добавление сообщения в чат
    function addMessageToChat(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Сообщение от бота
    function addBotMessage(text) {
        typingIndicator.classList.add('active');
        
        // Имитация задержки печати
        const words = text.split(' ');
        let typedText = '';
        let i = 0;
        
        const typingInterval = setInterval(() => {
            if (i < words.length) {
                typedText += words[i] + ' ';
                const tempDiv = document.createElement('div');
                tempDiv.classList.add('message', 'bot-message');
                tempDiv.innerHTML = `<p>${typedText}</p>`;
                
                // Удаляем предыдущее сообщение
                const lastBotMessage = document.querySelector('.message.bot-message:last-child');
                if (lastBotMessage && lastBotMessage !== tempDiv) {
                    chatMessages.removeChild(lastBotMessage);
                }
                
                chatMessages.appendChild(tempDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                i++;
            } else {
                clearInterval(typingInterval);
                typingIndicator.classList.remove('active');
                
                // Сохраняем в историю
                chatHistory.push({
                    text: text,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                });
                saveChatHistory();
            }
        }, 100);
    }

    // Сообщение от пользователя
    function addUserMessage(text) {
        addMessageToChat(text, 'user');
        
        // Сохраняем в историю
        chatHistory.push({
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString(),
            mood: currentMood
        });
        saveChatHistory();
        
        // Сбрасываем выбранное настроение
        currentMood = null;
        
        // Ответ бота
        setTimeout(() => {
            generateBotResponse(text);
        }, 800);
    }

    // Генерация ответа бота (имитация ИИ)
    function generateBotResponse(userMessage) {
        // Анализ сообщения пользователя
        const lowerMsg = userMessage.toLowerCase();
        let response = "";
        
        // Простые правила для имитации ИИ
        if (lowerMsg.includes("тревож") || lowerMsg.includes("волн")) {
            response = "Тревога — это естественная реакция. Попробуйте технику '5-4-3-2-1': назовите 5 вещей, которые видите, 4 — которые слышите, 3 — которые чувствуете, 2 — которые нюхаете, 1 — которую можете попробовать на вкус.";
        } 
        else if (lowerMsg.includes("груст") || lowerMsg.includes("плохое настроение")) {
            response = "Грусть может быть сигналом, что что-то важно для вас. Может, расскажете подробнее, что произошло?";
        }
        else if (lowerMsg.includes("стресс") || lowerMsg.includes("устал")) {
            response = "Стресс часто возникает из-за перегрузки. Попробуйте технику 'Квадратного дыхания': вдох на 4 счёта, задержка на 4, выдох на 4, пауза на 4. Повторите 3-5 раз.";
        }
        else if (lowerMsg.includes("спасибо") || lowerMsg.includes("благодар")) {
            response = "Всегда рад помочь! Как ещё я могу вас поддержать?";
        }
        else {
            // Общие ответы
            const generalResponses = [
                "Расскажите подробнее, что вас беспокоит?",
                "Как это на вас влияет?",
                "Что обычно помогает вам в таких ситуациях?",
                "Давайте разберём это вместе. Что вы чувствуете, когда думаете об этом?",
                "Попробуйте выразить это другими словами. Что для вас самое сложное в этой ситуации?"
            ];
            response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        }
        
        // Добавление ответа с учетом настроения
        if (currentMood) {
            const moodResponses = {
                happy: "Рада, что у вас хорошее настроение! ",
                sad: "Вижу, вам грустно. ",
                angry: "Похоже, вы злитесь. ",
                anxious: "Чувствую вашу тревогу. ",
                neutral: ""
            };
            response = moodResponses[currentMood] + response;
        }
        
        addBotMessage(response);
    }

    // Сохранение истории чата
    function saveChatHistory() {
        localStorage.setItem('mindbot_chat_history', JSON.stringify(chatHistory));
    }

    // Очистка истории чата
    function clearChatHistory() {
        if (confirm("Очистить всю историю чата? Это действие нельзя отменить.")) {
            chatHistory = [];
            saveChatHistory();
            chatMessages.innerHTML = '';
            initChat();
        }
    }

    // Открытие чата
    function openChat() {
        chatContainer.classList.add('active');
        initChat();
    }

    // Закрытие чата
    function closeChat() {
        chatContainer.classList.remove('active');
    }

    // Отправка сообщения
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
        }
    }

    // Открытие модального окна настроения
    function openMoodModal() {
        moodModal.style.display = 'flex';
    }

    // Закрытие модального окна
    function closeMoodModal() {
        moodModal.style.display = 'none';
    }

    // Выбор настроения
    function selectMood(e) {
        currentMood = e.target.dataset.mood;
        const moodIcons = {
            happy: 'fa-laugh-beam',
            sad: 'fa-sad-tear',
            angry: 'fa-angry',
            anxious: 'fa-flushed',
            neutral: 'fa-meh'
        };
        moodSelector.innerHTML = `<i class="fas ${moodIcons[currentMood]}"></i>`;
        closeMoodModal();
    }

    // Переключение мобильного меню
    function toggleMobileMenu() {
        mainNav.classList.toggle('active');
    }

    // Обработчики событий
    startChatBtn.addEventListener('click', openChat);
    heroChatBtn.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);
    clearChatBtn.addEventListener('click', clearChatHistory);
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    moodSelector.addEventListener('click', openMoodModal);
    closeModal.addEventListener('click', closeMoodModal);
    moodOptions.forEach(option => {
        option.addEventListener('click', selectMood);
    });
    quickQuestions.forEach(question => {
        question.addEventListener('click', function() {
            addUserMessage(this.textContent);
        });
    });
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === moodModal) {
            closeMoodModal();
        }
    });

    // Плавная прокрутка для якорей
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                if (mainNav.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Анимация при скролле
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate__animated');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                const animationClass = element.classList[1];
                element.classList.add(animationClass);
                
                // Для элементов с задержкой
                const delay = element.dataset.delay;
                if (delay) {
                    element.style.animationDelay = delay;
                }
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Инициализация при загрузке
});

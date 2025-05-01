document.addEventListener('DOMContentLoaded', function() {
    // ========== Элементы интерфейса ==========
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
    const closeModalBtn = document.querySelector('.close-modal');
    const moodOptions = document.querySelectorAll('.mood-option');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const watchDemoBtn = document.getElementById('watch-demo');
    const demoModal = document.createElement('div');
    const emergencyBtn = document.createElement('button');

    // ========== Состояние приложения ==========
    let chatHistory = JSON.parse(localStorage.getItem('mindbot_chat_history')) || [];
    let currentMood = null;
    let isTyping = false;

    // ========== Инициализация ==========
    initModals();
    initEmergencyButton();
    initChat();

    // ========== Функции ==========
    
    // Инициализация модальных окон
    function initModals() {
        // Демо-видео
        demoModal.className = 'modal';
        demoModal.id = 'demo-modal';
        demoModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Как работает MindBot?</h3>
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>Здесь будет демонстрация работы приложения</p>
                </div>
            </div>
        `;
        document.body.appendChild(demoModal);

        // Обработчики для всех модальных окон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('close-modal')) {
                    this.style.display = 'none';
                }
            });
        });
    }

    // Кнопка экстренной помощи
    function initEmergencyButton() {
        emergencyBtn.id = 'emergency-btn';
        emergencyBtn.innerHTML = '<i class="fas fa-life-ring"></i> Экстренная помощь';
        document.body.appendChild(emergencyBtn);
        
        emergencyBtn.addEventListener('click', function() {
            if (confirm('Вы нуждаетесь в срочной помощи? Мы можем направить вас к профессионалам.')) {
                window.open('https://telefon-doveria.ru/', '_blank');
            }
        });
    }

    // Инициализация чата
    function initChat() {
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                addMessageToChat(msg.text, msg.sender, msg.timestamp);
            });
        } else {
            setTimeout(() => {
                addBotMessage("Привет! Я MindBot — ваш виртуальный психолог. Я здесь, чтобы помочь вам разобраться в ваших чувствах и мыслях. О чём вы хотели бы поговорить?");
            }, 500);
        }
    }

    // Добавление сообщения в чат
    function addMessageToChat(text, sender, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        
        const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                  new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <p>${text}</p>
            <span class="message-time">${timeStr}</span>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Сообщение от бота
    function addBotMessage(text) {
        if (isTyping) return;
        isTyping = true;
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
                tempDiv.innerHTML = `
                    <p>${typedText}</p>
                    <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                `;
                
                // Удаляем предыдущее сообщение
                const lastBotMessage = document.querySelector('.message.bot-message:last-child');
                if (lastBotMessage && !lastBotMessage.innerHTML.includes('</span>')) {
                    chatMessages.removeChild(lastBotMessage);
                }
                
                chatMessages.appendChild(tempDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                i++;
            } else {
                clearInterval(typingInterval);
                typingIndicator.classList.remove('active');
                isTyping = false;
                
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
        moodSelector.innerHTML = '<i class="fas fa-smile"></i>';
        
        // Ответ бота
        setTimeout(() => {
            generateBotResponse(text);
        }, 800);
    }

    // Генерация ответа бота (имитация ИИ)
    function generateBotResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        let response = "";
        
        // База знаний психолога
        const knowledgeBase = {
            'тревож|волн|боюсь': [
                "Тревога — это естественная реакция. Попробуйте технику '5-4-3-2-1': назовите 5 вещей, которые видите, 4 — которые слышите, 3 — которые чувствуете, 2 — которые нюхаете, 1 — которую можете попробовать на вкус.",
                "Когда вы чувствуете тревогу, попробуйте заземление: сожмите и разожмите кулаки 5 раз, почувствуйте опору под ногами, сделайте глубокий вдох."
            ],
            'груст|плохое настроение|тоск': [
                "Грусть может быть сигналом, что что-то важно для вас. Может, расскажете подробнее, что произошло?",
                "Позвольте себе почувствовать грусть. Иногда нам нужно это переживание. Хотите обсудить, что именно вызывает эти чувства?"
            ],
            'стресс|устал|нервнич': [
                "Стресс часто возникает из-за перегрузки. Попробуйте технику 'Квадратного дыхания': вдох на 4 счёта, задержка на 4, выдох на 4, пауза на 4. Повторите 3-5 раз.",
                "При стрессе помогает метод 'Помпурри': назовите 3 цвета вокруг вас, 3 звука и сделайте 3 глубоких вдоха."
            ],
            'спасибо|благодар': [
                "Всегда рад помочь! Как ещё я могу вас поддержать?",
                "Спасибо за ваше доверие. Продолжаем работу?"
            ],
            'привет|здравств': [
                "Здравствуйте! О чём вы хотели бы поговорить сегодня?",
                "Привет! Как ваше настроение?"
            ]
        };

        // Поиск подходящего ответа
        for (const [pattern, responses] of Object.entries(knowledgeBase)) {
            if (new RegExp(pattern).test(lowerMsg)) {
                response = responses[Math.floor(Math.random() * responses.length)];
                break;
            }
        }

        // Если не найдено совпадений
        if (!response) {
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

    // Выбор настроения
    function selectMood(e) {
        currentMood = e.currentTarget.dataset.mood;
        const moodIcons = {
            happy: 'fa-laugh-beam',
            sad: 'fa-sad-tear',
            angry: 'fa-angry',
            anxious: 'fa-flushed',
            neutral: 'fa-meh'
        };
        moodSelector.innerHTML = `<i class="fas ${moodIcons[currentMood]}"></i>`;
        moodModal.style.display = 'none';
    }

    // Переключение мобильного меню
    function toggleMobileMenu() {
        mainNav.classList.toggle('active');
        mobileMenuBtn.innerHTML = mainNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }

    // Показать демо
    function showDemo() {
        document.getElementById('demo-modal').style.display = 'flex';
    }

    // ========== Обработчики событий ==========
    startChatBtn.addEventListener('click', openChat);
    heroChatBtn.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);
    clearChatBtn.addEventListener('click', clearChatHistory);
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    moodSelector.addEventListener('click', openMoodModal);
    moodOptions.forEach(option => {
        option.addEventListener('click', selectMood);
    });
    quickQuestions.forEach(question => {
        question.addEventListener('click', function() {
            addUserMessage(this.textContent);
        });
    });
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    watchDemoBtn.addEventListener('click', showDemo);

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
        const elements = document.querySelectorAll('.feature-card, .step');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Инициализация при загрузке
});

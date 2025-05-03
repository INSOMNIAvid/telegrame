// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAryOAJtH9AxUBBzPTdNMyhapUvSzxAREs",
  authDomain: "edfghj-eea58.firebaseapp.com",
  projectId: "edfghj-eea58",
  storageBucket: "edfghj-eea58.firebasestorage.app",
  messagingSenderId: "441274161947",
  appId: "1:441274161947:web:79a344c0121d0d0bfe91be",
  measurementId: "G-7KZCMLECJM"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const providerGoogle = new firebase.auth.GoogleAuthProvider();
const providerFacebook = new firebase.auth.FacebookAuthProvider();

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
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const moodOptions = document.querySelectorAll('.mood-option');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const watchDemoBtn = document.getElementById('watch-demo');
    const demoVideo = document.getElementById('demo-video');
    const addTestimonialBtn = document.getElementById('add-testimonial');
    const testimonialModal = document.getElementById('testimonial-modal');
    const testimonialForm = document.getElementById('testimonial-form');
    const ratingStars = document.querySelectorAll('.rating-input i');
    const faqItems = document.querySelectorAll('.faq-item');
    const emergencyBtn = document.getElementById('emergency-btn');
    const emergencyBtnFooter = document.getElementById('emergency-btn-footer');
    const featureCards = document.querySelectorAll('.feature-card');
    const featureBtns = document.querySelectorAll('.feature-btn');
    const freePlanBtn = document.getElementById('free-plan-btn');
    const premiumPlanBtn = document.getElementById('premium-plan-btn');
    const annualPlanBtn = document.getElementById('annual-plan-btn');
    const subscribeModal = document.getElementById('subscribe-modal');
    const subscribeTitle = document.getElementById('subscribe-title');
    const subscribeContent = document.getElementById('subscribe-content');
    const paymentForm = document.getElementById('payment-form');
    const paymentSuccess = document.getElementById('payment-success');
    const closeSuccessBtn = document.getElementById('close-success');
    const limitModal = document.getElementById('limit-modal');
    const upgradePlanBtn = document.getElementById('upgrade-plan');
    const closeLimitBtn = document.getElementById('close-limit');
    const messagesLeftSpan = document.getElementById('messages-left');
    const chatLimit = document.getElementById('chat-limit');
    const userStatus = document.getElementById('user-status');
    const accountBtn = document.getElementById('account-btn');
    const dropdownContent = document.getElementById('dropdown-content');
    const profileLink = document.getElementById('profile-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const subscriptionLink = document.getElementById('subscription-link');
    const logoutLink = document.getElementById('logout-link');
    const profileModal = document.getElementById('profile-modal');
    const profileStatus = document.getElementById('profile-status');
    const subscriptionInfo = document.getElementById('subscription-info');
    const subscriptionEnd = document.getElementById('subscription-end');
    const subscriptionEndContainer = document.getElementById('subscription-end-container');
    const upgradeProfileBtn = document.getElementById('upgrade-profile-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileForm = document.getElementById('edit-profile-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const privacyPolicyBtn = document.getElementById('privacy-policy-btn');
    const termsOfUseBtn = document.getElementById('terms-of-use-btn');
    const privacyPolicyModal = document.getElementById('privacy-policy-modal');
    const termsOfUseModal = document.getElementById('terms-of-use-modal');
    const premiumFeaturesBtn = document.getElementById('premium-features-btn');
    const registerSuggestion = document.getElementById('register-suggestion');
    const registerBeforePay = document.getElementById('register-before-pay');
    const continueWithoutRegister = document.getElementById('continue-without-register');
    const googleLoginBtn = document.getElementById('google-login');
    const facebookLoginBtn = document.getElementById('facebook-login');
    const googleRegisterBtn = document.getElementById('google-register');
    const facebookRegisterBtn = document.getElementById('facebook-register');

    // ========== Состояние приложения ==========
    let chatHistory = JSON.parse(localStorage.getItem('mindbot_chat_history')) || [];
    let currentMood = null;
    let isTyping = false;
    let selectedRating = 0;
    let messagesLeft = 3;
    let isPremium = localStorage.getItem('mindbot_premium') === 'true';
    let trialUsed = localStorage.getItem('mindbot_trial_used') === 'true';
    let currentPlan = localStorage.getItem('mindbot_plan') || 'free';
    let trialEndDate = localStorage.getItem('mindbot_trial_end');
    let totalMessages = parseInt(localStorage.getItem('mindbot_total_messages')) || 0;
    let signupDate = localStorage.getItem('mindbot_signup_date') || new Date().toLocaleDateString();
    let isLoggedIn = localStorage.getItem('mindbot_logged_in') === 'true';
    let currentUser = JSON.parse(localStorage.getItem('mindbot_current_user')) || null;
    let currentPaymentPlan = null;

    // ========== Инициализация ==========
    initModals();
    initChat();
    updateUserStatus();
    setupAnimations();
    setupEventListeners();
    checkMessageLimit();
    updatePremiumFeaturesVisibility();
    checkLoginStatus();
    checkAuthState();

    // ========== Функции инициализации ==========
    
    function initModals() {
        // Инициализация всех модальных окон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('close-modal')) {
                    this.style.display = 'none';
                }
            });
        });
    }

    function initChat() {
        // Загрузка истории чата
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                addMessageToChat(msg.text, msg.sender, msg.timestamp);
            });
        } else {
            // Приветственное сообщение
            setTimeout(() => {
                addBotMessage("Привет! Я MindBot — ваш виртуальный психолог. Я здесь, чтобы помочь вам разобраться в ваших чувствах и мыслях. О чём вы хотели бы поговорить?");
            }, 500);
        }
    }

    function updateUserStatus() {
        if (isPremium) {
            userStatus.textContent = currentPlan === 'annual' ? 'Годовая подписка' : 'Премиум';
            userStatus.classList.add('premium');
            chatLimit.style.display = 'none';
        } else {
            userStatus.textContent = isLoggedIn ? (currentUser ? currentUser.name : 'Пользователь') : 'Гость';
            userStatus.classList.remove('premium');
            chatLimit.style.display = 'block';
        }
        
        // Обновляем кнопку в профиле
        if (upgradeProfileBtn) {
            upgradeProfileBtn.style.display = isPremium ? 'none' : 'block';
        }
    }

    function updatePremiumFeaturesVisibility() {
        const premiumFeatures = document.querySelectorAll('.premium-feature');
        premiumFeatures.forEach(feature => {
            if (isPremium) {
                feature.style.display = 'block';
            } else {
                feature.style.display = 'none';
            }
        });
    }

    function checkLoginStatus() {
        if (isLoggedIn) {
            // Показываем кнопку выхода и скрываем вход/регистрацию
            if (logoutLink) logoutLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
            if (subscriptionLink) subscriptionLink.style.display = 'block';
        } else {
            // Показываем кнопки входа/регистрации и скрываем выход
            if (logoutLink) logoutLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'block';
            if (subscriptionLink) subscriptionLink.style.display = 'block';
        }
    }

    function checkAuthState() {
        auth.onAuthStateChanged(user => {
            if (user) {
                // Пользователь вошел в систему
                isLoggedIn = true;
                currentUser = {
                    id: user.uid,
                    name: user.displayName || 'Пользователь',
                    email: user.email,
                    signupDate: new Date(user.metadata.creationTime).toLocaleDateString() || new Date().toLocaleDateString()
                };
                
                localStorage.setItem('mindbot_logged_in', 'true');
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                signupDate = currentUser.signupDate;
                localStorage.setItem('mindbot_signup_date', signupDate);
                
                updateUserStatus();
                checkLoginStatus();
                updateProfileInfo();
            } else {
                // Пользователь вышел из системы
                isLoggedIn = false;
                currentUser = null;
                localStorage.setItem('mindbot_logged_in', 'false');
                localStorage.removeItem('mindbot_current_user');
                
                updateUserStatus();
                checkLoginStatus();
            }
        });
    }

    function setupAnimations() {
        // Анимации при скролле
        const animateOnScroll = function() {
            const elements = document.querySelectorAll('[data-animate]');
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementPosition < windowHeight - 100) {
                    element.classList.add('animate');
                }
            });
        };

        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // Инициализация при загрузке
    }

    function setupEventListeners() {
        // Навигация и общие элементы
        startChatBtn.addEventListener('click', openChat);
        heroChatBtn.addEventListener('click', openChat);
        closeChatBtn.addEventListener('click', closeChat);
        clearChatBtn.addEventListener('click', clearChatHistory);
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Модальные окна
        moodSelector.addEventListener('click', () => moodModal.style.display = 'flex');
        watchDemoBtn.addEventListener('click', () => demoVideo.scrollIntoView({ behavior: 'smooth' }));
        addTestimonialBtn.addEventListener('click', () => testimonialModal.style.display = 'flex');
        premiumFeaturesBtn.addEventListener('click', () => showSubscribeModal('premium'));
        
        // Закрытие модальных окон
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Выбор настроения
        moodOptions.forEach(option => {
            option.addEventListener('click', selectMood);
        });
        
        // Быстрые вопросы в чате
        quickQuestions.forEach(question => {
            question.addEventListener('click', function() {
                addUserMessage(this.textContent);
            });
        });
        
        // FAQ аккордеон
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
        
        // Рейтинг в форме отзыва
        ratingStars.forEach(star => {
            star.addEventListener('click', setRating);
            star.addEventListener('mouseover', hoverRating);
            star.addEventListener('mouseout', resetRating);
        });
        
        // Кнопки экстренной помощи
        emergencyBtn.addEventListener('click', showEmergencyHelp);
        emergencyBtnFooter.addEventListener('click', showEmergencyHelp);
        
        // Кнопки "Подробнее" в карточках возможностей
        featureBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => showFeatureDetails(index));
        });
        
        // Кнопки подписки
        freePlanBtn.addEventListener('click', () => showSubscribeModal('free'));
        premiumPlanBtn.addEventListener('click', () => showSubscribeModal('premium'));
        annualPlanBtn.addEventListener('click', () => showSubscribeModal('annual'));
        upgradePlanBtn.addEventListener('click', () => showSubscribeModal('premium'));
        upgradeProfileBtn.addEventListener('click', () => showSubscribeModal('premium'));
        
        // Форма оплаты
        paymentForm.addEventListener('submit', processPayment);
        closeSuccessBtn.addEventListener('click', () => {
            subscribeModal.style.display = 'none';
            paymentSuccess.style.display = 'none';
            paymentForm.style.display = 'block';
        });
        
        // Лимит сообщений
        closeLimitBtn.addEventListener('click', () => limitModal.style.display = 'none');
        
        // Аккаунт и профиль
        accountBtn.addEventListener('click', toggleDropdown);
        profileLink.addEventListener('click', showProfileModal);
        loginLink.addEventListener('click', () => {
            loginModal.style.display = 'flex';
            dropdownContent.style.display = 'none';
        });
        registerLink.addEventListener('click', () => {
            registerModal.style.display = 'flex';
            dropdownContent.style.display = 'none';
        });
        subscriptionLink.addEventListener('click', () => {
            showSubscribeModal('premium');
            dropdownContent.style.display = 'none';
        });
        logoutLink.addEventListener('click', logout);
        editProfileBtn.addEventListener('click', editProfile);
        cancelEditBtn.addEventListener('click', () => editProfileModal.style.display = 'none');
        
        // Формы входа и регистрации
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        editProfileForm.addEventListener('submit', handleEditProfile);
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
        
        // Политика конфиденциальности и условия
        privacyPolicyBtn.addEventListener('click', () => privacyPolicyModal.style.display = 'flex');
        termsOfUseBtn.addEventListener('click', () => termsOfUseModal.style.display = 'flex');
        
        // Предложение регистрации перед оплатой
        registerBeforePay.addEventListener('click', () => {
            registerSuggestion.style.display = 'none';
            registerModal.style.display = 'flex';
            subscribeModal.style.display = 'none';
        });
        
        continueWithoutRegister.addEventListener('click', () => {
            registerSuggestion.style.display = 'none';
            showPaymentForm(currentPaymentPlan);
        });
        
        // Социальный вход
        googleLoginBtn.addEventListener('click', () => signInWithGoogle());
        facebookLoginBtn.addEventListener('click', () => signInWithFacebook());
        googleRegisterBtn.addEventListener('click', () => signInWithGoogle());
        facebookRegisterBtn.addEventListener('click', () => signInWithFacebook());
        
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
        
        // Маска для номера карты
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '');
                if (value.length > 16) value = value.substring(0, 16);
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }
        
        // Маска для срока действия
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D+/g, '');
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
    }

    // ========== Функции чата ==========
    
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

    function addUserMessage(text) {
        if (!isPremium && messagesLeft <= 0) {
            limitModal.style.display = 'flex';
            return;
        }
        
        addMessageToChat(text, 'user');
        
        if (!isPremium) {
            messagesLeft--;
            updateMessageLimit();
            localStorage.setItem('mindbot_messages_left', messagesLeft);
        }
        
        // Увеличиваем счетчик сообщений
        totalMessages++;
        localStorage.setItem('mindbot_total_messages', totalMessages);
        
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
            ],
            'как это работает|как пользоваться': [
                "MindBot использует когнитивно-поведенческую терапию (CBT) и другие проверенные методики. Просто напишите о своей проблеме, и я предложу техники для её решения.",
                "Работаю так: 1) Вы описываете ситуацию 2) Я анализирую и предлагаю техники 3) Вы применяете их и отслеживаете прогресс в дневнике настроения."
            ],
            'подписка|премиум|оплата': [
                "Премиум-подписка дает неограниченное количество сообщений, доступ ко всем техникам CBT и расширенному дневнику настроения.",
                "Вы можете оформить подписку в разделе 'Тарифы'. Доступна ежемесячная и годовая подписка со скидкой 30%."
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

    function saveChatHistory() {
        localStorage.setItem('mindbot_chat_history', JSON.stringify(chatHistory));
    }

    function clearChatHistory() {
        if (confirm("Очистить всю историю чата? Это действие нельзя отменить.")) {
            chatHistory = [];
            saveChatHistory();
            chatMessages.innerHTML = '';
            initChat();
        }
    }

    function openChat() {
        chatContainer.classList.add('active');
        initChat();
    }

    function closeChat() {
        chatContainer.classList.remove('active');
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
        }
    }

    function checkMessageLimit() {
        const savedMessagesLeft = localStorage.getItem('mindbot_messages_left');
        const lastReset = localStorage.getItem('mindbot_last_reset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            // Сброс лимита на новый день
            messagesLeft = 3;
            localStorage.setItem('mindbot_messages_left', messagesLeft);
            localStorage.setItem('mindbot_last_reset', today);
        } else if (savedMessagesLeft) {
            messagesLeft = parseInt(savedMessagesLeft);
        }
        
        updateMessageLimit();
    }

    function updateMessageLimit() {
        messagesLeftSpan.textContent = messagesLeft;
        
        if (messagesLeft <= 1) {
            chatLimit.style.color = 'var(--danger-color)';
        } else {
            chatLimit.style.color = 'var(--text-light)';
        }
    }

    // ========== Функции настроения ==========
    
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

    // ========== Функции мобильного меню ==========
    
    function toggleMobileMenu() {
        mainNav.classList.toggle('active');
        mobileMenuBtn.innerHTML = mainNav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }

    // ========== Функции отзывов ==========
    
    function setRating(e) {
        selectedRating = parseInt(e.target.dataset.rating);
        updateRatingStars();
    }

    function hoverRating(e) {
        const hoverRating = parseInt(e.target.dataset.rating);
        ratingStars.forEach(star => {
            if (parseInt(star.dataset.rating) <= hoverRating) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    }

    function resetRating() {
        updateRatingStars();
    }

    function updateRatingStars() {
        ratingStars.forEach(star => {
            star.classList.remove('hover', 'active');
            if (parseInt(star.dataset.rating) <= selectedRating) {
                star.classList.add('active');
            }
        });
    }

    // Обработка формы отзыва
    testimonialForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userName = document.getElementById('user-name').value || 'Аноним';
        const testimonialText = document.getElementById('user-testimonial').value;
        
        if (testimonialText.trim() === '') {
            alert('Пожалуйста, напишите ваш отзыв');
            return;
        }
        
        // Здесь можно добавить отправку на сервер
        alert('Спасибо за ваш отзыв!');
        testimonialModal.style.display = 'none';
        testimonialForm.reset();
        selectedRating = 0;
        updateRatingStars();
    });

    // ========== Функции экстренной помощи ==========
    
    function showEmergencyHelp() {
        if (confirm('Вы нуждаетесь в срочной помощи? Мы можем направить вас к профессионалам.')) {
            window.open('https://telefon-doveria.ru/', '_blank');
        }
    }

    // ========== Функции карточек возможностей ==========
    
    function showFeatureDetails(index) {
        const featureTitles = [
            "Анонимный чат",
            "Техники CBT",
            "Дневник настроения",
            "Неограниченные сессии",
            "Персональные программы",
            "Подробный анализ"
        ];
        
        const featureDescriptions = [
            "Все ваши диалоги полностью анонимны. Мы не сохраняем персональные данные и не требуем регистрации. Ваши секреты в безопасности.",
            "Когнитивно-поведенческая терапия (CBT) - золотой стандарт психотерапии. Мы используем проверенные техники для работы с тревогой, депрессией и стрессом.",
            "Отслеживайте ваше эмоциональное состояние с помощью удобного дневника. Анализируйте закономерности и прогресс в терапии.",
            "Премиум-функция: общайтесь без ограничений по количеству сообщений и времени сессий. Подробнее: вы сможете общаться столько, сколько вам нужно, без ежедневных лимитов.",
            "Премиум-функция: индивидуальные планы терапии, адаптированные под ваши потребности и цели. Подробнее: программа будет учитывать ваши уникальные запросы и прогресс.",
            "Премиум-функция: глубокий анализ вашего состояния с детальными отчетами и рекомендациями. Подробнее: вы получите статистику по вашему эмоциональному состоянию и персональные советы."
        ];
        
        alert(`${featureTitles[index]}\n\n${featureDescriptions[index]}`);
    }

    // ========== Функции подписки ==========
    
    function showSubscribeModal(plan) {
        subscribeModal.style.display = 'flex';
        paymentForm.style.display = 'none';
        paymentSuccess.style.display = 'none';
        subscribeContent.style.display = 'block';
        registerSuggestion.style.display = 'none';
        
        currentPaymentPlan = plan;
        
        const planInfo = {
            free: {
                title: "Бесплатный тариф",
                description: "Вы можете продолжить использовать MindBot бесплатно с ограничением 3 сообщения в день.",
                price: "0₽",
                button: "Продолжить бесплатно"
            },
            premium: {
                title: "Премиум подписка",
                description: "Полный доступ ко всем функциям MindBot без ограничений. Платите ежемесячно, отмена в любой момент.",
                price: "990₽ в месяц",
                button: "Оформить подписку"
            },
            annual: {
                title: "Годовая подписка",
                description: "Полный доступ на 1 год со скидкой 30%. Экономия 2,970₽ по сравнению с ежемесячной оплатой.",
                price: "7,900₽ в год",
                button: "Оформить подписку"
            }
        };
        
        subscribeTitle.textContent = planInfo[plan].title;
        subscribeContent.innerHTML = `
            <p>${planInfo[plan].description}</p>
            <div class="plan-price">${planInfo[plan].price}</div>
            <button class="cta-button" id="confirm-subscription">${planInfo[plan].button}</button>
        `;
        
        document.getElementById('confirm-subscription').addEventListener('click', function() {
            if (plan === 'free') {
                subscribeModal.style.display = 'none';
            } else {
                // Показываем предложение регистрации, если пользователь не авторизован
                if (!isLoggedIn) {
                    subscribeContent.style.display = 'none';
                    registerSuggestion.style.display = 'block';
                } else {
                    showPaymentForm(plan);
                }
            }
        });
    }
    
    function showPaymentForm(plan) {
        subscribeTitle.textContent = `Оплата ${plan === 'annual' ? 'годовой' : 'ежемесячной'} подписки`;
        subscribeContent.style.display = 'none';
        registerSuggestion.style.display = 'none';
        paymentForm.style.display = 'block';
        
        // Здесь можно добавить обработку разных планов
        document.getElementById('confirm-payment').onclick = function(e) {
            e.preventDefault();
            processPayment(plan);
        };
    }
    
    function processPayment(plan) {
        // В реальном приложении здесь будет интеграция с платежной системой
        // Для демонстрации просто имитируем успешную оплату
        
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Имитация обработки платежа
        setTimeout(() => {
            paymentForm.style.display = 'none';
            paymentSuccess.style.display = 'block';
            
            // Активируем премиум доступ
            isPremium = true;
            currentPlan = plan;
            localStorage.setItem('mindbot_premium', 'true');
            localStorage.setItem('mindbot_plan', plan);
            
            if (plan === 'premium' && !trialUsed) {
                // Активируем пробный период
                const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                trialEndDate = trialEnd.toISOString();
                localStorage.setItem('mindbot_trial_end', trialEndDate);
                trialUsed = true;
                localStorage.setItem('mindbot_trial_used', 'true');
            }
            
            updateUserStatus();
            updatePremiumFeaturesVisibility();
            updateProfileInfo();
        }, 1500);
    }

    // Проверка пробного периода
    function checkTrialPeriod() {
        if (trialEndDate && new Date(trialEndDate) < new Date()) {
            isPremium = false;
            currentPlan = 'free';
            localStorage.setItem('mindbot_premium', 'false');
            localStorage.setItem('mindbot_plan', 'free');
            updateUserStatus();
            updatePremiumFeaturesVisibility();
            updateProfileInfo();
            alert('Ваш пробный период закончился. Пожалуйста, оформите подписку для продолжения использования.');
        }
    }

    // ========== Функции аккаунта ==========
    
    function toggleDropdown() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    }
    
    function showProfileModal() {
        updateProfileInfo();
        profileModal.style.display = 'flex';
        dropdownContent.style.display = 'none';
    }
    
    function updateProfileInfo() {
        document.getElementById('profile-name').textContent = currentUser ? currentUser.name : 'Гость';
        document.getElementById('messages-used').textContent = totalMessages;
        document.getElementById('signup-date').textContent = signupDate;
        
        if (isPremium) {
            profileStatus.innerHTML = '<span class="status-badge premium">Премиум аккаунт</span>';
            subscriptionInfo.textContent = currentPlan === 'annual' ? 'Годовая подписка' : 'Ежемесячная подписка';
            
            if (trialEndDate) {
                const endDate = new Date(trialEndDate);
                subscriptionEnd.textContent = endDate.toLocaleDateString();
                subscriptionEndContainer.style.display = 'flex';
            } else {
                subscriptionEndContainer.style.display = 'none';
            }
        } else {
            profileStatus.innerHTML = '<span class="status-badge free">Бесплатный аккаунт</span>';
            subscriptionInfo.textContent = 'Не активна';
            subscriptionEndContainer.style.display = 'none';
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Успешный вход
                const user = userCredential.user;
                isLoggedIn = true;
                currentUser = {
                    id: user.uid,
                    name: user.displayName || email.split('@')[0],
                    email: user.email,
                    signupDate: new Date(user.metadata.creationTime).toLocaleDateString() || new Date().toLocaleDateString()
                };
                
                localStorage.setItem('mindbot_logged_in', 'true');
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                signupDate = currentUser.signupDate;
                localStorage.setItem('mindbot_signup_date', signupDate);
                
                alert('Вы успешно вошли в систему!');
                loginModal.style.display = 'none';
                checkLoginStatus();
                updateUserStatus();
                updateProfileInfo();
            })
            .catch((error) => {
                alert('Ошибка входа: ' + error.message);
            });
    }
    
    function handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Успешная регистрация
                const user = userCredential.user;
                
                // Обновляем имя пользователя
                return user.updateProfile({
                    displayName: name
                }).then(() => {
                    isLoggedIn = true;
                    currentUser = {
                        id: user.uid,
                        name: name,
                        email: email,
                        signupDate: new Date().toLocaleDateString()
                    };
                    
                    localStorage.setItem('mindbot_logged_in', 'true');
                    localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                    signupDate = currentUser.signupDate;
                    localStorage.setItem('mindbot_signup_date', signupDate);
                    
                    alert('Регистрация прошла успешно!');
                    registerModal.style.display = 'none';
                    checkLoginStatus();
                    updateUserStatus();
                    updateProfileInfo();
                });
            })
            .catch((error) => {
                alert('Ошибка регистрации: ' + error.message);
            });
    }
    
    function handleEditProfile(e) {
        e.preventDefault();
        
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;
        const password = document.getElementById('edit-password').value;
        const confirmPassword = document.getElementById('edit-confirm').value;
        
        if (password && password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        const user = auth.currentUser;
        
        if (!user) {
            alert('Пользователь не авторизован');
            return;
        }
        
        // Обновляем email
        const promises = [];
        
        if (email !== user.email) {
            promises.push(user.updateEmail(email));
        }
        
        if (name !== user.displayName) {
            promises.push(user.updateProfile({
                displayName: name
            }));
        }
        
        if (password) {
            promises.push(user.updatePassword(password));
        }
        
        Promise.all(promises)
            .then(() => {
                // Обновляем данные пользователя
                currentUser.name = name;
                currentUser.email = email;
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                
                alert('Профиль успешно обновлен!');
                editProfileModal.style.display = 'none';
                updateUserStatus();
                updateProfileInfo();
            })
            .catch((error) => {
                alert('Ошибка обновления профиля: ' + error.message);
            });
    }
    
    function editProfile() {
        if (!isLoggedIn) {
            alert('Пожалуйста, войдите в систему');
            return;
        }
        
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-email').value = currentUser.email;
        document.getElementById('edit-password').value = '';
        document.getElementById('edit-confirm').value = '';
        
        profileModal.style.display = 'none';
        editProfileModal.style.display = 'flex';
    }
    
    function logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            auth.signOut().then(() => {
                isLoggedIn = false;
                currentUser = null;
                localStorage.setItem('mindbot_logged_in', 'false');
                localStorage.removeItem('mindbot_current_user');
                
                alert('Вы вышли из системы');
                dropdownContent.style.display = 'none';
                checkLoginStatus();
                updateUserStatus();
            }).catch((error) => {
                alert('Ошибка при выходе: ' + error.message);
            });
        }
    }
    
    function signInWithGoogle() {
        auth.signInWithPopup(providerGoogle)
            .then((result) => {
                // Успешный вход
                const user = result.user;
                isLoggedIn = true;
                currentUser = {
                    id: user.uid,
                    name: user.displayName || 'Пользователь',
                    email: user.email,
                    signupDate: new Date(user.metadata.creationTime).toLocaleDateString() || new Date().toLocaleDateString()
                };
                
                localStorage.setItem('mindbot_logged_in', 'true');
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                signupDate = currentUser.signupDate;
                localStorage.setItem('mindbot_signup_date', signupDate);
                
                loginModal.style.display = 'none';
                registerModal.style.display = 'none';
                checkLoginStatus();
                updateUserStatus();
                updateProfileInfo();
            })
            .catch((error) => {
                alert('Ошибка входа через Google: ' + error.message);
            });
    }
    
    function signInWithFacebook() {
        auth.signInWithPopup(providerFacebook)
            .then((result) => {
                // Успешный вход
                const user = result.user;
                isLoggedIn = true;
                currentUser = {
                    id: user.uid,
                    name: user.displayName || 'Пользователь',
                    email: user.email,
                    signupDate: new Date(user.metadata.creationTime).toLocaleDateString() || new Date().toLocaleDateString()
                };
                
                localStorage.setItem('mindbot_logged_in', 'true');
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                signupDate = currentUser.signupDate;
                localStorage.setItem('mindbot_signup_date', signupDate);
                
                loginModal.style.display = 'none';
                registerModal.style.display = 'none';
                checkLoginStatus();
                updateUserStatus();
                updateProfileInfo();
            })
            .catch((error) => {
                alert('Ошибка входа через Facebook: ' + error.message);
            });
    }

    // Проверяем пробный период при загрузке
    checkTrialPeriod();
});

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAryOAJtH9AxUBBzPTdNMyhapUvSzxAREs",
  authDomain: "edfghj-eea58.firebaseapp.com",
  projectId: "edfghj-eea58",
  storageBucket: "edfghj-eea58.appspot.com",
  messagingSenderId: "441274161947",
  appId: "1:441274161947:web:79a344c0121d0d0bfe91be",
  measurementId: "G-7KZCMLECJM"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const providerGoogle = new firebase.auth.GoogleAuthProvider();
const providerFacebook = new firebase.auth.FacebookAuthProvider();

// Конфигурация ИИ (Hugging Face Inference API)
const AI_CONFIG = {
  API_URL: "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
  API_KEY: "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", // Замените на реальный ключ
  CONTEXT_LENGTH: 5 // Сколько последних сообщений учитывать для контекста
};

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
    const voiceInputBtn = document.getElementById('voice-input-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const quickQuestions = document.querySelectorAll('.quick-question');
    const moodSelector = document.getElementById('mood-selector');
    const moodModal = document.getElementById('mood-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const moodOptions = document.querySelectorAll('.mood-option');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const watchDemoBtn = document.getElementById('watch-demo');
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
    const moodChartCanvas = document.getElementById('mood-chart');
    const botAnimationContainer = document.getElementById('bot-animation');
    const chatBotAvatar = document.getElementById('chat-bot-avatar');
    const themeToggle = document.createElement('button');
    
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
    let moodData = JSON.parse(localStorage.getItem('mindbot_mood_data')) || [];
    let recognition;
    let isDarkTheme = localStorage.getItem('mindbot_dark_theme') === 'true';
    let moodChart = null;
    let aiContext = []; // Контекст для ИИ

    // ========== Инициализация ==========
    initModals();
    initChat();
    initAnimations();
    updateUserStatus();
    setupAnimations();
    setupEventListeners();
    checkMessageLimit();
    updatePremiumFeaturesVisibility();
    checkLoginStatus();
    checkAuthState();
    initVoiceRecognition();
    initThemeToggle();
    checkTrialPeriod();

    // ========== Функции инициализации ==========
    
    function initModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this || e.target.classList.contains('close-modal')) {
                    this.style.display = 'none';
                }
            });
        });
    }

    function initChat() {
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                addMessageToChat(msg.text, msg.sender, msg.timestamp);
                // Добавляем в контекст ИИ
                if (msg.sender === 'user') {
                    aiContext.push({ role: 'user', content: msg.text });
                } else {
                    aiContext.push({ role: 'assistant', content: msg.text });
                }
            });
        } else {
            setTimeout(() => {
                const welcomeMessage = "Привет! Я MindBot — ваш виртуальный психолог. Я здесь, чтобы помочь вам разобраться в ваших чувствах и мыслях. О чём вы хотели бы поговорить?";
                addBotMessage(welcomeMessage);
                aiContext.push({ role: 'assistant', content: welcomeMessage });
            }, 500);
        }
    }

    function initAnimations() {
        // Анимация бота в герой-секции
        if (botAnimationContainer) {
            const botAnimation = lottie.loadAnimation({
                container: botAnimationContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'https://assets5.lottiefiles.com/packages/lf20_iv4dsx3q.json'
            });
        }
        
        // Анимация аватара в чате
        if (chatBotAvatar) {
            const avatarAnimation = lottie.loadAnimation({
                container: chatBotAvatar,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'https://assets1.lottiefiles.com/packages/lf20_5tkzkblw.json'
            });
        }
    }

    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'ru-RU';
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                sendMessage();
            };
            
            recognition.onerror = function(event) {
                console.error('Ошибка распознавания речи:', event.error);
                addBotMessage("Извините, я не смог распознать вашу речь. Попробуйте еще раз или введите текст вручную.");
            };
            
            voiceInputBtn.style.display = 'block';
        } else {
            voiceInputBtn.style.display = 'none';
        }
    }

    function initThemeToggle() {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.className = 'theme-toggle';
        themeToggle.title = 'Переключить тему';
        document.body.insertBefore(themeToggle, document.body.firstChild);
        
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        themeToggle.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        localStorage.setItem('mindbot_dark_theme', isDarkTheme);
        
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
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
            if (logoutLink) logoutLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
            if (subscriptionLink) subscriptionLink.style.display = 'block';
        } else {
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
                
                // Загрузка данных настроения из Firestore
                db.collection('users').doc(user.uid).collection('moodData').get()
                    .then(snapshot => {
                        moodData = [];
                        snapshot.forEach(doc => {
                            moodData.push(doc.data());
                        });
                        localStorage.setItem('mindbot_mood_data', JSON.stringify(moodData));
                        updateMoodChart();
                    })
                    .catch(error => {
                        console.error("Ошибка загрузки данных настроения:", error);
                    });
            } else {
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
        animateOnScroll();
    }

    function setupEventListeners() {
        startChatBtn.addEventListener('click', openChat);
        heroChatBtn.addEventListener('click', openChat);
        closeChatBtn.addEventListener('click', closeChat);
        clearChatBtn.addEventListener('click', clearChatHistory);
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        moodSelector.addEventListener('click', () => moodModal.style.display = 'flex');
        voiceInputBtn.addEventListener('click', startVoiceRecognition);
        
        watchDemoBtn.addEventListener('click', function() {
            document.querySelector('#about').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        
        addTestimonialBtn.addEventListener('click', () => testimonialModal.style.display = 'flex');
        premiumFeaturesBtn.addEventListener('click', () => showSubscribeModal('premium'));
        
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        moodOptions.forEach(option => {
            option.addEventListener('click', selectMood);
        });
        
        quickQuestions.forEach(question => {
            question.addEventListener('click', function() {
                addUserMessage(this.textContent);
            });
        });
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
        
        ratingStars.forEach(star => {
            star.addEventListener('click', setRating);
            star.addEventListener('mouseover', hoverRating);
            star.addEventListener('mouseout', resetRating);
        });
        
        emergencyBtn.addEventListener('click', showEmergencyHelp);
        emergencyBtnFooter.addEventListener('click', showEmergencyHelp);
        
        featureBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => showFeatureDetails(index));
        });
        
        freePlanBtn.addEventListener('click', () => showSubscribeModal('free'));
        premiumPlanBtn.addEventListener('click', () => showSubscribeModal('premium'));
        annualPlanBtn.addEventListener('click', () => showSubscribeModal('annual'));
        upgradePlanBtn.addEventListener('click', () => showSubscribeModal('premium'));
        upgradeProfileBtn.addEventListener('click', () => showSubscribeModal('premium'));
        
        paymentForm.addEventListener('submit', processPayment);
        closeSuccessBtn.addEventListener('click', () => {
            subscribeModal.style.display = 'none';
            paymentSuccess.style.display = 'none';
            paymentForm.style.display = 'block';
        });
        
        closeLimitBtn.addEventListener('click', () => limitModal.style.display = 'none');
        
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
        
        privacyPolicyBtn.addEventListener('click', () => privacyPolicyModal.style.display = 'flex');
        termsOfUseBtn.addEventListener('click', () => termsOfUseModal.style.display = 'flex');
        
        registerBeforePay.addEventListener('click', () => {
            registerSuggestion.style.display = 'none';
            registerModal.style.display = 'flex';
            subscribeModal.style.display = 'none';
        });
        
        continueWithoutRegister.addEventListener('click', () => {
            registerSuggestion.style.display = 'none';
            showPaymentForm(currentPaymentPlan);
        });
        
        googleLoginBtn.addEventListener('click', () => signInWithGoogle());
        facebookLoginBtn.addEventListener('click', () => signInWithFacebook());
        googleRegisterBtn.addEventListener('click', () => signInWithGoogle());
        facebookRegisterBtn.addEventListener('click', () => signInWithFacebook());
        
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
        
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '');
                if (value.length > 16) value = value.substring(0, 16);
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }
        
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
                
                chatHistory.push({
                    text: text,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                });
                saveChatHistory();
                
                // Добавляем в контекст ИИ
                aiContext.push({ role: 'assistant', content: text });
                
                // Ограничиваем размер контекста
                if (aiContext.length > AI_CONFIG.CONTEXT_LENGTH * 2) {
                    aiContext = aiContext.slice(-AI_CONFIG.CONTEXT_LENGTH * 2);
                }
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
        
        totalMessages++;
        localStorage.setItem('mindbot_total_messages', totalMessages);
        
        chatHistory.push({
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString(),
            mood: currentMood
        });
        saveChatHistory();
        
        // Добавляем в контекст ИИ
        aiContext.push({ role: 'user', content: text });
        
        // Сохраняем настроение в историю
        if (currentMood) {
            const moodEntry = {
                date: new Date().toISOString(),
                mood: currentMood
            };
            
            moodData.push(moodEntry);
            localStorage.setItem('mindbot_mood_data', JSON.stringify(moodData));
            
            // Сохраняем в Firestore для зарегистрированных пользователей
            if (isLoggedIn && currentUser) {
                db.collection('users').doc(currentUser.id).collection('moodData').add(moodEntry)
                    .catch(error => {
                        console.error("Ошибка сохранения настроения:", error);
                    });
            }
        }
        
        currentMood = null;
        moodSelector.innerHTML = '<i class="fas fa-smile"></i>';
        
        setTimeout(() => {
            generateBotResponse(text);
        }, 800);
    }

    async function generateBotResponse(userMessage) {
        try {
            // Для премиум пользователей используем ИИ API
            if (isPremium) {
                const aiResponse = await queryAI(userMessage);
                addBotMessage(aiResponse);
                return;
            }
            
            // Для бесплатных пользователей - локальная база знаний
            const response = generateLocalResponse(userMessage);
            addBotMessage(response);
        } catch (error) {
            console.error("Ошибка генерации ответа:", error);
            // Fallback на локальную базу знаний при ошибке
            const fallbackResponse = generateLocalResponse(userMessage);
            addBotMessage(fallbackResponse);
        }
    }

    async function queryAI(userMessage) {
        // Подготовка контекста для ИИ
        const messages = [
            {
                role: "system",
                content: "Ты профессиональный психолог-консультант, который использует когнитивно-поведенческую терапию. Будь эмпатичным, поддерживающим и профессиональным. Отвечай на русском языке."
            },
            ...aiContext.slice(-AI_CONFIG.CONTEXT_LENGTH), // Берем последние N сообщений для контекста
            {
                role: "user",
                content: userMessage
            }
        ];

        const response = await fetch(AI_CONFIG.API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_CONFIG.API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: messages })
        });

        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const result = await response.json();
        
        // Обработка ответа от разных API (может отличаться в зависимости от модели)
        if (result.generated_text) {
            return result.generated_text;
        } else if (result[0] && result[0].generated_text) {
            return result[0].generated_text;
        } else {
            throw new Error("Неожиданный формат ответа от API");
        }
    }

    function generateLocalResponse(userMessage) {
        const lowerMsg = userMessage.toLowerCase();
        let response = "";
        
        // Локальная база знаний
        const knowledgeBase = {
            'тревож|волн|боюсь|страх|испуг': [
                "Я понимаю, что тревога может быть очень тяжелым переживанием. Давайте попробуем технику '5-4-3-2-1': назовите 5 вещей, которые видите вокруг, 4 — которые можете потрогать, 3 — которые слышите, 2 — которые чувствуете запах, 1 — которую можете попробовать на вкус. Это поможет вам заземлиться.",
                "Тревога часто возникает из-за ощущения потери контроля. Попробуйте дыхательное упражнение: вдох на 4 счета, задержка на 4, выдох на 6. Повторите 5 раз. Это активирует парасимпатическую нервную систему."
            ],
            'груст|плохое настроение|тоск|печаль|уныни': [
                "Грусть — это естественная эмоция, которая говорит нам о том, что что-то важно для нас. Можете описать, что именно вызывает у вас эти чувства?",
                "Когда вам грустно, попробуйте технику 'Трех благодарностей': назовите три вещи, за которые вы благодарны сегодня, даже если они кажутся маленькими."
            ],
            'стресс|устал|нервнич|напряжени|перегрузк': [
                "Стресс — это реакция организма на вызовы. Попробуйте технику 'Помпурри': назовите 3 цвета вокруг вас, 3 звука и сделайте 3 глубоких вдоха. Это поможет переключить внимание.",
                "При стрессе помогает метод 'Микро-паузы': каждые 30 минут делайте 30-секундный перерыв — потянитесь, посмотрите в окно, сделайте глоток воды."
            ],
            'спасибо|благодар|хорош': [
                "Всегда рад помочь! Как еще я могу вас поддержать?",
                "Спасибо за обратную связь! Продолжаем работу?"
            ],
            'привет|здравств|добр|hi|hello': [
                "Здравствуйте! Как ваше настроение сегодня?",
                "Привет! О чем вы хотели бы поговорить?"
            ],
            'как это работает|как пользоваться|инструкция': [
                "MindBot использует когнитивно-поведенческую терапию (CBT) и другие проверенные методики. Просто опишите свою ситуацию, и я предложу техники для ее решения. Вы также можете использовать дневник настроения для отслеживания прогресса.",
                "Алгоритм работы: 1) Вы описываете ситуацию 2) Я анализирую и предлагаю техники 3) Вы применяете их и отслеживаете изменения в дневнике настроения. Премиум-функции дают доступ к расширенным методикам."
            ],
            'подписка|премиум|оплат|купить|тариф': [
                "Премиум подписка дает полный доступ ко всем функциям MindBot без ограничений. Платите ежемесячно (990₽), отмена в любой момент. Годовая подписка (7,900₽) экономит 30%.",
                "Премиум-функции включают неограниченные сессии, персональные программы терапии и подробный анализ вашего состояния. Первые 7 дней бесплатно для новых пользователей."
            ],
            'отношен|партнер|семья|друзья|любов': [
                "Конфликты в отношениях — это нормально. Попробуйте технику 'Я-высказываний': говорите о своих чувствах, а не обвиняйте. Например: 'Я чувствую... когда... потому что...'",
                "В отношениях важно уметь слушать. Попробуйте технику активного слушания: повторите слова партнера своими словами и уточните, правильно ли вы поняли."
            ],
            'сон|бессонниц|спать|усталос': [
                "Проблемы со сном часто связаны со стрессом. Попробуйте вечерний ритуал: за час до сна выключите гаджеты, примите теплый душ, выпейте травяной чай.",
                "Техника '4-7-8' для засыпания: вдох через нос на 4 счета, задержка на 7, выдох через рот на 8. Повторите 4 раза."
            ],
            'мотивац|лень|прокрастинац|лень|не хочу': [
                "Мотивация — это как мускул, ее нужно тренировать. Начните с малого — поставьте таймер на 5 минут и делайте задачу только это время. Чаще всего вы продолжите.",
                "Попробуйте метод 'Помидора': 25 минут работы, 5 минут отдыха. После 4 циклов — перерыв 15-30 минут. Это помогает сохранять концентрацию."
            ]
        };

        // Поиск подходящего ответа с учетом контекста
        let foundMatch = false;
        for (const [pattern, responses] of Object.entries(knowledgeBase)) {
            if (new RegExp(pattern).test(lowerMsg)) {
                response = responses[Math.floor(Math.random() * responses.length)];
                foundMatch = true;
                break;
            }
        }

        // Если не найдено совпадений, используем более сложный алгоритм
        if (!foundMatch) {
            const lastUserMessage = chatHistory.length > 1 ? chatHistory[chatHistory.length - 2].text.toLowerCase() : '';
            
            if (lastUserMessage.includes('тревож') || lastUserMessage.includes('волн')) {
                response = "Вы упоминали о тревоге ранее. Как изменилось ваше состояние с тех пор?";
            } 
            else if (lastUserMessage.includes('груст') || lastUserMessage.includes('плохое настроение')) {
                response = "Вы говорили о грусти. Что помогает вам улучшить настроение в таких ситуациях?";
            }
            else {
                const generalResponses = [
                    "Расскажите подробнее, что вас беспокоит?",
                    "Как это на вас влияет?",
                    "Что обычно помогает вам в таких ситуациях?",
                    "Давайте разберём это вместе. Что вы чувствуете, когда думаете об этом?",
                    "Попробуйте выразить это другими словами. Что для вас самое сложное в этой ситуации?"
                ];
                response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
            }
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
        
        return response;
    }

    function saveChatHistory() {
        localStorage.setItem('mindbot_chat_history', JSON.stringify(chatHistory));
    }

    function clearChatHistory() {
        if (confirm("Очистить всю историю чата? Это действие нельзя отменить.")) {
            chatHistory = [];
            aiContext = [];
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

    function startVoiceRecognition() {
        if (!isPremium) {
            alert("Голосовой ввод доступен только для премиум пользователей");
            return;
        }
        
        if (recognition) {
            recognition.start();
            addBotMessage("Слушаю вас...");
        } else {
            addBotMessage("Извините, голосовой ввод не поддерживается в вашем браузере.");
        }
    }

    function checkMessageLimit() {
        const savedMessagesLeft = localStorage.getItem('mindbot_messages_left');
        const lastReset = localStorage.getItem('mindbot_last_reset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
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

    function updateMoodChart() {
        if (!moodChartCanvas || moodData.length === 0) return;
        
        const moodValues = {
            happy: 4,
            neutral: 3,
            sad: 2,
            anxious: 1,
            angry: 0
        };
        
        // Группируем данные по дням
        const groupedData = {};
        moodData.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push(moodValues[entry.mood]);
        });
        
        // Рассчитываем среднее значение для каждого дня
        const labels = [];
        const dataPoints = [];
        for (const [date, values] of Object.entries(groupedData)) {
            labels.push(date);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            dataPoints.push(avg);
        }
        
        // Создаем или обновляем график
        if (moodChart) {
            moodChart.data.labels = labels;
            moodChart.data.datasets[0].data = dataPoints;
            moodChart.update();
        } else {
            moodChart = new Chart(moodChartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Уровень настроения',
                        data: dataPoints,
                        borderColor: '#7e57c2',
                        backgroundColor: 'rgba(126, 87, 194, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 0,
                            max: 4,
                            ticks: {
                                callback: function(value) {
                                    const moods = [
                                        'Злость',
                                        'Тревога',
                                        'Грусть',
                                        'Нейтральное',
                                        'Радость'
                                    ];
                                    return moods[value];
                                }
                            }
                        }
                    }
                }
            });
        }
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

    testimonialForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userName = document.getElementById('user-name').value || 'Аноним';
        const testimonialText = document.getElementById('user-testimonial').value;
        
        if (testimonialText.trim() === '') {
            alert('Пожалуйста, напишите ваш отзыв');
            return;
        }
        
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
            "Подробный анализ",
            "Голосовой чат",
            "Библиотека медитаций"
        ];
        
        const featureDescriptions = [
            "Все ваши диалоги полностью анонимны. Мы не сохраняем персональные данные и не требуем регистрации. Ваши секреты в безопасности.",
            "Когнитивно-поведенческая терапия (CBT) - золотой стандарт психотерапии. Мы используем проверенные техники для работы с тревогой, депрессией и стрессом.",
            "Отслеживайте ваше эмоциональное состояние с помощью удобного дневника. Анализируйте закономерности и прогресс в терапии.",
            "Премиум-функция: общайтесь без ограничений по количеству сообщений и времени сессий. Подробнее: вы сможете общаться столько, сколько вам нужно, без ежедневных лимитов.",
            "Премиум-функция: индивидуальные планы терапии, адаптированные под ваши потребности и цели. Подробнее: программа будет учитывать ваши уникальные запросы и прогресс.",
            "Премиум-функция: глубокий анализ вашего состояния с детальными отчетами и рекомендациями. Подробнее: вы получите статистику по вашему эмоциональному состоянию и персональные советы.",
            "Премиум-функция: общайтесь с ботом голосом, используя технологию распознавания речи. Подробнее: просто нажмите на микрофон и говорите - бот поймет вас.",
            "Премиум-функция: доступ к коллекции управляемых медитаций и техник релаксации. Подробнее: выберите подходящую медитацию по длительности и цели."
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
                title: "Премиум подписка\n",
                description: "Полный доступ ко всем функциям MindBot без ограничений. Платите ежемесячно, отмена в любой момент. 990₽ в месяц (также и в годовой подписке).\n990₽ в месяц",
                price: "",
                button: "Оформить подписку.      "
            },
            annual: {
                title: "Годовая подписка\n",
                description: "Полный доступ ко всем функциям MindBot без ограничений на 1 год со скидкой 30%. Экономия 2,970₽ по сравнению с ежемесячной оплатой.\n7,900₽ в год",
                price: "",
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
        
        document.getElementById('confirm-payment').onclick = function(e) {
            e.preventDefault();
            processPayment(plan);
        };
    }
    
    function processPayment(plan) {
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Здесь должна быть реальная обработка платежа
        // Для демонстрации просто имитируем успешный платеж
        
        setTimeout(() => {
            paymentForm.style.display = 'none';
            paymentSuccess.style.display = 'block';
            
            isPremium = true;
            currentPlan = plan;
            localStorage.setItem('mindbot_premium', 'true');
            localStorage.setItem('mindbot_plan', plan);
            
            if (plan === 'premium' && !trialUsed) {
                const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                trialEndDate = trialEnd.toISOString();
                localStorage.setItem('mindbot_trial_end', trialEndDate);
                trialUsed = true;
                localStorage.setItem('mindbot_trial_used', 'true');
            }
            
            updateUserStatus();
            updatePremiumFeaturesVisibility();
            updateProfileInfo();
            
            // Сохраняем информацию о подписке в Firestore
            if (isLoggedIn && currentUser) {
                db.collection('users').doc(currentUser.id).set({
                    subscription: {
                        plan: plan,
                        status: 'active',
                        startDate: new Date().toISOString(),
                        endDate: plan === 'annual' ? 
                            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    }
                }, { merge: true })
                .catch(error => {
                    console.error("Ошибка сохранения подписки:", error);
                });
            }
        }, 1500);
    }

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
        updateMoodChart();
    }
    
    function updateProfileInfo() {
        if (!profileModal) return;
        
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
                
                // Проверяем подписку пользователя
                db.collection('users').doc(user.uid).get()
                    .then(doc => {
                        if (doc.exists) {
                            const userData = doc.data();
                            if (userData.subscription && userData.subscription.status === 'active') {
                                isPremium = true;
                                currentPlan = userData.subscription.plan;
                                trialEndDate = userData.subscription.endDate;
                                localStorage.setItem('mindbot_premium', 'true');
                                localStorage.setItem('mindbot_plan', currentPlan);
                                localStorage.setItem('mindbot_trial_end', trialEndDate);
                            }
                        }
                        
                        alert('Вы успешно вошли в систему!');
                        loginModal.style.display = 'none';
                        checkLoginStatus();
                        updateUserStatus();
                        updateProfileInfo();
                    })
                    .catch(error => {
                        console.error("Ошибка загрузки данных пользователя:", error);
                        alert('Вы успешно вошли в систему!');
                        loginModal.style.display = 'none';
                        checkLoginStatus();
                        updateUserStatus();
                        updateProfileInfo();
                    });
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
                const user = userCredential.user;
                
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
                    
                    // Создаем запись пользователя в Firestore
                    return db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        createdAt: new Date().toISOString()
                    });
                }).then(() => {
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
                currentUser.name = name;
                currentUser.email = email;
                localStorage.setItem('mindbot_current_user', JSON.stringify(currentUser));
                
                // Обновляем данные в Firestore
                return db.collection('users').doc(user.uid).update({
                    name: name,
                    email: email
                });
            })
            .then(() => {
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
                
                // Проверяем, есть ли пользователь в Firestore
                return db.collection('users').doc(user.uid).get()
                    .then(doc => {
                        if (!doc.exists) {
                            // Создаем новую запись пользователя
                            return db.collection('users').doc(user.uid).set({
                                name: user.displayName,
                                email: user.email,
                                createdAt: new Date().toISOString()
                            });
                        }
                    });
            })
            .then(() => {
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
                
                // Проверяем, есть ли пользователь в Firestore
                return db.collection('users').doc(user.uid).get()
                    .then(doc => {
                        if (!doc.exists) {
                            // Создаем новую запись пользователя
                            return db.collection('users').doc(user.uid).set({
                                name: user.displayName,
                                email: user.email,
                                createdAt: new Date().toISOString()
                            });
                        }
                    });
            })
            .then(() => {
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

    // Инициализация Service Worker для PWA и оффлайн-режима
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // Инициализация Push-уведомлений
    function initPushNotifications() {
        if (!('Notification' in window)) {
            console.log('Этот браузер не поддерживает уведомления');
            return;
        }
        
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Разрешение на уведомления получено');
            }
        });
    }

    // Проверяем, поддерживает ли браузер PWA-функции
    if ('standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Приложение запущено в PWA-режиме');
    }
});

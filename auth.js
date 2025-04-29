// Имитация базы данных пользователей
let users = JSON.parse(localStorage.getItem('messenger_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('current_user')) || null;

// DOM элементы
const authScreen = document.getElementById('authScreen');
const messengerContainer = document.getElementById('messengerContainer');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authStatus = document.getElementById('authStatus');
const currentUsernameElement = document.getElementById('currentUsername');

// Переключение между вкладками входа и регистрации
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authStatus.textContent = '';
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authStatus.textContent = '';
});

// Обработка регистрации
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    // Валидация
    if (!username.startsWith('@')) {
        showAuthStatus('Имя пользователя должно начинаться с @', 'error');
        return;
    }
    
    if (username.length < 3) {
        showAuthStatus('Имя пользователя должно быть не менее 3 символов', 'error');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        showAuthStatus('Это имя пользователя уже занято', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showAuthStatus('Пользователь с таким email уже зарегистрирован', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthStatus('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    // Регистрация пользователя
    const newUser = {
        id: generateId(),
        username,
        email,
        password: hashPassword(password),
        contacts: [],
        groups: []
    };
    
    users.push(newUser);
    saveUsers();
    
    // Автоматический вход после регистрации
    currentUser = newUser;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    
    showAuthStatus('Регистрация прошла успешно!', 'success');
    setTimeout(() => {
        authScreen.classList.add('hidden');
        messengerContainer.classList.remove('hidden');
        currentUsernameElement.textContent = currentUser.username;
        loadChats();
    }, 1000);
});

// Обработка входа
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== hashPassword(password)) {
        showAuthStatus('Неверный email или пароль', 'error');
        return;
    }
    
    currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    
    showAuthStatus('Вход выполнен успешно!', 'success');
    setTimeout(() => {
        authScreen.classList.add('hidden');
        messengerContainer.classList.remove('hidden');
        currentUsernameElement.textContent = currentUser.username;
        loadChats();
    }, 1000);
});

// Вспомогательные функции
function showAuthStatus(message, type) {
    authStatus.textContent = message;
    authStatus.className = 'auth-status ' + type;
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function hashPassword(password) {
    // В реальном приложении используйте более надежное хеширование (например, bcrypt)
    return password.split('').reverse().join('') + password.length;
}

function saveUsers() {
    localStorage.setItem('messenger_users', JSON.stringify(users));
}

// Проверка авторизации при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        authScreen.classList.add('hidden');
        messengerContainer.classList.remove('hidden');
        currentUsernameElement.textContent = currentUser.username;
        loadChats();
    }
});

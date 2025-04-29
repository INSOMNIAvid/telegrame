// Улучшенная аутентификация с JWT и WebSocket

const authScreen = document.getElementById('authScreen');
const messengerContainer = document.getElementById('messengerContainer');
const currentUsernameElement = document.getElementById('currentUsername');
let socket = null;
let currentUser = null;

// Инициализация WebSocket соединения
function initWebSocket(token) {
    if (socket) {
        socket.close();
    }
    
    socket = new WebSocket(`wss://${window.location.host}/ws`);
    
    socket.onopen = () => {
        console.log('WebSocket connected');
        // Аутентификация в WebSocket
        socket.send(JSON.stringify({
            type: 'auth',
            token
        }));
    };
    
    socket.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => initWebSocket(token), 5000); // Переподключение
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
}

// Обработка сообщений WebSocket
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'private_message':
            handleIncomingMessage(data);
            break;
        case 'group_message':
            handleIncomingGroupMessage(data);
            break;
        case 'typing':
            showTypingIndicator(data);
            break;
        case 'call':
            handleIncomingCall(data);
            break;
        case 'call_accepted':
            handleCallAccepted(data);
            break;
        case 'call_rejected':
            handleCallRejected(data);
            break;
        case 'call_ended':
            handleCallEnded(data);
            break;
        default:
            console.log('Unknown WebSocket message:', data);
    }
}

// Регистрация пользователя
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await axios.post('/api/auth/register', {
            username,
            email,
            password
        });
        
        showAuthStatus('Регистрация прошла успешно!', 'success');
        await loginUser(email, password);
    } catch (error) {
        showAuthStatus(error.response?.data?.message || 'Ошибка регистрации', 'error');
    }
});

// Вход пользователя
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    await loginUser(email, password);
});

async function loginUser(email, password) {
    try {
        const response = await axios.post('/api/auth/login', {
            email,
            password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        currentUser = user;
        
        // Инициализация WebSocket
        initWebSocket(token);
        
        showAuthStatus('Вход выполнен успешно!', 'success');
        setTimeout(() => {
            authScreen.classList.add('hidden');
            messengerContainer.classList.remove('hidden');
            currentUsernameElement.textContent = currentUser.username;
            loadChats();
            loadUserContacts();
        }, 1000);
    } catch (error) {
        showAuthStatus(error.response?.data?.message || 'Ошибка входа', 'error');
    }
}

// Проверка авторизации при загрузке
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            const response = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            currentUser = response.data;
            initWebSocket(token);
            
            authScreen.classList.add('hidden');
            messengerContainer.classList.remove('hidden');
            currentUsernameElement.textContent = currentUser.username;
            loadChats();
            loadUserContacts();
        } catch (error) {
            localStorage.removeItem('auth_token');
        }
    }
});

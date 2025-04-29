// Конфигурация
const SERVER_URL = 'http://localhost:3000';
let socket = null;
let currentUser = null;
let currentChat = 'general';
let contacts = [];

// DOM элементы
const authContainer = document.getElementById('auth-container');
const messengerContainer = document.getElementById('messenger-container');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const currentUsernameSpan = document.getElementById('current-username');
const logoutButton = document.getElementById('logout-button');
const contactsList = document.getElementById('contacts-list');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const sendFileButton = document.getElementById('send-file-button');
const fileInput = document.getElementById('file-input');
const currentChatName = document.getElementById('current-chat-name');
const newGroupNameInput = document.getElementById('new-group-name');
const createGroupButton = document.getElementById('create-group-button');

// Инициализация приложения
function init() {
    setupEventListeners();
}

// Настройка обработчиков событий
function setupEventListeners() {
    loginButton.addEventListener('click', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    sendFileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    createGroupButton.addEventListener('click', createGroup);
}

// Обработка входа пользователя
async function handleLogin() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Пожалуйста, введите имя пользователя');
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Ошибка входа');
        }

        const data = await response.json();
        currentUser = data.user;
        setupSocketConnection();
        
        // Обновляем UI
        currentUsernameSpan.textContent = currentUser.username;
        authContainer.style.display = 'none';
        messengerContainer.style.display = 'flex';
        
        // Загружаем контакты и сообщения
        loadContacts();
        loadMessages(currentChat);
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Не удалось войти. Пожалуйста, попробуйте снова.');
    }
}

// Настройка WebSocket соединения
function setupSocketConnection() {
    socket = new WebSocket(`ws://localhost:3000/ws?userId=${currentUser.id}`);

    socket.onopen = () => {
        console.log('WebSocket соединение установлено');
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleIncomingMessage(message);
    };

    socket.onclose = () => {
        console.log('WebSocket соединение закрыто');
    };

    socket.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
    };
}

// Обработка входящих сообщений
function handleIncomingMessage(message) {
    if (message.type === 'new_message' && message.chatId === currentChat) {
        addMessageToChat(message, false);
    } else if (message.type === 'user_online') {
        updateContactStatus(message.userId, true);
    } else if (message.type === 'user_offline') {
        updateContactStatus(message.userId, false);
    } else if (message.type === 'new_contact') {
        addNewContact(message.user);
    } else if (message.type === 'new_group') {
        addNewGroup(message.group);
    }
}

// Загрузка списка контактов
async function loadContacts() {
    try {
        const response = await fetch(`${SERVER_URL}/contacts`);
        if (!response.ok) throw new Error('Ошибка загрузки контактов');
        
        contacts = await response.json();
        renderContacts();
    } catch (error) {
        console.error('Ошибка загрузки контактов:', error);
    }
}

// Отображение списка контактов
function renderContacts() {
    contactsList.innerHTML = '';
    
    // Общий чат
    const generalChatItem = document.createElement('li');
    generalChatItem.textContent = 'Общий чат';
    generalChatItem.className = currentChat === 'general' ? 'active' : '';
    generalChatItem.addEventListener('click', () => switchChat('general'));
    contactsList.appendChild(generalChatItem);
    
    // Пользователи
    contacts.forEach(contact => {
        const contactItem = document.createElement('li');
        contactItem.innerHTML = `
            <span>${contact.username}</span>
            <span class="status-indicator ${contact.online ? 'online' : 'offline'}"></span>
        `;
        contactItem.className = currentChat === contact.id ? 'active' : '';
        contactItem.addEventListener('click', () => switchChat(contact.id));
        contactsList.appendChild(contactItem);
    });
}

// Переключение между чатами
function switchChat(chatId) {
    currentChat = chatId;
    chatMessages.innerHTML = '';
    
    // Обновляем активный элемент в списке контактов
    document.querySelectorAll('#contacts-list li').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = [...document.querySelectorAll('#contacts-list li')]
        .find(item => {
            if (chatId === 'general') return item.textContent === 'Общий чат';
            return item.textContent.includes(contacts.find(c => c.id === chatId)?.username);
        });
    
    if (activeItem) activeItem.classList.add('active');
    
    // Обновляем название текущего чата
    if (chatId === 'general') {
        currentChatName.textContent = 'Общий чат';
    } else {
        const contact = contacts.find(c => c.id === chatId);
        if (contact) {
            currentChatName.textContent = contact.username;
        }
    }
    
    loadMessages(chatId);
}

// Загрузка сообщений для выбранного чата
async function loadMessages(chatId) {
    try {
        const response = await fetch(`${SERVER_URL}/messages?chatId=${chatId}`);
        if (!response.ok) throw new Error('Ошибка загрузки сообщений');
        
        const messages = await response.json();
        messages.forEach(message => {
            addMessageToChat(message, message.senderId === currentUser.id);
        });
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

// Добавление сообщения в чат
function addMessageToChat(message, isSent) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const messageInfo = document.createElement('div');
    messageInfo.className = 'message-info';
    
    const senderName = document.createElement('span');
    senderName.className = 'sender-name';
    senderName.textContent = isSent ? 'Вы' : message.senderName;
    
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date(message.timestamp).toLocaleTimeString();
    
    messageInfo.appendChild(senderName);
    messageInfo.appendChild(messageTime);
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (message.type === 'text') {
        messageContent.textContent = message.content;
    } else if (message.type === 'file') {
        const fileLink = document.createElement('a');
        fileLink.href = `${SERVER_URL}/uploads/${message.content}`;
        fileLink.className = 'file-message';
        fileLink.textContent = message.fileName || 'Файл';
        fileLink.target = '_blank';
        messageContent.appendChild(fileLink);
    }
    
    messageDiv.appendChild(messageInfo);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Отправка сообщения
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    const message = {
        chatId: currentChat,
        senderId: currentUser.id,
        senderName: currentUser.username,
        content,
        type: 'text',
        timestamp: new Date().toISOString()
    };
    
    try {
        // Отправляем через WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'send_message',
                ...message
            }));
        }
        
        // Добавляем сообщение в чат
        addMessageToChat(message, true);
        messageInput.value = '';
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
    }
}

// Обработка загрузки файла
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', currentChat);
    formData.append('senderId', currentUser.id);
    formData.append('senderName', currentUser.username);
    
    try {
        const response = await fetch(`${SERVER_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки файла');
        
        const fileMessage = await response.json();
        
        // Отправляем информацию о файле через WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'send_message',
                ...fileMessage
            }));
        }
        
        // Добавляем сообщение в чат
        addMessageToChat(fileMessage, true);
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        alert('Не удалось загрузить файл');
    } finally {
        fileInput.value = '';
    }
}

// Создание новой группы
async function createGroup() {
    const groupName = newGroupNameInput.value.trim();
    if (!groupName) {
        alert('Пожалуйста, введите название группы');
        return;
    }
    
    try {
        const response = await fetch(`${SERVER_URL}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: groupName,
                creatorId: currentUser.id
            })
        });
        
        if (!response.ok) throw new Error('Ошибка создания группы');
        
        const group = await response.json();
        newGroupNameInput.value = '';
        
        // Добавляем группу в список контактов
        addNewGroup(group);
    } catch (error) {
        console.error('Ошибка создания группы:', error);
        alert('Не удалось создать группу');
    }
}

// Добавление новой группы в список
function addNewGroup(group) {
    contacts.push({
        id: group.id,
        username: group.name,
        online: true,
        isGroup: true
    });
    renderContacts();
}

// Добавление нового контакта
function addNewContact(user) {
    if (!contacts.some(c => c.id === user.id)) {
        contacts.push(user);
        renderContacts();
    }
}

// Обновление статуса контакта
function updateContactStatus(userId, isOnline) {
    const contact = contacts.find(c => c.id === userId);
    if (contact) {
        contact.online = isOnline;
        renderContacts();
    }
}

// Выход пользователя
function handleLogout() {
    if (socket) {
        socket.close();
    }
    
    currentUser = null;
    messengerContainer.style.display = 'none';
    authContainer.style.display = 'block';
    usernameInput.value = '';
    chatMessages.innerHTML = '';
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

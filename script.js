// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
    
    // Инициализация WebSocket
    initWebSocket(token);
    
    // Загрузка данных пользователя
    loadUserData();
    
    // Загрузка чатов
    loadChats();
    
    // Инициализация обработчиков событий
    initEventHandlers();
});

// WebSocket соединение
let socket = null;
let currentUser = null;
let currentChat = null;

function initWebSocket(token) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    socket = new WebSocket(`${wsProtocol}${window.location.host}/ws`);
    
    socket.onopen = () => {
        console.log('WebSocket connected');
        socket.send(JSON.stringify({
            type: 'auth',
            token
        }));
    };
    
    socket.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(() => initWebSocket(token), 5000);
    };
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'message':
            handleIncomingMessage(data);
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
        case 'status_change':
            updateUserStatus(data.userId, data.status);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        
        currentUser = response.data;
        updateUI();
    } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('auth_token');
        window.location.href = '/auth.html';
    }
}

// Загрузка чатов
async function loadChats() {
    try {
        const response = await axios.get('/api/chats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        
        renderChatList(response.data);
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

// Отрисовка списка чатов
function renderChatList(chats) {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const isGroup = chat.isGroup;
        const chatName = isGroup ? chat.name : getOtherUser(chat.participants).username;
        const lastMessage = chat.lastMessage ? chat.lastMessage.content : 'Нет сообщений';
        const unreadCount = chat.unreadCount > 0 ? `<span class="unread-count">${chat.unreadCount}</span>` : '';
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat._id;
        chatItem.innerHTML = `
            <div class="chat-avatar">
                <img src="${isGroup ? 'https://via.placeholder.com/48/0088cc/ffffff?text=G' : 'https://via.placeholder.com/48'}" alt="${chatName}">
                ${!isGroup ? `<div class="online-status ${getOtherUser(chat.participants).online ? 'online' : ''}"></div>` : ''}
            </div>
            <div class="chat-info">
                <div class="chat-name">
                    <span>${chatName}</span>
                    <span class="last-message-time">${formatTime(chat.updatedAt)}</span>
                </div>
                <div class="last-message">
                    <span>${lastMessage}</span>
                    ${unreadCount}
                </div>
            </div>
        `;
        
        chatItem.addEventListener('click', () => openChat(chat._id, isGroup));
        chatList.appendChild(chatItem);
    });
}

// Открытие чата
async function openChat(chatId, isGroup) {
    try {
        // Снимаем выделение со всех чатов
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Выделяем текущий чат
        document.querySelector(`.chat-item[data-chat-id="${chatId}"]`).classList.add('active');
        
        currentChat = { id: chatId, isGroup };
        
        // Загружаем сообщения
        const response = await axios.get(`/api/chats/${chatId}/messages`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        
        renderMessages(response.data.messages);
        
        // Обновляем заголовок чата
        updateChatHeader(response.data.chat);
    } catch (error) {
        console.error('Error opening chat:', error);
    }
}

// Отрисовка сообщений
function renderMessages(messages) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        const isOutgoing = message.sender._id === currentUser._id;
        const messageElement = createMessageElement(message, isOutgoing);
        messagesContainer.appendChild(messageElement);
    });
    
    // Прокрутка вниз
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(message, isOutgoing) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
    
    let content = '';
    if (message.content) {
        content = `<div class="message-text">${message.content}</div>`;
    } else if (message.file) {
        content = `
            <div class="message-file">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(message.file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${message.file.name}</div>
                    <div class="file-size">${formatFileSize(message.file.size)}</div>
                </div>
                <button class="download-btn" data-file-id="${message.file._id}">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        ${!isOutgoing && currentChat.isGroup ? 
            `<div class="message-sender">${message.sender.username}</div>` : ''}
        ${content}
        <div class="message-time">
            ${formatTime(message.createdAt)}
            <i class="fas ${message.read ? 'fa-check-double' : 'fa-check'}"></i>
        </div>
    `;
    
    return messageElement;
}

// Отправка сообщения
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files[0];
    
    if (!content && !file) return;
    
    try {
        let messageData = {
            chatId: currentChat.id,
            isGroup: currentChat.isGroup
        };
        
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatId', currentChat.id);
            formData.append('isGroup', currentChat.isGroup);
            
            const response = await axios.post('/api/messages/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            messageData.file = response.data.fileId;
        } else {
            messageData.content = content;
        }
        
        socket.send(JSON.stringify({
            type: 'message',
            ...messageData
        }));
        
        messageInput.value = '';
        if (fileInput) fileInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Ошибка при отправке сообщения', 'error');
    }
}

// Инициализация обработчиков событий
function initEventHandlers() {
    // Отправка сообщения
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Индикатор набора сообщения
    document.getElementById('messageInput').addEventListener('input', () => {
        if (currentChat) {
            socket.send(JSON.stringify({
                type: 'typing',
                chatId: currentChat.id,
                isGroup: currentChat.isGroup
            }));
        }
    });
    
    // Прикрепление файлов
    document.querySelector('.attachment-btn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                sendMessage();
            }
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    });
    
    // Звонки
    document.querySelector('.fa-phone-alt').addEventListener('click', () => {
        if (currentChat && !currentChat.isGroup) {
            initCall(currentChat.id, false);
        }
    });
    
    document.querySelector('.fa-video').addEventListener('click', () => {
        if (currentChat && !currentChat.isGroup) {
            initCall(currentChat.id, true);
        }
    });
    
    // Новый чат
    document.querySelector('.new-chat-btn').addEventListener('click', () => {
        document.getElementById('newChatModal').classList.add('active');
        loadUsersForNewChat();
    });
    
    // Закрытие модальных окон
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('newChatModal').classList.remove('active');
    });
}

// Вспомогательные функции
function getOtherUser(participants) {
    return participants.find(user => user._id !== currentUser._id);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'fa-image';
    if (fileType.startsWith('video/')) return 'fa-video';
    if (fileType.startsWith('audio/')) return 'fa-music';
    if (fileType === 'application/pdf') return 'fa-file-pdf';
    return 'fa-file';
}

function showNotification(message, type) {
    const container = document.getElementById('notificationsContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Обновление UI
function updateUI() {
    if (currentUser) {
        document.querySelectorAll('.user-avatar').forEach(el => {
            el.textContent = currentUser.username.charAt(0).toUpperCase();
        });
    }
}

function updateChatHeader(chat) {
    const chatTitle = document.getElementById('chatTitle');
    const chatStatus = document.getElementById('chatStatus');
    
    if (chat.isGroup) {
        chatTitle.textContent = chat.name;
        chatStatus.textContent = `${chat.participants.length} участников`;
    } else {
        const otherUser = getOtherUser(chat.participants);
        chatTitle.textContent = otherUser.username;
        chatStatus.textContent = otherUser.online ? 'онлайн' : `был(а) ${formatLastSeen(otherUser.lastSeen)}`;
    }
}

function formatLastSeen(timestamp) {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diff = now - lastSeen;
    
    if (diff < 60 * 1000) return 'только что';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} мин. назад`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} ч. назад`;
    return lastSeen.toLocaleDateString();
}

// WebRTC звонки
async function initCall(chatId, isVideo) {
    try {
        // Реализация WebRTC звонков
        showNotification('Инициализация звонка...', 'info');
        
        // В реальном приложении здесь будет код инициализации WebRTC
        // с использованием STUN/TURN серверов и обработкой ICE кандидатов
        
        socket.send(JSON.stringify({
            type: 'call',
            chatId,
            isVideo,
            offer: {} // Здесь будет SDP offer
        }));
        
        showCallModal(chatId, true, isVideo);
    } catch (error) {
        console.error('Error initializing call:', error);
        showNotification('Ошибка при инициализации звонка', 'error');
    }
}

function showCallModal(chatId, isCaller, isVideo) {
    const callModal = document.getElementById('callModal');
    callModal.innerHTML = `
        <div class="modal-content call-modal">
            <div class="call-info">
                <div class="call-avatar" id="callAvatar"></div>
                <div class="call-name" id="callName"></div>
                <div class="call-status" id="callStatus">${isCaller ? 'Вызов...' : 'Входящий вызов'}</div>
            </div>
            <div class="call-controls">
                ${!isCaller ? `
                    <button class="call-btn accept-call" id="acceptCallBtn">
                        <i class="fas fa-phone"></i>
                    </button>
                ` : ''}
                <button class="call-btn reject-call" id="rejectCallBtn">
                    <i class="fas fa-phone-slash"></i>
                </button>
                <button class="call-btn end-call hidden" id="endCallBtn">
                    <i class="fas fa-phone-slash"></i>
                </button>
            </div>
            ${isVideo ? `
                <div class="video-container">
                    <video id="localVideo" autoplay muted></video>
                    <video id="remoteVideo" autoplay></video>
                </div>
            ` : ''}
        </div>
    `;
    
    callModal.classList.add('active');
    
    if (!isCaller) {
        document.getElementById('acceptCallBtn').addEventListener('click', acceptCall);
    }
    document.getElementById('rejectCallBtn').addEventListener('click', endCall);
    document.getElementById('endCallBtn').addEventListener('click', endCall);
    
    // Обновляем информацию о звонке
    const chat = getChatById(chatId);
    const otherUser = getOtherUser(chat.participants);
    
    document.getElementById('callName').textContent = otherUser.username;
    document.getElementById('callAvatar').innerHTML = otherUser.username.charAt(0).toUpperCase();
}

function acceptCall() {
    // Реализация принятия звонка
    showNotification('Звонок принят', 'success');
    
    document.getElementById('acceptCallBtn').classList.add('hidden');
    document.getElementById('rejectCallBtn').classList.add('hidden');
    document.getElementById('endCallBtn').classList.remove('hidden');
    document.getElementById('callStatus').textContent = 'Разговор';
    
    // Отправляем ответ на звонок через WebSocket
    socket.send(JSON.stringify({
        type: 'call_accepted',
        chatId: currentCall.chatId,
        answer: {} // Здесь будет SDP answer
    }));
}

function endCall() {
    // Реализация завершения звонка
    showNotification('Звонок завершен', 'info');
    
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    document.getElementById('callModal').classList.remove('active');
    currentCall = null;
    
    // Отправляем уведомление о завершении звонка
    if (currentCall) {
        socket.send(JSON.stringify({
            type: 'call_ended',
            chatId: currentCall.chatId
        }));
    }
}

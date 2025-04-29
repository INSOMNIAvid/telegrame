// Имитация базы данных чатов и сообщений
let chats = JSON.parse(localStorage.getItem('messenger_chats')) || [];
let groups = JSON.parse(localStorage.getItem('messenger_groups')) || [];
let currentChat = null;

// DOM элементы
const chatsList = document.getElementById('chatsList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatTitle = document.getElementById('chatTitle');
const newChatBtn = document.getElementById('newChatBtn');
const newChatModal = document.getElementById('newChatModal');
const closeNewChatModal = document.getElementById('closeNewChatModal');
const searchUserInput = document.getElementById('searchUserInput');
const usersList = document.getElementById('usersList');
const createGroupBtn = document.getElementById('createGroupBtn');
const createGroupModal = document.getElementById('createGroupModal');
const closeCreateGroupModal = document.getElementById('closeCreateGroupModal');
const groupNameInput = document.getElementById('groupNameInput');
const groupMembersInput = document.getElementById('groupMembersInput');
const selectedMembers = document.getElementById('selectedMembers');
const availableUsersForGroup = document.getElementById('availableUsersForGroup');
const confirmCreateGroupBtn = document.getElementById('confirmCreateGroupBtn');

// Загрузка чатов пользователя
function loadChats() {
    if (!currentUser) return;
    
    chatsList.innerHTML = '';
    
    // Личные чаты
    const personalChats = chats.filter(chat => 
        chat.participants.includes(currentUser.id) && !chat.isGroup
    );
    
    // Групповые чаты
    const groupChats = groups.filter(group => 
        group.members.includes(currentUser.id)
    );
    
    // Отображаем чаты
    personalChats.forEach(chat => {
        const otherUserId = chat.participants.find(id => id !== currentUser.id);
        const otherUser = users.find(u => u.id === otherUserId);
        
        if (!otherUser) return;
        
        const lastMessage = chat.messages.length > 0 ? 
            decryptMessage(chat.messages[chat.messages.length - 1].content, currentUser.password) : 
            'Нет сообщений';
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        chatItem.innerHTML = `
            <div class="chat-avatar">${otherUser.username.charAt(1).toUpperCase()}</div>
            <div class="chat-info">
                <div class="chat-name">${otherUser.username}</div>
                <div class="last-message">${lastMessage}</div>
            </div>
            <div class="chat-time">${chat.messages.length > 0 ? formatTime(chat.messages[chat.messages.length - 1].timestamp) : ''}</div>
        `;
        
        chatItem.addEventListener('click', () => openChat(chat.id, false));
        chatsList.appendChild(chatItem);
    });
    
    // Отображаем группы
    groupChats.forEach(group => {
        const lastMessage = group.messages.length > 0 ? 
            decryptMessage(group.messages[group.messages.length - 1].content, currentUser.password) : 
            'Нет сообщений';
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = group.id;
        chatItem.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-users"></i></div>
            <div class="chat-info">
                <div class="chat-name">${group.name}</div>
                <div class="last-message">${lastMessage}</div>
            </div>
            <div class="chat-time">${group.messages.length > 0 ? formatTime(group.messages[group.messages.length - 1].timestamp) : ''}</div>
        `;
        
        chatItem.addEventListener('click', () => openChat(group.id, true));
        chatsList.appendChild(chatItem);
    });
}

// Открытие чата
function openChat(chatId, isGroup) {
    // Снимаем выделение со всех чатов
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Выделяем текущий чат
    document.querySelector(`.chat-item[data-chat-id="${chatId}"]`).classList.add('active');
    
    currentChat = { id: chatId, isGroup };
    
    if (isGroup) {
        const group = groups.find(g => g.id === chatId);
        if (!group) return;
        
        chatTitle.textContent = group.name;
        displayMessages(group.messages);
    } else {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        
        const otherUserId = chat.participants.find(id => id !== currentUser.id);
        const otherUser = users.find(u => u.id === otherUserId);
        
        if (!otherUser) return;
        
        chatTitle.textContent = otherUser.username;
        displayMessages(chat.messages);
    }
}

// Отображение сообщений
function displayMessages(messages) {
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const isOutgoing = msg.senderId === currentUser.id;
        const decryptedContent = decryptMessage(msg.content, currentUser.password);
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
        
        if (!isOutgoing && currentChat.isGroup) {
            const sender = users.find(u => u.id === msg.senderId);
            messageElement.innerHTML = `
                <div class="message-sender">${sender ? sender.username : 'Unknown'}</div>
                <div class="message-text">${decryptedContent}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-text">${decryptedContent}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Прокрутка вниз
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChat) return;
    
    const encryptedContent = encryptMessage(content, currentUser.password);
    const newMessage = {
        id: generateId(),
        senderId: currentUser.id,
        content: encryptedContent,
        timestamp: Date.now()
    };
    
    if (currentChat.isGroup) {
        const groupIndex = groups.findIndex(g => g.id === currentChat.id);
        if (groupIndex !== -1) {
            groups[groupIndex].messages.push(newMessage);
            saveGroups();
        }
    } else {
        const chatIndex = chats.findIndex(c => c.id === currentChat.id);
        if (chatIndex !== -1) {
            chats[chatIndex].messages.push(newMessage);
            saveChats();
        }
    }
    
    messageInput.value = '';
    loadChats(); // Обновляем список чатов (последнее сообщение)
    displayMessages(
        currentChat.isGroup ? 
        groups.find(g => g.id === currentChat.id).messages : 
        chats.find(c => c.id === currentChat.id).messages
    );
}

// Создание нового личного чата
function createNewChat(userId) {
    const existingChat = chats.find(chat => 
        chat.participants.includes(currentUser.id) && 
        chat.participants.includes(userId) && 
        !chat.isGroup
    );
    
    if (existingChat) {
        openChat(existingChat.id, false);
        newChatModal.classList.add('hidden');
        return;
    }
    
    const newChat = {
        id: generateId(),
        participants: [currentUser.id, userId],
        isGroup: false,
        messages: []
    };
    
    chats.push(newChat);
    saveChats();
    
    // Добавляем в контакты, если еще нет
    if (!currentUser.contacts.includes(userId)) {
        currentUser.contacts.push(userId);
        saveUsers();
        localStorage.setItem('current_user', JSON.stringify(currentUser));
    }
    
    openChat(newChat.id, false);
    newChatModal.classList.add('hidden');
}

// Создание новой группы
function createNewGroup(name, members) {
    const groupKey = generateGroupKey();
    const encryptedKeys = {};
    
    // Шифруем групповой ключ для каждого участника
    members.forEach(memberId => {
        const member = users.find(u => u.id === memberId);
        if (member) {
            // В реальном приложении используйте публичный ключ участника
            encryptedKeys[memberId] = encryptGroupKeyForMember(groupKey, member.password);
        }
    });
    
    const newGroup = {
        id: generateId(),
        name,
        creatorId: currentUser.id,
        members,
        encryptedKeys,
        messages: [],
        createdAt: Date.now()
    };
    
    groups.push(newGroup);
    saveGroups();
    
    // Добавляем группу в список групп каждого участника
    members.forEach(memberId => {
        const user = users.find(u => u.id === memberId);
        if (user) {
            user.groups.push(newGroup.id);
        }
    });
    
    saveUsers();
    if (currentUser) {
        localStorage.setItem('current_user', JSON.stringify(currentUser));
    }
    
    loadChats();
    openChat(newGroup.id, true);
    createGroupModal.classList.add('hidden');
}

// Поиск пользователей для нового чата
function searchUsers(query) {
    usersList.innerHTML = '';
    
    if (!query) return;
    
    const filteredUsers = users.filter(user => 
        user.id !== currentUser.id && 
        user.username.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = '<div class="no-users">Пользователи не найдены</div>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-avatar">${user.username.charAt(1).toUpperCase()}</div>
            <div class="user-name">${user.username}</div>
        `;
        
        userItem.addEventListener('click', () => createNewChat(user.id));
        usersList.appendChild(userItem);
    });
}

// Вспомогательные функции
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function saveChats() {
    localStorage.setItem('messenger_chats', JSON.stringify(chats));
}

function saveGroups() {
    localStorage.setItem('messenger_groups', JSON.stringify(groups));
}

// Обработчики событий
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

newChatBtn.addEventListener('click', () => {
    newChatModal.classList.remove('hidden');
    searchUserInput.value = '';
    usersList.innerHTML = '<div class="no-users">Введите имя пользователя для поиска</div>';
});

closeNewChatModal.addEventListener('click', () => {
    newChatModal.classList.add('hidden');
});

searchUserInput.addEventListener('input', () => {
    searchUsers(searchUserInput.value.trim());
});

createGroupBtn.addEventListener('click', () => {
    createGroupModal.classList.remove('hidden');
    groupNameInput.value = '';
    groupMembersInput.value = '';
    selectedMembers.innerHTML = '';
    availableUsersForGroup.innerHTML = '';
    
    // Показываем доступных пользователей (исключая текущего)
    users.filter(u => u.id !== currentUser.id).forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-avatar">${user.username.charAt(1).toUpperCase()}</div>
            <div class="user-name">${user.username}</div>
            <button class="add-member-btn" data-user-id="${user.id}">Добавить</button>
        `;
        
        userItem.querySelector('.add-member-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addMemberToGroup(user.id, user.username);
        });
        
        availableUsersForGroup.appendChild(userItem);
    });
});

closeCreateGroupModal.addEventListener('click', () => {
    createGroupModal.classList.add('hidden');
});

confirmCreateGroupBtn.addEventListener('click', () => {
    const name = groupNameInput.value.trim();
    if (!name) {
        alert('Введите название группы');
        return;
    }
    
    const memberIds = Array.from(selectedMembers.children).map(el => el.dataset.userId);
    if (memberIds.length === 0) {
        alert('Добавьте хотя бы одного участника');
        return;
    }
    
    // Добавляем текущего пользователя как участника
    const allMembers = [...memberIds, currentUser.id];
    createNewGroup(name, allMembers);
});

function addMemberToGroup(userId, username) {
    if (document.querySelector(`.selected-member[data-user-id="${userId}"]`)) return;
    
    const memberElement = document.createElement('div');
    memberElement.className = 'selected-member';
    memberElement.dataset.userId = userId;
    memberElement.innerHTML = `
        ${username}
        <button class="remove-member">&times;</button>
    `;
    
    memberElement.querySelector('.remove-member').addEventListener('click', () => {
        memberElement.remove();
    });
    
    selectedMembers.appendChild(memberElement);
}

// Инициализация при загрузке
if (currentUser) {
    loadChats();
}

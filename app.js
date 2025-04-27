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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const userAvatar = document.getElementById('user-avatar');
const chatListItems = document.getElementById('chat-list-items');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatTitle = document.getElementById('chat-title');
const noChatSelected = document.getElementById('no-chat-selected');
const chatArea = document.getElementById('chat-area');
const newGroupBtn = document.getElementById('new-group-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const groupCreationModal = document.getElementById('group-creation-modal');
const groupNameInput = document.getElementById('group-name');
const userListForGroup = document.getElementById('user-list-for-group');
const createGroupBtn = document.getElementById('create-group-btn');
const chatInfoModal = document.getElementById('chat-info-modal');
const chatInfoContent = document.getElementById('chat-info-content');
const chatInfoBtn = document.getElementById('chat-info-btn');
const leaveChatBtn = document.getElementById('leave-chat-btn');
const closeModals = document.querySelectorAll('.close-modal');
const searchInput = document.getElementById('search-input');

// App State
let currentUser = null;
let currentChat = null;
let chats = [];
let users = [];
let selectedUsersForGroup = [];

// Initialize the app
function init() {
    setupEventListeners();
    checkAuthState();
}

// Set up event listeners
function setupEventListeners() {
    // Auth events
    showRegister.addEventListener('click', showRegisterForm);
    showLogin.addEventListener('click', showLoginForm);
    loginBtn.addEventListener('click', loginUser);
    registerBtn.addEventListener('click', registerUser);
    logoutBtn.addEventListener('click', logoutUser);
    
    // Chat events
    newGroupBtn.addEventListener('click', showGroupCreationModal);
    newChatBtn.addEventListener('click', startNewChat);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Modal events
    createGroupBtn.addEventListener('click', createGroup);
    chatInfoBtn.addEventListener('click', showChatInfo);
    leaveChatBtn.addEventListener('click', leaveCurrentChat);
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Search
    searchInput.addEventListener('input', searchChats);
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Check auth state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserData();
            authContainer.style.display = 'none';
            appContainer.style.display = 'flex';
        } else {
            currentUser = null;
            authContainer.style.display = 'flex';
            appContainer.style.display = 'none';
        }
    });
}

// Load user data
function loadUserData() {
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                usernameDisplay.textContent = userData.username;
                
                // Load chats
                loadChats();
                
                // Load users for new chat/group
                loadUsers();
            }
        })
        .catch(error => {
            console.error("Error loading user data:", error);
        });
}

// Load user's chats
function loadChats() {
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTimestamp', 'desc')
        .onSnapshot(snapshot => {
            chats = [];
            snapshot.forEach(doc => {
                chats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderChatList();
        });
}

// Load all users (except current user)
function loadUsers() {
    db.collection('users')
        .where('uid', '!=', currentUser.uid)
        .get()
        .then(snapshot => {
            users = [];
            snapshot.forEach(doc => {
                users.push(doc.data());
            });
        })
        .catch(error => {
            console.error("Error loading users:", error);
        });
}

// Render chat list
function renderChatList() {
    chatListItems.innerHTML = '';
    
    if (chats.length === 0) {
        chatListItems.innerHTML = '<li class="no-chats">У вас пока нет чатов</li>';
        return;
    }
    
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.dataset.chatId = chat.id;
        
        // Determine chat title and avatar
        let title, avatar;
        if (chat.isGroup) {
            title = chat.name;
            avatar = 'https://via.placeholder.com/50/3498db/ffffff?text=G';
        } else {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = users.find(u => u.uid === otherUserId);
            if (otherUser) {
                title = otherUser.username;
                avatar = otherUser.avatar || 'https://via.placeholder.com/50';
            } else {
                title = 'Unknown User';
                avatar = 'https://via.placeholder.com/50';
            }
        }
        
        li.innerHTML = `
            <img src="${avatar}" alt="${title}">
            <div class="chat-item-info">
                <h4>${title}</h4>
                <p>${chat.lastMessage || 'Нет сообщений'}</p>
            </div>
        `;
        
        li.addEventListener('click', () => openChat(chat.id));
        
        if (currentChat && currentChat.id === chat.id) {
            li.classList.add('active');
        }
        
        chatListItems.appendChild(li);
    });
}

// Open a chat
function openChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChat = chat;
    renderChatList();
    renderChatArea();
}

// Render chat area
function renderChatArea() {
    noChatSelected.style.display = 'none';
    chatArea.style.display = 'flex';
    
    // Set chat title
    if (currentChat.isGroup) {
        chatTitle.textContent = currentChat.name;
        leaveChatBtn.style.display = 'block';
    } else {
        const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
        const otherUser = users.find(u => u.uid === otherUserId);
        chatTitle.textContent = otherUser ? otherUser.username : 'Unknown User';
        leaveChatBtn.style.display = 'none';
    }
    
    // Load messages
    loadMessages();
}

// Load messages for current chat
function loadMessages() {
    messagesContainer.innerHTML = '';
    
    db.collection('chats').doc(currentChat.id).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                renderMessage(message);
            });
            
            // Scroll to bottom
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        });
}

// Render a message
function renderMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    const isSent = message.senderId === currentUser.uid;
    messageDiv.classList.add(isSent ? 'sent' : 'received');
    
    // Decrypt message
    let decryptedContent = '';
    try {
        decryptedContent = decryptMessage(message.content, currentUser.uid);
    } catch (e) {
        console.error("Decryption error:", e);
        decryptedContent = "Не удалось расшифровать сообщение";
    }
    
    const date = new Date(message.timestamp.toDate());
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-info">
            ${isSent ? 'Вы' : message.senderName} • ${timeString}
        </div>
        <div class="message-content">${decryptedContent}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Send a message
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChat) return;
    
    // Encrypt message for all participants
    const encryptedMessages = {};
    currentChat.participants.forEach(userId => {
        encryptedMessages[userId] = encryptMessage(content, userId);
    });
    
    // Create message object
    const message = {
        content: encryptedMessages,
        senderId: currentUser.uid,
        senderName: usernameDisplay.textContent,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add message to chat
    db.collection('chats').doc(currentChat.id).collection('messages').add(message)
        .then(() => {
            // Update last message in chat
            db.collection('chats').doc(currentChat.id).update({
                lastMessage: content,
                lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            messageInput.value = '';
        })
        .catch(error => {
            console.error("Error sending message:", error);
        });
}

// Show group creation modal
function showGroupCreationModal() {
    groupCreationModal.style.display = 'flex';
    groupNameInput.value = '';
    selectedUsersForGroup = [];
    
    // Render user list
    userListForGroup.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.dataset.userId = user.uid;
        li.innerHTML = `
            <img src="${user.avatar || 'https://via.placeholder.com/30'}" alt="${user.username}">
            <span>${user.username}</span>
        `;
        
        li.addEventListener('click', () => {
            li.classList.toggle('selected');
            const userId = li.dataset.userId;
            
            if (selectedUsersForGroup.includes(userId)) {
                selectedUsersForGroup = selectedUsersForGroup.filter(id => id !== userId);
            } else {
                selectedUsersForGroup.push(userId);
            }
        });
        
        userListForGroup.appendChild(li);
    });
}

// Create a new group
function createGroup() {
    const groupName = groupNameInput.value.trim();
    if (!groupName || selectedUsersForGroup.length === 0) {
        alert('Пожалуйста, укажите название группы и выберите участников');
        return;
    }
    
    // Add current user to participants
    const participants = [...selectedUsersForGroup, currentUser.uid];
    
    // Create group chat
    db.collection('chats').add({
        name: groupName,
        participants: participants,
        isGroup: true,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: 'Группа создана',
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        groupCreationModal.style.display = 'none';
    })
    .catch(error => {
        console.error("Error creating group:", error);
    });
}

// Start a new private chat
function startNewChat() {
    showGroupCreationModal();
    document.getElementById('group-name').style.display = 'none';
    createGroupBtn.textContent = 'Начать чат';
    
    // When modal is closed, reset to group creation
    const modal = document.getElementById('group-creation-modal');
    const originalDisplay = document.getElementById('group-name').style.display;
    const originalText = createGroupBtn.textContent;
    
    const resetModal = () => {
        document.getElementById('group-name').style.display = originalDisplay;
        createGroupBtn.textContent = originalText;
        modal.removeEventListener('click', resetModal);
    };
    
    modal.addEventListener('click', resetModal);
}

// Show chat info
function showChatInfo() {
    chatInfoModal.style.display = 'flex';
    
    if (currentChat.isGroup) {
        document.getElementById('info-modal-title').textContent = `Информация о группе: ${currentChat.name}`;
        
        let html = `
            <p><strong>Создана:</strong> ${currentChat.createdAt.toDate().toLocaleString()}</p>
            <h4>Участники:</h4>
            <ul class="participants-list">
        `;
        
        // Get user data for participants
        const participantPromises = currentChat.participants.map(uid => {
            return db.collection('users').doc(uid).get();
        });
        
        Promise.all(participantPromises)
            .then(snapshots => {
                snapshots.forEach(snap => {
                    if (snap.exists) {
                        const user = snap.data();
                        html += `
                            <li>
                                <img src="${user.avatar || 'https://via.placeholder.com/30'}" alt="${user.username}">
                                <span>${user.username}</span>
                                ${user.uid === currentChat.createdBy ? '(Создатель)' : ''}
                            </li>
                        `;
                    }
                });
                
                html += '</ul>';
                chatInfoContent.innerHTML = html;
            });
    } else {
        const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
        db.collection('users').doc(otherUserId).get()
            .then(doc => {
                if (doc.exists) {
                    const user = doc.data();
                    document.getElementById('info-modal-title').textContent = `Информация о пользователе`;
                    
                    chatInfoContent.innerHTML = `
                        <div class="user-info">
                            <img src="${user.avatar || 'https://via.placeholder.com/100'}" alt="${user.username}" class="user-avatar-large">
                            <h3>${user.username}</h3>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Зарегистрирован:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    `;
                }
            });
    }
}

// Leave current chat
function leaveCurrentChat() {
    if (!currentChat || !currentChat.isGroup) return;
    
    if (confirm(`Вы уверены, что хотите покинуть группу "${currentChat.name}"?`)) {
        // Remove user from participants
        const updatedParticipants = currentChat.participants.filter(id => id !== currentUser.uid);
        
        db.collection('chats').doc(currentChat.id).update({
            participants: updatedParticipants
        })
        .then(() => {
            currentChat = null;
            noChatSelected.style.display = 'flex';
            chatArea.style.display = 'none';
        })
        .catch(error => {
            console.error("Error leaving chat:", error);
        });
    }
}

// Search chats
function searchChats() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        renderChatList();
        return;
    }
    
    const filteredChats = chats.filter(chat => {
        if (chat.isGroup) {
            return chat.name.toLowerCase().includes(searchTerm);
        } else {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = users.find(u => u.uid === otherUserId);
            return otherUser ? otherUser.username.toLowerCase().includes(searchTerm) : false;
        }
    });
    
    // Render filtered list
    chatListItems.innerHTML = '';
    
    if (filteredChats.length === 0) {
        chatListItems.innerHTML = '<li class="no-results">Ничего не найдено</li>';
        return;
    }
    
    filteredChats.forEach(chat => {
        const li = document.createElement('li');
        li.dataset.chatId = chat.id;
        
        let title, avatar;
        if (chat.isGroup) {
            title = chat.name;
            avatar = 'https://via.placeholder.com/50/3498db/ffffff?text=G';
        } else {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = users.find(u => u.uid === otherUserId);
            title = otherUser ? otherUser.username : 'Unknown User';
            avatar = otherUser ? (otherUser.avatar || 'https://via.placeholder.com/50') : 'https://via.placeholder.com/50';
        }
        
        li.innerHTML = `
            <img src="${avatar}" alt="${title}">
            <div class="chat-item-info">
                <h4>${title}</h4>
                <p>${chat.lastMessage || 'Нет сообщений'}</p>
            </div>
        `;
        
        li.addEventListener('click', () => openChat(chat.id));
        
        if (currentChat && currentChat.id === chat.id) {
            li.classList.add('active');
        }
        
        chatListItems.appendChild(li);
    });
}

// Initialize the app
init();

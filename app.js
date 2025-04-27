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
const storage = firebase.storage();

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
const profileBtn = document.getElementById('profile-btn');
const chatListItems = document.getElementById('chat-list-items');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatTitle = document.getElementById('chat-title');
const chatStatus = document.getElementById('chat-status');
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
const tabBtns = document.querySelectorAll('.tab-btn');
const contentTabs = document.querySelectorAll('.content-tab');
const friendsList = document.getElementById('friends-list');
const friendRequestsList = document.getElementById('friend-requests-list');
const addFriendBtn = document.getElementById('add-friend-btn');
const groupsList = document.getElementById('groups-list');
const profileModal = document.getElementById('profile-modal');
const profileUsername = document.getElementById('profile-username');
const profileStatus = document.getElementById('profile-status');
const profileBio = document.getElementById('profile-bio');
const saveProfileBtn = document.getElementById('save-profile-btn');
const changeAvatarBtn = document.getElementById('change-avatar-btn');
const avatarUpload = document.getElementById('avatar-upload');
const profileAvatar = document.getElementById('profile-avatar');
const addFriendModal = document.getElementById('add-friend-modal');
const friendUsername = document.getElementById('friend-username');
const sendFriendRequestBtn = document.getElementById('send-friend-request-btn');
const userProfileModal = document.getElementById('user-profile-modal');
const userProfileContent = document.getElementById('user-profile-content');
const chatAvatar = document.getElementById('chat-avatar');

// App State
let currentUser = null;
let currentChat = null;
let chats = [];
let users = [];
let friends = [];
let friendRequests = [];
let groups = [];
let selectedUsersForGroup = [];
let onlineUsers = {};

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
    
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    // Profile
    profileBtn.addEventListener('click', showProfileModal);
    saveProfileBtn.addEventListener('click', saveProfile);
    changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
    avatarUpload.addEventListener('change', uploadAvatar);
    
    // Friends
    addFriendBtn.addEventListener('click', showAddFriendModal);
    sendFriendRequestBtn.addEventListener('click', sendFriendRequest);
    
    // Search
    searchInput.addEventListener('input', searchChats);
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Switch between tabs
function switchTab(e) {
    const tabId = e.target.dataset.tab;
    
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) btn.classList.add('active');
    });
    
    contentTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.id === `${tabId}-tab`) tab.classList.add('active');
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
            
            // Set user online status
            setUserOnlineStatus(true);
            
            // Listen for online status changes
            listenForOnlineStatus();
        } else {
            currentUser = null;
            authContainer.style.display = 'flex';
            appContainer.style.display = 'none';
            
            // Set user offline status when logging out
            if (user) {
                setUserOnlineStatus(false);
            }
        }
    });
}

// Set user online status
function setUserOnlineStatus(isOnline) {
    if (!currentUser) return;
    
    const status = isOnline ? 'online' : 'offline';
    const lastSeen = isOnline ? null : new Date();
    
    db.collection('users').doc(currentUser.uid).update({
        status: status,
        lastSeen: lastSeen
    });
}

// Listen for online status changes
function listenForOnlineStatus() {
    db.collection('users').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const userData = change.doc.data();
            if (userData.uid !== currentUser.uid) {
                onlineUsers[userData.uid] = userData.status === 'online';
                
                // Update friend status in UI
                updateFriendStatus(userData.uid, userData.status);
                
                // Update chat status if current chat is with this user
                if (currentChat && !currentChat.isGroup && 
                    currentChat.participants.includes(userData.uid)) {
                    updateChatStatus(userData.status);
                }
            }
        });
    });
}

// Update friend status in UI
function updateFriendStatus(userId, status) {
    const friendItems = document.querySelectorAll(`.friend-item[data-user-id="${userId}"]`);
    friendItems.forEach(item => {
        const statusElement = item.querySelector('.friend-status');
        if (statusElement) {
            statusElement.textContent = status === 'online' ? 'online' : 'offline';
            statusElement.classList.toggle('online', status === 'online');
            statusElement.classList.toggle('offline', status !== 'online');
        }
    });
}

// Update chat status in UI
function updateChatStatus(status) {
    if (status === 'online') {
        chatStatus.textContent = 'online';
        chatStatus.classList.add('online');
    } else {
        const user = users.find(u => u.uid === currentChat.participants.find(id => id !== currentUser.uid));
        if (user && user.lastSeen) {
            const lastSeen = user.lastSeen.toDate();
            chatStatus.textContent = `был(а) в сети ${formatLastSeen(lastSeen)}`;
        } else {
            chatStatus.textContent = 'offline';
        }
        chatStatus.classList.remove('online');
    }
}

// Format last seen time
function formatLastSeen(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days === 1) return 'вчера';
    return `${days} дн. назад`;
}

// Load user data
function loadUserData() {
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                usernameDisplay.textContent = userData.username;
                userAvatar.src = userData.avatar || 'https://via.placeholder.com/50';
                
                // Load chats, friends, and groups
                loadChats();
                loadFriends();
                loadGroups();
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

// Load user's friends
function loadFriends() {
    // Load accepted friends
    db.collection('friendships')
        .where('users', 'array-contains', currentUser.uid)
        .where('status', '==', 'accepted')
        .onSnapshot(snapshot => {
            friends = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const friendId = data.users.find(id => id !== currentUser.uid);
                friends.push({
                    id: doc.id,
                    friendId: friendId,
                    ...data
                });
            });
            renderFriendsList();
        });
    
    // Load friend requests
    db.collection('friendships')
        .where('receiver', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            friendRequests = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                friendRequests.push({
                    id: doc.id,
                    senderId: data.sender,
                    ...data
                });
            });
            renderFriendRequestsList();
        });
}

// Load user's groups
function loadGroups() {
    db.collection('groups')
        .where('members', 'array-contains', currentUser.uid)
        .orderBy('lastActivity', 'desc')
        .onSnapshot(snapshot => {
            groups = [];
            snapshot.forEach(doc => {
                groups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderGroupsList();
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
        let title, avatar, status;
        if (chat.isGroup) {
            title = chat.name;
            avatar = chat.avatar || 'https://via.placeholder.com/50/3498db/ffffff?text=G';
            status = `${chat.members.length} участников`;
        } else {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = users.find(u => u.uid === otherUserId);
            if (otherUser) {
                title = otherUser.username;
                avatar = otherUser.avatar || 'https://via.placeholder.com/50';
                status = onlineUsers[otherUserId] ? 'online' : 'offline';
            } else {
                title = 'Unknown User';
                avatar = 'https://via.placeholder.com/50';
                status = 'offline';
            }
        }
        
        const lastMessageTime = chat.lastMessageTimestamp ? 
            formatTime(chat.lastMessageTimestamp.toDate()) : '';
        
        li.innerHTML = `
            <img src="${avatar}" alt="${title}">
            <div class="chat-item-info">
                <h4>${title}</h4>
                <p>${chat.lastMessage || 'Нет сообщений'}</p>
            </div>
            <div class="chat-item-time">${lastMessageTime}</div>
        `;
        
        li.addEventListener('click', () => openChat(chat.id));
        
        if (currentChat && currentChat.id === chat.id) {
            li.classList.add('active');
        }
        
        chatListItems.appendChild(li);
    });
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    
    // Set chat title and avatar
    if (currentChat.isGroup) {
        chatTitle.textContent = currentChat.name;
        chatAvatar.src = currentChat.avatar || 'https://via.placeholder.com/40/3498db/ffffff?text=G';
        chatStatus.textContent = `${currentChat.members.length} участников`;
        chatStatus.classList.remove('online');
        leaveChatBtn.style.display = 'block';
    } else {
        const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
        const otherUser = users.find(u => u.uid === otherUserId);
        if (otherUser) {
            chatTitle.textContent = otherUser.username;
            chatAvatar.src = otherUser.avatar || 'https://via.placeholder.com/40';
            
            if (onlineUsers[otherUserId]) {
                chatStatus.textContent = 'online';
                chatStatus.classList.add('online');
            } else {
                chatStatus.textContent = otherUser.lastSeen ? 
                    `был(а) в сети ${formatLastSeen(otherUser.lastSeen.toDate())}` : 'offline';
                chatStatus.classList.remove('online');
            }
        }
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
    
    const date = new Date(message.timestamp.toDate());
    const timeString = formatTime(date);
    
    messageDiv.innerHTML = `
        <div class="message-info">
            ${isSent ? 'Вы' : message.senderName} • ${timeString}
        </div>
        <div class="message-content">${message.content}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Send a message
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentChat) return;
    
    // Create message object
    const message = {
        content: content,
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
    
    // Render user list (friends only)
    userListForGroup.innerHTML = '';
    friends.forEach(friend => {
        const friendData = users.find(u => u.uid === friend.friendId);
        if (friendData) {
            const li = document.createElement('li');
            li.dataset.userId = friendData.uid;
            li.innerHTML = `
                <img src="${friendData.avatar || 'https://via.placeholder.com/30'}" alt="${friendData.username}">
                <span>${friendData.username}</span>
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
        }
    });
}

// Create a new group
function createGroup() {
    const groupName = groupNameInput.value.trim();
    const groupDescription = document.getElementById('group-description').value.trim();
    
    if (!groupName || selectedUsersForGroup.length === 0) {
        alert('Пожалуйста, укажите название группы и выберите участников');
        return;
    }
    
    // Add current user to members as admin
    const members = selectedUsersForGroup.map(userId => ({
        userId: userId,
        role: 'member'
    }));
    
    members.push({
        userId: currentUser.uid,
        role: 'admin'
    });
    
    // Create group
    db.collection('groups').add({
        name: groupName,
        description: groupDescription,
        members: members,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
        avatar: ''
    })
    .then(groupRef => {
        // Create a chat for the group
        return db.collection('chats').add({
            name: groupName,
            participants: [...selectedUsersForGroup, currentUser.uid],
            isGroup: true,
            groupId: groupRef.id,
            createdBy: currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessage: 'Группа создана',
            lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
            avatar: ''
        });
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
    document.getElementById('group-description').style.display = 'none';
    createGroupBtn.textContent = 'Начать чат';
    
    // When modal is closed, reset to group creation
    const modal = document.getElementById('group-creation-modal');
    const originalDisplayName = document.getElementById('group-name').style.display;
    const originalDisplayDesc = document.getElementById('group-description').style.display;
    const originalText = createGroupBtn.textContent;
    
    const resetModal = () => {
        document.getElementById('group-name').style.display = originalDisplayName;
        document.getElementById('group-description').style.display = originalDisplayDesc;
        createGroupBtn.textContent = originalText;
        modal.removeEventListener('click', resetModal);
    };
    
    modal.addEventListener('click', resetModal);
}

// Show chat info
function showChatInfo() {
    chatInfoModal.style.display = 'flex';
    
    if (currentChat.isGroup) {
        // Get group info
        db.collection('groups').doc(currentChat.groupId).get()
            .then(groupDoc => {
                if (groupDoc.exists) {
                    const group = groupDoc.data();
                    
                    let html = `
                        <div class="group-info-content">
                            <img src="${group.avatar || 'https://via.placeholder.com/100/3498db/ffffff?text=G'}" alt="${group.name}">
                            <h3>${group.name}</h3>
                            <p>${group.description || 'Нет описания'}</p>
                            <p><small>Создана ${group.createdAt.toDate().toLocaleDateString()}</small></p>
                            
                            <div class="group-members">
                                <h4>Участники (${group.members.length})</h4>
                                <ul class="group-members-list">
                    `;
                    
                    // Get member details
                    const memberPromises = group.members.map(member => {
                        return db.collection('users').doc(member.userId).get();
                    });
                    
                    Promise.all(memberPromises)
                        .then(snapshots => {
                            snapshots.forEach((snap, index) => {
                                if (snap.exists) {
                                    const user = snap.data();
                                    const member = group.members[index];
                                    
                                    html += `
                                        <li>
                                            <img src="${user.avatar || 'https://via.placeholder.com/30'}" alt="${user.username}">
                                            <div class="member-info">
                                                <h5>${user.username}</h5>
                                                <p>${user.status || 'offline'}</p>
                                            </div>
                                            <span class="member-role">${member.role === 'admin' ? 'админ' : 'участник'}</span>
                                    `;
                                    
                                    // Add admin actions if current user is admin
                                    if (group.createdBy === currentUser.uid && member.userId !== currentUser.uid) {
                                        html += `
                                            <div class="member-actions">
                                                ${member.role === 'admin' ? 
                                                    `<button data-action="demote" data-user-id="${member.userId}">Понизить</button>` : 
                                                    `<button data-action="promote" data-user-id="${member.userId}">Повысить</button>`}
                                                <button data-action="remove" data-user-id="${member.userId}">Удалить</button>
                                            </div>
                                        `;
                                    }
                                    
                                    html += `</li>`;
                                }
                            });
                            
                            html += `
                                </ul>
                            </div>
                        </div>
                            `;
                            
                            chatInfoContent.innerHTML = html;
                            
                            // Add event listeners for admin actions
                            document.querySelectorAll('[data-action="promote"]').forEach(btn => {
                                btn.addEventListener('click', () => promoteMember(btn.dataset.userId));
                            });
                            
                            document.querySelectorAll('[data-action="demote"]').forEach(btn => {
                                btn.addEventListener('click', () => demoteMember(btn.dataset.userId));
                            });
                            
                            document.querySelectorAll('[data-action="remove"]').forEach(btn => {
                                btn.addEventListener('click', () => removeMember(btn.dataset.userId));
                            });
                        });
                }
            });
    } else {
        const otherUserId = currentChat.participants.find(id => id !== currentUser.uid);
        showUserProfile(otherUserId);
    }
}

// Promote member to admin
function promoteMember(userId) {
    if (!currentChat || !currentChat.isGroup) return;
    
    db.collection('groups').doc(currentChat.groupId).get()
        .then(groupDoc => {
            if (groupDoc.exists) {
                const group = groupDoc.data();
                const updatedMembers = group.members.map(member => {
                    if (member.userId === userId) {
                        return { ...member, role: 'admin' };
                    }
                    return member;
                });
                
                return db.collection('groups').doc(currentChat.groupId).update({
                    members: updatedMembers
                });
            }
        })
        .then(() => {
            showChatInfo(); // Refresh the info
        })
        .catch(error => {
            console.error("Error promoting member:", error);
        });
}

// Demote admin to member
function demoteMember(userId) {
    if (!currentChat || !currentChat.isGroup) return;
    
    db.collection('groups').doc(currentChat.groupId).get()
        .then(groupDoc => {
            if (groupDoc.exists) {
                const group = groupDoc.data();
                const updatedMembers = group.members.map(member => {
                    if (member.userId === userId) {
                        return { ...member, role: 'member' };
                    }
                    return member;
                });
                
                return db.collection('groups').doc(currentChat.groupId).update({
                    members: updatedMembers
                });
            }
        })
        .then(() => {
            showChatInfo(); // Refresh the info
        })
        .catch(error => {
            console.error("Error demoting member:", error);
        });
}

// Remove member from group
function removeMember(userId) {
    if (!currentChat || !currentChat.isGroup) return;
    
    if (confirm("Вы уверены, что хотите удалить этого участника из группы?")) {
        db.collection('groups').doc(currentChat.groupId).get()
            .then(groupDoc => {
                if (groupDoc.exists) {
                    const group = groupDoc.data();
                    const updatedMembers = group.members.filter(member => member.userId !== userId);
                    
                    return db.collection('groups').doc(currentChat.groupId).update({
                        members: updatedMembers
                    });
                }
            })
            .then(() => {
                // Also remove from chat participants
                return db.collection('chats').doc(currentChat.id).update({
                    participants: firebase.firestore.FieldValue.arrayRemove(userId)
                });
            })
            .then(() => {
                showChatInfo(); // Refresh the info
            })
            .catch(error => {
                console.error("Error removing member:", error);
            });
    }
}

// Leave current chat
function leaveCurrentChat() {
    if (!currentChat || !currentChat.isGroup) return;
    
    if (confirm(`Вы уверены, что хотите покинуть группу "${currentChat.name}"?`)) {
        // Remove user from group members
        db.collection('groups').doc(currentChat.groupId).get()
            .then(groupDoc => {
                if (groupDoc.exists) {
                    const group = groupDoc.data();
                    const updatedMembers = group.members.filter(member => member.userId !== currentUser.uid);
                    
                    return db.collection('groups').doc(currentChat.groupId).update({
                        members: updatedMembers
                    });
                }
            })
            .then(() => {
                // Remove user from chat participants
                return db.collection('chats').doc(currentChat.id).update({
                    participants: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                });
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

// Show user profile modal
function showUserProfile(userId) {
    chatInfoModal.style.display = 'none';
    
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const user = doc.data();
                
                let html = `
                    <div class="user-profile-content">
                        <img src="${user.avatar || 'https://via.placeholder.com/100'}" alt="${user.username}">
                        <h3>${user.username}</h3>
                        <p class="user-status ${user.status === 'online' ? 'online' : ''}">
                            ${user.status === 'online' ? 'online' : 
                              user.lastSeen ? `был(а) в сети ${formatLastSeen(user.lastSeen.toDate())}` : 'offline'}
                        </p>
                `;
                
                if (user.bio) {
                    html += `
                        <div class="user-bio">
                            <h4>О себе</h4>
                            <p>${user.bio}</p>
                        </div>
                    `;
                }
                
                // Check if this user is a friend
                const isFriend = friends.some(f => f.friendId === userId);
                const hasRequest = friendRequests.some(r => r.senderId === userId);
                
                html += `
                    <div class="user-profile-actions">
                `;
                
                if (isFriend) {
                    html += `
                        <button class="btn-primary" onclick="startChatWithUser('${userId}')">Написать</button>
                        <button class="btn-danger" onclick="removeFriend('${userId}')">Удалить из друзей</button>
                    `;
                } else if (hasRequest) {
                    html += `
                        <button class="btn-primary" onclick="acceptFriendRequest('${userId}')">Принять запрос</button>
                        <button class="btn-danger" onclick="declineFriendRequest('${userId}')">Отклонить</button>
                    `;
                } else {
                    // Check if we've already sent a request to this user
                    db.collection('friendships')
                        .where('sender', '==', currentUser.uid)
                        .where('receiver', '==', userId)
                        .where('status', '==', 'pending')
                        .get()
                        .then(snapshot => {
                            if (snapshot.empty) {
                                html += `
                                    <button class="btn-primary" onclick="sendFriendRequestFromProfile('${userId}')">Добавить в друзья</button>
                                `;
                            } else {
                                html += `
                                    <button class="btn-primary" disabled>Запрос отправлен</button>
                                `;
                            }
                            
                            html += `</div></div>`;
                            userProfileContent.innerHTML = html;
                            userProfileModal.style.display = 'flex';
                        });
                    return;
                }
                
                html += `</div></div>`;
                userProfileContent.innerHTML = html;
                userProfileModal.style.display = 'flex';
            }
        });
}

// Start chat with user
function startChatWithUser(userId) {
    // Check if chat already exists
    const existingChat = chats.find(chat => 
        !chat.isGroup && chat.participants.includes(userId));
    
    if (existingChat) {
        openChat(existingChat.id);
        userProfileModal.style.display = 'none';
        return;
    }
    
    // Create new chat
    db.collection('chats').add({
        participants: [currentUser.uid, userId],
        isGroup: false,
        createdBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: 'Чат создан',
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        userProfileModal.style.display = 'none';
    })
    .catch(error => {
        console.error("Error creating chat:", error);
    });
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
            avatar = chat.avatar || 'https://via.placeholder.com/50/3498db/ffffff?text=G';
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

// Make functions available globally for HTML event handlers
window.startChatWithUser = startChatWithUser;
window.removeFriend = removeFriend;
window.acceptFriendRequest = acceptFriendRequest;
window.declineFriendRequest = declineFriendRequest;
window.sendFriendRequestFromProfile = sendFriendRequestFromProfile;

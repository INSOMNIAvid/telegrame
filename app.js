// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const addFriendBtn = document.getElementById('add-friend-btn');
const createGroupBtn = document.getElementById('create-group-btn');
const changeAvatarBtn = document.getElementById('change-avatar-btn');
const avatarUpload = document.getElementById('avatar-upload');
const saveBioBtn = document.getElementById('save-bio-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const chatInfoBtn = document.getElementById('chat-info-btn');
const closeRightSidebar = document.getElementById('close-right-sidebar');
const rightSidebar = document.getElementById('right-sidebar');
const sendMessageBtn = document.getElementById('send-message-btn');
const messageInput = document.getElementById('message-input');

// Modals
const addFriendModal = document.getElementById('add-friend-modal');
const createGroupModal = document.getElementById('create-group-modal');
const groupInfoModal = document.getElementById('group-info-modal');
const changePasswordModal = document.getElementById('change-password-modal');
const modalCloseBtns = document.querySelectorAll('.close-modal');

// Current chat data
let currentChat = null;
let currentChatType = null; // 'private' or 'group'
let unsubscribeMessages = null;

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await updateUserStatus('offline');
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        
        // Get tab name
        const tabName = btn.getAttribute('data-tab');
        
        // Hide all tab contents
        document.querySelectorAll('.sidebar-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show selected tab content
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    });
});

// Add friend modal
addFriendBtn.addEventListener('click', () => {
    addFriendModal.classList.remove('hidden');
});

// Send friend request
document.getElementById('send-friend-request-btn').addEventListener('click', async () => {
    const usernameInput = document.getElementById('friend-username');
    let username = usernameInput.value.trim();
    
    // Format username with @ if not present
    if (!username.startsWith('@')) {
        username = `@${username}`;
    }
    
    try {
        // Find user by username
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            alert('User not found');
            return;
        }

        const friendDoc = snapshot.docs[0];
        const friendId = friendDoc.id;
        
        if (friendId === currentUser.uid) {
            alert("You can't add yourself as a friend");
            return;
        }

        // Check if friendship already exists
        const friendshipQuery = await db.collection('friendships')
            .where('users', 'array-contains', currentUser.uid)
            .get();

        const existingFriendship = friendshipQuery.docs.find(doc => {
            const data = doc.data();
            return data.users.includes(friendId);
        });

        if (existingFriendship) {
            const status = existingFriendship.data().status;
            if (status === 'accepted') {
                alert('This user is already your friend');
            } else if (status === 'pending' && existingFriendship.data().sender === currentUser.uid) {
                alert('Friend request already sent');
            } else {
                alert('This user has already sent you a friend request');
            }
            return;
        }

        // Create new friendship
        await db.collection('friendships').add({
            users: [currentUser.uid, friendId],
            sender: currentUser.uid,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Friend request sent');
        addFriendModal.classList.add('hidden');
        usernameInput.value = '';
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Error sending friend request');
    }
});

// Create group modal
createGroupBtn.addEventListener('click', async () => {
    // Load friends for group creation
    await loadFriendsForGroup();
    createGroupModal.classList.remove('hidden');
});

// Create group
document.getElementById('create-group-confirm-btn').addEventListener('click', async () => {
    const groupName = document.getElementById('group-name').value.trim();
    const groupDescription = document.getElementById('group-description').value.trim();
    
    if (!groupName) {
        alert('Group name is required');
        return;
    }

    // Get selected members
    const selectedMembers = [];
    document.querySelectorAll('#group-members-select input:checked').forEach(checkbox => {
        selectedMembers.push(checkbox.value);
    });

    if (selectedMembers.length === 0) {
        alert('Please select at least one member');
        return;
    }

    try {
        // Create group
        await db.collection('groups').add({
            name: groupName,
            description: groupDescription,
            creator: currentUser.uid,
            members: [currentUser.uid, ...selectedMembers],
            avatar: 'assets/images/default-group.png',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Group created successfully');
        createGroupModal.classList.add('hidden');
        loadGroups();
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Error creating group');
    }
});

// Change avatar
changeAvatarBtn.addEventListener('click', () => {
    avatarUpload.click();
});

avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            // In a real app, you would upload to Firebase Storage
            // For this example, we'll use a data URL
            const reader = new FileReader();
            reader.onload = async (event) => {
                const avatarUrl = event.target.result;
                
                // Update user data
                await db.collection('users').doc(currentUser.uid).update({
                    avatar: avatarUrl
                });
                
                // Update local user data
                userData.avatar = avatarUrl;
                
                // Update avatar in UI
                document.getElementById('user-avatar').src = avatarUrl;
                document.getElementById('profile-view-avatar').src = avatarUrl;
                
                alert('Avatar updated successfully');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Error updating avatar');
        }
    }
});

// Save bio
saveBioBtn.addEventListener('click', async () => {
    const newBio = document.getElementById('profile-bio').value;
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            bio: newBio
        });
        
        // Update local user data
        userData.bio = newBio;
        
        alert('Bio updated successfully');
    } catch (error) {
        console.error('Error updating bio:', error);
        alert('Error updating bio');
    }
});

// Change password modal
changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.remove('hidden');
});

// Change password
document.getElementById('change-password-confirm-btn').addEventListener('click', async () => {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        // Reauthenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        await currentUser.reauthenticateWithCredential(credential);
        
        // Update password
        await currentUser.updatePassword(newPassword);
        
        alert('Password changed successfully');
        changePasswordModal.classList.add('hidden');
        
        // Clear fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
    } catch (error) {
        console.error('Error changing password:', error);
        alert(error.message);
    }
});

// Chat info
chatInfoBtn.addEventListener('click', () => {
    if (!currentChat) return;
    
    if (currentChatType === 'private') {
        loadPrivateChatInfo(currentChat);
    } else if (currentChatType === 'group') {
        loadGroupChatInfo(currentChat);
    }
    
    rightSidebar.classList.remove('hidden');
});

closeRightSidebar.addEventListener('click', () => {
    rightSidebar.classList.add('hidden');
});

// Send message
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText || !currentChat || !currentChatType) return;

    try {
        const messageData = {
            sender: currentUser.uid,
            content: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (currentChatType === 'private') {
            // For private chats, we use the chat document ID
            await db.collection('chats').doc(currentChat.id).collection('messages').add(messageData);
            
            // Update last message in chat
            await db.collection('chats').doc(currentChat.id).update({
                lastMessage: `${userData.username}: ${messageText}`,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else if (currentChatType === 'group') {
            // For group chats
            await db.collection('groups').doc(currentChat.id).collection('messages').add(messageData);
            
            // Update last message in group
            await db.collection('groups').doc(currentChat.id).update({
                lastMessage: `${userData.username}: ${messageText}`,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Clear input
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
    }
}

async function loadFriendsForGroup() {
    const container = document.getElementById('group-members-select');
    container.innerHTML = '<div class="loading">Loading friends...</div>';
    
    try {
        // Get accepted friendships
        const snapshot = await db.collection('friendships')
            .where('users', 'array-contains', currentUser.uid)
            .where('status', '==', 'accepted')
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<div class="no-friends">No friends to add</div>';
            return;
        }

        container.innerHTML = '';
        
        // Get friend data for each friendship
        const friendPromises = snapshot.docs.map(async doc => {
            const friendship = doc.data();
            const friendId = friendship.users.find(id => id !== currentUser.uid);
            const friend = await getUserData(friendId);
            return friend;
        });

        const friends = await Promise.all(friendPromises);
        
        // Add checkboxes for each friend
        friends.forEach(friend => {
            if (!friend) return;
            
            const div = document.createElement('div');
            div.className = 'friend-checkbox';
            div.innerHTML = `
                <input type="checkbox" id="friend-${friend.uid}" value="${friend.uid}">
                <img src="${friend.avatar}" alt="${friend.username}">
                <span>${friend.username}</span>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading friends:', error);
        container.innerHTML = '<div class="error">Error loading friends</div>';
    }
}

async function startChatWithFriend(friend) {
    try {
        // Check if chat already exists
        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .get();

        const existingChat = snapshot.docs.find(doc => {
            const chat = doc.data();
            return chat.participants.includes(friend.uid);
        });

        if (existingChat) {
            loadChat(existingChat.id, friend);
            return;
        }

        // Create new chat
        const chatRef = await db.collection('chats').add({
            participants: [currentUser.uid, friend.uid],
            lastMessage: '',
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        loadChat(chatRef.id, friend);
    } catch (error) {
        console.error('Error starting chat:', error);
        alert('Error starting chat');
    }
}

async function loadChat(chatId, otherUser) {
    // Unsubscribe from previous chat messages
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    currentChat = { id: chatId, ...otherUser };
    currentChatType = 'private';
    
    // Update UI
    document.getElementById('chat-title').textContent = otherUser.username;
    document.getElementById('chat-avatar').src = otherUser.avatar;
    document.getElementById('chat-status').textContent = otherUser.status || 'offline';
    
    // Clear messages container
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '<div class="loading">Loading messages...</div>';
    
    // Load messages
    try {
        unsubscribeMessages = db.collection('chats').doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                messagesContainer.innerHTML = '';
                
                if (snapshot.empty) {
                    messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
                    return;
                }
                
                snapshot.forEach(doc => {
                    const message = doc.data();
                    displayMessage(message);
                });
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<div class="error">Error loading messages</div>';
    }
}

async function loadGroupChat(groupId, group) {
    // Unsubscribe from previous chat messages
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    currentChat = { id: groupId, ...group };
    currentChatType = 'group';
    
    // Update UI
    document.getElementById('chat-title').textContent = group.name;
    document.getElementById('chat-avatar').src = group.avatar || 'assets/images/default-group.png';
    document.getElementById('chat-status').textContent = `${group.members.length} members`;
    
    // Clear messages container
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '<div class="loading">Loading messages...</div>';
    
    // Load messages
    try {
        unsubscribeMessages = db.collection('groups').doc(groupId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(async snapshot => {
                messagesContainer.innerHTML = '';
                
                if (snapshot.empty) {
                    messagesContainer.innerHTML = '<div class="no-messages">No messages yet</div>';
                    return;
                }
                
                // Get all senders' data once
                const senderIds = [...new Set(snapshot.docs.map(doc => doc.data().sender))];
                const senders = await Promise.all(senderIds.map(id => getUserData(id)));
                const sendersMap = senders.reduce((map, sender) => {
                    if (sender) map[sender.uid] = sender;
                    return map;
                }, {});
                
                snapshot.forEach(doc => {
                    const message = doc.data();
                    const sender = sendersMap[message.sender];
                    displayMessage(message, sender);
                });
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<div class="error">Error loading messages</div>';
    }
}

function displayMessage(message, sender = null) {
    const messagesContainer = document.getElementById('messages-container');
    const isCurrentUser = message.sender === currentUser.uid;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isCurrentUser ? 'message-sent' : 'message-received'}`;
    
    // If it's a group chat and not current user, show sender info
    const senderInfo = currentChatType === 'group' && !isCurrentUser && sender ? 
        `<small>${sender.username}</small>` : '';
    
    messageDiv.innerHTML = `
        ${senderInfo}
        <div class="message-content">${message.content}</div>
        <div class="message-info">
            <span class="message-time">${formatDate(message.timestamp?.toDate())}</span>
            ${isCurrentUser ? '<span class="message-status">✓✓</span>' : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

async function loadPrivateChatInfo(chat) {
    const chatDetails = document.getElementById('chat-details');
    chatDetails.innerHTML = `
        <div class="chat-info-header">
            <img src="${chat.avatar}" alt="${chat.username}">
            <div>
                <h4>${chat.username}</h4>
                <small class="status ${chat.status || 'offline'}">
                    <span class="status-indicator status-${chat.status || 'offline'}"></span>
                    ${chat.status || 'offline'}
                </small>
            </div>
        </div>
        <div class="chat-info-item">
            <label>Last Seen</label>
            <p>${formatDate(chat.lastSeen?.toDate())}</p>
        </div>
        <div class="chat-info-item">
            <label>Bio</label>
            <p>${chat.bio || 'No bio yet'}</p>
        </div>
    `;
}

async function loadGroupChatInfo(group) {
    const chatDetails = document.getElementById('chat-details');
    chatDetails.innerHTML = `
        <div class="group-info-header">
            <img src="${group.avatar || 'assets/images/default-group.png'}" alt="${group.name}">
            <div>
                <h4>${group.name}</h4>
                <small>${group.members.length} members</small>
            </div>
        </div>
        <div class="group-info-description">
            <p>${group.description || 'No description'}</p>
        </div>
        <div class="group-members">
            <h4>Members</h4>
            <div class="members-list" id="group-members-list">
                <div class="loading">Loading members...</div>
            </div>
        </div>
    `;
    
    // Load members
    const membersList = document.getElementById('group-members-list');
    try {
        const members = await Promise.all(group.members.map(id => getUserData(id)));
        
        membersList.innerHTML = '';
        members.forEach(member => {
            if (!member) return;
            
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <img src="${member.avatar}" alt="${member.username}">
                <div class="member-info">
                    <h5>${member.username}</h5>
                    <small>${member.status || 'offline'}</small>
                </div>
                ${member.uid === group.creator ? 
                    '<span class="member-role">Admin</span>' : 
                    '<span class="member-role">Member</span>'}
            `;
            membersList.appendChild(memberItem);
        });
    } catch (error) {
        console.error('Error loading members:', error);
        membersList.innerHTML = '<div class="error">Error loading members</div>';
    }
}

async function viewUserProfile(user) {
    const chatDetails = document.getElementById('chat-details');
    chatDetails.innerHTML = `
        <div class="profile-view">
            <div class="profile-avatar">
                <img src="${user.avatar}" alt="${user.username}">
            </div>
            <div class="profile-info">
                <div class="info-item">
                    <label>Username:</label>
                    <span>${user.username}</span>
                </div>
                <div class="info-item">
                    <label>Status:</label>
                    <span class="status ${user.status || 'offline'}">
                        <span class="status-indicator status-${user.status || 'offline'}"></span>
                        ${user.status || 'offline'}
                    </span>
                </div>
                <div class="info-item">
                    <label>Last Seen:</label>
                    <span>${formatDate(user.lastSeen?.toDate())}</span>
                </div>
            </div>
            <div class="profile-bio">
                <label>Bio:</label>
                <p>${user.bio || 'No bio yet'}</p>
            </div>
            <div class="profile-actions">
                <button class="btn" id="start-chat-btn">Start Chat</button>
                <button class="btn" id="add-friend-profile-btn">Add Friend</button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    document.getElementById('start-chat-btn').addEventListener('click', () => {
        startChatWithFriend(user);
        rightSidebar.classList.add('hidden');
    });
    
    document.getElementById('add-friend-profile-btn').addEventListener('click', async () => {
        try {
            // Check if friendship already exists
            const friendshipQuery = await db.collection('friendships')
                .where('users', 'array-contains', currentUser.uid)
                .get();

            const existingFriendship = friendshipQuery.docs.find(doc => {
                const data = doc.data();
                return data.users.includes(user.uid);
            });

            if (existingFriendship) {
                const status = existingFriendship.data().status;
                if (status === 'accepted') {
                    alert('This user is already your friend');
                } else if (status === 'pending' && existingFriendship.data().sender === currentUser.uid) {
                    alert('Friend request already sent');
                } else {
                    alert('This user has already sent you a friend request');
                }
                return;
            }

            // Create new friendship
            await db.collection('friendships').add({
                users: [currentUser.uid, user.uid],
                sender: currentUser.uid,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('Friend request sent');
            rightSidebar.classList.add('hidden');
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert('Error sending friend request');
        }
    });
    
    rightSidebar.classList.remove('hidden');
}

// Close modals
modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.add('hidden');
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});
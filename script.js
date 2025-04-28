// Firebase Configuration (will be in separate file)
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// DOM Elements
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPassword = document.getElementById('forgotPassword');
const appContainer = document.getElementById('appContainer');
ar current = null;
document.querySelector('#email').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: 0,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '240 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
document.querySelector('#password').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: -336,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '240 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
document.querySelector('#submit').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: -730,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '530 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authModal.style.display = 'none';
        appContainer.style.display = 'flex';
        loadUserData(user.uid);
        setupRealTimeListeners(user.uid);
        
        // Update user status to online
        database.ref('users/' + user.uid).update({
            status: 'online',
            lastLogin: firebase.database.ServerValue.TIMESTAMP
        });
    } else {
        // No user is signed in
        authModal.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});

// Tab Switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Close Auth Modal
closeAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginInput = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Determine if input is email or phone
    let authPromise;
    if (loginInput.includes('@')) {
        // Email login
        authPromise = auth.signInWithEmailAndPassword(loginInput, password);
    } else {
        // Phone login (would need Firebase phone auth setup)
        alert("Phone login not implemented in this example");
        return;
    }
    
    authPromise
        .then((userCredential) => {
            // Update last login time
            const userId = userCredential.user.uid;
            return database.ref('users/' + userId).update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                status: 'online'
            });
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Register Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    let username = document.getElementById('registerUsername').value;
    const phone = document.getElementById('registerPhone').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    // Ensure username starts with @
    if (!username.startsWith('@')) {
        username = '@' + username;
    }
    
    // Validate username format
    if (!/^@[a-zA-Z0-9_]{3,20}$/.test(username)) {
        alert("Username must start with @ and contain 3-20 letters, numbers or underscores");
        return;
    }
    
    // Check if username is available
    database.ref('usernames').child(username).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                alert('Username already taken!');
                return Promise.reject('Username taken');
            }
            
            // Create user
            return auth.createUserWithEmailAndPassword(email, password);
        })
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Prepare user data
            const userData = {
                username: username,
                email: email,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                status: 'online',
                bio: '',
                avatar: 'https://via.placeholder.com/150'
            };
            
            // Add phone if provided
            if (phone) {
                if (!/^\+[0-9]{10,15}$/.test(phone)) {
                    alert("Phone number must be in format +1234567890");
                    return Promise.reject('Invalid phone');
                }
                userData.phone = phone;
                
                // Store phone mapping
                return database.ref('phones').child(phone).set(user.uid)
                    .then(() => {
                        // Save user data
                        return database.ref('users/' + user.uid).set(userData);
                    })
                    .then(() => {
                        // Reserve username
                        return database.ref('usernames/' + username).set(user.uid);
                    });
            } else {
                // Save user data without phone
                return database.ref('users/' + user.uid).set(userData)
                    .then(() => {
                        // Reserve username
                        return database.ref('usernames/' + username).set(user.uid);
                    });
            }
        })
        .then(() => {
            alert('Registration successful!');
            loginTab.click();
        })
        .catch((error) => {
            if (error !== 'Username taken' && error !== 'Invalid phone') {
                alert(error.message);
            }
        });
});

// Forgot Password
forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Please enter your email address:');
    
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent!');
            })
            .catch((error) => {
                alert(error.message);
            });
    }
});

// Load User Data
function loadUserData(userId) {
    database.ref('users/' + userId).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            
            // Update UI
            document.getElementById('usernameDisplay').textContent = userData.username;
            document.getElementById('profileUsername').textContent = userData.username;
            document.getElementById('userStatus').textContent = userData.status;
            document.getElementById('profileBio').value = userData.bio || '';
            document.getElementById('profilePhone').value = userData.phone || '';
            
            // Format last seen
            if (userData.lastLogin) {
                const lastSeen = new Date(userData.lastLogin);
                document.getElementById('profileLastSeen').textContent = 'Last seen: ' + lastSeen.toLocaleString();
            }
            
            // Set avatar
            if (userData.avatar) {
                document.getElementById('userAvatar').src = userData.avatar;
                document.getElementById('profileAvatar').src = userData.avatar;
            }
        });
}

// Setup Real-time Listeners
function setupRealTimeListeners(userId) {
    // Listen for user data changes
    database.ref('users/' + userId).on('value', snapshot => {
        const userData = snapshot.val();
        if (userData) {
            document.getElementById('usernameDisplay').textContent = userData.username;
            document.getElementById('profileUsername').textContent = userData.username;
            document.getElementById('userStatus').textContent = userData.status;
            document.getElementById('profileBio').value = userData.bio || '';
            document.getElementById('profilePhone').value = userData.phone || '';
            
            if (userData.lastLogin) {
                const lastSeen = new Date(userData.lastLogin);
                document.getElementById('profileLastSeen').textContent = 'Last seen: ' + lastSeen.toLocaleString();
            }
            
            if (userData.avatar) {
                document.getElementById('userAvatar').src = userData.avatar;
                document.getElementById('profileAvatar').src = userData.avatar;
            }
        }
    });
    
    // Listen for friends list
    database.ref('friends/' + userId).on('value', snapshot => {
        const friendsList = document.getElementById('friendsList');
        friendsList.innerHTML = '';
        
        if (snapshot.exists()) {
            const friends = snapshot.val();
            Object.keys(friends).forEach(friendId => {
                database.ref('users/' + friendId).once('value')
                    .then(friendSnapshot => {
                        const friendData = friendSnapshot.val();
                        if (friendData) {
                            const friendItem = document.createElement('div');
                            friendItem.className = 'friend-item';
                            friendItem.innerHTML = `
                                <img src="${friendData.avatar || 'https://via.placeholder.com/40'}" alt="Friend">
                                <div class="friend-info">
                                    <h4>${friendData.username}</h4>
                                    <p>${friendData.bio || 'No bio yet'}</p>
                                </div>
                                <div class="friend-status status-${friendData.status || 'offline'}"></div>
                            `;
                            friendItem.addEventListener('click', () => startPrivateChat(friendId, friendData.username, friendData.avatar));
                            friendsList.appendChild(friendItem);
                        }
                    });
            });
        } else {
            friendsList.innerHTML = '<p class="no-friends">No friends yet. Add some!</p>';
        }
    });
    
    // Listen for friend requests
    database.ref('friendRequests/' + userId).on('value', snapshot => {
        // Update UI to show pending requests
        const requestsBtn = document.getElementById('friendRequestsBtn');
        if (snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
            requestsBtn.classList.add('has-requests');
        } else {
            requestsBtn.classList.remove('has-requests');
        }
    });
    
    // Listen for groups
    database.ref('userGroups/' + userId).on('value', snapshot => {
        const groupsList = document.getElementById('groupsList');
        groupsList.innerHTML = '';
        
        if (snapshot.exists()) {
            const groups = snapshot.val();
            Object.keys(groups).forEach(groupId => {
                database.ref('groups/' + groupId).once('value')
                    .then(groupSnapshot => {
                        const groupData = groupSnapshot.val();
                        if (groupData) {
                            const groupItem = document.createElement('div');
                            groupItem.className = 'group-item';
                            groupItem.innerHTML = `
                                <img src="${groupData.avatar || 'https://via.placeholder.com/40'}" alt="Group">
                                <div class="group-info">
                                    <h4>${groupData.name}</h4>
                                    <p>${Object.keys(groupData.members || {}).length} members</p>
                                </div>
                            `;
                            groupItem.addEventListener('click', () => startGroupChat(groupId, groupData.name, groupData.avatar));
                            groupsList.appendChild(groupItem);
                        }
                    });
            });
        } else {
            groupsList.innerHTML = '<p class="no-groups">No groups yet. Create one!</p>';
        }
    });
}

// Start Private Chat
function startPrivateChat(userId, username, avatar) {
    const currentUserId = auth.currentUser.uid;
    const chatId = [currentUserId, userId].sort().join('_');
    
    // Update UI
    document.getElementById('currentChatName').textContent = username;
    document.getElementById('currentChatAvatar').src = avatar || 'https://via.placeholder.com/40';
    document.getElementById('currentChatStatus').textContent = 'Online';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendMessageBtn').disabled = false;
    
    // Load messages
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    database.ref('privateMessages/' + chatId).limitToLast(50).on('child_added', snapshot => {
        const message = snapshot.val();
        displayMessage(message, currentUserId);
    });
    
    // Set up message sending
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const newMessage = {
                senderId: currentUserId,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            database.ref('privateMessages/' + chatId).push(newMessage);
            messageInput.value = '';
        }
    }
    
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Start Group Chat
function startGroupChat(groupId, groupName, groupAvatar) {
    const currentUserId = auth.currentUser.uid;
    
    // Update UI
    document.getElementById('currentChatName').textContent = groupName;
    document.getElementById('currentChatAvatar').src = groupAvatar || 'https://via.placeholder.com/40';
    document.getElementById('currentChatStatus').textContent = 'Group';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendMessageBtn').disabled = false;
    
    // Load messages
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    database.ref('groupMessages/' + groupId).limitToLast(50).on('child_added', snapshot => {
        const message = snapshot.val();
        displayMessage(message, currentUserId);
    });
    
    // Set up message sending
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const newMessage = {
                senderId: currentUserId,
                text: text,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            database.ref('groupMessages/' + groupId).push(newMessage);
            messageInput.value = '';
        }
    }
    
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Display Message
function displayMessage(message, currentUserId) {
    const messagesContainer = document.getElementById('messagesContainer');
    const isCurrentUser = message.senderId === currentUserId;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'message-sent' : 'message-received'}`;
    
    // Get sender info
    let senderName = 'Unknown';
    let senderAvatar = 'https://via.placeholder.com/40';
    
    database.ref('users/' + message.senderId).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                senderName = userData.username;
                senderAvatar = userData.avatar || 'https://via.placeholder.com/40';
                
                let messageContent = '';
                
                if (message.text) {
                    messageContent = `<div class="message-content">${message.text}</div>`;
                } else if (message.fileUrl) {
                    messageContent = `
                        <div class="message-content">Sent a file</div>
                        <img src="${message.fileUrl}" class="message-file" alt="File">
                    `;
                }
                
                messageElement.innerHTML = `
                    <div class="message-info">
                        <span class="message-author">${senderName}</span>
                        <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    ${messageContent}
                `;
                
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });
}

// Add Friend Modal
document.getElementById('addFriendBtn').addEventListener('click', () => {
    const addFriendModal = document.getElementById('addFriendModal');
    addFriendModal.classList.add('active');
    
    const searchTabs = addFriendModal.querySelectorAll('.search-tab-btn');
    const friendSearch = document.getElementById('friendSearch');
    const searchResults = document.getElementById('friendSearchResults');
    
    // Set default search to username
    let searchType = 'username';
    friendSearch.placeholder = 'Search by username...';
    
    // Handle search tab switching
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            searchType = tab.getAttribute('data-search-type');
            friendSearch.placeholder = `Search by ${searchType}...`;
            friendSearch.value = '';
            searchResults.innerHTML = '';
        });
    });
    
    friendSearch.addEventListener('input', () => {
        const query = friendSearch.value.trim();
        if (query.length >= 3) {
            if (searchType === 'username') {
                searchUsersByUsername(query, searchResults);
            } else {
                searchUsersByPhone(query, searchResults);
            }
        } else {
            searchResults.innerHTML = '';
        }
    });
    
    // Close modal when clicking X
    addFriendModal.querySelector('.close-btn').addEventListener('click', () => {
        addFriendModal.classList.remove('active');
    });
});

// Search Users by Username
function searchUsersByUsername(query, resultsContainer) {
    // Ensure query starts with @
    if (!query.startsWith('@')) {
        query = '@' + query;
    }
    
    database.ref('usernames').orderByKey().startAt(query).endAt(query + '\uf8ff').once('value')
        .then(snapshot => {
            resultsContainer.innerHTML = '';
            
            if (snapshot.exists()) {
                const usernames = snapshot.val();
                const currentUserId = auth.currentUser.uid;
                
                Object.keys(usernames).forEach(username => {
                    const userId = usernames[username];
                    
                    // Don't show current user in results
                    if (userId !== currentUserId) {
                        database.ref('users/' + userId).once('value')
                            .then(userSnapshot => {
                                const userData = userSnapshot.val();
                                if (userData) {
                                    createSearchResultItem(userData, resultsContainer, currentUserId);
                                }
                            });
                    }
                });
            } else {
                resultsContainer.innerHTML = '<p class="no-results">No users found</p>';
            }
        });
}

// Search Users by Phone
function searchUsersByPhone(query, resultsContainer) {
    // Clean phone number (remove non-digit characters except +)
    const cleanQuery = query.replace(/[^\d+]/g, '');
    
    if (cleanQuery.length < 3) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    database.ref('phones').orderByKey().startAt(cleanQuery).endAt(cleanQuery + '\uf8ff').once('value')
        .then(snapshot => {
            resultsContainer.innerHTML = '';
            
            if (snapshot.exists()) {
                const phones = snapshot.val();
                const currentUserId = auth.currentUser.uid;
                
                Object.keys(phones).forEach(phone => {
                    const userId = phones[phone];
                    
                    // Don't show current user in results
                    if (userId !== currentUserId) {
                        database.ref('users/' + userId).once('value')
                            .then(userSnapshot => {
                                const userData = userSnapshot.val();
                                if (userData) {
                                    createSearchResultItem(userData, resultsContainer, currentUserId);
                                }
                            });
                    }
                });
            } else {
                resultsContainer.innerHTML = '<p class="no-results">No users found with this phone number</p>';
            }
        });
}

// Create Search Result Item
function createSearchResultItem(userData, container, currentUserId) {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
        <img src="${userData.avatar || 'https://via.placeholder.com/40'}" alt="User">
        <div class="search-result-info">
            <h4>${userData.username}</h4>
            <p>${userData.bio || 'No bio yet'}</p>
            ${userData.phone ? `<p><small>Phone: ${userData.phone}</small></p>` : ''}
        </div>
        <button class="add-friend-btn" data-userid="${userData.userId || userData.key}">Add Friend</button>
    `;
    
    // Check if already friends
    database.ref('friends/' + currentUserId + '/' + (userData.userId || userData.key)).once('value')
        .then(friendSnapshot => {
            if (friendSnapshot.exists()) {
                resultItem.querySelector('.add-friend-btn').textContent = 'Added';
                resultItem.querySelector('.add-friend-btn').disabled = true;
            }
        });
    
    container.appendChild(resultItem);
}

// Friend Requests
document.getElementById('friendRequestsBtn').addEventListener('click', () => {
    const requestsModal = document.getElementById('friendRequestsModal');
    requestsModal.classList.add('active');
    
    const currentUserId = auth.currentUser.uid;
    const requestsList = document.getElementById('friendRequestsList');
    requestsList.innerHTML = '';
    
    // Load pending friend requests
    database.ref('friendRequests/' + currentUserId).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const requests = snapshot.val();
                
                Object.keys(requests).forEach(requestId => {
                    const requesterId = requests[requestId].from;
                    const timestamp = requests[requestId].timestamp;
                    
                    database.ref('users/' + requesterId).once('value')
                        .then(userSnapshot => {
                            const userData = userSnapshot.val();
                            if (userData) {
                                const requestItem = document.createElement('div');
                                requestItem.className = 'request-item';
                                requestItem.innerHTML = `
                                    <img src="${userData.avatar || 'https://via.placeholder.com/40'}" alt="User">
                                    <div class="request-info">
                                        <h4>${userData.username}</h4>
                                        <p>Wants to be friends</p>
                                        <small>${new Date(timestamp).toLocaleString()}</small>
                                    </div>
                                    <button class="request-action-btn accept" data-requestid="${requestId}" data-userid="${requesterId}">Accept</button>
                                    <button class="request-action-btn decline" data-requestid="${requestId}">Decline</button>
                                `;
                                requestsList.appendChild(requestItem);
                            }
                        });
                });
            } else {
                requestsList.innerHTML = '<p class="no-requests">No pending friend requests</p>';
            }
        });
    
    // Close modal when clicking X
    requestsModal.querySelector('.close-btn').addEventListener('click', () => {
        requestsModal.classList.remove('active');
    });
});

// Handle Add Friend
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-friend-btn')) {
        const userId = e.target.getAttribute('data-userid');
        const currentUserId = auth.currentUser.uid;
        
        // Create friend request instead of directly adding
        const requestId = database.ref('friendRequests/' + userId).push().key;
        
        database.ref('friendRequests/' + userId + '/' + requestId).set({
            from: currentUserId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            e.target.textContent = 'Request Sent';
            e.target.disabled = true;
            alert('Friend request sent!');
        });
    }
    
    // Handle friend request actions
    if (e.target.classList.contains('request-action-btn')) {
        const requestId = e.target.getAttribute('data-requestid');
        const currentUserId = auth.currentUser.uid;
        
        if (e.target.classList.contains('accept')) {
            const requesterId = e.target.getAttribute('data-userid');
            
            // Add to both users' friend lists
            database.ref('friends/' + currentUserId + '/' + requesterId).set(true);
            database.ref('friends/' + requesterId + '/' + currentUserId).set(true);
            
            // Remove the request
            database.ref('friendRequests/' + currentUserId + '/' + requestId).remove()
                .then(() => {
                    e.target.closest('.request-item').remove();
                    alert('Friend added!');
                });
        } else if (e.target.classList.contains('decline')) {
            // Just remove the request
            database.ref('friendRequests/' + currentUserId + '/' + requestId).remove()
                .then(() => {
                    e.target.closest('.request-item').remove();
                });
        }
    }
});

// Create Group
document.getElementById('createGroupBtn').addEventListener('click', () => {
    const createGroupModal = document.getElementById('createGroupModal');
    createGroupModal.classList.add('active');
    
    const groupMemberSearch = document.getElementById('groupMemberSearch');
    const selectedMembers = document.getElementById('selectedMembers');
    const currentUserId = auth.currentUser.uid;
    let members = {};
    
    // Add current user as admin
    members[currentUserId] = 'admin';
    updateSelectedMembersUI(members);
    
    // Search for friends to add
    groupMemberSearch.addEventListener('input', () => {
        const query = groupMemberSearch.value.trim();
        if (query.length >= 3) {
            // In a real app, we'd show search results and let user select
        }
    });
    
    // Close modal when clicking X
    createGroupModal.querySelector('.close-btn').addEventListener('click', () => {
        createGroupModal.classList.remove('active');
    });
    
    // Submit group creation
    document.getElementById('createGroupSubmit').addEventListener('click', () => {
        const groupName = document.getElementById('groupName').value.trim();
        
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        if (Object.keys(members).length < 2) {
            alert('Please add at least one member');
            return;
        }
        
        // Create group
        const newGroupRef = database.ref('groups').push();
        newGroupRef.set({
            name: groupName,
            createdBy: currentUserId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            members: members
        }).then(() => {
            // Add group to each member's group list
            Object.keys(members).forEach(memberId => {
                database.ref('userGroups/' + memberId + '/' + newGroupRef.key).set(true);
            });
            
            createGroupModal.classList.remove('active');
            alert('Group created successfully!');
        });
    });
    
    function updateSelectedMembersUI(members) {
        selectedMembers.innerHTML = '';
        
        // Get member details and display them
        Object.keys(members).forEach(memberId => {
            database.ref('users/' + memberId).once('value')
                .then(snapshot => {
                    const userData = snapshot.val();
                    if (userData) {
                        const memberElement = document.createElement('div');
                        memberElement.className = 'selected-member';
                        memberElement.innerHTML = `
                            <img src="${userData.avatar || 'https://via.placeholder.com/20'}" alt="Member">
                            <span>${userData.username}</span>
                            ${memberId !== currentUserId ? '<span class="remove-member" data-userid="' + memberId + '">&times;</span>' : ''}
                        `;
                        selectedMembers.appendChild(memberElement);
                        
                        // Add remove functionality
                        const removeBtn = memberElement.querySelector('.remove-member');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', () => {
                                delete members[memberId];
                                updateSelectedMembersUI(members);
                            });
                        }
                    }
                });
        });
    }
});

// Change Avatar
document.getElementById('changeAvatarBtn').addEventListener('click', () => {
    document.getElementById('avatarUpload').click();
});

document.getElementById('avatarUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const userId = auth.currentUser.uid;
        const storageRef = storage.ref('avatars/' + userId + '/' + file.name);
        
        storageRef.put(file).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
            // Update user's avatar URL
            return database.ref('users/' + userId).update({
                avatar: downloadURL
            });
        }).then(() => {
            alert('Avatar updated successfully!');
        }).catch(error => {
            alert('Error uploading avatar: ' + error.message);
        });
    }
});

// Save Profile
document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const userId = auth.currentUser.uid;
    const newBio = document.getElementById('profileBio').value.trim();
    const newPhone = document.getElementById('profilePhone').value.trim();
    
    const updates = {
        bio: newBio
    };
    
    // Only update phone if it's changed and valid
    if (newPhone) {
        if (!/^\+[0-9]{10,15}$/.test(newPhone)) {
            alert("Phone number must be in format +1234567890");
            return;
        }
        updates.phone = newPhone;
        
        // Update phone mapping
        database.ref('phones').child(newPhone).set(userId);
    }
    
    database.ref('users/' + userId).update(updates)
        .then(() => {
            alert('Profile updated successfully!');
        });
});

// File Attachment
document.getElementById('attachFileBtn').addEventListener('click', () => {
    document.getElementById('fileUpload').click();
});

document.getElementById('fileUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const filePreviewModal = document.getElementById('filePreviewModal');
        const filePreview = document.getElementById('filePreview');
        const fileInfo = document.getElementById('fileInfo');
        
        filePreviewModal.classList.add('active');
        
        // Display file info
        fileInfo.innerHTML = `
            <p><strong>Name:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> ${file.type}</p>
        `;
        
        // Preview if image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            filePreview.innerHTML = `<i class="fas fa-file" style="font-size: 50px;"></i>`;
        }
        
        // Set up send button
        document.getElementById('sendFileBtn').onclick = () => {
            sendFile(file);
            filePreviewModal.classList.remove('active');
        };
        
        // Close modal when clicking X
        filePreviewModal.querySelector('.close-btn').addEventListener('click', () => {
            filePreviewModal.classList.remove('active');
        });
    }
});

function sendFile(file) {
    const userId = auth.currentUser.uid;
    const storageRef = storage.ref('chat_files/' + userId + '/' + Date.now() + '_' + file.name);
    
    storageRef.put(file).then(snapshot => {
        return snapshot.ref.getDownloadURL();
    }).then(downloadURL => {
        // Get current chat info
        const chatId = getCurrentChatId(); // You'd need to implement this based on your chat state
        
        if (chatId) {
            const newMessage = {
                senderId: userId,
                fileUrl: downloadURL,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            // Save to appropriate chat (private or group)
            if (chatId.includes('_')) {
                // Private chat
                database.ref('privateMessages/' + chatId).push(newMessage);
            } else {
                // Group chat
                database.ref('groupMessages/' + chatId).push(newMessage);
            }
        }
    }).catch(error => {
        alert('Error uploading file: ' + error.message);
    });
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    // Update status to offline
    const userId = auth.currentUser.uid;
    database.ref('users/' + userId).update({
        status: 'offline',
        lastLogin: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        auth.signOut();
    });
});

// Tab Switching in App
document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.sidebar-tabs .tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId + 'Tab').classList.add('active');
    });
});

// Chat Info
document.getElementById('chatInfoBtn').addEventListener('click', () => {
    document.getElementById('rightSidebar').classList.add('active');
});

document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('rightSidebar').classList.remove('active');
});

// Encryption (simplified example)
document.getElementById('encryptBtn').addEventListener('click', () => {
    alert('End-to-end encryption would be implemented here in a production app');
});

// Global Search
document.getElementById('globalSearch').addEventListener('input', (e) => {
    // In a real app, this would search across users, groups, and messages
    console.log('Searching for:', e.target.value);
});

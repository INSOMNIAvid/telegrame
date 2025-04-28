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
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const formClose = document.querySelector('.form-close');
const togglePassword = document.querySelectorAll('.toggle-password');

// Current user data
let currentUser = null;
let userData = null;

// Toggle password visibility
togglePassword.forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});

// Switch between login and signup forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Close form
formClose.addEventListener('click', () => {
    authContainer.style.display = 'none';
});

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        currentUser = user;
        loadUserData(user.uid);
    } else {
        // User is signed out
        currentUser = null;
        userData = null;
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);
        await auth.signInWithEmailAndPassword(email, password);
        
        // Hide auth and show app
        authContainer.style.display = 'none';
    } catch (error) {
        alert(error.message);
    }
});

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Format username with @ if not present
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            username: formattedUsername,
            email: email,
            avatar: 'assets/images/default-avatar.png',
            bio: '',
            status: 'online',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Hide auth and show app
        authContainer.style.display = 'none';
        
        // Switch to login form
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    } catch (error) {
        alert(error.message);
    }
});

// Load user data from Firestore
async function loadUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            userData = doc.data();
            appContainer.style.display = 'flex';
            loadAppData();
        } else {
            console.error('No user data found');
            await auth.signOut();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load app data
function loadAppData() {
    if (!currentUser || !userData) return;
    
    // Update sidebar username
    document.getElementById('sidebar-username').textContent = userData.username;
    document.getElementById('sidebar-status').textContent = userData.status;
    document.getElementById('user-avatar').src = userData.avatar;
    
    // Load profile data
    loadProfileData();
    
    // Load chats
    loadChats();
    
    // Load friends
    loadFriends();
    
    // Load groups
    loadGroups();
    
    // Set up search
    setupSearch();
    
    // Update user status
    updateUserStatus('online');
    
    // Set up beforeunload to update status when leaving
    window.addEventListener('beforeunload', () => {
        updateUserStatus('offline');
    });
}

function loadProfileData() {
    document.getElementById('profile-username').textContent = userData.username;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-status').textContent = userData.status;
    document.getElementById('profile-last-seen').textContent = 
        userData.lastSeen ? formatDate(userData.lastSeen.toDate()) : 'Now';
    document.getElementById('profile-bio').value = userData.bio || '';
    document.getElementById('profile-view-avatar').src = userData.avatar;
}

async function loadChats() {
    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '<div class="loading">Loading chats...</div>';

    try {
        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageAt', 'desc')
            .get();

        if (snapshot.empty) {
            chatsList.innerHTML = '<div class="no-chats">No chats yet</div>';
            return;
        }

        chatsList.innerHTML = '';
        snapshot.forEach(async doc => {
            const chat = doc.data();
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const otherUser = await getUserData(otherUserId);
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.chatId = doc.id;
            chatItem.innerHTML = `
                <img src="${otherUser.avatar}" alt="${otherUser.username}">
                <div class="chat-info">
                    <h4>${otherUser.username}</h4>
                    <p>${chat.lastMessage || 'No messages yet'}</p>
                </div>
                <div class="chat-time">${formatDate(chat.lastMessageAt?.toDate())}</div>
            `;
            
            chatItem.addEventListener('click', () => loadChat(doc.id, otherUser));
            chatsList.appendChild(chatItem);
        });
    } catch (error) {
        console.error('Error loading chats:', error);
        chatsList.innerHTML = '<div class="error">Error loading chats</div>';
    }
}

async function loadFriends() {
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = '<div class="loading">Loading friends...</div>';

    try {
        const snapshot = await db.collection('friendships')
            .where('users', 'array-contains', currentUser.uid)
            .where('status', '==', 'accepted')
            .get();

        if (snapshot.empty) {
            friendsList.innerHTML = '<div class="no-friends">No friends yet</div>';
            return;
        }

        friendsList.innerHTML = '';
        snapshot.forEach(async doc => {
            const friendship = doc.data();
            const friendId = friendship.users.find(id => id !== currentUser.uid);
            const friend = await getUserData(friendId);
            
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.dataset.friendId = friendId;
            friendItem.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.username}">
                <div class="friend-info">
                    <h4>${friend.username}</h4>
                    <p>${friend.bio || 'No bio yet'}</p>
                </div>
                <div class="friend-status ${friend.status || 'offline'}">
                    <span class="status-indicator status-${friend.status || 'offline'}"></span>
                    ${friend.status || 'offline'}
                </div>
            `;
            
            friendItem.addEventListener('click', () => startChatWithFriend(friend));
            friendsList.appendChild(friendItem);
        });
    } catch (error) {
        console.error('Error loading friends:', error);
        friendsList.innerHTML = '<div class="error">Error loading friends</div>';
    }
}

async function loadGroups() {
    const groupsList = document.getElementById('groups-list');
    groupsList.innerHTML = '<div class="loading">Loading groups...</div>';

    try {
        const snapshot = await db.collection('groups')
            .where('members', 'array-contains', currentUser.uid)
            .orderBy('lastMessageAt', 'desc')
            .get();

        if (snapshot.empty) {
            groupsList.innerHTML = '<div class="no-groups">No groups yet</div>';
            return;
        }

        groupsList.innerHTML = '';
        snapshot.forEach(async doc => {
            const group = doc.data();
            
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.dataset.groupId = doc.id;
            groupItem.innerHTML = `
                <img src="${group.avatar || 'assets/images/default-group.png'}" alt="${group.name}">
                <div class="group-info">
                    <h4>${group.name}</h4>
                    <p>${group.lastMessage || 'No messages yet'}</p>
                </div>
                <div class="group-members">${group.members.length} members</div>
            `;
            
            groupItem.addEventListener('click', () => loadGroupChat(doc.id, group));
            groupsList.appendChild(groupItem);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
        groupsList.innerHTML = '<div class="error">Error loading groups</div>';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    let searchTimeout;
    searchInput.addEventListener('input', async () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const formattedQuery = query.startsWith('@') ? query.substring(1) : query;
                const snapshot = await db.collection('users')
                    .where('username', '>=', `@${formattedQuery}`)
                    .where('username', '<=', `@${formattedQuery}\uf8ff`)
                    .limit(10)
                    .get();

                searchResults.innerHTML = '';
                if (snapshot.empty) {
                    searchResults.innerHTML = '<div class="no-results">No users found</div>';
                    searchResults.style.display = 'block';
                    return;
                }

                snapshot.forEach(doc => {
                    const user = doc.data();
                    if (user.uid === currentUser.uid) return;

                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <img src="${user.avatar}" alt="${user.username}">
                        <div class="search-result-info">
                            <h4>${user.username}</h4>
                            <p>${user.bio || 'No bio'}</p>
                        </div>
                    `;
                    
                    resultItem.addEventListener('click', () => {
                        viewUserProfile(user);
                        searchResults.style.display = 'none';
                        searchInput.value = '';
                    });
                    
                    searchResults.appendChild(resultItem);
                });
                
                searchResults.style.display = 'block';
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = '<div class="error">Search error</div>';
                searchResults.style.display = 'block';
            }
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

async function updateUserStatus(status) {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).update({
            status: status,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user status:', error);
    }
}

function formatDate(date) {
    if (!date) return 'Just now';
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

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

// Logout
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('messenger_currentUser');
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
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

// Create group modal
createGroupBtn.addEventListener('click', () => {
    // Load friends for group creation
    loadFriendsForGroup();
    createGroupModal.classList.remove('hidden');
});

// Change avatar
changeAvatarBtn.addEventListener('click', () => {
    avatarUpload.click();
});

avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentUser.avatar = event.target.result;
            localStorage.setItem('messenger_currentUser', JSON.stringify(currentUser));
            localStorage.setItem('messenger_users', JSON.stringify(users));
            
            // Update avatar in UI
            document.getElementById('user-avatar').src = currentUser.avatar;
            document.getElementById('profile-view-avatar').src = currentUser.avatar;
        };
        reader.readAsDataURL(file);
    }
});

// Save bio
saveBioBtn.addEventListener('click', () => {
    const newBio = document.getElementById('profile-bio').value;
    currentUser.bio = newBio;
    localStorage.setItem('messenger_currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].bio = newBio;
        localStorage.setItem('messenger_users', JSON.stringify(users));
    }
    
    alert('Bio updated successfully');
});

// Change password modal
changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.remove('hidden');
});

// Chat info
chatInfoBtn.addEventListener('click', () => {
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

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentUser) {
        // Implement message sending logic
        messageInput.value = '';
    }
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

// Helper functions
function loadFriendsForGroup() {
    const container = document.getElementById('group-members-select');
    container.innerHTML = '';
    
    // Get current user's friends
    const userFriends = friends.filter(f => 
        f.userId === currentUser.id && f.status === 'accepted'
    ).map(f => {
        const friendId = f.friendId === currentUser.id ? f.userId : f.friendId;
        return users.find(u => u.id === friendId);
    });
    
    // Add checkboxes for each friend
    userFriends.forEach(friend => {
        const div = document.createElement('div');
        div.className = 'friend-checkbox';
        div.innerHTML = `
            <input type="checkbox" id="friend-${friend.id}" value="${friend.id}">
            <img src="${friend.avatar}" alt="${friend.username}">
            <span>${friend.username}</span>
        `;
        container.appendChild(div);
    });
}

// Initialize app
if (currentUser) {
    loadAppData();
}

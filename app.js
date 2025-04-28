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
logoutBtn.addEventListener('click', async () => {
    try {
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
    addFriendModal.classList.add('active');
});

// Create group modal
createGroupBtn.addEventListener('click', async () => {
    await loadFriendsForGroup();
    createGroupModal.classList.add('active');
});

// Change avatar
changeAvatarBtn.addEventListener('click', () => {
    avatarUpload.click();
});

avatarUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && currentUser) {
        try {
            // In a real app, you would upload to Firebase Storage
            // For this example, we'll just use a data URL
            const reader = new FileReader();
            reader.onload = async (event) => {
                const avatarUrl = event.target.result;
                
                // Update user in Firestore
                await db.collection('users').doc(currentUser.uid).update({
                    avatar: avatarUrl
                });
                
                // Update local data
                userData.avatar = avatarUrl;
                updateUI();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    }
});

// Save bio
saveBioBtn.addEventListener('click', async () => {
    if (!currentUser) return;
    
    const newBio = document.getElementById('profile-bio').value;
    
    try {
        // Update user in Firestore
        await db.collection('users').doc(currentUser.uid).update({
            bio: newBio
        });
        
        // Update local data
        userData.bio = newBio;
        alert('Bio updated successfully');
    } catch (error) {
        console.error('Error updating bio:', error);
    }
});

// Change password modal
changePasswordBtn.addEventListener('click', () => {
    changePasswordModal.classList.add('active');
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

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentUser) {
        // Implement message sending logic
        // You would need to know the current chat/recipient
        messageInput.value = '';
    }
}

// Close modals
modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('active');
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Helper functions
async function loadFriendsForGroup() {
    const container = document.getElementById('group-members-select');
    container.innerHTML = '';
    
    try {
        // Get current user's friends
        const snapshot = await db.collection('friends')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'accepted')
            .get();
        
        const friendIds = snapshot.docs.map(doc => doc.data().friendId);
        
        // Get friend data
        const friendsPromises = friendIds.map(id => 
            db.collection('users').doc(id).get()
        );
        const friendsSnapshots = await Promise.all(friendsPromises);
        
        // Add checkboxes for each friend
        friendsSnapshots.forEach(doc => {
            if (doc.exists) {
                const friend = doc.data();
                const div = document.createElement('div');
                div.className = 'friend-checkbox';
                div.innerHTML = `
                    <input type="checkbox" id="friend-${doc.id}" value="${doc.id}">
                    <img src="${friend.avatar}" alt="${friend.username}">
                    <span>${friend.username}</span>
                `;
                container.appendChild(div);
            }
        });
    } catch (error) {
        console.error('Error loading friends:', error);
    }
}

// Initialize app
if (auth.currentUser) {
    loadUserData(auth.currentUser.uid);
}
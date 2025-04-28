// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const formClose = document.querySelector('.form-close');
const togglePassword = document.querySelectorAll('.toggle-password');

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

// Sample data for demonstration
let users = JSON.parse(localStorage.getItem('messenger_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('messenger_currentUser')) || null;
let messages = JSON.parse(localStorage.getItem('messenger_messages')) || [];
let friends = JSON.parse(localStorage.getItem('messenger_friends')) || [];
let groups = JSON.parse(localStorage.getItem('messenger_groups')) || [];

// Check if user is already logged in
if (currentUser) {
    authContainer.style.display = 'none';
    appContainer.style.display = 'flex';
    loadAppData();
} else {
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
}

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Find user
    const user = users.find(u => u.username === username && decryptPassword(u.password) === password);
    
    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('messenger_users', JSON.stringify(users));
        
        // Set current user
        currentUser = user;
        localStorage.setItem('messenger_currentUser', JSON.stringify(currentUser));
        
        // Hide auth and show app
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        
        // Load app data
        loadAppData();
    } else {
        alert('Invalid username or password');
    }
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate
    if (!username.startsWith('@')) {
        alert('Username must start with @');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        alert('Email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username,
        email,
        password: encryptPassword(password),
        avatar: 'assets/images/default-avatar.png',
        bio: '',
        status: 'online',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    // Add to users
    users.push(newUser);
    localStorage.setItem('messenger_users', JSON.stringify(users));
    
    // Set as current user
    currentUser = newUser;
    localStorage.setItem('messenger_currentUser', JSON.stringify(currentUser));
    
    // Hide auth and show app
    authContainer.style.display = 'none';
    appContainer.style.display = 'flex';
    
    // Load app data
    loadAppData();
    
    // Switch to login form
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Helper functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, 'secret-key').toString();
}

function decryptPassword(encrypted) {
    return CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);
}

// Load app data
function loadAppData() {
    if (!currentUser) return;
    
    // Update sidebar username
    document.getElementById('sidebar-username').textContent = currentUser.username;
    document.getElementById('sidebar-status').textContent = currentUser.status;
    document.getElementById('user-avatar').src = currentUser.avatar;
    
    // Load profile data
    loadProfileData();
    
    // Load chats
    loadChats();
    
    // Load friends
    loadFriends();
    
    // Load groups
    loadGroups();
}

function loadProfileData() {
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-status').textContent = currentUser.status;
    document.getElementById('profile-last-seen').textContent = formatDate(currentUser.lastLogin);
    document.getElementById('profile-bio').value = currentUser.bio;
    document.getElementById('profile-view-avatar').src = currentUser.avatar;
}

function loadChats() {
    // Implement chat loading logic
}

function loadFriends() {
    // Implement friends loading logic
}

function loadGroups() {
    // Implement groups loading logic
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

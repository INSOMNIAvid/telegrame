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
const globalSearch = document.getElementById('global-search');
const searchResults = document.getElementById('search-results');

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
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
    } else {
        // User is signed out
        currentUser = null;
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        // Update last login time
        await db.collection('users').doc(userCredential.user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        showError(error.message);
    }
});

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = formatUsername(document.getElementById('signup-username').value.trim());
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            username,
            email,
            avatar: 'assets/images/default-avatar.png',
            bio: '',
            status: 'online',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Send email verification
        await userCredential.user.sendEmailVerification();
        alert('Verification email sent. Please check your inbox.');
    } catch (error) {
        showError(error.message);
    }
});

// Global search
globalSearch.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    try {
        let searchQuery = query;
        if (!searchQuery.startsWith('@')) {
            searchQuery = '@' + searchQuery;
        }
        
        const snapshot = await db.collection('users')
            .where('username', '>=', searchQuery)
            .where('username', '<=', searchQuery + '\uf8ff')
            .limit(5)
            .get();
        
        searchResults.innerHTML = '';
        
        if (snapshot.empty) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No users found';
            searchResults.appendChild(noResults);
        } else {
            snapshot.forEach(doc => {
                const user = doc.data();
                if (user.uid !== currentUser.uid) { // Don't show current user in results
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <img src="${user.avatar}" alt="${user.username}">
                        <div class="search-result-info">
                            <h4>${user.username}</h4>
                            <p>${user.email}</p>
                        </div>
                    `;
                    item.addEventListener('click', () => {
                        // Open chat or show profile
                        globalSearch.value = '';
                        searchResults.classList.remove('active');
                        // Implement chat opening logic
                    });
                    searchResults.appendChild(item);
                }
            });
        }
        
        searchResults.classList.add('active');
    } catch (error) {
        console.error('Search error:', error);
    }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!globalSearch.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Helper functions
function formatUsername(username) {
    if (!username.startsWith('@')) {
        return '@' + username;
    }
    return username;
}

function showError(message) {
    alert(message); // In a real app, you'd show this in a nicer way
}

async function loadUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            userData = doc.data();
            updateUI();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateUI() {
    if (!userData) return;
    
    // Update sidebar
    document.getElementById('sidebar-username').textContent = userData.username;
    document.getElementById('sidebar-status').textContent = userData.status;
    document.getElementById('user-avatar').src = userData.avatar;
    
    // Update profile
    document.getElementById('profile-username').textContent = userData.username;
    document.getElementById('profile-email').textContent = userData.email;
    document.getElementById('profile-status').textContent = userData.status;
    document.getElementById('profile-last-seen').textContent = formatDate(userData.lastLogin?.toDate());
    document.getElementById('profile-bio').value = userData.bio || '';
    document.getElementById('profile-view-avatar').src = userData.avatar;
}

function formatDate(date) {
    if (!date) return 'Unknown';
    return date.toLocaleString();
}

// Initialize
if (auth.currentUser) {
    loadUserData(auth.currentUser.uid);
}
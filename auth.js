// Show register form
function showRegisterForm(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

// Show login form
function showLoginForm(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
}

// Login user
function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Пожалуйста, введите email и пароль');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Success - handled by auth state change
        })
        .catch(error => {
            console.error("Login error:", error);
            alert(`Ошибка входа: ${error.message}`);
        });
}

// Register new user
function registerUser() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    if (!username || !email || !password || !confirmPassword) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен содержать не менее 6 символов');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // Create user document in Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                uid: userCredential.user.uid,
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
            });
        })
        .then(() => {
            // Switch to login form after successful registration
            showLoginForm({ preventDefault: () => {} });
            alert('Регистрация прошла успешно! Теперь вы можете войти.');
        })
        .catch(error => {
            console.error("Registration error:", error);
            alert(`Ошибка регистрации: ${error.message}`);
        });
}

// Logout user
function logoutUser() {
    auth.signOut()
        .then(() => {
            currentChat = null;
            chats = [];
            users = [];
        })
        .catch(error => {
            console.error("Logout error:", error);
        });
}

// Show profile modal
function showProfileModal() {
    profileModal.style.display = 'flex';
    
    // Load current user data
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                profileUsername.value = userData.username;
                profileStatus.value = userData.statusText || '';
                profileBio.value = userData.bio || '';
                profileAvatar.src = userData.avatar || 'https://via.placeholder.com/100';
            }
        });
}

// Save profile
function saveProfile() {
    const username = profileUsername.value.trim();
    const statusText = profileStatus.value.trim();
    const bio = profileBio.value.trim();
    
    if (!username.startsWith('@')) {
        alert('Никнейм должен начинаться с @');
        return;
    }
    
    // Check if username was changed
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                if (userData.username !== username) {
                    // Check if new username is available
                    return db.collection('users').where('username', '==', username).get()
                        .then(snapshot => {
                            if (!snapshot.empty) {
                                throw new Error('Этот никнейм уже занят');
                            }
                            return true;
                        });
                }
                return true;
            }
        })
        .then(() => {
            // Update profile
            return db.collection('users').doc(currentUser.uid).update({
                username: username,
                statusText: statusText,
                bio: bio
            });
        })
        .then(() => {
            // Update UI
            usernameDisplay.textContent = username;
            profileModal.style.display = 'none';
            alert('Профиль успешно обновлен');
        })
        .catch(error => {
            console.error("Error saving profile:", error);
            alert(`Ошибка обновления профиля: ${error.message}`);
        });
}

// Upload avatar
function uploadAvatar() {
    const file = avatarUpload.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Размер файла не должен превышать 2MB');
        return;
    }
    
    // Upload to Firebase Storage
    const storageRef = storage.ref();
    const avatarRef = storageRef.child(`avatars/${currentUser.uid}/${file.name}`);
    const uploadTask = avatarRef.put(file);
    
    uploadTask.on('state_changed', 
        (snapshot) => {
            // Progress monitoring can be added here
        }, 
        (error) => {
            console.error("Upload error:", error);
            alert('Ошибка загрузки аватара');
        }, 
        () => {
            // Upload complete, get download URL
            uploadTask.snapshot.ref.getDownloadURL()
                .then(downloadURL => {
                    // Update user profile with new avatar URL
                    return db.collection('users').doc(currentUser.uid).update({
                        avatar: downloadURL
                    });
                })
                .then(() => {
                    // Update UI
                    profileAvatar.src = downloadURL;
                    userAvatar.src = downloadURL;
                    
                    // Update avatar in all chats where user participates
                    return db.collection('chats')
                        .where('participants', 'array-contains', currentUser.uid)
                        .get();
                })
                .then(snapshot => {
                    const batch = db.batch();
                    
                    snapshot.forEach(doc => {
                        if (!doc.data().isGroup) {
                            batch.update(doc.ref, {
                                [`avatar_${currentUser.uid}`]: downloadURL
                            });
                        }
                    });
                    
                    return batch.commit();
                })
                .catch(error => {
                    console.error("Error updating avatar:", error);
                });
        }
    );
}

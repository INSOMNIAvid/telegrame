// Render friends list
function renderFriendsList() {
    friendsList.innerHTML = '';
    
    if (friends.length === 0) {
        friendsList.innerHTML = '<li class="no-friends">У вас пока нет друзей</li>';
        return;
    }
    
    friends.forEach(friend => {
        const friendData = users.find(u => u.uid === friend.friendId);
        if (friendData) {
            const li = document.createElement('li');
            li.className = 'friend-item';
            li.dataset.userId = friendData.uid;
            
            li.innerHTML = `
                <img src="${friendData.avatar || 'https://via.placeholder.com/40'}" alt="${friendData.username}">
                <div class="friend-item-info">
                    <h4>${friendData.username}</h4>
                    <p class="friend-status ${friendData.status === 'online' ? 'online' : 'offline'}">
                        ${friendData.status === 'online' ? 'online' : 
                          friendData.lastSeen ? `был(а) в сети ${formatLastSeen(friendData.lastSeen.toDate())}` : 'offline'}
                    </p>
                </div>
                <div class="friend-actions">
                    <button onclick="startChatWithUser('${friendData.uid}')"><i class="fas fa-comment"></i></button>
                    <button onclick="removeFriend('${friend.friendId}')"><i class="fas fa-user-times"></i></button>
                </div>
            `;
            
            li.addEventListener('click', () => showUserProfile(friendData.uid));
            friendsList.appendChild(li);
        }
    });
}

// Render friend requests list
function renderFriendRequestsList() {
    friendRequestsList.innerHTML = '';
    
    if (friendRequests.length === 0) {
        friendRequestsList.innerHTML = '<li class="no-requests">Нет новых запросов</li>';
        return;
    }
    
    friendRequests.forEach(request => {
        const senderData = users.find(u => u.uid === request.senderId);
        if (senderData) {
            const li = document.createElement('li');
            li.className = 'friend-request-item';
            li.dataset.requestId = request.id;
            
            li.innerHTML = `
                <img src="${senderData.avatar || 'https://via.placeholder.com/40'}" alt="${senderData.username}">
                <div class="friend-item-info">
                    <h4>${senderData.username}</h4>
                    <p>Хочет добавить вас в друзья</p>
                </div>
                <div class="friend-actions">
                    <button onclick="acceptFriendRequest('${request.id}')"><i class="fas fa-check"></i></button>
                    <button onclick="declineFriendRequest('${request.id}')"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            li.addEventListener('click', () => showUserProfile(senderData.uid));
            friendRequestsList.appendChild(li);
        }
    });
}

// Show add friend modal
function showAddFriendModal() {
    addFriendModal.style.display = 'flex';
    friendUsername.value = '';
}

// Send friend request
function sendFriendRequest() {
    const username = friendUsername.value.trim();
    
    if (!username.startsWith('@')) {
        alert('Никнейм должен начинаться с @');
        return;
    }
    
    if (username === currentUser.username) {
        alert('Вы не можете добавить себя в друзья');
        return;
    }
    
    // Find user by username
    db.collection('users').where('username', '==', username).get()
        .then(snapshot => {
            if (snapshot.empty) {
                throw new Error('Пользователь с таким никнеймом не найден');
            }
            
            const userDoc = snapshot.docs[0];
            const receiverId = userDoc.id;
            
            // Check if friendship already exists
            return db.collection('friendships')
                .where('users', 'array-contains', currentUser.uid)
                .where('users', 'array-contains', receiverId)
                .get();
        })
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Этот пользователь уже у вас в друзьях');
            }
            
            // Check if request already exists
            return db.collection('friendships')
                .where('sender', '==', currentUser.uid)
                .where('receiver', '==', receiverId)
                .where('status', '==', 'pending')
                .get();
        })
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Вы уже отправили запрос этому пользователю');
            }
            
            // Create friend request
            return db.collection('friendships').add({
                users: [currentUser.uid, receiverId],
                sender: currentUser.uid,
                receiver: receiverId,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            addFriendModal.style.display = 'none';
            alert('Запрос на добавление в друзья отправлен');
        })
        .catch(error => {
            console.error("Error sending friend request:", error);
            alert(`Ошибка: ${error.message}`);
        });
}

// Send friend request from profile modal
function sendFriendRequestFromProfile(userId) {
    // Check if friendship already exists
    db.collection('friendships')
        .where('users', 'array-contains', currentUser.uid)
        .where('users', 'array-contains', userId)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Этот пользователь уже у вас в друзьях');
            }
            
            // Check if request already exists
            return db.collection('friendships')
                .where('sender', '==', currentUser.uid)
                .where('receiver', '==', userId)
                .where('status', '==', 'pending')
                .get();
        })
        .then(snapshot => {
            if (!snapshot.empty) {
                throw new Error('Вы уже отправили запрос этому пользователю');
            }
            
            // Create friend request
            return db.collection('friendships').add({
                users: [currentUser.uid, userId],
                sender: currentUser.uid,
                receiver: userId,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            userProfileModal.style.display = 'none';
            alert('Запрос на добавление в друзья отправлен');
        })
        .catch(error => {
            console.error("Error sending friend request:", error);
            alert(`Ошибка: ${error.message}`);
        });
}

// Accept friend request
function acceptFriendRequest(requestId) {
    db.collection('friendships').doc(requestId).update({
        status: 'accepted'
    })
    .then(() => {
        alert('Запрос в друзья принят');
    })
    .catch(error => {
        console.error("Error accepting friend request:", error);
        alert('Ошибка при принятии запроса');
    });
}

// Decline friend request
function declineFriendRequest(requestId) {
    db.collection('friendships').doc(requestId).delete()
    .then(() => {
        alert('Запрос в друзья отклонен');
    })
    .catch(error => {
        console.error("Error declining friend request:", error);
        alert('Ошибка при отклонении запроса');
    });
}

// Remove friend
function removeFriend(friendId) {
    // Find friendship document
    db.collection('friendships')
        .where('users', 'array-contains', currentUser.uid)
        .where('users', 'array-contains', friendId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                throw new Error('Дружба не найдена');
            }
            
            // Delete friendship
            const docId = snapshot.docs[0].id;
            return db.collection('friendships').doc(docId).delete();
        })
        .then(() => {
            userProfileModal.style.display = 'none';
            alert('Пользователь удален из друзей');
        })
        .catch(error => {
            console.error("Error removing friend:", error);
            alert(`Ошибка: ${error.message}`);
        });
}

// Render groups list
function renderGroupsList() {
    groupsList.innerHTML = '';
    
    if (groups.length === 0) {
        groupsList.innerHTML = '<li class="no-groups">У вас пока нет групп</li>';
        return;
    }
    
    groups.forEach(group => {
        const li = document.createElement('li');
        li.className = 'group-item';
        li.dataset.groupId = group.id;
        
        const lastActivity = group.lastActivity ? 
            formatTime(group.lastActivity.toDate()) : '';
        
        li.innerHTML = `
            <img src="${group.avatar || 'https://via.placeholder.com/40/3498db/ffffff?text=G'}" alt="${group.name}">
            <div class="group-item-info">
                <h4>${group.name}</h4>
                <p>${group.description || 'Нет описания'}</p>
            </div>
            <div class="group-item-time">${lastActivity}</div>
        `;
        
        li.addEventListener('click', () => openGroupChat(group.id));
        groupsList.appendChild(li);
    });
}

// Open group chat
function openGroupChat(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Find chat for this group
    db.collection('chats')
        .where('groupId', '==', groupId)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                const chatDoc = snapshot.docs[0];
                const chat = {
                    id: chatDoc.id,
                    ...chatDoc.data()
                };
                
                currentChat = chat;
                renderGroupsList();
                renderChatArea();
            }
        })
        .catch(error => {
            console.error("Error finding group chat:", error);
        });
}

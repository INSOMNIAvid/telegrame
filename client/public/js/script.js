// Основной скрипт с улучшенным функционалом

let currentChat = null;
let peerConnection = null;
let localStream = null;
let currentCall = null;

// Инициализация звонков WebRTC
async function initCall(chatId, isVideo = false) {
    try {
        currentCall = { chatId, isVideo, isCaller: true };
        
        // Получаем локальный поток (аудио/видео)
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo
        });
        
        // Создаем PeerConnection
        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        // Добавляем локальный поток
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // Обработка ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({
                    type: 'ice_candidate',
                    chatId,
                    candidate: event.candidate
                }));
            }
        };
        
        // Обработка входящего потока
        peerConnection.ontrack = (event) => {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
            }
        };
        
        // Создаем предложение
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Отправляем предложение через WebSocket
        socket.send(JSON.stringify({
            type: 'call',
            chatId,
            isVideo,
            offer
        }));
        
        // Показываем интерфейс звонка
        showCallModal(chatId, true);
    } catch (error) {
        console.error('Call error:', error);
        showNotification('Ошибка при инициализации звонка', 'error');
        endCall();
    }
}

// Обработка входящего звонка
function handleIncomingCall(data) {
    currentCall = {
        chatId: data.chatId,
        isVideo: data.isVideo,
        isCaller: false,
        callerId: data.callerId,
        offer: data.offer
    };
    
    const caller = getUserById(data.callerId);
    showCallModal(data.chatId, false, caller);
}

// Принятие звонка
async function acceptCall() {
    try {
        // Получаем локальный поток
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: currentCall.isVideo
        });
        
        // Создаем PeerConnection
        peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        // Добавляем локальный поток
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // Обработка ICE кандидатов
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({
                    type: 'ice_candidate',
                    chatId: currentCall.chatId,
                    candidate: event.candidate
                }));
            }
        };
        
        // Обработка входящего потока
        peerConnection.ontrack = (event) => {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = event.streams[0];
            }
        };
        
        // Устанавливаем удаленное предложение
        await peerConnection.setRemoteDescription(new RTCSessionDescription(currentCall.offer));
        
        // Создаем ответ
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Отправляем ответ
        socket.send(JSON.stringify({
            type: 'call_accepted',
            chatId: currentCall.chatId,
            answer
        }));
        
        // Обновляем интерфейс звонка
        document.getElementById('acceptCallBtn').classList.add('hidden');
        document.getElementById('rejectCallBtn').classList.add('hidden');
        document.getElementById('endCallBtn').classList.remove('hidden');
        document.getElementById('callStatus').textContent = 'Разговор';
        
        if (currentCall.isVideo) {
            const localVideo = document.createElement('video');
            localVideo.autoplay = true;
            localVideo.muted = true;
            localVideo.srcObject = localStream;
            document.querySelector('.call-info').appendChild(localVideo);
        }
    } catch (error) {
        console.error('Error accepting call:', error);
        showNotification('Ошибка при принятии звонка', 'error');
        endCall();
    }
}

// Завершение звонка
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (currentCall) {
        if (currentCall.isCaller || document.getElementById('acceptCallBtn').classList.contains('hidden')) {
            socket.send(JSON.stringify({
                type: 'call_ended',
                chatId: currentCall.chatId
            }));
        }
        
        currentCall = null;
    }
    
    document.getElementById('callModal').classList.add('hidden');
}

// Загрузка файлов
async function uploadFile(file) {
    try {
        // Шифруем файл перед отправкой
        const { encryptedData, key, iv } = await encryptFile(file);
        
        const formData = new FormData();
        formData.append('file', new Blob([encryptedData]), file.name);
        formData.append('key', key);
        formData.append('iv', iv);
        formData.append('chatId', currentChat.id);
        formData.append('isGroup', currentChat.isGroup);
        
        const response = await axios.post('/api/messages/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
}

// Скачивание файла
async function downloadFile(messageId) {
    try {
        const response = await axios.get(`/api/messages/download/${messageId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            responseType: 'blob'
        });
        
        // Получаем ключи для дешифрования
        const { key, iv } = response.data.metadata;
        const encryptedData = await response.data.blob.text();
        
        // Дешифруем файл
        const decryptedBlob = await decryptFile(encryptedData, key, iv);
        
        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('File download error:', error);
        throw error;
    }
}

// Обработчик отправки сообщения (обновленный для файлов)
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const content = messageInput.value.trim();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files[0];
    
    if (!content && !file) return;
    
    try {
        if (file) {
            // Отправка файла
            const uploadedFile = await uploadFile(file);
            
            socket.send(JSON.stringify({
                type: currentChat.isGroup ? 'group_message' : 'private_message',
                [currentChat.isGroup ? 'groupId' : 'chatId']: currentChat.id,
                content: '',
                file: uploadedFile,
                timestamp: Date.now()
            }));
            
            fileInput.value = '';
        } else {
            // Отправка текстового сообщения
            const encryptedContent = await encryptMessage(
                content,
                currentChat.isGroup ? 'group' : 'private',
                currentChat.isGroup ? 
                    { groupKey: await getGroupKey(currentChat.id) } : 
                    { chatId: currentChat.id }
            );
            
            socket.send(JSON.stringify({
                type: currentChat.isGroup ? 'group_message' : 'private_message',
                [currentChat.isGroup ? 'groupId' : 'chatId']: currentChat.id,
                content: encryptedContent,
                timestamp: Date.now()
            }));
        }
        
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Ошибка при отправке сообщения', 'error');
    }
}

// Улучшенное шифрование с использованием RSA для ключей и AES для сообщений

// Генерация ключевой пары RSA
async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    
    return {
        publicKey: await window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
        privateKey: await window.crypto.subtle.exportKey("jwk", keyPair.privateKey)
    };
}

// Шифрование сообщения
async function encryptMessage(message, type, metadata = {}) {
    try {
        if (type === 'private') {
            // Для личных сообщений используем общий ключ чата
            const chatKey = await getChatKey(metadata.chatId);
            const encrypted = CryptoJS.AES.encrypt(message, chatKey).toString();
            return encrypted;
        } else if (type === 'group') {
            // Для групповых сообщений используем групповой ключ
            const encrypted = CryptoJS.AES.encrypt(message, metadata.groupKey).toString();
            return encrypted;
        }
    } catch (e) {
        console.error('Encryption error:', e);
        return message;
    }
}

// Дешифрование сообщения
async function decryptMessage(encryptedMessage, type, metadata = {}) {
    try {
        if (type === 'private') {
            const chatKey = await getChatKey(metadata.chatId);
            const decrypted = CryptoJS.AES.decrypt(encryptedMessage, chatKey).toString(CryptoJS.enc.Utf8);
            return decrypted || encryptedMessage;
        } else if (type === 'group') {
            const decrypted = CryptoJS.AES.decrypt(encryptedMessage, metadata.groupKey).toString(CryptoJS.enc.Utf8);
            return decrypted || encryptedMessage;
        }
    } catch (e) {
        console.error('Decryption error:', e);
        return encryptedMessage;
    }
}

// Управление ключами
async function getChatKey(chatId) {
    let chatKey = localStorage.getItem(`chat_key_${chatId}`);
    if (!chatKey) {
        // Запрашиваем ключ с сервера
        const response = await axios.get(`/api/chats/${chatId}/key`);
        chatKey = response.data.key;
        localStorage.setItem(`chat_key_${chatId}`, chatKey);
    }
    return chatKey;
}

// Шифрование файлов
async function encryptFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileData = event.target.result;
            const key = CryptoJS.lib.WordArray.random(32).toString();
            const iv = CryptoJS.lib.WordArray.random(16).toString();
            
            const encrypted = CryptoJS.AES.encrypt(
                CryptoJS.lib.WordArray.create(fileData),
                CryptoJS.enc.Hex.parse(key),
                { iv: CryptoJS.enc.Hex.parse(iv) }
            );
            
            resolve({
                encryptedData: encrypted.toString(),
                key,
                iv
            });
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Дешифрование файлов
async function decryptFile(encryptedData, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        CryptoJS.enc.Hex.parse(key),
        { iv: CryptoJS.enc.Hex.parse(iv) }
    );
    
    return new Blob([new Uint8Array(decrypted.sigBytes)], { type: 'application/octet-stream' });
}

module.exports = {
    generateKeyPair,
    encryptMessage,
    decryptMessage,
    encryptFile,
    decryptFile
};

// Простое шифрование сообщений с использованием AES (используем библиотеку CryptoJS)
// В реальном приложении используйте более надежные методы шифрования

// Подключаем CryptoJS (в реальном приложении подключите библиотеку через CDN)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

// Генерация ключа шифрования на основе пароля пользователя
function generateEncryptionKey(password) {
    // В реальном приложении используйте более надежный метод генерации ключа
    return CryptoJS.enc.Utf8.parse(password.padEnd(32, '0').substring(0, 32));
}

// Шифрование сообщения
function encryptMessage(message, password) {
    try {
        const key = generateEncryptionKey(password);
        const iv = CryptoJS.lib.WordArray.random(16);
        
        const encrypted = CryptoJS.AES.encrypt(message, key, { 
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        // Объединяем IV и зашифрованный текст для хранения
        return iv.toString() + ':' + encrypted.toString();
    } catch (e) {
        console.error('Encryption error:', e);
        return message; // В случае ошибки возвращаем исходное сообщение
    }
}

// Дешифрование сообщения
function decryptMessage(encryptedMessage, password) {
    try {
        const parts = encryptedMessage.split(':');
        if (parts.length !== 2) return encryptedMessage; // Не зашифровано
        
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const encrypted = parts[1];
        const key = generateEncryptionKey(password);
        
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error('Decryption error:', e);
        return encryptedMessage; // В случае ошибки возвращаем исходное сообщение
    }
}

// Генерация ключа для группового чата
function generateGroupKey() {
    return CryptoJS.lib.WordArray.random(32).toString();
}

// Шифрование группового ключа для участника
function encryptGroupKeyForMember(groupKey, memberPublicKey) {
    // В реальном приложении используйте асимметричное шифрование
    // Здесь просто имитируем это
    return groupKey + '_encrypted_for_' + memberPublicKey;
}

// Дешифрование группового ключа участником
function decryptGroupKey(encryptedGroupKey, privateKey) {
    // В реальном приложении используйте асимметричное шифрование
    // Здесь просто имитируем это
    return encryptedGroupKey.replace('_encrypted_for_' + privateKey, '');
}

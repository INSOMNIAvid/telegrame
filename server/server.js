require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// База данных (временная, в памяти)
let users = [];
let messages = {
    general: []
};
let groups = [];
let onlineUsers = new Set();

// WebSocket сервер
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const userId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('userId');
    
    if (!userId) {
        ws.close();
        return;
    }
    
    // Добавляем пользователя в онлайн
    onlineUsers.add(userId);
    broadcastUserStatus(userId, true);
    
    ws.on('message', (message) => {
        handleWebSocketMessage(ws, userId, message);
    });
    
    ws.on('close', () => {
        onlineUsers.delete(userId);
        broadcastUserStatus(userId, false);
    });
});

// Обработка WebSocket сообщений
function handleWebSocketMessage(ws, userId, message) {
    try {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'send_message':
                handleNewMessage(data);
                break;
            // Другие типы сообщений...
        }
    } catch (error) {
        console.error('Ошибка обработки WebSocket сообщения:', error);
    }
}

// Обработка нового сообщения
function handleNewMessage(message) {
    // Сохраняем сообщение
    if (!messages[message.chatId]) {
        messages[message.chatId] = [];
    }
    
    messages[message.chatId].push(message);
    
    // Рассылаем сообщение всем подключенным клиентам
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'new_message',
                ...message
            }));
        }
    });
}

// Рассылка статуса пользователя
function broadcastUserStatus(userId, isOnline) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: isOnline ? 'user_online' : 'user_offline',
                userId
            }));
        }
    });
}

// Маршруты API
app.post('/login', (req, res) => {
    const { username } = req.body;
    
    // Проверяем, существует ли пользователь
    let user = users.find(u => u.username === username);
    
    if (!user) {
        // Создаем нового пользователя
        user = {
            id: generateId(),
            username,
            createdAt: new Date()
        };
        users.push(user);
        
        // Рассылаем информацию о новом пользователе
        broadcastNewUser(user);
    }
    
    res.json({ user });
});

app.get('/contacts', (req, res) => {
    const contacts = users.map(user => ({
        ...user,
        online: onlineUsers.has(user.id)
    }));
    
    res.json(contacts);
});

// Настройка загрузки файлов
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const { chatId, senderId, senderName } = req.body;
    const originalName = req.file.originalname;
    
    // Переименовываем файл для безопасного хранения
    const fileExt = path.extname(originalName);
    const newFileName = `${req.file.filename}${fileExt}`;
    fs.renameSync(req.file.path, path.join('uploads', newFileName));
    
    // Создаем сообщение о файле
    const fileMessage = {
        chatId,
        senderId,
        senderName,
        content: newFileName,
        fileName: originalName,
        type: 'file',
        timestamp: new Date().toISOString()
    };
    
    // Сохраняем и рассылаем сообщение
    handleNewMessage(fileMessage);
    
    res.json(fileMessage);
});
// Групповые чаты
app.post('/groups', (req, res) => {
    const { name, creatorId } = req.body;
    
    if (!name || !creatorId) {
        return res.status(400).json({ error: 'Не указано название группы или создатель' });
    }
    
    const creator = users.find(u => u.id === creatorId);
    if (!creator) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const group = {
        id: generateId(),
        name,
        creatorId,
        createdAt: new Date(),
        members: [creatorId]
    };
    
    groups.push(group);
    messages[group.id] = [];
    
    // Рассылаем информацию о новой группе
    broadcastNewGroup(group);
    
    res.json(group);
});

app.get('/groups', (req, res) => {
    res.json(groups);
});

app.post('/groups/:groupId/members', (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ error: 'Группа не найдена' });
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!group.members.includes(userId)) {
        group.members.push(userId);
    }
    
    res.json(group);
});

// Получение сообщений
app.get('/messages', (req, res) => {
    const { chatId } = req.query;
    
    if (!chatId) {
        return res.status(400).json({ error: 'Не указан ID чата' });
    }
    
    if (!messages[chatId]) {
        messages[chatId] = [];
    }
    
    res.json(messages[chatId]);
});

// Поиск пользователей
app.get('/users/search', (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.json([]);
    }
    
    const results = users.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json(results);
});

// Информация о пользователе
app.get('/users/:userId', (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({
        ...user,
        online: onlineUsers.has(user.id)
    });
});

// Рассылка информации о новой группе
function broadcastNewGroup(group) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'new_group',
                group
            }));
        }
    });
}
// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    
    // Создаем папку для загрузок, если ее нет
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
});

// Вспомогательные функции
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function broadcastNewUser(user) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'new_contact',
                user: {
                    ...user,
                    online: onlineUsers.has(user.id)
                }
            }));
        }
    });
}

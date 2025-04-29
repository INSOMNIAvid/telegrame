const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/messenger', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Настройка Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware для статических файлов
app.use(express.static('../client'));

// Обработка соединений Socket.io
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Отправка истории сообщений новому клиенту
    socket.on('getHistory', async () => {
        try {
            const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
            socket.emit('messageHistory', messages);
        } catch (err) {
            console.error('Error fetching message history:', err);
        }
    });
    
    // Обработка новых сообщений
    socket.on('sendMessage', async (data) => {
        try {
            // Сохраняем сообщение в БД
            const message = new Message({
                sender: data.sender,
                text: data.text,
                timestamp: new Date()
            });
            
            await message.save();
            
            // Отправляем сообщение всем подключенным клиентам
            io.emit('message', message);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
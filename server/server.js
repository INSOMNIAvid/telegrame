require('dotenv').config();
const app = require('./app');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const { setupWebSocket } = require('./services/websocket');
const { applyEncryptionMiddleware } = require('./middleware/encryption');

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Создание HTTP сервера
const server = http.createServer(app);

// Настройка WebSocket
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

// Применение middleware для шифрования
applyEncryptionMiddleware(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

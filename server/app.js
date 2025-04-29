require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/messenger', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Модели
const User = mongoose.model('User', {
  username: String,
  password: String
});

const Message = mongoose.model('Message', {
  text: String,
  user: String,
  createdAt: { type: Date, default: Date.now }
});

// API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');
    
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('sendMessage', async ({ text, user }) => {
    const message = new Message({ text, user });
    await message.save();
    io.emit('newMessage', message);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

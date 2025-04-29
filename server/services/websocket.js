const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/crypto');
const { getGroupKey } = require('./groupService');

function setupWebSocket(wss) {
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    let userId = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth' && data.token) {
          // Аутентификация пользователя (в реальном приложении проверяйте токен)
          userId = data.userId;
          clients.set(userId, ws);
          console.log(`User ${userId} connected`);
          return;
        }

        if (!userId) {
          ws.close(1008, 'Unauthorized');
          return;
        }

        // Обработка разных типов сообщений
        switch (data.type) {
          case 'private_message':
            await handlePrivateMessage(data, userId);
            break;
          case 'group_message':
            await handleGroupMessage(data, userId);
            break;
          case 'typing':
            handleTypingNotification(data, userId);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      if (userId) clients.delete(userId);
      console.log(`Client ${clientId} disconnected`);
    });
  });

  async function handlePrivateMessage(data, senderId) {
    // Сохраняем сообщение в БД
    const message = new Message({
      chat: data.chatId,
      sender: senderId,
      content: encryptMessage(data.content, 'private', { chatId: data.chatId }),
      isGroup: false
    });
    
    await message.save();
    
    // Отправляем получателю
    const recipientWs = clients.get(data.recipientId);
    if (recipientWs) {
      recipientWs.send(JSON.stringify({
        type: 'private_message',
        chatId: data.chatId,
        senderId,
        content: data.content,
        timestamp: Date.now()
      }));
    }
  }

  async function handleGroupMessage(data, senderId) {
    // Получаем групповой ключ
    const groupKey = await getGroupKey(data.groupId, senderId);
    
    // Сохраняем сообщение в БД
    const message = new Message({
      chat: data.groupId,
      sender: senderId,
      content: encryptMessage(data.content, 'group', { groupKey }),
      isGroup: true
    });
    
    await message.save();
    
    // Отправляем всем участникам группы
    const groupMembers = await getGroupMembers(data.groupId);
    groupMembers.forEach(memberId => {
      if (memberId !== senderId) {
        const memberWs = clients.get(memberId);
        if (memberWs) {
          memberWs.send(JSON.stringify({
            type: 'group_message',
            groupId: data.groupId,
            senderId,
            content: data.content,
            timestamp: Date.now()
          }));
        }
      }
    });
  }

  function handleTypingNotification(data, senderId) {
    const recipientWs = clients.get(data.recipientId);
    if (recipientWs) {
      recipientWs.send(JSON.stringify({
        type: 'typing',
        chatId: data.chatId,
        senderId
      }));
    }
  }
}

module.exports = { setupWebSocket };

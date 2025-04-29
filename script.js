document.addEventListener('DOMContentLoaded', function() {
    // Пример данных чатов
    const chats = [
        {
            id: 1,
            name: "Алексей Петров",
            lastMessage: "Привет, как дела?",
            time: "12:30",
            avatar: "AP",
            messages: [
                { text: "Привет!", time: "12:25", incoming: true },
                { text: "Как дела?", time: "12:25", incoming: true },
                { text: "Привет! Все отлично, спасибо!", time: "12:30", incoming: false }
            ]
        },
        {
            id: 2,
            name: "Мария Иванова",
            lastMessage: "Документы готовы",
            time: "10:15",
            avatar: "МИ",
            messages: [
                { text: "Здравствуйте, документы готовы к отправке.", time: "10:10", incoming: true },
                { text: "Отлично, отправляйте их сегодня.", time: "10:15", incoming: false }
            ]
        },
        {
            id: 3,
            name: "Команда проекта",
            lastMessage: "Иван: Завтра встреча в 15:00",
            time: "09:45",
            avatar: "КП",
            messages: [
                { text: "Всем привет! Напоминаю о завтрашней встрече.", time: "09:30", incoming: true, sender: "Иван" },
                { text: "Готовы обсудить новый дизайн.", time: "09:35", incoming: true, sender: "Ольга" },
                { text: "Я подготовил презентацию.", time: "09:40", incoming: false },
                { text: "Завтра встреча в 15:00", time: "09:45", incoming: true, sender: "Иван" }
            ]
        },
        {
            id: 4,
            name: "Техподдержка",
            lastMessage: "Ваш запрос решен",
            time: "Вчера",
            avatar: "ТП",
            messages: [
                { text: "Здравствуйте! Чем можем помочь?", time: "16:20", incoming: true },
                { text: "У меня проблема с входом в аккаунт.", time: "16:25", incoming: false },
                { text: "Мы проверили ваш аккаунт. Попробуйте сейчас.", time: "16:40", incoming: true },
                { text: "Ваш запрос решен", time: "16:45", incoming: true }
            ]
        }
    ];

    const chatList = document.querySelector('.chat-list');
    const messagesContainer = document.querySelector('.messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatName = document.querySelector('.chat-name');
    const noChatSelected = document.querySelector('.no-chat-selected');
    
    let activeChatId = null;

    // Отображение списка чатов
    function renderChatList() {
        chatList.innerHTML = '';
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = chat.id;
            
            chatItem.innerHTML = `
                <div class="chat-item-avatar">${chat.avatar}</div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${chat.name}</div>
                    <div class="chat-item-last-message">${chat.lastMessage}</div>
                    <div class="chat-item-time">${chat.time}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => openChat(chat.id));
            chatList.appendChild(chatItem);
        });
    }

    // Открытие чата
    function openChat(chatId) {
        activeChatId = chatId;
        const chat = chats.find(c => c.id == chatId);
        
        // Обновляем заголовок чата
        chatName.textContent = chat.name;
        noChatSelected.style.display = 'none';
        
        // Помечаем активный чат в списке
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id == chatId);
        });
        
        // Очищаем контейнер сообщений
        messagesContainer.innerHTML = '';
        
        // Добавляем сообщения
        chat.messages.forEach(message => {
            addMessage(message.text, message.time, message.incoming, message.sender);
        });
        
        // Прокручиваем вниз
        scrollToBottom();
    }

    // Добавление сообщения
    function addMessage(text, time, incoming, sender = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${incoming ? 'message-incoming' : 'message-outgoing'}`;
        
        if (sender) {
            text = `<strong>${sender}:</strong> ${text}`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // Прокрутка вниз
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Отправка сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text && activeChatId) {
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            // Добавляем сообщение в UI
            addMessage(text, time, false);
            
            // Находим активный чат и обновляем его данные
            const activeChat = chats.find(c => c.id == activeChatId);
            activeChat.messages.push({ text, time, incoming: false });
            activeChat.lastMessage = text;
            activeChat.time = time;
            
            // Очищаем поле ввода
            messageInput.value = '';
            
            // Обновляем список чатов
            renderChatList();
        }
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Инициализация
    renderChatList();
});
// Добавляем к предыдущему коду в script.js

    // Функция для создания тестового входящего сообщения
    function simulateIncomingMessage() {
        if (activeChatId) {
            const responses = [
                "Да, конечно!",
                "Я сейчас занят, перезвоню позже.",
                "Спасибо за информацию!",
                "Вы получили документы?",
                "Давайте встретимся завтра.",
                "Я думаю, это хорошая идея.",
                "Можете уточнить детали?",
                "Рад это слышать!",
                "Как ваши дела?",
                "Что вы думаете по этому поводу?"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const now = new Date();
            const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const activeChat = chats.find(c => c.id == activeChatId);
            const sender = activeChat.messages.find(m => m.incoming && m.sender)?.sender || null;
            
            // Добавляем сообщение в UI
            addMessage(randomResponse, time, true, sender);
            
            // Обновляем данные чата
            activeChat.messages.push({
                text: randomResponse,
                time: time,
                incoming: true,
                sender: sender
            });
            
            activeChat.lastMessage = sender ? `${sender}: ${randomResponse}` : randomResponse;
            activeChat.time = time;
            
            // Обновляем список чатов
            renderChatList();
        }
    }

    // Имитация получения сообщения каждые 10-30 секунд
    setInterval(() => {
        if (Math.random() > 0.7 && activeChatId) { // 30% chance of receiving a message
            simulateIncomingMessage();
        }
    }, 10000 + Math.random() * 20000);

    // Улучшенный поиск по чатам
    const searchInput = document.querySelector('.sidebar-header input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.chat-item-last-message').textContent.toLowerCase();
            if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Добавляем обработчик клика по смайлику
    document.querySelector('.fa-smile').addEventListener('click', function() {
        const emojis = ['😀', '😂', '😊', '🤔', '😎', '👍', '❤️', '🔥', '🎉', '🙏'];
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-container';
        emojiContainer.style.position = 'absolute';
        emojiContainer.style.bottom = '60px';
        emojiContainer.style.right = '60px';
        emojiContainer.style.display = 'flex';
        emojiContainer.style.flexWrap = 'wrap';
        emojiContainer.style.width = '150px';
        emojiContainer.style.backgroundColor = 'white';
        emojiContainer.style.borderRadius = '8px';
        emojiContainer.style.padding = '10px';
        emojiContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        emojiContainer.style.zIndex = '1000';
        
        emojis.forEach(emoji => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            emojiSpan.style.fontSize = '20px';
            emojiSpan.style.margin = '5px';
            emojiSpan.style.cursor = 'pointer';
            emojiSpan.addEventListener('click', function() {
                messageInput.value += emoji;
                emojiContainer.remove();
            });
            emojiContainer.appendChild(emojiSpan);
        });
        
        document.body.appendChild(emojiContainer);
        
        // Удаляем контейнер при клике вне его
        setTimeout(() => {
            document.addEventListener('click', function outsideClick(e) {
                if (!emojiContainer.contains(e.target) {
                    emojiContainer.remove();
                    document.removeEventListener('click', outsideClick);
                }
            });
        }, 0);
    });

    // Добавляем обработчик для кнопки прикрепления файла
    document.querySelector('.fa-paperclip').addEventListener('click', function() {
        alert('Функция отправки файлов будет реализована в следующей версии!');
    });

    // Добавляем анимацию при отправке сообщения
    sendButton.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    sendButton.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });

    // Добавляем дату между сообщениями
    function addDateSeparator(dateText) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        separator.textContent = dateText;
        separator.style.textAlign = 'center';
        separator.style.margin = '20px 0';
        separator.style.color = '#667781';
        separator.style.fontSize = '12px';
        messagesContainer.appendChild(separator);
    }

    // Пример использования разделителя дат
    if (messagesContainer.children.length === 0) {
        addDateSeparator('Сегодня');
    }
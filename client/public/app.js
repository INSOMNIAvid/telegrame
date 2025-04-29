const { createApp, ref, onMounted, nextTick } = Vue;

createApp({
  setup() {
    const isAuthenticated = ref(false);
    const currentUser = ref('');
    const messages = ref([]);
    const newMessage = ref('');
    const loginData = ref({ username: '', password: '' });
    const registerData = ref({ username: '', password: '' });
    const showRegister = ref(false);
    const chat = ref(null);
    const socket = io(process.env.VUE_APP_API_URL || 'http://localhost:5000');

    const scrollToBottom = () => {
      nextTick(() => {
        if (chat.value) {
          chat.value.scrollTop = chat.value.scrollHeight;
        }
      });
    };

    const loadMessages = async () => {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000'}/api/messages`);
        const data = await response.json();
        messages.value = data;
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    const login = async () => {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000'}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData.value)
        });
        
        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem('token', token);
          currentUser.value = loginData.value.username;
          isAuthenticated.value = true;
          connectSocket(token);
          loadMessages();
        } else {
          alert('Ошибка входа');
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    };

    const register = async () => {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000'}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData.value)
        });
        
        if (response.ok) {
          alert('Регистрация успешна. Теперь вы можете войти.');
          showRegister.value = false;
        } else {
          alert('Ошибка регистрации');
        }
      } catch (error) {
        console.error('Register error:', error);
      }
    };

    const logout = () => {
      localStorage.removeItem('token');
      isAuthenticated.value = false;
      currentUser.value = '';
      socket.disconnect();
    };

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        socket.emit('sendMessage', {
          text: newMessage.value,
          user: currentUser.value
        });
        newMessage.value = '';
      }
    };

    const connectSocket = (token) => {
      socket.auth = { token };
      socket.connect();

      socket.on('newMessage', (message) => {
        messages.value.push(message);
        scrollToBottom();
      });

      socket.on('connect_error', (err) => {
        console.log('Socket connection error:', err);
      });
    };

    onMounted(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          currentUser.value = decoded.username;
          isAuthenticated.value = true;
          connectSocket(token);
          loadMessages();
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    });

    return {
      isAuthenticated,
      currentUser,
      messages,
      newMessage,
      loginData,
      registerData,
      showRegister,
      chat,
      login,
      register,
      logout,
      sendMessage
    };
  }
}).mount('#app');

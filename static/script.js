
// Global Variables
let isRecording = false;
let recognition = null;
let currentUsername = 'Usuario';
let isDarkTheme = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupSpeechRecognition();
    loadUserPreferences();
});

// Initialize the application
function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        enableDarkTheme();
    }
    
    // Focus on input
    document.getElementById('messageInput').focus();
    
    // Add sample messages for demo
    addSampleMessages();
}

// Add sample messages for demonstration
function addSampleMessages() {
    setTimeout(() => {
        addMessage('user', '¡Hola! ¿Cómo estás?');
    }, 1000);
    
    setTimeout(() => {
        addMessage('assistant', '¡Hola! Estoy muy bien, gracias por preguntar. Soy tu asistente de IA y estoy aquí para ayudarte con cualquier cosa que necesites. ¿En qué puedo asistirte hoy?');
    }, 2000);
}

// Toggle theme
function toggleTheme() {
    if (isDarkTheme) {
        disableDarkTheme();
    } else {
        enableDarkTheme();
    }
}

function enableDarkTheme() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle i').className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
    isDarkTheme = true;
}

function disableDarkTheme() {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('.theme-toggle i').className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
    isDarkTheme = false;
}

// Handle key press in input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message function
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Animate assistant face
    animateAssistantFace(true);
    
    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        animateAssistantFace(false);
        
        const response = generateAIResponse(message);
        addMessage('assistant', response);
        
        // Speak the response if voice is enabled
        if (document.getElementById('voiceEnabled').checked) {
            speakText(response);
        }
    }, 1500 + Math.random() * 1000);
}

// Add message to chat
function addMessage(sender, content) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}-message`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${content}</p>
        </div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Generate AI response (simulated)
function generateAIResponse(userMessage) {
    const responses = [
        "Esa es una excelente pregunta. Déjame pensarlo un momento...",
        "Entiendo perfectamente lo que me dices. Aquí tienes mi respuesta:",
        "¡Qué interesante! Me gusta mucho tu forma de pensar sobre esto.",
        "Basándome en lo que me has contado, creo que la mejor respuesta es:",
        "Perfecto, puedo ayudarte con eso. Aquí está mi sugerencia:",
        "¡Claro! Esa es una de mis áreas favoritas para ayudar.",
        "Excelente punto. Permíteme explicarte mi perspectiva:"
    ];
    
    const specificResponses = {
        'hola': '¡Hola! ¿Cómo estás hoy? Me alegra mucho poder chatear contigo.',
        'como estas': 'Estoy funcionando perfectamente, gracias por preguntar. ¿Y tú cómo te encuentras?',
        'ayuda': 'Por supuesto, estoy aquí para ayudarte. ¿Qué necesitas específicamente?',
        'gracias': '¡De nada! Siempre es un placer ayudarte. ¿Hay algo más en lo que pueda asistirte?',
        'adios': 'Ha sido genial chatear contigo. ¡Que tengas un día maravilloso! Vuelve cuando gustes.',
        'nombre': `Mi nombre es Asistente AI, pero puedes llamarme como prefieras. ¿Y tú cómo te llamas?`,
        'tiempo': `No puedo acceder a información del tiempo en tiempo real, pero te recomiendo revisar una app de clima confiable.`,
        'chiste': '¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae a los bugs! 😄'
    };
    
    // Check for specific keywords
    const lowerMessage = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(specificResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }
    
    // Return a random generic response
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const followUps = [
        " ¿Te gustaría saber más sobre este tema?",
        " ¿Esto responde a tu pregunta?",
        " ¿Hay algo específico que te gustaría que profundice?",
        " ¿Te resulta útil esta información?",
        " ¿Necesitas que te explique algo más?"
    ];
    
    return randomResponse + followUps[Math.floor(Math.random() * followUps.length)];
}

// Show/Hide typing indicator
function showTypingIndicator() {
    document.getElementById('typingIndicator').classList.add('show');
}

function hideTypingIndicator() {
    document.getElementById('typingIndicator').classList.remove('show');
}

// Animate assistant face
function animateAssistantFace(isSpeaking) {
    const mouth = document.getElementById('mouth');
    const face = document.querySelector('.face');
    
    if (isSpeaking) {
        mouth.classList.add('talking');
        face.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
    } else {
        mouth.classList.remove('talking');
        face.style.boxShadow = '0 10px 30px var(--shadow-lg)';
    }
}

// Speech Recognition Setup
function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onstart = function() {
            isRecording = true;
            const voiceButton = document.getElementById('voiceButton');
            const voiceIndicator = document.getElementById('voiceIndicator');
            voiceButton.classList.add('recording');
            voiceIndicator.classList.add('active');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('messageInput').value = transcript;
        };
        
        recognition.onend = function() {
            isRecording = false;
            const voiceButton = document.getElementById('voiceButton');
            const voiceIndicator = document.getElementById('voiceIndicator');
            voiceButton.classList.remove('recording');
            voiceIndicator.classList.remove('active');
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            const voiceButton = document.getElementById('voiceButton');
            const voiceIndicator = document.getElementById('voiceIndicator');
            voiceButton.classList.remove('recording');
            voiceIndicator.classList.remove('active');
        };
    }
}

// Toggle voice recording
function toggleVoiceRecording() {
    if (!recognition) {
        alert('Lo siento, tu navegador no soporta reconocimiento de voz.');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Text to Speech
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onstart = function() {
            animateAssistantFace(true);
        };
        
        utterance.onend = function() {
            animateAssistantFace(false);
        };
        
        speechSynthesis.speak(utterance);
    }
}

// Settings Modal Functions
function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
    const username = document.getElementById('username').value;
    const voiceEnabled = document.getElementById('voiceEnabled').checked;
    
    if (username.trim()) {
        currentUsername = username.trim();
        localStorage.setItem('username', currentUsername);
    }
    
    localStorage.setItem('voiceEnabled', voiceEnabled);
    closeSettings();
}

function loadUserPreferences() {
    const savedUsername = localStorage.getItem('username');
    const savedVoiceEnabled = localStorage.getItem('voiceEnabled');
    
    if (savedUsername) {
        currentUsername = savedUsername;
        document.getElementById('username').value = savedUsername;
    }
    
    if (savedVoiceEnabled !== null) {
        document.getElementById('voiceEnabled').checked = savedVoiceEnabled === 'true';
    }
}

// Add settings button to header (call this after DOM is loaded)
document.addEventListener('DOMContentLoaded', function() {
    const headerActions = document.querySelector('.header-actions');
    const settingsButton = document.createElement('button');
    settingsButton.className = 'theme-toggle';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
    settingsButton.onclick = openSettings;
    headerActions.insertBefore(settingsButton, headerActions.firstChild);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape to close modal
    if (event.key === 'Escape') {
        closeSettings();
    }
    
    // Ctrl/Cmd + / to toggle theme
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        toggleTheme();
    }
});

// Add click outside modal to close
document.getElementById('settingsModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeSettings();
    }
});

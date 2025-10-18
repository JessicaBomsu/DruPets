// Sistema de Chat
class ChatSystem {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSuggestionButtons(); 
        this.loadChatHistory();
        this.startAutoCleanup(); 
    }

    setupEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatClose = document.getElementById('chatClose');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');

        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }

        if (chatClose) {
            chatClose.addEventListener('click', () => this.closeChat());
        }

        if (chatSend) {
            chatSend.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    // Lógica para que os botões de sugestão funcionem
    setupSuggestionButtons() {
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');
        const chatInput = document.getElementById('chatInput');
        const suggestions = document.getElementById('chatSuggestions'); // Captura o container

        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                
                chatInput.value = question;
                this.sendMessage();
                
                // MANTIDO: Sugestões visíveis para que o usuário possa clicar em outras
                if (suggestions) {
                    suggestions.style.display = 'flex'; 
                }
            });
        });
    }

    toggleChat() {
        const chatPopup = document.getElementById('chatPopup');
        if (!chatPopup) return;

        this.isOpen = !this.isOpen;
        chatPopup.classList.toggle('active');
        
        if (this.isOpen) {
            this.loadChatHistory();
            
            // Garante que as sugestões estejam visíveis ao abrir o chat
            const suggestions = document.getElementById('chatSuggestions');
            if (suggestions) {
                suggestions.style.display = 'flex'; 
            }
        }
    }

    closeChat() {
        const chatPopup = document.getElementById('chatPopup');
        if (!chatPopup) return;

        this.isOpen = false;
        chatPopup.classList.remove('active');
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (message === '') return;

        this.addMessage(message, 'user');
        chatInput.value = '';

        setTimeout(() => {
            this.processMessage(message);
        }, 800 + Math.random() * 800); 
    }
    
    // Configura o temporizador de limpeza a cada 15 minutos
    startAutoCleanup() {
        const fifteenMinutes = 15 * 60 * 1000; 

        this.cleanupInterval = setInterval(() => {
            
            this.clearChatHistory(); 
            this.addMessage('Sua conversa anterior foi apagada automaticamente por questões de privacidade (a cada 15 minutos). Olá de novo!', 'bot');
            
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

        }, fifteenMinutes);
    }

    // Função principal de processamento de mensagem
    processMessage(message) {
        const lowerCaseMessage = message.toLowerCase().trim();
        let botResponse = '';

        // Mapeamento de Perguntas Prontas
        const questionMap = {
            'o que é o DruPets?': 'quem somos',
            'brinquedo para cachorro': 'qual brinquedo ideal para cachorro',
            'saúde para gatos': 'dicas de saude para gatos',
            'adotar um pet': 'como posso adotar um pet?',
            'o que e o DruPets': 'quem somos',
            'saude para gatos': 'dicas de saude para gatos',
            'como posso adotar um pet': 'como posso adotar um pet?'
        };

        // 1. Dicionário de Perguntas Estáticas
        const tipsResponses = {
            // == Institucional (DruPets) ==
            'quem somos': "Somos o **DruPets**, uma plataforma que conecta animais abandonados ou perdidos a lares seguros e amorosos. Nossa missão é facilitar a adoção e o reencontro!",
            'nossa missao': "Nossa missão é facilitar a adoção e o reencontro de pets, além de fornecer informações úteis para a comunidade pet do **DruPets**. Adotar é um ato de amor!",
            'sobre o site': "O **DruPets** é uma ponte entre protetores, ONGs e pessoas dispostas a adotar ou ajudar. Veja animais para adoção, cadastre achados/perdidos e muito mais.",
            
            // == Dicas de Brinquedos e Produtos ==
            'comprar para gato': "Para gatos, o ideal são **Varinhas com Penas ou Bichinhos** (imitam a caça e ativam o instinto) e **Bolinhas com Guizos** (adoram som e movimento). **Túneis e Arranhadores** são essenciais para arranhar, se alongar e se esconder.",
            'comprar para cachorro': "O brinquedo ideal para cães depende do estilo de brincar! Para **roedores**, use brinquedos robustos de borracha (como Kong) recheados com petisco. Para **puxadores**, cordas de nylon resistente são ótimas. Para **estimulação mental**, use brinquedos que escondem petiscos (farejadores).",
            'qual brinquedo ideal para cachorro': "O brinquedo ideal para cães depende do estilo de brincar! Para **roedores**, use brinquedos robustos de borracha (como Kong) recheados com petisco. Para **puxadores**, cordas de nylon resistente são ótimas. Para **estimulação mental**, use brinquedos que escondem petiscos (farejadores).",
            'seguranca brinquedos': "Sempre supervisione a brincadeira! Escolha brinquedos do tamanho adequado para evitar engasgos e descarte se o brinquedo estiver quebrado.",
            'brinquedo ideal': "O brinquedo ideal depende da espécie, tamanho e personalidade do seu animal. O objetivo é entreter, exercitar e evitar o tédio.",
            
            // == Dicas de Saúde e Cuidado ==
            'saude gato': "A saúde felina é delicada! Garanta vacinação em dia, vermifugação regular e ração de alta qualidade. Se notar mudanças drásticas ou falta de apetite, consulte o veterinário imediatamente.",
            'dicas de saude para gatos': "A saúde felina é delicada! Garanta vacinação em dia, vermifugação regular e ração de alta qualidade. Se notar mudanças drásticas ou falta de apetite, consulte o veterinário imediatamente.",
            'saude cachorro': "Para a saúde canina, foco na prevenção: vacinas anuais (V8/V10 e raiva), controle de parasitas (pulgas/carrapatos) e exercícios diários. Lembre-se: **ninguém conhece seu animal melhor que você**.",
            'castracao': "A castração é vital! Ajuda a prevenir doenças como câncer de mama e próstata, reduz fugas e a superpopulação. Fale com seu veterinário sobre a melhor idade para castrar seu pet.",
            
            // == Perguntas de Adoção e Eventos ==
            'como posso adotar um pet?': "Para adotar, visite a seção **Adotar** do **DruPets** e veja os perfis disponíveis! Você pode usar os filtros de espécie e porte. Adotar é um ato de amor! 🐾",
            'adotar': "Para adotar, visite a seção **Adotar** do **DruPets** e veja os perfis disponíveis! Você pode usar os filtros de espécie e porte. 🐾",
            'evento': "Confira nossa seção de **Feira de Adoções** para ver eventos próximos de você!",
            'o que sao feiras de adocao': "Feiras de Adoção são eventos organizados por ONGs e protetores para apresentar os animais a potenciais adotantes. É uma ótima chance de conhecer seu novo amigo pessoalmente!",

            // == Respostas Base ==
            'ola': "Olá! 😊 Como posso ajudar você hoje?",
            'oi': "Olá! 😊 Como posso ajudar você hoje?",
            'contato': "Você pode nos contatar por email: contato@drupets.org ou telefone: (11) 3456-7890",
        };

        let responseKey = lowerCaseMessage;
        
        // Verifica se a mensagem é uma das perguntas prontas e mapeia para a chave correta
        if (questionMap[lowerCaseMessage]) {
            responseKey = questionMap[lowerCaseMessage];
        }

        // Tentar responder com as dicas estáticas primeiro (usando a chave mapeada ou a mensagem original)
        if (tipsResponses[responseKey]) {
            botResponse = tipsResponses[responseKey];
            this.addMessage(botResponse, 'bot');
            return;
        }

        // 2. Busca Inteligente no Google (Fallback)
        
        let searchTerm = lowerCaseMessage
            .replace(/posso|onde|quero|comprar|qual|o que|de|um|uma|como|para|o/g, '')
            .trim();

        if (searchTerm.length < 5) {
             searchTerm = lowerCaseMessage; 
        }

        const googleSearchQuery = `${searchTerm} dicas pet DruPets`;
        
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(googleSearchQuery)}`;
        
        botResponse = `Sou um assistente virtual e não encontrei a resposta imediata sobre **${searchTerm}**. Mas posso ajudar você a buscar artigos e dicas em blogs especializados!\n\n`;
        botResponse += `Link: ${googleSearchUrl}`; 
        
        this.addMessage(botResponse, 'bot');
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        this.saveToHistory(text, sender);

        // --- Processamento de Formatação (Links e Negrito) ---
        let htmlContent = text.replace(/\n/g, '<br>');

        htmlContent = htmlContent.replace(
            /(Link:)\s*(https?:\/\/[^\s<]+)/g,
            (match, label, url) => `${label} <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir Pesquisa do Google</a>`
        );

        htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        messageDiv.innerHTML = htmlContent;
        // --- FIM DO PROCESSAMENTO ---

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    saveToHistory(text, sender) {
        let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({ message: text, sender: sender, timestamp: new Date().toISOString() });
        
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(chatHistory.length - 50);
        }

        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    loadChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // ** Mensagem inicial do robô (Ajustada para DruPets) **
        const initialMessageText = 'Olá! Eu sou o DruPetsBot, um assistente virtual. Posso te ajudar com dúvidas sobre o site, adoção, ou buscar dicas de saúde e produtos. Pergunte!';
        
        chatMessages.innerHTML = '';
        
        const initialDiv = document.createElement('div');
        initialDiv.className = 'message bot';
        initialDiv.textContent = initialMessageText;
        chatMessages.appendChild(initialDiv);
        

        chatHistory.forEach(entry => {
            if (entry.message.trim() === initialMessageText.trim()) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${entry.sender}`;
            
            let htmlContent = entry.message.replace(/\n/g, '<br>');
            htmlContent = htmlContent.replace(
                /(Link:)\s*(https?:\/\/[^\s<]+)/g,
                (match, label, url) => `${label} <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir Pesquisa do Google</a>`
            );
            htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            messageDiv.innerHTML = htmlContent;
            chatMessages.appendChild(messageDiv);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChatHistory() {
        localStorage.removeItem('chatHistory');
        this.loadChatHistory();
    }
}

// Inicializar chat quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.chatSystem = new ChatSystem();
});
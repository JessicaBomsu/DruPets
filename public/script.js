// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyBudkk0obhdXCXfx08VvQP90zB5EsOcUAY",
    authDomain: "pex25-a64be.firebaseapp.com",
    databaseURL: "https://pex25-a64be-default-rtdb.firebaseio.com",
    projectId: "pex25-a64be",
    storageBucket: "pex25-a64be.firebasestorage.app",
    messagingSenderId: "524883286653",
    appId: "1:524883286653:web:8e2c8d9028d69e7d996f14",
    measurementId: "G-RE34NV3ZMH"
};

// Inicializar Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    console.log("Firebase inicializado com sucesso!");
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    showNotification('Erro ao conectar com o banco de dados', 'error');
}

const database = firebase.database();
const auth = firebase.auth();

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let isLoginMode = true;
let map = null;

// ===== SISTEMA DE AUTENTICAÇÃO =====
function openAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    resetAuthForm();
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    resetAuthForm();
}

function switchAuthMode() {
    isLoginMode = !isLoginMode;
    updateAuthUI();
}

function updateAuthUI() {
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchText = document.getElementById('auth-switch-text');
    
    // Elementos opcionais para cadastro
    const nameGroup = document.getElementById('auth-name-group');
    const cpfGroup = document.getElementById('auth-cpf-group');
    const dataGroup = document.getElementById('auth-data-nascimento-group');
    const enderecoGroup = document.getElementById('auth-endereco-group');

    if (isLoginMode) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Entrar';
        switchText.innerHTML = 'Não tem uma conta? <a href="#" onclick="switchAuthMode()">Cadastre-se</a>';
        
        // Esconder campos opcionais
        nameGroup.style.display = 'none';
        cpfGroup.style.display = 'none';
        dataGroup.style.display = 'none';
        enderecoGroup.style.display = 'none';
    } else {
        title.textContent = 'Cadastro';
        submitBtn.textContent = 'Cadastrar';
        switchText.innerHTML = 'Já tem uma conta? <a href="#" onclick="switchAuthMode()">Faça login</a>';
        
        // Mostrar campos opcionais
        nameGroup.style.display = 'block';
        cpfGroup.style.display = 'block';
        dataGroup.style.display = 'block';
        enderecoGroup.style.display = 'block';
    }
}

function resetAuthForm() {
    document.getElementById('auth-form').reset();
    isLoginMode = true;
    updateAuthUI();
}

// Sistema de autenticação
document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const cpf = document.getElementById('auth-cpf').value;
    const dataNascimento = document.getElementById('auth-data-nascimento').value;
    const endereco = document.getElementById('auth-endereco').value;

    const submitBtn = document.getElementById('auth-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    submitBtn.disabled = true;

    try {
        if (isLoginMode) {
            // Login
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            currentUser = userCredential.user;
            showNotification('Login realizado com sucesso!', 'success');
        } else {
            // Cadastro
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            currentUser = userCredential.user;
            
            // Salvar dados adicionais no Realtime Database
            await database.ref('usuarios/' + currentUser.uid).set({
                nome: name,
                cpf: cpf,
                email: email,
                data_nascimento: dataNascimento,
                endereco: endereco,
                id: currentUser.uid,
                data_cadastro: new Date().toISOString()
            });
            
            showNotification('Conta criada com sucesso!', 'success');
        }
        
        closeAuthModal();
        updateUserUI();
        
    } catch (error) {
        console.error('Erro na autenticação:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Este email já está em uso.';
        case 'auth/invalid-email':
            return 'Email inválido.';
        case 'auth/weak-password':
            return 'Senha muito fraca (mínimo 6 caracteres).';
        case 'auth/user-not-found':
            return 'Usuário não encontrado.';
        case 'auth/wrong-password':
            return 'Senha incorreta.';
        case 'auth/network-request-failed':
            return 'Erro de conexão. Verifique sua internet.';
        default:
            return 'Erro na autenticação: ' + error.message;
    }
}

function updateUserUI() {
    const authNavItem = document.getElementById('auth-nav-item');
    const userNavItem = document.getElementById('user-nav-item');
    const userNameSpan = document.getElementById('user-name');
    const announcementForm = document.getElementById('announcement-form-container');
    const loginRequiredMessage = document.getElementById('login-required-message');
    const myAnnouncementsLogin = document.getElementById('my-announcements-login-message');
    const myAdoptionsLogin = document.getElementById('my-adoptions-login-message');

    if (currentUser) {
        // Carregar dados do usuário
        database.ref('usuarios/' + currentUser.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                userNameSpan.textContent = userData.nome || userData.email.split('@')[0];
            }
        });

        authNavItem.style.display = 'none';
        userNavItem.style.display = 'block';
        
        // Mostrar formulário de anúncios
        if (announcementForm) {
            announcementForm.style.display = 'block';
            loginRequiredMessage.style.display = 'none';
        }
        
        // Esconder mensagens de login necessário
        if (myAnnouncementsLogin) myAnnouncementsLogin.style.display = 'none';
        if (myAdoptionsLogin) myAdoptionsLogin.style.display = 'none';
        
        // Carregar dados específicos do usuário
        loadMyAnnouncements();
        loadMyAdoptions();
        
    } else {
        authNavItem.style.display = 'block';
        userNavItem.style.display = 'none';
        
        // Esconder formulário de anúncios
        if (announcementForm) {
            announcementForm.style.display = 'none';
            loginRequiredMessage.style.display = 'block';
        }
        
        // Mostrar mensagens de login necessário
        if (myAnnouncementsLogin) myAnnouncementsLogin.style.display = 'block';
        if (myAdoptionsLogin) myAdoptionsLogin.style.display = 'block';
        
        // Limpar dados do usuário
        document.getElementById('my-announcements-container').innerHTML = '';
        document.getElementById('my-adoptions-container').innerHTML = '';
    }
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        showNotification('Logout realizado com sucesso!', 'success');
        updateUserUI();
    }).catch(error => {
        console.error('Erro ao fazer logout:', error);
        showNotification('Erro ao fazer logout', 'error');
    });
}

function checkAuthBeforeAction(targetId, message) {
    if (!currentUser) {
        showNotification(message, 'error');
        openAuthModal();
        return false;
    }
    showLoaderAndScroll(targetId);
    return true;
}

// Verificar estado de autenticação
auth.onAuthStateChanged((user) => {
    console.log('Estado de autenticação alterado:', user);
    currentUser = user;
    updateUserUI();
});

// ===== SISTEMA DE CADASTRO DE ANIMAIS =====
document.getElementById('announcement-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Você precisa fazer login para cadastrar animais.', 'error');
        openAuthModal();
        return;
    }
    
    const petName = document.getElementById('pet-name').value;
    const petSpecies = document.getElementById('pet-species').value;
    const petAge = document.getElementById('pet-age').value;
    const petDescription = document.getElementById('pet-description').value;
    const petImage = document.getElementById('pet-image').value;
    const contactInfo = document.getElementById('contact-info').value;
    
    // Validação básica
    if (!petName || !petSpecies || !petAge || !petDescription || !contactInfo) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Mostrar loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    submitBtn.disabled = true;

    try {
        // Criar ID único para o animal
        const animalId = 'animal_' + Date.now();
        
        // URL de imagem padrão se não for fornecida
        const imageUrl = petImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop';
        
        console.log("Tentando cadastrar animal...");
        
        // Cadastrar animal no Realtime Database
        await database.ref('cadastro_animais/' + animalId).set({
            descricao: petDescription,
            especie: petSpecies,
            id: animalId,
            idade: parseInt(petAge) || 0,
            imagen: imageUrl,
            nome: petName,
            contato: contactInfo,
            data: new Date().toLocaleDateString('pt-BR'),
            timestamp: Date.now(),
            userId: currentUser.uid,
            userEmail: currentUser.email
        });
        
        console.log("Animal cadastrado com ID: ", animalId);
        showNotification('Animal cadastrado com sucesso!', 'success');
        
        // Limpar formulário
        this.reset();
        
        // Recarregar animais
        await loadAnimais();
        await loadMyAnnouncements();
        
    } catch (error) {
        console.error("Erro detalhado ao cadastrar animal: ", error);
        showNotification('Erro ao cadastrar animal: ' + error.message, 'error');
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Carregar animais do Firebase
async function loadAnimais() {
    const container = document.getElementById('announcements-container');
    
    try {
        console.log("Carregando animais do Firebase...");
        container.innerHTML = '<div class="loader" style="display: block; grid-column: 1 / -1;"></div>';
        
        // Buscar dados do Realtime Database
        const snapshot = await database.ref('cadastro_animais').once('value');
        
        console.log("Dados recebidos:", snapshot.val());
        container.innerHTML = '';
        
        if (!snapshot.exists()) {
            container.innerHTML = 
                '<div style="text-align: center; grid-column: 1 / -1; padding: 40px; background: #f9f9f9; border-radius: 10px;">' +
                '<i class="fas fa-paw" style="font-size: 3rem; color: #ff85a2; margin-bottom: 20px;"></i>' +
                '<h3 style="color: #666; margin-bottom: 10px;">Nenhum animal cadastrado ainda</h3>' +
                '<p style="color: #888;">Seja o primeiro a cadastrar um animal para adoção!</p>' +
                '</div>';
            return;
        }
        
        const animais = snapshot.val();
        const animaisArray = [];
        
        for (let id in animais) {
            if (animais[id] && animais[id].nome) {
                animaisArray.push({
                    id: id,
                    ...animais[id]
                });
            }
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        animaisArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        if (animaisArray.length === 0) {
            container.innerHTML = 
                '<div style="text-align: center; grid-column: 1 / -1; padding: 40px; background: #f9f9f9; border-radius: 10px;">' +
                '<i class="fas fa-paw" style="font-size: 3rem; color: #ff85a2; margin-bottom: 20px;"></i>' +
                '<h3 style="color: #666; margin-bottom: 10px;">Nenhum animal cadastrado ainda</h3>' +
                '<p style="color: #888;">Seja o primeiro a cadastrar um animal para adoção!</p>' +
                '</div>';
            return;
        }
        
        animaisArray.forEach(animal => {
            const card = createAnimalCard(animal, false);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error("Erro ao carregar animais: ", error);
        container.innerHTML = 
            '<div style="text-align: center; grid-column: 1 / -1; padding: 20px; background: #ffe6e6; border-radius: 10px;">' +
            '<i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff6666; margin-bottom: 10px;"></i>' +
            '<h3 style="color: #cc0000; margin-bottom: 10px;">Erro ao carregar animais</h3>' +
            '<p style="color: #666;">' + error.message + '</p>' +
            '</div>';
    }
}

// Função para criar card de animal
function createAnimalCard(animal, isMyAnnouncement = false) {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    
    const speciesIcon = animal.especie === 'cachorro' ? 'fa-dog' : 
                      animal.especie === 'gato' ? 'fa-cat' : 'fa-paw';
    
    const speciesText = animal.especie === 'cachorro' ? 'Cachorro' : 
                      animal.especie === 'gato' ? 'Gato' : 'Outro';
    
    // Usar imagem do animal ou padrão
    const imageUrl = animal.imagen || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop';
    
    // Verificar se o usuário atual é o dono do anúncio
    const isOwner = currentUser && animal.userId === currentUser.uid;
    
    let buttonsHTML = '';
    
    if (isMyAnnouncement) {
        // Para meus anúncios - apenas botão de remover
        buttonsHTML = `
            <button class="btn btn-secondary" onclick="deleteAnimal('${animal.id}')" style="background: #ff6666;">
                <i class="fas fa-trash"></i> Remover Anúncio
            </button>
        `;
    } else {
        // Para lista geral - botões de contato e interesse
        buttonsHTML = `
            <button class="btn" onclick="contactAboutAnimal('${animal.contato || ''}', '${animal.nome}')">
                <i class="fas fa-envelope"></i> Entrar em Contato
            </button>
            <button class="btn" onclick="addToMyAdoptions('${animal.id}')" style="margin-top: 10px; background: var(--accent);">
                <i class="fas fa-heart"></i> Quero Adotar
            </button>
            ${isOwner ? `
            <button class="btn btn-secondary" onclick="deleteAnimal('${animal.id}')" style="margin-top: 10px; background: #ff6666;">
                <i class="fas fa-trash"></i> Remover
            </button>
            ` : ''}
        `;
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${animal.nome}" 
             class="announcement-image" 
             onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop'">
        <div class="announcement-content">
            <h3 class="announcement-title">${animal.nome}</h3>
            <div class="announcement-meta">
                <i class="fas ${speciesIcon}"></i>
                ${speciesText} • ${animal.idade || 'N/A'} anos • ${animal.data || 'Data não informada'}
            </div>
            <p class="announcement-description">${animal.descricao || 'Sem descrição disponível.'}</p>
            <div class="announcement-meta">
                <i class="fas fa-phone"></i> Contato: ${animal.contato || 'Não informado'}
            </div>
            ${!isMyAnnouncement ? `
            <div class="announcement-meta">
                <i class="fas fa-user"></i> Publicado por: ${animal.userEmail || 'Anônimo'}
            </div>
            ` : ''}
            ${buttonsHTML}
        </div>
    `;
    
    return card;
}

// Carregar meus anúncios
async function loadMyAnnouncements() {
    if (!currentUser) return;
    
    const container = document.getElementById('my-announcements-container');
    
    try {
        const snapshot = await database.ref('cadastro_animais').orderByChild('userId').equalTo(currentUser.uid).once('value');
        container.innerHTML = '';
        
        if (!snapshot.exists()) {
            container.innerHTML = 
                '<div style="text-align: center; grid-column: 1 / -1; padding: 40px; background: #f9f9f9; border-radius: 10px;">' +
                '<i class="fas fa-bullhorn" style="font-size: 3rem; color: #ff85a2; margin-bottom: 20px;"></i>' +
                '<h3 style="color: #666; margin-bottom: 10px;">Você ainda não cadastrou nenhum animal</h3>' +
                '<p style="color: #888;">Cadastre seu primeiro animal para adoção!</p>' +
                '</div>';
            return;
        }
        
        const animais = snapshot.val();
        const animaisArray = [];
        
        for (let id in animais) {
            animaisArray.push({
                id: id,
                ...animais[id]
            });
        }
        
        animaisArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        animaisArray.forEach(animal => {
            const card = createAnimalCard(animal, true);
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar meus anúncios:', error);
        container.innerHTML = 
            '<div style="text-align: center; grid-column: 1 / -1; padding: 20px; background: #ffe6e6; border-radius: 10px;">' +
            '<i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff6666; margin-bottom: 10px;"></i>' +
            '<h3 style="color: #cc0000; margin-bottom: 10px;">Erro ao carregar seus anúncios</h3>' +
            '</div>';
    }
}

// Carregar minhas adoções
async function loadMyAdoptions() {
    if (!currentUser) return;
    
    const container = document.getElementById('my-adoptions-container');
    
    try {
        const snapshot = await database.ref('minhas_adocoes/' + currentUser.uid).once('value');
        container.innerHTML = '';
        
        if (!snapshot.exists()) {
            container.innerHTML = 
                '<div style="text-align: center; grid-column: 1 / -1; padding: 40px; background: #f9f9f9; border-radius: 10px;">' +
                '<i class="fas fa-heart" style="font-size: 3rem; color: #ff85a2; margin-bottom: 20px;"></i>' +
                '<h3 style="color: #666; margin-bottom: 10px;">Você ainda não expressou interesse em nenhum animal</h3>' +
                '<p style="color: #888;">Explore os animais disponíveis para adoção!</p>' +
                '</div>';
            return;
        }
        
        const adocoes = snapshot.val();
        const animaisIds = Object.keys(adocoes);
        
        // Buscar informações dos animais
        const animaisPromises = animaisIds.map(animalId => 
            database.ref('cadastro_animais/' + animalId).once('value')
        );
        
        const animaisSnapshots = await Promise.all(animaisPromises);
        const animaisArray = [];
        
        animaisSnapshots.forEach((snapshot, index) => {
            if (snapshot.exists()) {
                animaisArray.push({
                    id: animaisIds[index],
                    ...snapshot.val()
                });
            }
        });
        
        animaisArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        animaisArray.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'announcement-card';
            
            const speciesIcon = animal.especie === 'cachorro' ? 'fa-dog' : 
                              animal.especie === 'gato' ? 'fa-cat' : 'fa-paw';
            
            const speciesText = animal.especie === 'cachorro' ? 'Cachorro' : 
                              animal.especie === 'gato' ? 'Gato' : 'Outro';
            
            const imageUrl = animal.imagen || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop';
            
            card.innerHTML = `
                <img src="${imageUrl}" alt="${animal.nome}" 
                     class="announcement-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=200&fit=crop'">
                <div class="announcement-content">
                    <h3 class="announcement-title">${animal.nome}</h3>
                    <div class="announcement-meta">
                        <i class="fas ${speciesIcon}"></i>
                        ${speciesText} • ${animal.idade || 'N/A'} anos • ${animal.data || 'Data não informada'}
                    </div>
                    <p class="announcement-description">${animal.descricao || 'Sem descrição disponível.'}</p>
                    <div class="announcement-meta">
                        <i class="fas fa-phone"></i> Contato: ${animal.contato || 'Não informado'}
                    </div>
                    <button class="btn" onclick="contactAboutAnimal('${animal.contato || ''}', '${animal.nome}')">
                        <i class="fas fa-envelope"></i> Entrar em Contato
                    </button>
                    <button class="btn btn-secondary" onclick="removeFromMyAdoptions('${animal.id}')" style="margin-top: 10px; background: #ff6666;">
                        <i class="fas fa-times"></i> Remover Interesse
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar minhas adoções:', error);
        container.innerHTML = 
            '<div style="text-align: center; grid-column: 1 / -1; padding: 20px; background: #ffe6e6; border-radius: 10px;">' +
            '<i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff6666; margin-bottom: 10px;"></i>' +
            '<h3 style="color: #cc0000; margin-bottom: 10px;">Erro ao carregar suas adoções</h3>' +
            '</div>';
    }
}

// Adicionar animal às minhas adoções
async function addToMyAdoptions(animalId) {
    if (!currentUser) {
        showNotification('Você precisa fazer login para adicionar animais às suas adoções.', 'error');
        openAuthModal();
        return;
    }
    
    try {
        await database.ref('minhas_adocoes/' + currentUser.uid + '/' + animalId).set({
            timestamp: Date.now(),
            animalId: animalId
        });
        
        showNotification('Animal adicionado às suas adoções!', 'success');
        loadMyAdoptions();
    } catch (error) {
        console.error('Erro ao adicionar às adoções:', error);
        showNotification('Erro ao adicionar animal às suas adoções.', 'error');
    }
}

// Remover animal das minhas adoções
async function removeFromMyAdoptions(animalId) {
    if (!currentUser) return;
    
    try {
        await database.ref('minhas_adocoes/' + currentUser.uid + '/' + animalId).remove();
        showNotification('Animal removido das suas adoções.', 'success');
        loadMyAdoptions();
    } catch (error) {
        console.error('Erro ao remover das adoções:', error);
        showNotification('Erro ao remover animal das suas adoções.', 'error');
    }
}

// Deletar animal (apenas o dono pode deletar)
async function deleteAnimal(animalId) {
    if (!currentUser) return;
    
    if (!confirm('Tem certeza que deseja remover este anúncio?')) {
        return;
    }
    
    try {
        // Verificar se o usuário é o dono do anúncio
        const snapshot = await database.ref('cadastro_animais/' + animalId).once('value');
        const animal = snapshot.val();
        
        if (!animal || animal.userId !== currentUser.uid) {
            showNotification('Você só pode remover seus próprios anúncios.', 'error');
            return;
        }
        
        // Remover do cadastro de animais
        await database.ref('cadastro_animais/' + animalId).remove();
        
        // Remover de todas as listas de adoções
        const adocoesSnapshot = await database.ref('minhas_adocoes').once('value');
        const adocoes = adocoesSnapshot.val();
        
        if (adocoes) {
            const promises = [];
            for (let userId in adocoes) {
                if (adocoes[userId][animalId]) {
                    promises.push(
                        database.ref('minhas_adocoes/' + userId + '/' + animalId).remove()
                    );
                }
            }
            await Promise.all(promises);
        }
        
        showNotification('Anúncio removido com sucesso!', 'success');
        loadAnimais();
        loadMyAnnouncements();
        
    } catch (error) {
        console.error('Erro ao deletar animal:', error);
        showNotification('Erro ao remover anúncio.', 'error');
    }
}

// ===== SISTEMA DE CHAT =====
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addMessageToChat(message, 'sent');
    input.value = '';
    
    // Mostrar indicador de digitação
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.style.display = 'block';
    
    // Simular resposta do bot após um tempo
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const response = getBotResponse(message);
        addMessageToChat(response, 'received');
    }, 1500);
}

function addMessageToChat(message, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('adoção') || lowerMessage.includes('adotar')) {
        return "Para adotar um animal, você pode navegar pela seção 'Adotar' e escolher um animal que se identifique. Entre em contato com o responsável pelo anúncio para combinar os detalhes! 🐾";
    } else if (lowerMessage.includes('cadastrar') || lowerMessage.includes('anúncio')) {
        return "Para cadastrar um animal para adoção, faça login e vá para a seção 'Anúncios'. Lá você poderá preencher o formulário com as informações do animal.";
    } else if (lowerMessage.includes('cuidados') || lowerMessage.includes('saúde')) {
        return "Animais precisam de cuidados como alimentação balanceada, vacinação em dia, visitas regulares ao veterinário, carinho e atenção. Cada espécie tem necessidades específicas!";
    } else if (lowerMessage.includes('custo') || lowerMessage.includes('gasto')) {
        return "Os custos variam, mas geralmente incluem alimentação, veterinário, vacinas, vermífugos e possíveis emergências. Cães de porte grande tendem a ter custos maiores com alimentação.";
    } else if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada')) {
        return "De nada! Estou aqui para ajudar. Se tiver mais dúvidas, é só perguntar! 😊";
    } else if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('ola')) {
        return "Olá! Como posso ajudar você hoje? Posso tirar dúvidas sobre adoção, cuidados com animais e muito mais!";
    } else {
        return "Obrigado pela sua pergunta! Posso ajudar com informações sobre adoção, cuidados com animais, custos e muito mais. O que você gostaria de saber especificamente?";
    }
}

// Enter para enviar mensagem no chat
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// ===== SISTEMA DE MAPA =====
function initMap() {
    try {
        map = L.map('abandonment-map').setView([-23.5505, -46.6333], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Adicionar alguns marcadores de exemplo
        const locations = [
            { lat: -23.5505, lng: -46.6333, type: 'abandoned', title: 'Cachorro abandonado - Centro' },
            { lat: -23.5634, lng: -46.6526, type: 'shelter', title: 'Canil Municipal - Ibirapuera' },
            { lat: -23.5489, lng: -46.6388, type: 'store', title: 'Pet Shop Amigo Animal' },
            { lat: -23.5577, lng: -46.6600, type: 'abandoned', title: 'Gatos abandonados - Vila Mariana' },
            { lat: -23.5435, lng: -46.6440, type: 'shelter', title: 'Abrigo São Francisco' }
        ];
        
        locations.forEach(location => {
            let iconColor;
            if (location.type === 'abandoned') iconColor = 'red';
            else if (location.type === 'shelter') iconColor = 'blue';
            else iconColor = 'green';
            
            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            
            L.marker([location.lat, location.lng], { icon: icon })
                .addTo(map)
                .bindPopup(location.title);
        });
        
        console.log('Mapa inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
        document.getElementById('abandonment-map').innerHTML = 
            '<div style="text-align: center; padding: 40px; color: #666;">' +
            '<i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>' +
            '<p>Erro ao carregar o mapa. Tente recarregar a página.</p>' +
            '</div>';
    }
}

// ===== FUNÇÕES AUXILIARES =====
function contactAboutAnimal(contact, animalName) {
    if (!contact) {
        showNotification('Informações de contato não disponíveis.', 'error');
        return;
    }
    
    if (contact.includes('@')) {
        window.location.href = `mailto:${contact}?subject=Interesse na adoção do ${animalName}`;
    } else {
        const phoneNumber = contact.replace(/\D/g, '');
        window.location.href = `tel:${phoneNumber}`;
    }
}

function trackEmergencyCall(number) {
    console.log(`Chamada de emergência realizada para: ${number}`);
    showNotification(`Ligando para ${number}... Obrigado por denunciar maus tratos!`, 'info');
}

function showLoaderAndScroll(targetId) {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Sistema de notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const icon = notification.querySelector('i');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    
    // Atualizar ícone baseado no tipo
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Animação de contagem para estatísticas
function animateCount(elementId, targetValue, duration = 2000) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const increment = targetValue / (duration / 16);
    
    let currentValue = startValue;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            clearInterval(timer);
            currentValue = targetValue;
        }
        element.textContent = Math.floor(currentValue).toLocaleString();
    }, 16);
}

// Carregar pets de exemplo
function loadPets(species = 'todos') {
    const petsLoader = document.getElementById('pets-loader');
    const petsContainer = document.getElementById('pets-container');
    
    petsLoader.style.display = 'block';
    petsContainer.innerHTML = '';
    
    setTimeout(() => {
        // Dados de exemplo
        const petsData = [
            { id: 1, name: "Bolinha", species: "cachorro", breed: "Shih Tzu", age: "2 anos", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop", badge: "Novo" },
            { id: 2, name: "Luna", species: "gato", breed: "Siamês", age: "1 ano", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop", badge: "Popular" },
            { id: 3, name: "Rex", species: "cachorro", breed: "Vira-lata", age: "3 anos", image: "https://images.unsplash.com/photo-1517423447168-cb804aafa6e0?w=300&h=200&fit=crop" },
            { id: 4, name: "Mimi", species: "gato", breed: "Persa", age: "4 meses", image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=300&h=200&fit=crop", badge: "Filhote" }
        ];
        
        const filteredPets = species === 'todos' 
            ? petsData 
            : petsData.filter(pet => pet.species === species);
        
        filteredPets.forEach((pet, index) => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.style.setProperty('--delay', index);
            
            const speciesIcon = pet.species === 'cachorro' ? 'fa-dog' : 
                              pet.species === 'gato' ? 'fa-cat' : 'fa-dove';
            
            let badgeHTML = '';
            if (pet.badge) {
                badgeHTML = `<div class="pet-badge">${pet.badge}</div>`;
            }
            
            petCard.innerHTML = `
                ${badgeHTML}
                <img src="${pet.image}" alt="${pet.name}" class="pet-image">
                <div class="pet-info">
                    <h3 class="pet-name">${pet.name}</h3>
                    <p class="pet-details">
                        <i class="fas ${speciesIcon}"></i> 
                        ${pet.species === 'cachorro' ? 'Cachorro' : pet.species === 'gato' ? 'Gato' : 'Outro'} • ${pet.breed} • ${pet.age}
                    </p>
                    <button class="btn" onclick="selectAnimal(${pet.id}, '${pet.name}')">
                        <i class="fas fa-heart"></i> Adotar
                    </button>
                </div>
            `;
            
            petsContainer.appendChild(petCard);
        });
        
        petsLoader.style.display = 'none';
    }, 1000);
}

function filterPets(species) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadPets(species);
}

function selectAnimal(petId, petName) {
    showNotification(`Você selecionou ${petName}! Entre em contato para mais informações.`, 'success');
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada, inicializando...");
    
    // Inicializar mapa
    initMap();
    
    // Carregar animais do Firebase
    loadAnimais();
    
    // Carregar pets de exemplo
    loadPets();
    
    // Inicializar estatísticas
    setTimeout(() => {
        animateCount('adopted-count', 1247);
        animateCount('available-count', 86);
        animateCount('volunteers-count', 324);
        animateCount('cities-count', 42);
    }, 1000);
    
    // Configurar eventos
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('auth-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });
    
    // Botão voltar ao topo
    window.addEventListener('scroll', function() {
        const backToTop = document.getElementById('back-to-top');
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    document.getElementById('back-to-top').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    console.log("Inicialização concluída");
});

// Corações flutuantes
function createHearts() {
    const hearts = ['❤', '💕', '💖', '💗', '💘', '💓', '💞'];
    const colors = ['#ff9acd', '#ff85a2', '#ff5c8d', '#ffc2d6', '#ffd0dd'];
    
    for (let i = 0; i < 25; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 6}s`;
        heart.style.fontSize = `${Math.random() * 15 + 15}px`;
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        heart.style.opacity = '0';
        
        document.getElementById('hearts-container').appendChild(heart);
        
        setTimeout(() => {
            heart.style.animation = `hearts ${Math.random() * 10 + 10}s linear forwards`;
            heart.style.opacity = '0.7';
        }, 100);
    }
}
let userLoggedIn = false;

function updateDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userLoggedIn) {
        dropdownMenu.innerHTML = `
            <a href="/perfil">Meu Perfil</a>
            <a href="#" onclick="logout()">Sair</a>
        `;
    } else {
        dropdownMenu.innerHTML = `
            <a href="/login">Login</a>
        `;
    }
}

function login() {
    userLoggedIn = true;
    updateDropdown();
}

function logout() {
    userLoggedIn = false;
    updateDropdown();
}

// Inicializar
document.addEventListener('DOMContentLoaded', updateDropdown);

// Inicializar corações
createHearts();
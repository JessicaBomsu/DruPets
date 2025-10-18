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

// ===== SISTEMA DE AUTENTICAÇÃO =====

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkLoggedInUser();
        this.setupEventListeners();
        this.setupTabs();
        this.checkAdminPermissions();
        this.redirectAdminIfNeeded();
    }
    

    setupEventListeners() {
        // Login
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }

        // Cadastro
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.register());
        }

        // Logout
        const logoutBtn = document.getElementById('logout-link');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Enter key nos formulários
        this.setupEnterKey();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`form-${tabName}`).classList.add('active');
    }

    setupEnterKey() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const loginBtn = document.getElementById('login-btn');
                    const registerBtn = document.getElementById('register-btn');
                    
                    if (loginBtn) loginBtn.click();
                    if (registerBtn) registerBtn.click();
                }
            });
        });
    }

    // Verificar e redirecionar administradores
    redirectAdminIfNeeded() {
        if (this.isAdmin()) {
            // Se é admin e está na página de perfil, redirecionar para admin
            if (window.location.pathname.includes('meuperfil.html') && !window.location.pathname.includes('adm.html')) {
                console.log('Admin detectado na página de perfil, redirecionando...');
                setTimeout(() => {
                    window.location.href = 'adm.html';
                }, 1000);
            }
            
            // Mostrar elementos administrativos em todas as páginas
            this.showAdminElements();
        }
    }

    // Verificar permissões de admin em tempo real
    checkAdminPermissions() {
        if (this.isAdmin()) {
            console.log('Usuário é administrador - ativando funções administrativas');
            this.showAdminElements();
        }
    }

    // Mostrar elementos administrativos para admins
    showAdminElements() {
        console.log('Mostrando elementos administrativos');
        
        // Adicionar botão de admin no header
        const adminLink = document.getElementById('admin-link');
        if (adminLink) {
            adminLink.classList.remove('hidden');
        }

        // Adicionar link administrativo no menu principal
        this.addAdminNavLink();

        // Mostrar funções administrativas no perfil se estiver na página de admin
        if (window.location.pathname.includes('adm.html')) {
            const adminFunctions = document.querySelectorAll('.admin-function');
            adminFunctions.forEach(func => {
                func.style.display = 'block';
            });
        }

        // Adicionar controles administrativos em animais e posts
        setTimeout(() => {
            this.addAdminAnimalControls();
        }, 1500);
    }

    // Adicionar link administrativo no menu
    addAdminNavLink() {
        const nav = document.querySelector('nav ul');
        if (nav && !document.querySelector('#admin-nav-item')) {
            const adminLi = document.createElement('li');
            adminLi.id = 'admin-nav-item';
            adminLi.innerHTML = `
                <a href="adm.html" id="admin-nav-link">
                    <i class="fas fa-shield-alt"></i> Administração
                </a>
            `;
            nav.appendChild(adminLi);
        }
    }

    // Adicionar controles administrativos nos animais
    addAdminAnimalControls() {
        if (!this.isAdmin()) return;

        // Adicionar controles em cards de animais
        const animalCards = document.querySelectorAll('.animal-card, .post-item, .animal-item, .card');
        animalCards.forEach(card => {
            if (!card.querySelector('.admin-controls')) {
                const animalId = card.dataset.animalId || card.id || this.generateAnimalId();
                const adminControls = document.createElement('div');
                adminControls.className = 'admin-controls';
                adminControls.innerHTML = `
                    <div class="admin-buttons">
                        <button class="btn-admin btn-delete" onclick="authSystem.adminDeleteAnimal('${animalId}')" title="Remover Publicação">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-admin btn-edit" onclick="authSystem.adminEditAnimal('${animalId}')" title="Editar Publicação">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-admin btn-suspend" onclick="authSystem.adminSuspendAnimal('${animalId}')" title="Suspender Publicação">
                            <i class="fas fa-pause"></i>
                        </button>
                    </div>
                `;
                card.style.position = 'relative';
                card.appendChild(adminControls);
            }
        });

        // Adicionar controles na feira de adoções
        this.addEventAdminControls();
    }

    // Adicionar controles na feira de adoções
    addEventAdminControls() {
        const eventSections = document.querySelectorAll('.event-section, .feira-item, .event-card');
        eventSections.forEach(section => {
            if (!section.querySelector('.admin-event-controls')) {
                const eventId = section.dataset.eventId || section.id || this.generateEventId();
                const adminControls = document.createElement('div');
                adminControls.className = 'admin-event-controls';
                adminControls.innerHTML = `
                    <div class="admin-buttons">
                        <button class="btn-admin btn-delete" onclick="authSystem.adminDeleteEvent('${eventId}')" title="Remover Evento">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-admin btn-edit" onclick="authSystem.adminEditEvent('${eventId}')" title="Editar Evento">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                `;
                section.style.position = 'relative';
                section.appendChild(adminControls);
            }
        });
    }

    // Funções administrativas para animais
    async adminDeleteAnimal(animalId) {
        if (!this.isAdmin()) {
            showNotification('Acesso negado. Apenas administradores podem executar esta ação.', 'error');
            return;
        }

        if (confirm('Tem certeza que deseja remover esta publicação? Esta ação não pode ser desfeita.')) {
            showPawLoader('Removendo publicação...');
            try {
                await database.ref(`cadastro_animais/${animalId}`).remove();
                showNotification('Publicação removida com sucesso!', 'success');
                
                // Remover elemento da página
                const animalElement = document.querySelector(`[data-animal-id="${animalId}"]`);
                if (animalElement) {
                    animalElement.remove();
                }
            } catch (error) {
                console.error('Erro ao remover publicação:', error);
                showNotification('Erro ao remover publicação: ' + error.message, 'error');
            } finally {
                hidePawLoader();
            }
        }
    }

    async adminSuspendAnimal(animalId) {
        if (!this.isAdmin()) {
            showNotification('Acesso negado.', 'error');
            return;
        }

        if (confirm('Deseja suspender esta publicação?')) {
            showPawLoader('Suspendendo publicação...');
            try {
                await database.ref(`cadastro_animais/${animalId}/status`).set('suspended');
                showNotification('Publicação suspensa com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao suspender publicação:', error);
                showNotification('Erro ao suspender publicação: ' + error.message, 'error');
            } finally {
                hidePawLoader();
            }
        }
    }

    async adminEditAnimal(animalId) {
        if (!this.isAdmin()) {
            showNotification('Acesso negado.', 'error');
            return;
        }
        showNotification('Redirecionando para edição...', 'info');
        // Redirecionar para página de edição ou abrir modal
        setTimeout(() => {
            window.location.href = `editar-animal.html?id=${animalId}`;
        }, 1000);
    }

    // Funções administrativas para eventos
    async adminDeleteEvent(eventId) {
        if (!this.isAdmin()) {
            showNotification('Acesso negado.', 'error');
            return;
        }

        if (confirm('Tem certeza que deseja remover este evento?')) {
            showPawLoader('Removendo evento...');
            try {
                await database.ref(`eventos/${eventId}`).remove();
                showNotification('Evento removido com sucesso!', 'success');
                
                // Remover elemento da página
                const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
                if (eventElement) {
                    eventElement.remove();
                }
            } catch (error) {
                console.error('Erro ao remover evento:', error);
                showNotification('Erro ao remover evento: ' + error.message, 'error');
            } finally {
                hidePawLoader();
            }
        }
    }

    adminEditEvent(eventId) {
        if (!this.isAdmin()) {
            showNotification('Acesso negado.', 'error');
            return;
        }
        showNotification('Editando evento...', 'info');
        // Implementar edição de evento
    }

    // Gerar ID para elementos sem ID específico
    generateAnimalId() {
        return 'temp_' + Date.now();
    }

    generateEventId() {
        return 'event_' + Date.now();
    }

    async login() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }

        showPawLoader("Entrando...");

        try {
            // Buscar usuário no banco de dados
            const snapshot = await database.ref('cadastro_conta').once('value');
            const users = snapshot.val();
            let userFound = null;

            // Procurar usuário com email e senha correspondentes
            for (let userId in users) {
                const user = users[userId];
                // EM UM SISTEMA REAL, A SENHA DEVERIA SER CRIPTOGRAFADA!
                if (user.email === email && user.senha === password) {
                    userFound = { id: userId, ...user };
                    break;
                }
            }

            if (userFound) {
                this.currentUser = userFound;
                // Salvar no localStorage para persistência
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                showNotification('Login realizado com sucesso!', 'success');
                
                // Verificar se é admin e redirecionar
                if (this.isAdmin()) {
                    console.log('Usuário admin logado - redirecionando para painel admin');
                    setTimeout(() => {
                        window.location.href = 'adm.html';
                    }, 1000);
                } else {
                    // Redirecionar baseado no tipo de usuário
                    setTimeout(() => {
                        if (this.currentUser.tipo === 'ong') {
                            window.location.href = 'meuperfil.html';
                        } else {
                            window.location.href = 'meuperfil.html';
                        }
                    }, 1000);
                }
                
            } else {
                showNotification('E-mail ou senha incorretos.', 'error');
            }
        } catch (error) {
            showNotification('Erro ao fazer login: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    async register() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        if (activeTab === 'pessoa') {
            await this.registerPessoa();
        } else if (activeTab === 'ong') {
            await this.registerONG();
        }
    }

    async registerPessoa() {
        const name = document.getElementById('register-name').value;
        const cpf = document.getElementById('register-cpf').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const phone = document.getElementById('register-phone').value;
        const address = document.getElementById('register-address').value;

        if (!name || !cpf || !email || !password || !phone) {
            showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        showPawLoader("Criando conta...");

        try {
            // Verificar se o email já existe
            const snapshot = await database.ref('cadastro_conta').once('value');
            const users = snapshot.val();
            let emailExists = false;

            for (let userId in users) {
                if (users[userId].email === email) {
                    emailExists = true;
                    break;
                }
            }

            if (emailExists) {
                showNotification('Este e-mail já está cadastrado.', 'error');
                return;
            }

            // Criar novo usuário
            const userId = 'user_' + Date.now();
            const userData = {
                nome: name,
                cpf: cpf,
                email: email,
                senha: password,
                telefone: phone,
                endereco: address,
                tipo: 'user',
                data_criacao: new Date().toISOString()
            };

            await database.ref('cadastro_conta/' + userId).set(userData);
            
            // Fazer login automaticamente após cadastro
            this.currentUser = {
                id: userId,
                ...userData
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            showNotification('Conta criada com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = 'meuperfil.html';
            }, 1000);

        } catch (error) {
            showNotification('Erro ao criar conta: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    async registerONG() {
    // 1. CORREÇÃO DE ID: Mudado de 'ong-cnpj' para 'ong-doc-field'
    const ongName = document.getElementById('ong-name').value;
    const docField = document.getElementById('ong-doc-field').value; // CORRIGIDO AQUI!
    const responsavel = document.getElementById('ong-responsavel').value;
    const email = document.getElementById('ong-email').value;
    const password = document.getElementById('ong-password').value;
    const phone = document.getElementById('ong-phone').value;
    const social = document.getElementById('ong-social').value;
    const description = document.getElementById('ong-description').value;

    if (!ongName || !docField || !responsavel || !email || !password || !phone) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

        showPawLoader("Criando conta da ONG...");

        try {
            // Verificar se o email já existe
            const snapshot = await database.ref('cadastro_conta').once('value');
            const users = snapshot.val();
            let emailExists = false;

            for (let userId in users) {
                if (users[userId].email === email) {
                    emailExists = true;
                    break;
                }
            }

            if (emailExists) {
                showNotification('Este e-mail já está cadastrado.', 'error');
                return;
            }

            // Criar nova ONG
            // 2. AJUSTE DE CHAVES: Os nomes das chaves foram atualizados para coincidir com a estrutura da sua imagem (pax/cadastro_ong)
            const userId = 'ong_' + Date.now();
            const ongData = {
            // Chaves ajustadas para corresponder ao seu modelo de DB:
            nome_da_ong: ongName,           // De 'nome' para 'nome_da_ong'
            cnpj_ou_rg: docField,           // De 'cnpj' para 'cnpj_ou_rg'
            nome_do_titular: responsavel,   // De 'responsavel' para 'nome_do_titular'
            email: email,
            senha: password,
            telefone: phone,
            rede_social: social,
            sobre_a_ong: description,       // De 'descricao' para 'sobre_a_ong'
            tipo: 'ong',
            data_criacao: new Date().toISOString()
        };
            await database.ref('cadastro_conta/' + userId).set(ongData);
            
            // Fazer login automaticamente após cadastro
            this.currentUser = {
                id: userId,
                ...ongData
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            showNotification('Conta da ONG criada com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = 'meuperfil.html';
            }, 1000);

        } catch (error) {
            showNotification('Erro ao criar conta: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        showNotification('Logout realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    checkLoggedInUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            
            // Atualizar interface baseada no login
            this.updateUIForLoggedInUser();
        }
    }

    updateUIForLoggedInUser() {
        const loginLink = document.getElementById('login-link');
        const userLink = document.getElementById('user-link');
        const logoutLink = document.getElementById('logout-link');

        // Esta parte é mantida para atualizar o cabeçalho (links de navegação)
        if (loginLink) loginLink.classList.add('hidden');
        if (userLink) userLink.classList.remove('hidden');
        if (logoutLink) logoutLink.classList.remove('hidden');

        // ==== CORREÇÃO DE IDS E CHAVES DE DADOS PARA O PERFIL ====
        const profileNameElement = document.getElementById('profile-name');
        const profileEmailElement = document.getElementById('profile-email');
        const profilePhoneElement = document.getElementById('profile-phone');
        const profileTypeElement = document.getElementById('profile-type');
        
        // 1. Lógica para o Nome
        if (profileNameElement && this.currentUser) {
            let nomeParaExibir = 'Usuário Desconhecido';

            if (this.currentUser.tipo === 'ong') {
                // Para ONG, usamos 'nome_da_ong' ou o nome do titular como fallback
                nomeParaExibir = this.currentUser.nome_da_ong || this.currentUser.nome_do_titular || 'ONG/Protetor';
            } else {
                // Para Pessoa Física ('user'), usamos 'nome'
                nomeParaExibir = this.currentUser.nome;
            }
            
            
            
        }
        

        // 2. Lógica para E-mail, Telefone e Tipo
        if (profileEmailElement && this.currentUser) {
            profileEmailElement.textContent = this.currentUser.email;
        }
        
        if (profilePhoneElement && this.currentUser) {
            // Usa 'telefone' para ambos (Pessoa Física e ONG)
            profilePhoneElement.textContent = this.currentUser.telefone || 'N/A';
        }

        if (profileTypeElement && this.currentUser) {
            if (this.currentUser.tipo === 'ong') {
                profileTypeElement.textContent = 'ONG/Protetor';
            } else if (this.currentUser.tipo === 'admin') {
                profileTypeElement.textContent = 'Administrador';
            } else {
                profileTypeElement.textContent = 'Usuário Comum';
            }
        }
        // =========================================================

        // Mostrar/ocultar seções baseadas no tipo de usuário
        this.handleUserTypeSpecificUI();
    }

    handleUserTypeSpecificUI() {
        if (!this.currentUser) return;

        // IDs corretos do meuperfil.html
        const myEventsSection = document.getElementById('my-events-section'); 
        
        // Se for ONG, mostramos a seção de eventos e escondemos a seção de animais (se houver um ID para ela)
        if (this.currentUser.tipo === 'ong') {
            if (myEventsSection) {
                myEventsSection.classList.remove('hidden'); // MOSTRA a seção de eventos
            }
            // Não há um ID limpo para a seção de animais no HTML, então mantemos a visibilidade da forma que estiver
            
        } else { // Pessoa Física ('user') ou Admin
            if (myEventsSection) {
                myEventsSection.classList.add('hidden'); // ESCONDE a seção de eventos
            }
        }
    }

    handleUserTypeSpecificUI() {
        if (!this.currentUser) return;

        const adoptionsSection = document.getElementById('adoptions-section');
        const eventsSection = document.getElementById('events-section');

        if (this.currentUser.tipo === 'ong') {
            if (adoptionsSection) adoptionsSection.classList.add('hidden');
            if (eventsSection) eventsSection.classList.remove('hidden');
        } else {
            if (adoptionsSection) adoptionsSection.classList.remove('hidden');
            if (eventsSection) eventsSection.classList.add('hidden');
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.tipo === 'admin';
    }

    isONG() {
        return this.currentUser && this.currentUser.tipo === 'ong';
    }
}

// ===== FUNÇÕES GLOBAIS =====
function showPawLoader(text = "Carregando...") {
    const loader = document.getElementById('pawLoader');
    if (loader) {
        const loaderText = loader.querySelector('.paw-loader-text');
        if (loaderText) loaderText.textContent = text;
        loader.classList.add('active');
    }
}

function hidePawLoader() {
    const loader = document.getElementById('pawLoader');
    if (loader) {
        loader.classList.remove('active');
    }
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação se não existir
    let notification = document.getElementById('global-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'global-notification';
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span class="notification-text">${message}</span>
        `;
        document.body.appendChild(notification);
    } else {
        notification.className = `notification ${type}`;
        const icon = notification.querySelector('i');
        const text = notification.querySelector('.notification-text');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;
        text.textContent = message;
    }

    notification.classList.add('show');

    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Inicializar sistema de autenticação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});

// Adicionar estilos para notificação e controles administrativos
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-left: 4px solid var(--success);
}

.notification.error {
    border-left: 4px solid var(--danger);
}

.notification.info {
    border-left: 4px solid var(--secondary);
}

.notification i {
    font-size: 1.5rem;
}

.notification.success i {
    color: var(--success);
}

.notification.error i {
    color: var(--danger);
}

.notification.info i {
    color: var(--secondary);
}

/* Estilos para controles administrativos */
.admin-controls, .admin-event-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
}

.admin-buttons {
    display: flex;
    gap: 5px;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.btn-admin {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.btn-admin:hover {
    transform: scale(1.1);
}

.btn-delete {
    background: #dc3545;
    color: white;
}

.btn-edit {
    background: #ffc107;
    color: black;
}

.btn-suspend {
    background: #6c757d;
    color: white;
}

#admin-nav-item {
    background: linear-gradient(45deg, #dc3545, #e35d6a);
    border-radius: 5px;
    margin-left: 10px;
}

#admin-nav-item a {
    color: white !important;
    font-weight: bold;
}

.hidden {
    display: none !important;
}
`;


// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
import { database, auth } from './config.js';

// Sistema Administrativo Completo
class AdminSystem {
    constructor() {
        // Verificar se é administrador
        if (!this.checkAdminAccess()) {
            window.location.href = 'index.html';
            return;
        }

        this.selectedUsers = new Set();
        this.selectedAnimals = new Set();
        this.currentFilters = {};

        this.init();
    }

    // Verificar acesso administrativo
    checkAdminAccess() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser || currentUser.tipo !== 'admin') {
            console.log('Acesso negado: usuário não é administrador');
            return false;
        }
        return true;
    }

    init() {
        console.log('Inicializando sistema administrativo...');
        this.setupEventListeners();
        this.setupRealtimeListeners();
        this.loadDashboardData();
        this.loadUsers();
        this.loadAnimals();
        this.setupAdminUI();
    }

    setupAdminUI() {
        // Garantir que elementos administrativos estejam visíveis
        document.querySelectorAll('.admin-function').forEach(el => {
            el.style.display = 'block';
        });

        // Adicionar indicador de admin
        this.addAdminIndicator();
    }

    addAdminIndicator() {
        const header = document.querySelector('header');
        if (header && !document.getElementById('admin-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'admin-indicator';
            indicator.innerHTML = `
                <div style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px;">
                    <i class="fas fa-shield-alt"></i> Modo Administrativo
                </div>
            `;
            header.style.position = 'relative';
            header.appendChild(indicator);
        }
    }

    setupEventListeners() {
        // Navegação entre tabs
        const tabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Botões de usuários
        this.setupUserEvents();

        // Botões de animais
        this.setupAnimalEvents();

        // Logout
        const logoutBtn = document.getElementById('logout-link');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    setupUserEvents() {
        // Adicionar usuário
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showUserModal());
        }

        // Busca de usuários
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => this.searchUsers(e.target.value));
        }
    }

    setupAnimalEvents() {
        // Busca de animais
        const animalSearch = document.getElementById('animal-search');
        if (animalSearch) {
            animalSearch.addEventListener('input', (e) => this.searchAnimals(e.target.value));
        }
    }

    setupRealtimeListeners() {
        // Escutar mudanças em tempo real
        database.ref('cadastro_conta').on('value', () => this.loadUsers());
        database.ref('cadastro_animais').on('value', () => this.loadAnimals());
        database.ref('reports').on('value', () => this.loadReports());

        // Atualizar estatísticas em tempo real
        setInterval(() => this.loadDashboardData(), 30000);
    }

    // ===== DASHBOARD =====
    async loadDashboardData() {
        try {
            const [usersSnapshot, animalsSnapshot] = await Promise.all([
                database.ref('cadastro_conta').once('value'),
                database.ref('cadastro_animais').once('value')
            ]);

            const users = usersSnapshot.val() || {};
            const animals = animalsSnapshot.val() || {};

            this.updateDashboardStats(users, animals);

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            this.logSystem('error', `Erro ao carregar dashboard: ${error.message}`);
        }
    }

    updateDashboardStats(users, animals) {
        const userCount = Object.keys(users).length;
        const animalCount = Object.keys(animals).length;
        const ongCount = Object.values(users).filter(user => user.tipo === 'ong').length;

        // Atualizar os elementos no HTML
        const totalUsersEl = document.getElementById('total-users');
        const totalAnimalsEl = document.getElementById('total-animals');
        const totalOngsEl = document.getElementById('total-ongs');

        if (totalUsersEl) totalUsersEl.textContent = userCount;
        if (totalAnimalsEl) totalAnimalsEl.textContent = animalCount;
        if (totalOngsEl) totalOngsEl.textContent = ongCount;
    }

    // ===== GERENCIAMENTO DE USUÁRIOS =====
    async loadUsers() {
        try {
            const snapshot = await database.ref('cadastro_conta').once('value');
            const users = snapshot.val();
            this.renderUsersTable(users);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            this.logSystem('error', `Erro ao carregar usuários: ${error.message}`);
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-table');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.selectedUsers.clear();

        if (!users) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário cadastrado</td></tr>';
            return;
        }

        const usersArray = Object.keys(users).map(userId => ({ id: userId, ...users[userId] }));

        usersArray.forEach(user => {
            const row = this.createUserRow(user);
            tbody.appendChild(row);
        });
    }

    createUserRow(user) {
        const row = document.createElement('tr');
        row.dataset.userId = user.id;

        const typeText = user.tipo === 'admin' ? 'Administrador' :
            user.tipo === 'ong' ? 'ONG' : 'Usuário';

        const typeClass = user.tipo === 'admin' ? 'badge-admin' :
            user.tipo === 'ong' ? 'badge-ong' : 'badge-user';

        // Assume 'active' como padrão se o status não existir
        const currentStatus = user.status || 'active';
        const statusClass = currentStatus === 'active' ? 'badge-active' :
            currentStatus === 'suspended' ? 'badge-suspended' : 'badge-inactive';

        const statusText = currentStatus === 'active' ? 'Ativo' :
            currentStatus === 'suspended' ? 'Suspenso' : 'Inativo';

        const date = user.data_criacao ? new Date(user.data_criacao).toLocaleDateString('pt-BR') : 'N/A';

        row.innerHTML = `
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small">
                        ${user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="user-details">
                        <span class="user-name-cell">${user.nome || 'N/A'}</span>
                        <span class="user-email-cell">${user.email || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td><span class="badge ${typeClass}">${typeText}</span></td>
            <td>${date}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon ${currentStatus === 'suspended' ? 'btn-success' : 'btn-warning'}" 
                            onclick="adminSystem.toggleUserStatus('${user.id}')" 
                            title="${currentStatus === 'suspended' ? 'Reativar' : 'Suspender'}">
                        <i class="fas ${currentStatus === 'suspended' ? 'fa-play' : 'fa-pause'}"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminSystem.deleteUser('${user.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    // ===== GERENCIAMENTO DE ANIMAIS =====
    async loadAnimals() {
        try {
            const snapshot = await database.ref('cadastro_animais').once('value');
            const animals = snapshot.val();
            this.renderAnimalsTable(animals);
        } catch (error) {
            console.error("Erro ao carregar animais:", error);
            this.logSystem('error', `Erro ao carregar animais: ${error.message}`);
        }
    }

    renderAnimalsTable(animals) {
        const tbody = document.getElementById('animals-table');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.selectedAnimals.clear();

        if (!animals) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum animal cadastrado</td></tr>';
            return;
        }

        const animalsArray = Object.keys(animals).map(animalId => ({ id: animalId, ...animals[animalId] }));

        animalsArray.forEach(animal => {
            const row = this.createAnimalRow(animal);
            tbody.appendChild(row);
        });
    }

    createAnimalRow(animal) {
        const row = document.createElement('tr');
        row.dataset.animalId = animal.id;

        const speciesText = animal.especie === 'cachorro' ? 'Cachorro' :
            animal.especie === 'gato' ? 'Gato' : animal.outra_especie || 'Outro';

        const statusClass = animal.status === 'adotado' ? 'badge-inactive' :
            animal.status === 'suspenso' ? 'badge-suspended' : 'badge-active';

        const statusText = animal.status === 'adotado' ? 'Adotado' :
            animal.status === 'suspenso' ? 'Suspenso' : 'Disponível';

        const date = animal.data_cadastro ? new Date(animal.data_cadastro).toLocaleDateString('pt-BR') : 'N/A';

        row.innerHTML = `
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small">
                        ${animal.nome ? animal.nome.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div class="user-details">
                        <span class="user-name-cell">${animal.nome || 'Sem nome'}</span>
                        <span class="user-email-cell">${animal.tipo_cadastro === 'adocao' ? 'Para adoção' : animal.tipo_cadastro || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td>${speciesText}</td>
            <td>${animal.idade || 'N/A'}</td>
            <td>${animal.porte || 'N/A'}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-danger" onclick="adminSystem.deleteAnimal('${animal.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    // ===== FUNÇÕES DE CONTROLE (CORRIGIDAS) =====
    switchTab(tabName) {
        document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    // CORREÇÃO: Função para suspender/reativar usuário
    async toggleUserStatus(userId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || currentUser.tipo !== 'admin') {
                showNotification('Acesso negado.', 'error');
                return;
            }
            if (currentUser.id === userId) {
                showNotification('Você não pode alterar seu próprio status.', 'error');
                return;
            }

            const snapshot = await database.ref(`cadastro_conta/${userId}`).once('value');
            const user = snapshot.val();

            if (!user) {
                showNotification('Usuário não encontrado.', 'error');
                return;
            }

            // Usa 'active' como padrão se o status for indefinido
            const currentStatus = user.status || 'active';
            const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
            const action = newStatus === 'suspended' ? 'suspenso' : 'reativado';

            await database.ref(`cadastro_conta/${userId}`).update({
                status: newStatus,
                status_updated_by: currentUser.id,
                status_updated_at: new Date().toISOString()
            });

            showNotification(`Usuário ${user.nome} foi ${action} com sucesso!`, 'success');
            this.logSystem('warning', `Usuário ${userId} (${user.nome}) ${action} pelo administrador ${currentUser.nome}`);
            this.loadUsers(); // Recarrega a tabela para atualizar a UI

        } catch (error) {
            console.error("Erro ao alterar status do usuário:", error);
            showNotification('Erro ao alterar status: ' + error.message, 'error');
        }
    }

    // CORREÇÃO: Função para excluir usuário permanentemente
    async deleteUser(userId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || currentUser.tipo !== 'admin') {
                showNotification('Acesso negado.', 'error');
                return;
            }
            if (currentUser.id === userId) {
                showNotification('Você não pode excluir sua própria conta.', 'error');
                return;
            }

            const snapshot = await database.ref(`cadastro_conta/${userId}`).once('value');
            const user = snapshot.val();

            if (!user) {
                showNotification('Usuário não encontrado.', 'error');
                return;
            }

            if (!confirm(`Tem certeza que deseja excluir PERMANENTEMENTE o usuário "${user.nome}"? Esta ação não pode ser desfeita.`)) {
                return;
            }

            showPawLoader("Excluindo usuário...");

            await database.ref(`cadastro_conta/${userId}`).remove();

            showNotification(`Usuário "${user.nome}" excluído permanentemente!`, 'success');
            this.logSystem('warning', `Usuário ${userId} (${user.nome}) EXCLUÍDO pelo administrador ${currentUser.nome}`);
            this.loadUsers(); // Recarrega a tabela

        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            showNotification('Erro ao excluir usuário: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    

    // CORREÇÃO: Função para excluir animal permanentemente
    async deleteAnimal(animalId) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || currentUser.tipo !== 'admin') {
                showNotification('Acesso negado.', 'error');
                return;
            }

            const snapshot = await database.ref(`cadastro_animais/${animalId}`).once('value');
            const animal = snapshot.val();

            if (!animal) {
                showNotification('Animal não encontrado.', 'error');
                return;
            }

            if (!confirm(`Tem certeza que deseja excluir PERMANENTEMENTE o animal "${animal.nome}"? Esta ação não pode ser desfeita.`)) {
                return;
            }

            showPawLoader("Excluindo animal...");

            await database.ref(`cadastro_animais/${animalId}`).remove();

            showNotification(`Animal "${animal.nome}" excluído permanentemente!`, 'success');
            this.logSystem('warning', `Animal ${animalId} (${animal.nome}) EXCLUÍDO pelo administrador ${currentUser.nome}`);
            this.loadAnimals(); // Recarrega a tabela

        } catch (error) {
            console.error("Erro ao excluir animal:", error);
            showNotification('Erro ao excluir animal: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    viewAnimal(animalId) {
        showNotification(`Visualizando animal ${animalId}`, 'info');
        // Implementar visualização detalhada
    }

    editUser(userId) {
        showNotification(`Editando usuário ${userId}`, 'info');
        // Implementar edição de usuário
    }

    // ===== SISTEMA DE DENÚNCIAS =====
    async loadReports() {
        // Implementar se necessário
    }

    // ===== SISTEMA DE LOGS =====
    async loadSystemLogs() {
        // Implementar se necessário
    }

    logSystem(level, message, details = null) {
        const logId = 'log_' + Date.now();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const logData = {
            level: level,
            message: message,
            details: details,
            timestamp: new Date().toISOString(),
            adminId: currentUser ? currentUser.id : 'unknown'
        };

        database.ref(`system_logs/${logId}`).set(logData);
    }

    // ===== UTILITÁRIOS =====
    formatTimeAgo(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins} min atrás`;
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 24) return `${diffHours} h atrás`;
        return date.toLocaleDateString('pt-BR');
    }

    logout() {
        localStorage.removeItem('currentUser');
        showNotification('Logout realizado com sucesso!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    searchUsers(searchTerm) {
        const rows = document.querySelectorAll('#users-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    searchAnimals(searchTerm) {
        const rows = document.querySelectorAll('#animals-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
}

// Inicializar sistema administrativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('adm.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && currentUser.tipo === 'admin') {
            window.adminSystem = new AdminSystem();
            console.log('Sistema administrativo inicializado para:', currentUser.nome);
        } else {
            showNotification('Acesso restrito a administradores. Redirecionando...', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
});

// Funções globais de notificação (garanta que elas existam no seu projeto)
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Aqui você deve implementar a lógica para mostrar a notificação na tela
    // Ex: Toastify, SweetAlert, ou um div customizado
}

function showPawLoader(message = "Carregando...") {
    console.log("LOADER:", message);
    // Implementar a lógica para mostrar o loader
    const loader = document.getElementById('pawLoader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

function hidePawLoader() {
    console.log("LOADER HIDDEN");
    // Implementar a lógica para esconder o loader
    const loader = document.getElementById('pawLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}
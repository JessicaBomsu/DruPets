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
        this.loadReports();
        this.loadSystemLogs();
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
            const [usersSnapshot, animalsSnapshot, adoptionsSnapshot, reportsSnapshot] = await Promise.all([
                database.ref('cadastro_conta').once('value'),
                database.ref('cadastro_animais').once('value'),
                database.ref('adoptions').once('value'),
                database.ref('reports').once('value')
            ]);

            const users = usersSnapshot.val() || {};
            const animals = animalsSnapshot.val() || {};
            const adoptions = adoptionsSnapshot.val() || {};
            const reports = reportsSnapshot.val() || {};

            this.updateDashboardStats(users, animals, adoptions, reports);
            this.updateActivityList(users, animals, reports);

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            this.logSystem('error', `Erro ao carregar dashboard: ${error.message}`);
        }
    }

    updateDashboardStats(users, animals, adoptions, reports) {
        const userCount = Object.keys(users).length;
        const animalCount = Object.keys(animals).length;
        const ongCount = Object.values(users).filter(user => user.tipo === 'ong').length;
        const adoptedCount = Object.values(animals).filter(animal => animal.status === 'adotado').length;
        const pendingAdoptions = Object.values(adoptions).filter(adoption => 
            adoption.phase && adoption.phase !== 'finalizado'
        ).length;
        const reportCount = Object.keys(reports).length;

        document.getElementById('total-users').textContent = userCount;
        document.getElementById('total-animals').textContent = animalCount;
        document.getElementById('total-ongs').textContent = ongCount;
        document.getElementById('adopted-animals').textContent = adoptedCount;
        document.getElementById('pending-adoptions').textContent = pendingAdoptions;
        document.getElementById('total-reports').textContent = reportCount;
    }

    updateActivityList(users, animals, reports) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const activities = [];

        // Adicionar atividades recentes de usuários
        Object.values(users)
            .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
            .slice(0, 5)
            .forEach(user => {
                activities.push({
                    type: 'user',
                    message: `Novo usuário cadastrado: ${user.nome}`,
                    timestamp: user.data_criacao,
                    icon: 'fas fa-user-plus'
                });
            });

        // Adicionar atividades recentes de animais
        Object.values(animals)
            .sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro))
            .slice(0, 5)
            .forEach(animal => {
                activities.push({
                    type: 'animal',
                    message: `Animal cadastrado: ${animal.nome}`,
                    timestamp: animal.data_cadastro,
                    icon: 'fas fa-paw'
                });
            });

        // Ordenar por timestamp e pegar as 10 mais recentes
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivities = activities.slice(0, 10);

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-message">${activity.message}</p>
                    <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
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
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum usuário cadastrado</td></tr>';
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
        
        const typeClass = user.tipo === 'admin' ? 'status-admin' : 
                         user.tipo === 'ong' ? 'status-ong' : 'status-user';

        const statusClass = user.status === 'active' ? 'status-active' : 
                           user.status === 'suspended' ? 'status-suspended' : 'status-inactive';
        
        const statusText = user.status === 'active' ? 'Ativo' : 
                          user.status === 'suspended' ? 'Suspenso' : 'Inativo';

        const date = user.data_criacao ? new Date(user.data_criacao).toLocaleDateString('pt-BR') : 'N/A';

        row.innerHTML = `
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small">
                        ${user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <strong>${user.nome || 'N/A'}</strong>
                        <br>
                        <small>${user.email || 'N/A'}</small>
                    </div>
                </div>
            </td>
            <td><span class="user-type-badge ${typeClass}">${typeText}</span></td>
            <td>${date}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="adminSystem.editUser('${user.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon ${user.status === 'suspended' ? 'btn-success' : 'btn-warning'}" 
                            onclick="adminSystem.toggleUserStatus('${user.id}')" 
                            title="${user.status === 'suspended' ? 'Reativar' : 'Suspender'}">
                        <i class="fas ${user.status === 'suspended' ? 'fa-play' : 'fa-pause'}"></i>
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
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum animal cadastrado</td></tr>';
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

        const statusClass = animal.status === 'adotado' ? 'status-adopted' : 
                           animal.status === 'suspenso' ? 'status-suspended' : 'status-available';
        
        const statusText = animal.status === 'adotado' ? 'Adotado' : 
                          animal.status === 'suspenso' ? 'Suspenso' : 'Disponível';

        const date = animal.data_cadastro ? new Date(animal.data_cadastro).toLocaleDateString('pt-BR') : 'N/A';

        row.innerHTML = `
            <td>
                <div class="animal-info-cell">
                    <img src="${this.getAnimalImage(animal)}" alt="${animal.nome}" class="animal-thumb">
                    <div>
                        <strong>${animal.nome || 'Sem nome'}</strong>
                        <br>
                        <small>${animal.tipo_cadastro === 'adocao' ? 'Para adoção' : 
                                animal.tipo_cadastro === 'perdido' ? 'Perdido' : 'Encontrado'}</small>
                    </div>
                </div>
            </td>
            <td>${speciesText}</td>
            <td>${animal.idade || 'N/A'} anos</td>
            <td>${animal.porte || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="adminSystem.viewAnimal('${animal.id}')" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon ${animal.status === 'suspenso' ? 'btn-success' : 'btn-warning'}" 
                            onclick="adminSystem.toggleAnimalStatus('${animal.id}')" 
                            title="${animal.status === 'suspenso' ? 'Reativar' : 'Suspender'}">
                        <i class="fas ${animal.status === 'suspenso' ? 'fa-play' : 'fa-pause'}"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminSystem.deleteAnimal('${animal.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    getAnimalImage(animal) {
        const placeholders = {
            'cachorro': 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60',
            'gato': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60',
            'outro': 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
        };
        
        return placeholders[animal.especie] || placeholders.outro;
    }

    // ===== FUNÇÕES DE CONTROLE =====
    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.admin-container .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    async toggleUserStatus(userId) {
        try {
            const snapshot = await database.ref(`cadastro_conta/${userId}`).once('value');
            const user = snapshot.val();
            
            if (!user) {
                showNotification('Usuário não encontrado.', 'error');
                return;
            }

            const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
            const action = newStatus === 'suspended' ? 'suspenso' : 'reativado';

            await database.ref(`cadastro_conta/${userId}/status`).set(newStatus);
            showNotification(`Usuário ${action} com sucesso!`, 'success');
            this.logSystem('warning', `Usuário ${userId} ${action} pelo administrador`);

        } catch (error) {
            console.error("Erro ao alterar status do usuário:", error);
            showNotification('Erro ao alterar status: ' + error.message, 'error');
        }
    }

    deleteUser(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            showPawLoader("Excluindo usuário...");

            database.ref(`cadastro_conta/${userId}`).remove()
                .then(() => {
                    showNotification('Usuário excluído com sucesso!', 'success');
                    this.logSystem('warning', `Usuário ${userId} excluído pelo administrador`);
                })
                .catch(error => {
                    console.error("Erro ao excluir usuário:", error);
                    showNotification('Erro ao excluir usuário: ' + error.message, 'error');
                })
                .finally(() => {
                    hidePawLoader();
                });
        }
    }

    async toggleAnimalStatus(animalId) {
        try {
            const snapshot = await database.ref(`cadastro_animais/${animalId}`).once('value');
            const animal = snapshot.val();
            
            if (!animal) {
                showNotification('Animal não encontrado.', 'error');
                return;
            }

            const newStatus = animal.status === 'suspenso' ? 'disponivel' : 'suspenso';
            const action = newStatus === 'suspenso' ? 'suspenso' : 'reativado';

            await database.ref(`cadastro_animais/${animalId}/status`).set(newStatus);
            showNotification(`Animal ${action} com sucesso!`, 'success');
            this.logSystem('warning', `Animal ${animalId} ${action} pelo administrador`);

        } catch (error) {
            console.error("Erro ao alterar status do animal:", error);
            showNotification('Erro ao alterar status: ' + error.message, 'error');
        }
    }

    deleteAnimal(animalId) {
        if (confirm('Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita.')) {
            showPawLoader("Excluindo animal...");

            database.ref(`cadastro_animais/${animalId}`).remove()
                .then(() => {
                    showNotification('Animal excluído com sucesso!', 'success');
                    this.logSystem('warning', `Animal ${animalId} excluído pelo administrador`);
                })
                .catch(error => {
                    console.error("Erro ao excluir animal:", error);
                    showNotification('Erro ao excluir animal: ' + error.message, 'error');
                })
                .finally(() => {
                    hidePawLoader();
                });
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
        try {
            const snapshot = await database.ref('reports').once('value');
            const reports = snapshot.val();
            this.renderReportsList(reports);
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            this.logSystem('error', `Erro ao carregar denúncias: ${error.message}`);
        }
    }

    renderReportsList(reports) {
        const container = document.getElementById('reports-list');
        if (!container) return;

        container.innerHTML = '';

        if (!reports) {
            container.innerHTML = '<div class="empty-state">Nenhuma denúncia encontrada</div>';
            return;
        }
    }

    // ===== SISTEMA DE LOGS =====
    async loadSystemLogs() {
        try {
            const snapshot = await database.ref('system_logs').once('value');
            const logs = snapshot.val();
            this.renderSystemLogs(logs);
        } catch (error) {
            console.error("Erro ao carregar logs:", error);
        }
    }

    renderSystemLogs(logs) {
        const container = document.getElementById('system-logs');
        if (!container) return;

        container.innerHTML = '';

        if (!logs) {
            container.innerHTML = '<div class="empty-state">Nenhum log encontrado</div>';
            return;
        }
    }

    logSystem(level, message, details = null) {
        const logId = 'log_' + Date.now();
        const logData = {
            level: level,
            message: message,
            details: details,
            timestamp: new Date().toISOString(),
            adminId: JSON.parse(localStorage.getItem('currentUser')).id
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
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours} h atrás`;
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
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
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    searchAnimals(searchTerm) {
        const rows = document.querySelectorAll('#animals-table tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Inicializar sistema administrativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('adm.html')) {
        // Verificar se é admin antes de inicializar
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && currentUser.tipo === 'admin') {
            window.adminSystem = new AdminSystem();
            console.log('Sistema administrativo inicializado para:', currentUser.nome);
        } else {
            // Redirecionar não-administradores
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            showNotification('Acesso restrito a administradores. Redirecionando...', 'error');
        }
    }
});
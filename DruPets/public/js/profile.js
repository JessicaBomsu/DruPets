// js/profile.js - Sistema de Gerenciamento de Perfil

class ProfileSystem {
    constructor() {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            // Se não estiver logado, redireciona para a página de login
            window.location.href = 'login.html';
            return;
        }

        this.database = firebase.database();
        this.currentUser = window.authSystem.getCurrentUser();
        this.userId = this.currentUser.id;
        this.userAnimalsData = { adocao: [], perdido: [], encontrado: [] };
        
        this.init();
    }

    init() {
        console.log('👤 ProfileSystem iniciado para o usuário:', this.userId);
        this.setupEventListeners();
        this.loadUserProfile();
        this.loadUserAnimals();
        
        // Carregar eventos apenas se for ONG ou Admin
        if (this.currentUser.tipo === 'ong' || this.currentUser.tipo === 'admin') {
            this.loadUserEvents();
            // Mostrar a seção de eventos
            const eventsSection = document.getElementById('my-events-section');
            if (eventsSection) eventsSection.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Botão de Editar Perfil
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditModal());
        }

        // Botão Salvar do Modal
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => this.handleSaveProfile(e));
        }
        
        // Botão Fechar/Cancelar do Modal
        const closeModalBtn = document.getElementById('close-edit-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeEditModal());
        }
        if (cancelEditBtn) {
             cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        }

        // Fechar Modal clicando fora
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeEditModal();
            });
        }
        
        // Tabs de Meus Animais
        document.querySelectorAll('#animal-display-tabs .tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove a classe 'active' de todos e adiciona no clicado
                document.querySelectorAll('#animal-display-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const type = e.target.dataset.type;
                this.switchAnimalDisplayTab(type);
            });
        });
    }

    // ===================================
    // 1. GERAL: CARREGAMENTO E SINCRONIZAÇÃO DO PERFIL
    // ===================================

    loadUserProfile() {
        showPawLoader('Carregando perfil...');
        
        this.database.ref(`cadastro_conta/${this.userId}`).once('value', (snapshot) => {
            hidePawLoader();
            const userData = snapshot.val();
            
            if (userData) {
                // SINCRONIZAÇÃO: Atualiza o objeto do usuário local
                Object.assign(this.currentUser, userData);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // Exibir dados na tela
                document.getElementById('profile-name').textContent = userData.nome || 'Nome não definido';
                document.getElementById('profile-email').textContent = userData.email || 'E-mail não disponível';
                document.getElementById('profile-phone').textContent = userData.telefone || 'Telefone não cadastrado';
                document.getElementById('profile-type').textContent = this.formatUserType(userData.tipo);
                
                // Exibir/Ocultar link Admin no dropdown (garantia)
                const adminLink = document.getElementById('admin-link');
                if (adminLink) {
                    if (userData.tipo === 'admin') {
                        adminLink.classList.remove('hidden');
                    } else {
                        adminLink.classList.add('hidden');
                    }
                }
            } else {
                showNotification('Dados do perfil não encontrados no banco de dados.', 'error');
            }
        });
    }

    formatUserType(type) {
        switch (type) {
            case 'admin':
                return 'Administrador';
            case 'ong':
                return 'ONG/Protetor';
            default:
                return 'Usuário Comum';
        }
    }

    // ===================================
    // 2. EDITAR PERFIL (Modal e Save)
    // ===================================

    openEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        
        // Preencher o modal com os dados atuais do usuário
        document.getElementById('edit-name').value = this.currentUser.nome || '';
        document.getElementById('edit-email').value = this.currentUser.email || '';
        document.getElementById('edit-phone').value = this.currentUser.telefone || '';
        document.getElementById('edit-email').disabled = true; // Email não deve ser editável

        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.getElementById('edit-password').value = ''; // Limpa campos de senha
            document.getElementById('edit-confirm-password').value = ''; 
        }
    }
    
    async handleSaveProfile(e) {
        e.preventDefault();
        
        const name = document.getElementById('edit-name').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const password = document.getElementById('edit-password').value;
        const confirmPassword = document.getElementById('edit-confirm-password').value;

        if (!name) {
            showNotification('O campo Nome não pode ficar vazio.', 'error');
            return;
        }

        if (password && password !== confirmPassword) {
            showNotification('A nova senha e a confirmação não coincidem.', 'error');
            return;
        }

        showPawLoader('Sincronizando perfil...');

        try {
            const updates = {
                nome: name,
                telefone: phone,
                ultima_atualizacao: new Date().toISOString()
            };

            // Se forneceu nova senha, atualizar
            if (password) {
                updates.senha = password;
            }

            await this.database.ref(`cadastro_conta/${this.userId}`).update(updates);
            
            // SINCRONIZAÇÃO: Atualizar usuário local
            Object.assign(this.currentUser, updates);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            showNotification('Perfil atualizado e sincronizado com sucesso!', 'success');
            this.closeEditModal();
            this.loadUserProfile(); // Recarrega informações exibidas
            
        } catch (error) {
            console.error('Erro ao sincronizar perfil:', error);
            showNotification('Erro ao sincronizar perfil: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }
    
    // ===================================
    // 3. MEUS ANIMAIS CADASTRADOS (TODOS OS TIPOS)
    // ===================================

    async loadUserAnimals() {
        showPawLoader('Carregando animais cadastrados...');
        const animalGrid = document.getElementById('my-animals-grid');
        const noAnimalsMessage = document.getElementById('no-animals-message');
        
        animalGrid.innerHTML = '';
        noAnimalsMessage.classList.add('hidden');

        try {
            const snapshot = await this.database.ref('animais').once('value');
            const animals = snapshot.val();
            
            let adocao = [];
            let perdido = [];
            let encontrado = [];

            if (animals) {
                // Filtrar os animais cadastrados por este usuário
                Object.keys(animals)
                    .map(key => ({ id: key, ...animals[key] }))
                    .filter(animal => animal.cadastradorId === this.userId)
                    .forEach(animal => {
                        if (animal.tipo === 'adocao') adocao.push(animal);
                        else if (animal.tipo === 'perdido') perdido.push(animal);
                        else if (animal.tipo === 'encontrado') encontrado.push(animal);
                    });
            }
            
            this.userAnimalsData = { adocao, perdido, encontrado };
            
            const totalAnimals = adocao.length + perdido.length + encontrado.length;
            if (totalAnimals === 0) {
                noAnimalsMessage.classList.remove('hidden');
                hidePawLoader();
                return;
            }
            
            // Carrega a tab ativa (padrão é 'adocao')
            const activeTab = document.querySelector('#animal-display-tabs .tab-btn.active');
            const initialType = activeTab ? activeTab.dataset.type : 'adocao';
            this.switchAnimalDisplayTab(initialType);
            
        } catch (error) {
            console.error('Erro ao carregar animais do usuário:', error);
            showNotification('Erro ao carregar seus animais cadastrados.', 'error');
        } finally {
            hidePawLoader();
        }
    }
    
    // Renderiza o grid da tab de animais selecionada
    switchAnimalDisplayTab(type) {
        if (!this.userAnimalsData) return;

        const animalGrid = document.getElementById('my-animals-grid');
        const noAnimalsMessage = document.getElementById('no-animals-message');
        const animalsToDisplay = this.userAnimalsData[type];
        
        animalGrid.innerHTML = '';
        noAnimalsMessage.classList.add('hidden');
        
        if (animalsToDisplay && animalsToDisplay.length > 0) {
            animalsToDisplay.forEach(animal => {
                const card = this.createAnimalCardWithDelete(animal, animal.id);
                animalGrid.appendChild(card);
            });
        } else {
            noAnimalsMessage.textContent = `Nenhum animal do tipo "${type.charAt(0).toUpperCase() + type.slice(1)}" cadastrado por você.`;
            noAnimalsMessage.classList.remove('hidden');
        }
    }
    
    // Cria um card de animal com a opção de exclusão (reutiliza a lógica do AnimalSystem)
    createAnimalCardWithDelete(animal, id) {
        if (!window.animalSystem || typeof window.animalSystem.createAnimalCard !== 'function') {
            // Fallback simples
            const card = document.createElement('div');
            card.className = 'animal-card';
            card.innerHTML = `<h3>${animal.nome}</h3><p>Tipo: ${animal.tipo}</p><button class="btn btn-danger btn-small">Excluir</button>`;
            return card;
        }
        
        // 1. Cria o card original
        const card = window.animalSystem.createAnimalCard(animal, id);
        
        // 2. Adiciona overlay de ação (Excluir)
        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions-overlay';
        cardActions.innerHTML = `
            <button class="btn btn-danger delete-animal-btn" data-id="${id}">
               <i class="fas fa-trash"></i> Excluir
            </button>
        `;
        
        // 3. Adiciona o listener para exclusão
        cardActions.querySelector('.delete-animal-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.animalSystem && typeof window.animalSystem.deleteAnimal === 'function') {
               // Chama o método de exclusão do AnimalSystem
               window.animalSystem.deleteAnimal(id, animal.tipo).then(() => {
                   this.loadUserAnimals(); // Recarrega a lista após exclusão
               });
            } else {
               showNotification('Funcionalidade de exclusão não disponível.', 'error');
            }
        });
        
        card.appendChild(cardActions);
        
        // Faz com que o card-actions-overlay cubra todo o card, mas permite o clique no botão
        card.style.position = 'relative'; 
        
        return card;
    }
    
    // ===================================
    // 4. MEUS EVENTOS (ONG/ADMIN)
    // ===================================

    async loadUserEvents() {
        showPawLoader('Carregando seus eventos...');
        const eventGrid = document.getElementById('my-events-grid');
        const noEventsMessage = document.getElementById('no-events-message');
        
        if (!eventGrid) return; 

        eventGrid.innerHTML = '';
        noEventsMessage.classList.add('hidden');

        try {
            const snapshot = await this.database.ref('eventos').once('value');
            const events = snapshot.val();
            
            let userEvents = [];

            if (events) {
                // Filtrar os eventos que foram cadastrados por este usuário
                userEvents = Object.keys(events)
                    .map(key => ({ id: key, ...events[key] }))
                    .filter(event => event.cadastradorId === this.userId);
                    
                if (userEvents.length > 0) {
                    // Ordenar por data (mais recente primeiro)
                    userEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    userEvents.forEach(event => {
                        if (window.eventSystem && typeof window.eventSystem.createEventCard === 'function') {
                            const eventCard = window.eventSystem.createEventCard(event, event.id, new Date(event.date) < new Date());
                            
                            // Adiciona botão de Excluir
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'btn btn-danger btn-small delete-event-btn';
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
                            deleteBtn.style.marginTop = '10px';
                            
                            deleteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (window.eventSystem && typeof window.eventSystem.deleteEvent === 'function') {
                                    window.eventSystem.deleteEvent(event.id).then(() => {
                                        this.loadUserEvents(); // Recarrega após exclusão
                                    });
                                } else {
                                    showNotification('Funcionalidade de exclusão de evento não disponível.', 'error');
                                }
                            });
                            
                            // Anexa o botão de exclusão no final da seção de detalhes
                            const details = eventCard.querySelector('.event-details');
                            if(details) details.appendChild(deleteBtn);
                            
                            eventGrid.appendChild(eventCard);
                        } else {
                            // Fallback
                            const card = document.createElement('div');
                            card.className = 'event-card';
                            card.innerHTML = `<h3>${event.title}</h3><p>${event.date} às ${event.time}</p>`;
                            eventGrid.appendChild(card);
                        }
                    });
                    
                } else {
                    noEventsMessage.textContent = 'Você ainda não cadastrou nenhum evento.';
                    noEventsMessage.classList.remove('hidden');
                }
            } else {
                noEventsMessage.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('Erro ao carregar eventos do usuário:', error);
            showNotification('Erro ao carregar seus eventos cadastrados.', 'error');
        } finally {
            hidePawLoader();
        }
    }
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', function() {
    // Dá um tempo para as outras libs (auth, animal, event) carregarem.
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && typeof window.authSystem !== 'undefined') {
            if (window.authSystem.isLoggedIn()) {
                window.profileSystem = new ProfileSystem();
                console.log('✅ ProfileSystem inicializado com sucesso!');
            } else {
                console.log('Usuário não logado. Redirecionando...');
            }
        } else {
            console.error("❌ Dependências (Firebase ou AuthSystem) não estão carregadas.");
        }
    }, 500); 
});
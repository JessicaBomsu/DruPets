// js/events.js - LÓGICA DE EVENTOS (FEIRAS DE ADOÇÃO) COM UPLOAD, EXCLUSÃO E SEPARAÇÃO POR DATA

class EventSystem {
    constructor() {
        this.database = firebase.database();
        this.storage = firebase.storage();
        this.modal = document.getElementById('event-details-modal');
        this.DEFAULT_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/pex25-a64be.appspot.com/o/placeholder%2Fevent-placeholder.png?alt=media&token=c45b850d-88e2-45a8-b57f-f772379e13d5'; // URL de uma imagem padrão para eventos
        this.init();
    }

    init() {
        console.log('🗓️ EventSystem iniciado');
        this.setupEventListeners();
        this.loadEvents();
        setTimeout(() => this.checkUserPermissions(), 500); 
    }

    setupEventListeners() {
        const showFormBtn = document.getElementById('show-event-form-btn');
        if (showFormBtn) {
            showFormBtn.addEventListener('click', () => this.showEventForm());
        }

        const cancelBtn = document.getElementById('cancel-event-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideEventForm());
        }

        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }

        const contactOngBtn = document.getElementById('contact-ong-btn');
        if (contactOngBtn) {
            contactOngBtn.addEventListener('click', () => this.contactForEvents());
        }
        
        // Preview da imagem ao selecionar o arquivo
        const imageInput = document.getElementById('event-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.previewImage(e.target.files[0]));
        }
        
        // Event listeners para o Modal
        const closeBtn = document.getElementById('close-event-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
    }
    
    previewImage(file) {
        const preview = document.getElementById('image-preview');
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    }

    showEventForm() {
        const formContainer = document.getElementById('event-form-container');
        const showFormBtn = document.getElementById('show-event-form-btn');
        const contactOngBtn = document.getElementById('contact-ong-btn');
        
        if (formContainer) {
            formContainer.classList.remove('hidden');
        }
        if (showFormBtn) {
            showFormBtn.classList.add('hidden');
        }
        if (contactOngBtn) {
            contactOngBtn.classList.add('hidden');
        }
    }
    
    hideEventForm() {
        const formContainer = document.getElementById('event-form-container');
        const eventForm = document.getElementById('event-form');
        
        if (formContainer) {
            formContainer.classList.add('hidden');
            if (eventForm) {
                eventForm.reset(); // Limpa todos os campos
            }
            this.previewImage(null); // Limpa a pré-visualização da imagem
            this.checkUserPermissions(); // Re-avalia as permissões para mostrar o botão 'Criar Evento' ou 'Sou ONG'
        }
    }

    // MODIFICADO: LÓGICA DE SALVAR EVENTO (Imagem opcional)
    async handleEventSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('event-title').value;
        const location = document.getElementById('event-location').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const description = document.getElementById('event-description').value;
        const contact = document.getElementById('event-contact').value;
        
        const imageFile = document.getElementById('event-image').files[0];
        
        // Validação (apenas campos de texto obrigatórios)
        if (!title || !location || !date || !time || !description || !contact) {
            showNotification('Por favor, preencha todos os campos de texto obrigatórios (*).', 'error');
            return;
        }

        showPawLoader('Salvando Evento...');
        
        try {
            let imageURL = this.DEFAULT_IMAGE_URL; // Define URL padrão
            
            // 1. UPLOAD DA IMAGEM (SE FOR FORNECIDA)
            if (imageFile) {
                showPawLoader('Fazendo upload da imagem...');
                imageURL = await this.uploadImage(imageFile);
            }
            
            // 2. SALVAR DADOS DO EVENTO
            const currentUser = window.authSystem.getCurrentUser();
            const eventData = {
                title: title,
                location: location,
                date: date,
                time: time,
                description: description,
                contact: contact,
                image: imageURL, // Agora pode ser o URL real ou o padrão
                cadastradorId: currentUser.id,
                cadastradorNome: currentUser.nome || currentUser.email,
                cadastradorTipo: currentUser.tipo || 'user',
                dataCadastro: new Date().toISOString(),
                status: 'ativo'
            };

            await this.database.ref('eventos').push(eventData);
            
            showNotification('Evento cadastrado com sucesso! Ele aparecerá na lista.', 'success');
            
            this.hideEventForm();
            this.loadEvents();
            
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            showNotification('Erro ao salvar evento. Verifique as regras do Firebase Storage: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }
    
    // Função para fazer upload da imagem no Firebase Storage
    async uploadImage(file) {
        const fileName = `event_${Date.now()}_${file.name}`;
        const storageRef = this.storage.ref(`event_images/${fileName}`);
        
        const uploadTask = storageRef.put(file);

        // Retorna uma Promise que resolve quando o upload é concluído e retorna a URL
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Opcional: Mostrar progresso
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                }, 
                (error) => {
                    // Lidar com erros de upload
                    console.error("Erro no upload:", error);
                    reject(new Error(`Falha no upload da imagem: ${error.message}`));
                }, 
                () => {
                    // Sucesso: obter a URL de download
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        resolve(downloadURL);
                    }).catch(reject);
                }
            );
        });
    }

    // Função para deletar o evento
    async deleteEvent(eventId) {
        if (!confirm('Tem certeza que deseja EXCLUIR este evento permanentemente? Esta ação não pode ser desfeita.')) {
            return;
        }

        showPawLoader('Excluindo evento...');

        try {
            // 1. Remover do Realtime Database
            await this.database.ref(`eventos/${eventId}`).remove();
            
            // Opcional: Se quisesse remover do Storage, precisaria guardar o path original no DB
            
            showNotification('Evento excluído com sucesso.', 'success');
            this.closeModal();
            this.loadEvents(); // Recarrega a lista
            
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            showNotification('Erro ao excluir evento: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    async getUserType(userId) {
         try {
            const snapshot = await this.database.ref(`cadastro_conta/${userId}`).once('value');
            const userData = snapshot.val();
            return userData ? userData.tipo : 'user';
        } catch (error) {
            console.error("Erro ao buscar tipo de usuário:", error);
            return 'user';
        }
    }

    // Separa eventos por data
    async loadEvents() {
        const upcomingGrid = document.getElementById('upcoming-events-grid');
        const pastGrid = document.getElementById('past-events-grid');
        const noUpcoming = document.getElementById('no-upcoming-events');
        const noPast = document.getElementById('no-past-events');
        
        if (!upcomingGrid || !pastGrid) return;
        
        upcomingGrid.innerHTML = '';
        pastGrid.innerHTML = '';
        noUpcoming.classList.add('hidden');
        noPast.classList.add('hidden');

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Zera a hora para considerar o dia inteiro

        try {
            const snapshot = await this.database.ref('eventos').once('value');
            const events = snapshot.val();
            
            let upcomingEvents = [];
            let pastEvents = [];

            if (events) {
                const eventsArray = Object.keys(events).map(key => ({ id: key, ...events[key] }));
                
                // 1. Processar e Separar Eventos
                for (const event of eventsArray) {
                    if (event.status === 'ativo') {
                        if (!event.cadastradorTipo && event.cadastradorId) {
                            event.cadastradorTipo = await this.getUserType(event.cadastradorId);
                        }
                        
                        // Cria um objeto Date apenas com a data do evento para comparação
                        const eventDate = new Date(event.date);
                        eventDate.setHours(0, 0, 0, 0);

                        if (eventDate >= now) {
                            upcomingEvents.push(event);
                        } else {
                            pastEvents.push(event);
                        }
                    }
                }
                
                // 2. Classificar (Futuros: mais próximos primeiro; Passados: mais recentes primeiro)
                upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // 3. Renderizar Eventos Futuros
                if (upcomingEvents.length > 0) {
                    upcomingEvents.forEach(event => {
                        const eventCard = this.createEventCard(event, event.id, false); // false = não é passado
                        upcomingGrid.appendChild(eventCard);
                    });
                } else {
                    noUpcoming.classList.remove('hidden');
                }
                
                // 4. Renderizar Eventos Passados
                if (pastEvents.length > 0) {
                    pastEvents.forEach(event => {
                        const eventCard = this.createEventCard(event, event.id, true); // true = é passado
                        pastGrid.appendChild(eventCard);
                    });
                } else {
                    noPast.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            showNotification('Erro ao carregar feiras de adoção.', 'error');
        }
    }

    createEventCard(event, id, isPastEvent) {
        const card = document.createElement('div');
        card.className = 'event-card';
        if (isPastEvent) {
            card.classList.add('past-event');
        }
        card.dataset.id = id;
        
        const fullDate = `${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time}`;
        const descriptionSnippet = event.description ? event.description.substring(0, 150) + (event.description.length > 150 ? '...' : '') : 'Nenhuma descrição disponível.';

        // Lógica de Verificação
        const isVerified = event.cadastradorTipo === 'ong' || event.cadastradorTipo === 'admin';
        const statusClass = isVerified ? 'status-verified' : 'status-unverified';
        const statusText = isVerified ? 'Conta Confiável' : 'Evento Não Verificado';
        const statusIcon = isVerified ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        
        const verificationBadge = `
            <span class="publisher-status ${statusClass}" title="${statusText}">
                <i class="${statusIcon}"></i> ${statusText}
            </span>
        `;

        // Usa a imagem do evento ou o padrão se estiver faltando
        const imageUrl = event.image || this.DEFAULT_IMAGE_URL; 

        card.innerHTML = `
            <img src="${imageUrl}" alt="Imagem do Evento" class="event-image">
            <div class="event-details">
                <h3>${event.title}</h3>
                <p class="event-meta"><i class="fas fa-user-alt"></i> ${event.cadastradorNome || 'Organizador'} ${verificationBadge}</p>
                <p class="event-meta"><i class="fas fa-calendar-alt"></i> ${fullDate}</p>
                <p class="event-meta"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p class="event-description">${descriptionSnippet}</p>
                <button class="btn btn-secondary view-details-btn" data-id="${id}">Ver Mais</button>
            </div>
        `;
        
        card.querySelector('.view-details-btn')?.addEventListener('click', () => this.showEventDetails(id, event, isVerified, statusText));
        
        return card;
    }
    
    // Adiciona lógica de permissão para o botão Excluir
    showEventDetails(id, eventData, isVerified, statusText) {
        if (!this.modal) return;
        
        const currentUser = window.authSystem.getCurrentUser();
        const isAdmin = window.authSystem.isAdmin();
        const isEventCreator = currentUser && currentUser.id === eventData.cadastradorId;
        
        // 1. Preencher Conteúdo
        document.getElementById('modal-event-image').src = eventData.image || this.DEFAULT_IMAGE_URL;
        document.getElementById('modal-event-title').textContent = eventData.title;
        document.getElementById('modal-publisher-name').textContent = eventData.cadastradorNome || 'Organizador Desconhecido';
        
        const fullDate = `${new Date(eventData.date).toLocaleDateString('pt-BR')} às ${eventData.time}`;
        document.getElementById('modal-event-datetime').textContent = fullDate;
        document.getElementById('modal-event-location').textContent = eventData.location;
        document.getElementById('modal-event-description').textContent = eventData.description;
        document.getElementById('modal-event-contact-info').textContent = eventData.contact;
        
        // 2. Injetar Selo de Verificação
        const statusElement = document.getElementById('modal-publisher-status');
        const statusClass = isVerified ? 'status-verified' : 'status-unverified';
        const statusIcon = isVerified ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        
        statusElement.innerHTML = `
            <span class="publisher-status ${statusClass}" title="${statusText}">
                <i class="${statusIcon}"></i> ${statusText}
            </span>
        `;
        
        // 3. Configurar Botão de Excluir (Novo)
        const deleteBtn = document.getElementById('delete-event-btn');
        if (isAdmin || isEventCreator) {
            deleteBtn.classList.remove('hidden');
            deleteBtn.onclick = () => this.deleteEvent(id);
        } else {
            deleteBtn.classList.add('hidden');
            deleteBtn.onclick = null;
        }

        // 4. Configurar Outros Botões de Ação
        const contactBtn = document.getElementById('contact-publisher-btn');
        const shareBtn = document.getElementById('share-event-btn');

        contactBtn.onclick = () => {
            const contactInfo = eventData.contact;
            if (contactInfo.includes('@')) {
                window.location.href = `mailto:${contactInfo}?subject=Interesse no evento: ${eventData.title}`;
            } else {
                alert(`Contato do Organizador: ${contactInfo}. Você pode ligar ou enviar uma mensagem.`);
            }
        };

        shareBtn.onclick = () => {
            if (navigator.share) {
                navigator.share({
                    title: eventData.title,
                    text: `Participe da Feira de Adoção: ${eventData.title}! Local: ${eventData.location}.`,
                    url: window.location.href
                });
            } else {
                alert(`Link do evento copiado! Compartilhe: ${window.location.href}`);
                navigator.clipboard.writeText(window.location.href);
            }
        };

        // 5. Abrir Modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    checkUserPermissions() {
        // ... (mantida)
        const showFormBtn = document.getElementById('show-event-form-btn');
        const contactOngBtn = document.getElementById('contact-ong-btn');
        const isLoggedIn = window.authSystem && window.authSystem.isLoggedIn();
        
        if (isLoggedIn) {
            const isAuthorized = window.authSystem.isAdmin() || window.authSystem.isONG();
            
            if (showFormBtn) {
                if (isAuthorized) {
                    showFormBtn.classList.remove('hidden');
                    if (contactOngBtn) contactOngBtn.classList.add('hidden');
                } else {
                    showFormBtn.classList.add('hidden');
                    if (contactOngBtn) contactOngBtn.classList.remove('hidden');
                }
            }
        } else {
            if (showFormBtn) showFormBtn.classList.add('hidden');
            if (contactOngBtn) contactOngBtn.classList.remove('hidden');
        }
    }
    
    contactForEvents() {
        // ... (mantida)
        const email = 'eventos@patasfelizes.org';
        const subject = 'Interesse em cadastrar feira de adoção';
        const body = `Olá, tenho interesse em cadastrar eventos de adoção na plataforma Patas Felizes.
        
Minha organização:
[Nome da ONG/Protetor]

Como posso proceder?`;

        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && typeof window.authSystem !== 'undefined') {
            window.eventSystem = new EventSystem();
            console.log('✅ EventSystem inicializado com sucesso!');
        } else {
            console.error("❌ Dependências (Firebase ou AuthSystem) não estão carregadas.");
            if (typeof showNotification !== 'undefined') showNotification('Erro ao carregar o sistema de eventos. Verifique o console.', 'error');
        }
    }, 300);
});
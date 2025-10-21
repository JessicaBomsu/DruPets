// js/events.js - LÓGICA DE EVENTOS (FEIRAS DE ADOÇÃO) COM UPLOAD, EXCLUSÃO E SEPARAÇÃO POR DATA

import { uploadFotoAnimal } from './upload.js';
import { showPawLoader, hidePawLoader, showNotification } from './auth.js';

class EventSystem {
    constructor() {
        this.database = firebase.database();
        this.modal = document.getElementById('event-details-modal');
        this.DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dbsp8poyk/image/upload/v1760904981/animal-sem-foto_l0j74u.jpg';
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
                eventForm.reset();
            }
            this.previewImage(null);
            this.checkUserPermissions();
        }
    }

    // LÓGICA DE SALVAR EVENTO
    async handleEventSubmit(e) {
        e.preventDefault();

        const title = document.getElementById('event-title').value;
        const location = document.getElementById('event-location').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const description = document.getElementById('event-description').value;
        const contact = document.getElementById('event-contact').value;
        const imageFile = document.getElementById('event-image').files[0];

        if (!title || !location || !date || !time || !description || !contact) {
            showNotification('Por favor, preencha todos os campos de texto obrigatórios (*).', 'error');
            return;
        }

        showPawLoader('Salvando Evento...');

        let imageURL = this.DEFAULT_IMAGE_URL;

        try {
            // UPLOAD DA IMAGEM
            if (imageFile) {
                showPawLoader('Fazendo upload da imagem...');
                const uploadedURL = await uploadFotoAnimal(imageFile);
                if (uploadedURL) {
                    imageURL = uploadedURL;
                } else {
                    showNotification('Falha no upload da foto. Usando imagem padrão.', 'warning');
                }
                showPawLoader('Salvando dados...');
            }

            // SALVAR DADOS DO EVENTO
            const currentUser = window.authSystem.getCurrentUser();
            const eventData = {
                title: title,
                location: location,
                date: date,
                time: time,
                description: description,
                contact: contact,
                image: imageURL,
                cadastradorId: currentUser.id,
                cadastradorNome: currentUser.nome || currentUser.email,
                cadastradorTipo: currentUser.tipo || 'user',
                dataCadastro: new Date().toISOString(),
                status: 'ativo'
            };

            await this.database.ref('eventos').push(eventData);

            showNotification('Evento cadastrado com sucesso!', 'success');
            
            document.getElementById('event-form').reset();
            this.previewImage(null);
            this.hideEventForm();
            
            // ATUALIZAR LISTA AUTOMATICAMENTE
            setTimeout(() => {
                 window.location.href = 'feira-adocoes.html';
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            showNotification('Erro ao salvar evento: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    // FUNÇÃO PARA DELETAR EVENTO
    async deleteEvent(eventId) {
        console.log('Tentando excluir evento:', eventId);
        
        if (!eventId) {
            showNotification('ID do evento não encontrado.', 'error');
            return;
        }

        if (!confirm('Tem certeza que deseja EXCLUIR este evento permanentemente? Esta ação não pode ser desfeita.')) {
            return;
        }
        

        showPawLoader('Excluindo evento...');

        try {
            // Verificar se o evento existe
            const snapshot = await this.database.ref(`eventos/${eventId}`).once('value');
            if (!snapshot.exists()) {
                showNotification('Evento não encontrado.', 'error');
                return;
            }

            // Remover do Realtime Database
            await this.database.ref(`eventos/${eventId}`).remove();

            showNotification('Evento excluído com sucesso.', 'success');
            this.closeModal();
            
            // ATUALIZAR LISTA AUTOMATICAMENTE
            setTimeout(() => {
                 window.location.href = 'feira-adocoes.html';
            }, 1000);

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

    clearEventListeners() {
        const detailButtons = document.querySelectorAll('.view-details-btn');
        detailButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
    }

    // CARREGAR EVENTOS
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
        now.setHours(0, 0, 0, 0);

        this.clearEventListeners();

        try {
            const snapshot = await this.database.ref('eventos').once('value');
            const events = snapshot.val();

            let upcomingEvents = [];
            let pastEvents = [];

            if (events) {
                const eventsArray = Object.keys(events).map(key => ({ id: key, ...events[key] }));
                const processEvents = [];

                // Processar eventos ativos
                eventsArray.forEach(event => {
                    if (event.status === 'ativo') {
                        const processPromise = !event.cadastradorTipo && event.cadastradorId ?
                            this.getUserType(event.cadastradorId).then(userType => {
                                event.cadastradorTipo = userType;
                                return event;
                            }) :
                            Promise.resolve(event);

                        processEvents.push(processPromise);
                    }
                });

                const processedEvents = await Promise.all(processEvents);
                
                processedEvents.forEach(event => {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);

                    if (eventDate >= now) {
                        upcomingEvents.push(event);
                    } else {
                        pastEvents.push(event);
                    }
                });

                // Ordenar
                upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Renderizar eventos futuros
                if (upcomingEvents.length > 0) {
                    upcomingEvents.forEach(event => {
                        const eventCard = this.createEventCard(event, event.id, false);
                        upcomingGrid.appendChild(eventCard);
                    });
                } else {
                    noUpcoming.classList.remove('hidden');
                }

                // Renderizar eventos passados
                if (pastEvents.length > 0) {
                    pastEvents.forEach(event => {
                        const eventCard = this.createEventCard(event, event.id, true);
                        pastGrid.appendChild(eventCard);
                    });
                } else {
                    noPast.classList.remove('hidden');
                }
            } else {
                noUpcoming.classList.remove('hidden');
                noPast.classList.remove('hidden');
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
        const descriptionSnippet = event.description ? 
            event.description.substring(0, 150) + (event.description.length > 150 ? '...' : '') : 
            'Nenhuma descrição disponível.';

        const isVerified = event.cadastradorTipo === 'ong' || event.cadastradorTipo === 'admin';
        const statusClass = isVerified ? 'status-verified' : 'status-unverified';
        const statusText = isVerified ? 'Conta Confiável' : 'Evento Não Verificado';
        const statusIcon = isVerified ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';

        const verificationBadge = `
            <span class="publisher-status ${statusClass}" title="${statusText}">
                <i class="${statusIcon}"></i> ${statusText}
            </span>
        `;

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

        // Adicionar event listener
        const viewBtn = card.querySelector('.view-details-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.showEventDetails(id, event, isVerified, statusText);
            });
        }

        return card;
    }

    // MOSTRAR DETALHES DO EVENTO NO MODAL
    showEventDetails(id, eventData, isVerified, statusText) {
        if (!this.modal) return;

        const currentUser = window.authSystem.getCurrentUser();
        const isAdmin = window.authSystem.isAdmin();
        const isEventCreator = currentUser && currentUser.id === eventData.cadastradorId;

        // Preencher conteúdo do modal
        document.getElementById('modal-event-image').src = eventData.image || this.DEFAULT_IMAGE_URL;
        document.getElementById('modal-event-title').textContent = eventData.title;
        document.getElementById('modal-publisher-name').textContent = eventData.cadastradorNome || 'Organizador Desconhecido';

        const fullDate = `${new Date(eventData.date).toLocaleDateString('pt-BR')} às ${eventData.time}`;
        document.getElementById('modal-event-datetime').textContent = fullDate;
        document.getElementById('modal-event-location').textContent = eventData.location;
        document.getElementById('modal-event-description').textContent = eventData.description;
        document.getElementById('modal-event-contact-info').textContent = eventData.contact;

        // Selo de verificação
        const statusElement = document.getElementById('modal-publisher-status');
        const statusClass = isVerified ? 'status-verified' : 'status-unverified';
        const statusIcon = isVerified ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';

        statusElement.innerHTML = `
            <span class="publisher-status ${statusClass}" title="${statusText}">
                <i class="${statusIcon}"></i> ${statusText}
            </span>
        `;

        // CONFIGURAÇÃO DO BOTÃO EXCLUIR
        const deleteBtn = document.getElementById('delete-event-btn');
        
        if (deleteBtn) {
            deleteBtn.classList.add('hidden');
            deleteBtn.onclick = null;
            
            if (isAdmin || isEventCreator) {
                deleteBtn.classList.remove('hidden');
                deleteBtn.onclick = this.deleteEvent.bind(this, id);
            }
        }

        // Configurar botão de contato
        const contactBtn = document.getElementById('contact-publisher-btn');
        if (contactBtn) {
            contactBtn.onclick = () => {
                const contactInfo = eventData.contact;
                if (contactInfo.includes('@')) {
                    window.location.href = `mailto:${contactInfo}?subject=Interesse no evento: ${eventData.title}`;
                } else {
                    alert(`Contato do Organizador: ${contactInfo}`);
                }
            };
        }

        // Configurar botão de compartilhar
        const shareBtn = document.getElementById('share-event-btn');
        if (shareBtn) {
            shareBtn.onclick = () => {
                if (navigator.share) {
                    navigator.share({
                        title: eventData.title,
                        text: `Participe da Feira de Adoção: ${eventData.title}!`,
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiado para a área de transferência!');
                }
            };
        }

        // Abrir modal
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
        const showFormBtn = document.getElementById('show-event-form-btn');
        const contactOngBtn = document.getElementById('contact-ong-btn');
        if (!showFormBtn) return;

        const isLoggedIn = window.authSystem && window.authSystem.isLoggedIn();

        if (isLoggedIn) {
            const isAuthorized = window.authSystem.isAdmin() || window.authSystem.isONG();
            if (isAuthorized) {
                showFormBtn.classList.remove('hidden');
                if (contactOngBtn) contactOngBtn.classList.add('hidden');
            } else {
                showFormBtn.classList.add('hidden');
                if (contactOngBtn) contactOngBtn.classList.remove('hidden');
            }
        } else {
            showFormBtn.classList.add('hidden');
            if (contactOngBtn) contactOngBtn.classList.remove('hidden');
        }
    }

    contactForEvents() {
        const email = 'eventos@patasfelizes.org';
        const subject = 'Interesse em cadastrar feira de adoção';
        const body = `Olá, tenho interesse em cadastrar eventos de adoção na plataforma Patas Felizes.
        
Minha organização:
[Nome da ONG/Protetor]

Como posso proceder?`;

        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
}

// INICIALIZAÇÃO MELHORADA
function initializeEventSystem() {
    if (typeof firebase !== 'undefined' && firebase.app && typeof window.authSystem !== 'undefined') {
        window.eventSystem = new EventSystem();
        console.log('✅ EventSystem inicializado com sucesso!');
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function () {
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryInitialize = () => {
        if (initializeEventSystem()) {
            return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
            setTimeout(tryInitialize, 500);
        } else {
            console.error("❌ Não foi possível inicializar o EventSystem");
        }
    };
    
    tryInitialize();
});

// Tentar inicializar quando auth estiver pronto
if (typeof window !== 'undefined') {
    window.addEventListener('authReady', function() {
        if (!window.eventSystem) {
            setTimeout(initializeEventSystem, 100);
        }
    });
}
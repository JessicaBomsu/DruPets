import { uploadFotoAnimal } from './upload.js';

class AnimalSystem {
    constructor() {
        this.currentTab = 'adocao';
        this.allAnimals = [];
        this.modalHandlers = null;
        this.init();
    }

    setupImagePreview() {
        const fileInputs = document.querySelectorAll('.file-input');

        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const inputId = e.target.id;

                // 1. Determina o nome da aba ativa (adocao, perdido, encontrado)
                let tabName = null;
                if (inputId === 'pet-image') {
                    tabName = 'adocao';
                } else if (inputId === 'lost-pet-image') {
                    tabName = 'perdido';
                } else if (inputId === 'found-pet-image') {
                    tabName = 'encontrado';
                }

                // 2. Constrói o ID do container de preview (ex: image-preview-perdido)
                const previewId = `image-preview-${tabName}`;
                const previewContainer = document.getElementById(previewId);

                if (file && previewContainer) {
                    // Remove previews antigas
                    previewContainer.innerHTML = '';

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.className = 'preview-img';
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    init() {
        console.log('🐾 AnimalSystem iniciado');
        this.setupEventListeners();

        if (window.location.pathname.includes('cadastraranimais.html')) {
            this.setupAnimalForm();
            setTimeout(() => this.fixRequiredFields(), 100);
        }

        if (window.location.pathname.includes('animais-para-adocao.html') ||
            window.location.pathname.includes('meuperfil.html')) {
            this.loadAllAnimalData();
        }
    }

    setupEventListeners() {
        // Filtros de espécie
        this.setupImagePreview();

        const speciesSelect = document.getElementById('pet-species');
        if (speciesSelect) {
            speciesSelect.addEventListener('change', (e) => {
                this.toggleOtherSpeciesField(e.target.value);
            });
        }

        // Tabs do formulário
        const formTabs = document.querySelectorAll('.form-tabs:not(.display-tabs) .tab-btn');
        formTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchAnimalTab(tabName);
            });
        });

        // Tabs de visualização
        const displayTabs = document.querySelectorAll('.form-tabs.display-tabs .tab-btn');
        displayTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.filter;
                this.switchDisplayTab(tabName);
            });
        });

        // Filtros
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.renderAnimals(this.currentTab));
        }

        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                document.getElementById('filter-species').value = '';
                document.getElementById('filter-size').value = '';
                document.getElementById('filter-age').value = '';
                document.getElementById('filter-gender').value = '';
                document.getElementById('filter-location').value = '';
                this.renderAnimals(this.currentTab);
            });
        }
    }

    toggleOtherSpeciesField(species) {
        const otherSpeciesGroup = document.getElementById('other-species-group');
        const otherSpeciesInput = document.getElementById('other-species');
        
        if (otherSpeciesGroup && otherSpeciesInput) {
            otherSpeciesGroup.style.display = species === 'outro' ? 'block' : 'none';
            
            // Se selecionou "outro", torna o campo obrigatório
            if (species === 'outro') {
                otherSpeciesInput.setAttribute('required', 'required');
            } else {
                otherSpeciesInput.removeAttribute('required');
                otherSpeciesInput.value = '';
            }
        }
    }

    switchAnimalTab(tabName) {
        document.querySelectorAll('.form-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.fixRequiredFields();
    }

    fixRequiredFields() {
        const allFields = document.querySelectorAll('input, select, textarea');
        allFields.forEach(field => {
            field.removeAttribute('required');
        });

        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const fields = activeTab.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                if (!field.id.includes('social') &&
                    !field.id.includes('image') &&
                    field.type !== 'file' &&
                    field.id !== 'other-species' &&
                    !field.placeholder?.includes('Opcional')) {
                    field.setAttribute('required', 'true');
                }
            });
            
            // Verifica se "outro" está selecionado para tornar o campo obrigatório
            const speciesSelect = activeTab.querySelector('[id$="-species"]');
            if (speciesSelect && speciesSelect.value === 'outro') {
                const otherSpeciesInput = activeTab.querySelector('[id$="-other-species"], #other-species');
                if (otherSpeciesInput) {
                    otherSpeciesInput.setAttribute('required', 'required');
                }
            }
        }
    }

    // LÓGICA DE CADASTRO
    setupAnimalForm() {
        const form = document.getElementById('animal-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAnimalSubmit(e);
                });
            }
        }
    }

    async handleAnimalSubmit(event) {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            showNotification('Você precisa estar logado para cadastrar um animal.', 'error');
            return;
        }

        const user = window.authSystem.getCurrentUser();
        const activeTabElement = document.querySelector('.form-tabs .tab-btn.active');
        if (!activeTabElement) {
            showNotification('Selecione uma aba válida.', 'error');
            return;
        }

        const activeTab = activeTabElement.dataset.tab;
        const formData = this.collectFormData(activeTab);

        if (!this.validateForm(formData, activeTab)) {
            return;
        }

        showPawLoader("Salvando animal...");

        // ----------------------------------------------------------------
        // 1. LÓGICA DE UPLOAD DO CLOUDINARY
        // ----------------------------------------------------------------
        let fotoURL = "";

        // Verifica se há um arquivo para upload
        if (formData.imageFile) {
            showPawLoader("Enviando foto...");
            const uploadedURL = await uploadFotoAnimal(formData.imageFile);

            if (!uploadedURL) {
                // O upload falhou (erro de rede, preset, etc.)
                hidePawLoader();
                showNotification('Falha no upload da foto. Cadastro cancelado.', 'error');
                return;
            }
            fotoURL = uploadedURL;
        }
        // Se não houver arquivo, fotoURL permanece uma string vazia ("")

        showPawLoader("Salvando animal...");
        // ----------------------------------------------------------------
        // 2. SALVAR DADOS NO FIREBASE
        // ----------------------------------------------------------------

        try {
            const animalId = 'animal_' + Date.now();
            let animalData = {};

            if (activeTab === 'adocao') {
                // CORREÇÃO: Se a espécie for "outro", usa o valor do campo "outra_especie"
                let especieValue = formData.especie;
                if (formData.especie === 'outro' && formData.outra_especie) {
                    especieValue = formData.outra_especie;
                }
                
                animalData = {
                    descricao: formData.descricao,
                    especie: formData.especie, // Mantém o valor original para filtros
                    especie_exibicao: especieValue, // NOVO: Campo para exibição
                    id: animalId,
                    idade: formData.idade,
                    imagen: fotoURL,
                    informacao_de_contato: formData.informacao_de_contato,
                    nome: formData.nome,
                    porte: formData.porte,
                    sexo: formData.sexo,
                    localizacao: formData.localizacao,
                    tipo_cadastro: 'adocao',
                    vacinado: formData.vacinado || 'nao-sei',
                    contato_social: formData.contato_social || '',
                    ownerId: user.id,
                    ownerName: user.nome,
                    data_cadastro: new Date().toISOString(),
                    timestamp: Date.now(),
                    status: 'disponivel'
                };

                if (formData.outra_especie) {
                    animalData.outra_especie = formData.outra_especie;
                }

            } else if (activeTab === 'perdido') {
                // CORREÇÃO: Se a espécie for "outro", usa o valor do campo "outra_especie"
                let especieValue = formData.especie;
                if (formData.especie === 'outro' && formData.outra_especie) {
                    especieValue = formData.outra_especie;
                }
                
                animalData = {
                    data_desaparecimento: formData.data_desaparecimento,
                    especie: formData.especie, // Mantém o valor original para filtros
                    especie_exibicao: especieValue, // NOVO: Campo para exibição
                    foto_animal: fotoURL,
                    nome_do_animal: formData.nome,
                    ultimo_local_visto: formData.ultimo_local_visto,
                    id: animalId,
                    tipo_cadastro: 'perdido',
                    informacao_de_contato: formData.informacao_de_contato,
                    contato_social: formData.contato_social || '',
                    ownerId: user.id,
                    ownerName: user.nome,
                    data_cadastro: new Date().toISOString(),
                    timestamp: Date.now(),
                    status: 'perdido'
                };

            } else if (activeTab === 'encontrado') {
                animalData = {
                    data_encontrado: formData.data_encontrado,
                    foto_animal: fotoURL,
                    local_achado: formData.local_achado,
                    nome: formData.nome,
                    id: animalId,
                    tipo_cadastro: 'encontrado',
                    informacao_de_contato: formData.informacao_de_contato,
                    contato_social: formData.contato_social || '',
                    ownerId: user.id,
                    ownerName: user.nome,
                    data_cadastro: new Date().toISOString(),
                    timestamp: Date.now(),
                    status: 'encontrado'
                };
            }

            await firebase.database().ref('cadastro_animais/' + animalId).set(animalData);

            function showNotification(message, type = 'info', duration = 4000) {
                // 1. Encontrar ou Criar o Container Principal (necessário para o CSS)
                let container = document.getElementById('notification-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'notification-container';
                    // Adiciona o container ao corpo do documento
                    document.body.appendChild(container);
                }

                // 2. Criar o Elemento de Notificação
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;

                // Definir ícone baseado no tipo
                let iconClass = 'fas fa-info-circle';
                if (type === 'success') {
                    iconClass = 'fas fa-check-circle';
                } else if (type === 'error') {
                    iconClass = 'fas fa-times-circle';
                } else if (type === 'warning') {
                    iconClass = 'fas fa-exclamation-triangle';
                }

                // 3. Adicionar o conteúdo
                notification.innerHTML = `<i class="${iconClass}"></i> <p>${message}</p>`;

                // 4. Exibir e Agendar Remoção
                container.appendChild(notification);

                // Forçar um pequeno delay para a transição CSS (move a notificação para dentro da tela)
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);

                // Remover a notificação após o tempo definido
                setTimeout(() => {
                    notification.classList.remove('show');
                    // Remover do DOM após a transição CSS
                    notification.addEventListener('transitionend', () => {
                        notification.remove();
                    }, { once: true });
                }, duration);
            }

            // O restante do seu auth.js (AuthSystem class, event listener, etc.) segue abaixo...

            showNotification('Animal cadastrado com sucesso!', 'success');

            document.getElementById('animal-form').reset();

            // 1. Identifica o ID do container de preview com base na aba ativa
            let previewToClearId = null;
            if (activeTab === 'adocao') {
                previewToClearId = 'image-preview-adocao';
            } else if (activeTab === 'perdido') {
                previewToClearId = 'image-preview-perdido';
            } else if (activeTab === 'encontrado') {
                previewToClearId = 'image-preview-encontrado';
            }

            // 2. Tenta limpar APENAS se o ID for encontrado
            if (previewToClearId) {
                const previewElement = document.getElementById(previewToClearId);
                if (previewElement) {
                    previewElement.innerHTML = '';
                }
            }

            setTimeout(() => {
                window.location.href = 'meuperfil.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            showNotification('Erro ao cadastrar animal: ' + error.message, 'error');
        } finally {
            hidePawLoader();
        }
    }

    collectFormData(tabType) {
        let data = {};
        let imageInputId = null;

        if (tabType === 'adocao') {
            imageInputId = 'pet-image';
            data = {
                nome: this.getValue('pet-name'),
                especie: this.getValue('pet-species'),
                idade: parseInt(this.getValue('pet-age')) || 0,
                porte: this.getValue('pet-size'),
                sexo: this.getValue('pet-gender'),
                descricao: this.getValue('pet-description'),
                informacao_de_contato: this.getValue('contact-info-adocao'),
                localizacao: this.getValue('pet-location'),
                vacinado: this.getValue('pet-vaccinated'),
                contato_social: this.getValue('social-contact-adocao'),
                outra_especie: this.getValue('other-species')
            };

        } else if (tabType === 'perdido') {
            imageInputId = 'lost-pet-image';
            data = {
                nome: this.getValue('lost-pet-name'),
                especie: this.getValue('lost-pet-species'),
                data_desaparecimento: this.getValue('lost-date'),
                ultimo_local_visto: this.getValue('lost-location'),
                informacao_de_contato: this.getValue('contact-info-perdido'),
                contato_social: this.getValue('social-contact-perdido'),
                outra_especie: this.getValue('lost-other-species') // CORREÇÃO: Adicionado campo para animais perdidos
            };

        } else if (tabType === 'encontrado') {
            imageInputId = 'found-pet-image';
            data = {
                nome: this.getValue('found-pet-name'),
                data_encontrado: this.getValue('found-date'),
                local_achado: this.getValue('found-location'),
                informacao_de_contato: this.getValue('contact-info-encontrado'),
                contato_social: this.getValue('social-contact-encontrado')
            };
        }

        if (imageInputId) {
            const imageInput = document.getElementById(imageInputId);

            // Adiciona o objeto File ao objeto de dados (data)
            data.imageFile = (imageInput && imageInput.files.length > 0) ? imageInput.files[0] : null;
        } else {
            data.imageFile = null;
        }

        return data;
    }

    getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    validateForm(data, tabType) {
        if (tabType === 'adocao') {
            const required = ['nome', 'especie', 'idade', 'porte', 'sexo', 'descricao', 'informacao_de_contato', 'localizacao'];
            for (let field of required) {
                if (!data[field]) {
                    showNotification(`Preencha o campo: ${field}`, 'error');
                    return false;
                }
            }
            if (data.especie === 'outro' && !data.outra_especie) {
                showNotification('Especifique a espécie do animal.', 'error');
                return false;
            }

        } else if (tabType === 'perdido') {
            const required = ['nome', 'especie', 'data_desaparecimento', 'ultimo_local_visto', 'informacao_de_contato'];
            for (let field of required) {
                if (!data[field]) {
                    showNotification(`Preencha o campo obrigatório do animal perdido.`, 'error');
                    return false;
                }
            }
            if (data.especie === 'outro' && !data.outra_especie) {
                showNotification('Especifique a espécie do animal.', 'error');
                return false;
            }

        } else if (tabType === 'encontrado') {
            const required = ['data_encontrado', 'local_achado', 'informacao_de_contato'];
            for (let field of required) {
                if (!data[field]) {
                    showNotification(`Preencha o campo obrigatório do animal encontrado.`, 'error');
                    return false;
                }
            }
        }

        return true;
    }

    // LÓGICA DE VISUALIZAÇÃO
    switchDisplayTab(tabType) {
        if (this.currentTab === tabType) return;

        this.currentTab = tabType;

        document.querySelectorAll('.form-tabs.display-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${tabType}"]`).classList.add('active');

        const adoptionFilters = document.getElementById('adoption-filters');
        if (adoptionFilters) {
            adoptionFilters.style.display = tabType === 'adocao' ? 'block' : 'none';
        }

        this.renderAnimals(tabType);
    }

    async loadAllAnimalData() {
        showPawLoader("Carregando animais...");
        const petsGrid = document.getElementById('pets-grid');
        if (petsGrid) petsGrid.innerHTML = '';
        const noResults = document.getElementById('no-results');
        if (noResults) noResults.classList.add('hidden');

        try {
            const snapshot = await firebase.database().ref('cadastro_animais').once('value');

            this.allAnimals = [];
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    this.allAnimals.push(childSnapshot.val());
                });
            }

            this.renderAnimals(this.currentTab);

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            showNotification('Erro ao carregar animais.', 'error');
        } finally {
            hidePawLoader();
        }
    }

    renderAnimals(tabType) {
        const petsGrid = document.getElementById('pets-grid');
        const noResults = document.getElementById('no-results');

        if (!petsGrid) {
            console.error('Elemento pets-grid não encontrado!');
            return;
        }

        petsGrid.innerHTML = '';
        if (noResults) noResults.classList.add('hidden');

        let filteredAnimals = this.allAnimals.filter(animal =>
            animal.tipo_cadastro === tabType
        );

        if (tabType === 'adocao') {
            filteredAnimals = this.applyAdoptionFilters(filteredAnimals);
        }

        if (filteredAnimals.length === 0) {
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        filteredAnimals.forEach(animal => {
            const card = this.createAnimalCard(animal, tabType);
            petsGrid.appendChild(card);
        });
    }

    applyAdoptionFilters(animals) {
        const species = this.getValue('filter-species');
        const size = this.getValue('filter-size');
        const age = this.getValue('filter-age');
        const gender = this.getValue('filter-gender');
        const location = this.getValue('filter-location').toLowerCase().trim();

        return animals.filter(animal => {
            let passes = true;

            // CORREÇÃO: Para o filtro de espécie, considera tanto o valor original quanto o de exibição
            if (species && animal.especie !== species) {
                // Se o filtro for "outro", verifica se a espécie original é "outro"
                if (species !== 'outro' || animal.especie !== 'outro') {
                    passes = false;
                }
            }
            
            if (size && animal.porte !== size) passes = false;
            if (gender && animal.sexo !== gender) passes = false;

            if (location && (!animal.localizacao || !animal.localizacao.toLowerCase().includes(location))) passes = false;

            if (age && animal.idade !== undefined) {
                const ageNum = parseInt(animal.idade);
                let agePasses = false;
                if (age === 'filhote' && ageNum >= 0 && ageNum <= 1) agePasses = true;
                else if (age === 'adulto' && ageNum > 1 && ageNum <= 7) agePasses = true;
                else if (age === 'idoso' && ageNum > 7) agePasses = true;

                if (!agePasses) passes = false;
            }

            return passes;
        });
    }

    createAnimalCard(animal, tabType) {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.dataset.id = animal.id;

        let subtitle = '';
        let icon = '';
        let status = '';

        if (tabType === 'adocao') {
            // CORREÇÃO: Usa o campo de exibição da espécie se existir
            const especieExibicao = animal.especie_exibicao || this.formatSpecies(animal.especie);
            subtitle = `${especieExibicao} | ${animal.porte} | ${animal.idade} anos`;
            icon = '<i class="fas fa-home"></i>';
            status = `<span class="status available">Adotar</span>`;
        } else if (tabType === 'perdido') {
            // CORREÇÃO: Usa o campo de exibição da espécie se existir
            const especieExibicao = animal.especie_exibicao || this.formatSpecies(animal.especie);
            subtitle = `${especieExibicao} | Desapareceu em: ${animal.data_desaparecimento}`;
            icon = '<i class="fas fa-search"></i>';
            status = `<span class="status lost">Perdido</span>`;
        } else if (tabType === 'encontrado') {
            subtitle = `Encontrado em: ${animal.data_encontrado}`;
            icon = '<i class="fas fa-paw"></i>';
            status = `<span class="status found">Encontrado</span>`;
        }

        const animalName = animal.nome || animal.nome_do_animal || 'Animal sem nome';
        const locationText = animal.localizacao || animal.ultimo_local_visto || animal.local_achado || 'Local não informado';

        card.innerHTML = `
            <div class="pet-image">
                <img src="${animal.imagen || animal.foto_animal || 'images/default-pet.png'}" alt="${animalName}" onerror="this.src='images/default-pet.png'">
                ${status}
            </div>
            <div class="pet-info">
                <h3>${icon} ${animalName}</h3>
                <p class="subtitle">${subtitle}</p>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${locationText}</p>
                <button class="btn btn-small view-details">Ver Detalhes</button>
            </div>
        `;

        // CORREÇÃO: Event listener para o botão "Ver Detalhes"
        const viewDetailsBtn = card.querySelector('.view-details');
        viewDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clicou em Ver Detalhes:', animal);
            this.showAnimalModal(animal, tabType);
        });

        return card;
    }

    showAnimalModal(animal, tabType) {
        const modal = document.getElementById('animal-modal');
        if (!modal) {
            console.error('Modal não encontrado!');
            return;
        }

        console.log('Abrindo modal para:', animal);

        // Limpa event listeners anteriores
        this.cleanupModalHandlers();

        // Status do animal
        let statusText = '';
        switch (tabType) {
            case 'adocao':
                statusText = '🔄 PARA ADOÇÃO';
                break;
            case 'perdido':
                statusText = '🔍 PERDIDO';
                break;
            case 'encontrado':
                statusText = '🎉 ENCONTRADO';
                break;
        }

        // Preenche os dados do animal
        const animalName = animal.nome || animal.nome_do_animal || 'Animal sem nome';

        // Atualiza o nome
        const nameElement = document.getElementById('modal-animal-name');
        if (nameElement) {
            nameElement.textContent = animalName;
        }

        // Atualiza badge de status
        let statusBadge = modal.querySelector('.animal-status-badge');
        if (statusBadge) {
            statusBadge.remove();
        }
        statusBadge = document.createElement('div');
        statusBadge.className = 'animal-status-badge';
        statusBadge.textContent = statusText;
        modal.querySelector('.modal-header').appendChild(statusBadge);

        // CORREÇÃO: Preenche a espécie corretamente
        const speciesElement = document.getElementById('modal-animal-species');
        if (speciesElement) {
            // Usa o campo de exibição da espécie se existir, senão formata a espécie original
            const especieExibicao = animal.especie_exibicao || this.formatSpecies(animal.especie);
            speciesElement.textContent = especieExibicao || 'Não informado';
        }
        
        document.getElementById('modal-animal-age').textContent = animal.idade ? `${animal.idade} anos` : 'Não informada';
        document.getElementById('modal-animal-size').textContent = this.formatSize(animal.porte) || 'Não informado';
        document.getElementById('modal-animal-gender').textContent = this.formatGender(animal.sexo) || 'Não informado';
        document.getElementById('modal-animal-location').textContent = this.getLocation(animal, tabType);
        document.getElementById('modal-animal-description').textContent = animal.descricao || 'Nenhuma descrição disponível.';
        document.getElementById('modal-animal-contact').textContent = animal.informacao_de_contato || 'Contato não informado';

        // CORREÇÃO: Configura o botão do Instagram
        const socialContact = animal.contato_social;
        const instagramBtn = document.getElementById('instagram-contact');
        
        if (instagramBtn) {
            if (socialContact) {
                instagramBtn.href = socialContact;
                instagramBtn.style.display = 'inline-flex';
            } else {
                instagramBtn.style.display = 'none';
            }
        }

        // Imagem do animal
        const animalImage = document.getElementById('modal-animal-image');
        if (animalImage) {
            const imageSrc = animal.imagen || animal.foto_animal || 'images/default-pet.png';
            animalImage.src = imageSrc;
            animalImage.alt = animalName;
            animalImage.onerror = function () {
                this.src = 'images/default-pet.png';
            };
        }

        // Configura botões de contato
        this.setupContactButtons(animal.informacao_de_contato);

        // Mostra o modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Configura eventos do modal
        this.setupModalEvents(modal);
    }

    // CORREÇÃO: Adiciona método para formatar a espécie
    formatSpecies(species) {
        const speciesMap = {
            'cachorro': 'Cachorro',
            'gato': 'Gato',
            'outro': 'Outro'
        };
        return speciesMap[species] || species || 'Não informado';
    }

    getLocation(animal, tabType) {
        switch (tabType) {
            case 'adocao':
                return animal.localizacao || 'Local não informado';
            case 'perdido':
                return animal.ultimo_local_visto || 'Local não informado';
            case 'encontrado':
                return animal.local_achado || 'Local não informado';
            default:
                return 'Local não informado';
        }
    }

    formatSize(size) {
        const sizes = {
            'pequeno': 'Pequeno',
            'medio': 'Médio',
            'grande': 'Grande'
        };
        return sizes[size] || size;
    }

    formatGender(gender) {
        const genders = {
            'macho': 'Macho',
            'femea': 'Fêmea'
        };
        return genders[gender] || gender;
    }

    setupContactButtons(contactInfo) {
        const whatsappBtn = document.getElementById('whatsapp-contact');
        const contactBtn = document.getElementById('contact-adopter');
        const instagramBtn = document.getElementById('instagram-contact'); // CORREÇÃO: Adicionado
        
        if (!contactBtn || !whatsappBtn) {
            console.error('Botões de contato não encontrados!');
            return;
        }

        // Remove event listeners antigos clonando os botões
        const newContactBtn = contactBtn.cloneNode(true);
        const newWhatsappBtn = whatsappBtn.cloneNode(true);
        const newInstagramBtn = instagramBtn ? instagramBtn.cloneNode(true) : null; // CORREÇÃO: Adicionado
        
        contactBtn.parentNode.replaceChild(newContactBtn, contactBtn);
        whatsappBtn.parentNode.replaceChild(newWhatsappBtn, whatsappBtn);
        if (newInstagramBtn && instagramBtn) { // CORREÇÃO: Adicionado
            instagramBtn.parentNode.replaceChild(newInstagramBtn, instagramBtn);
        }

        // Configura o botão de contato principal
        if (contactInfo && contactInfo.includes('@')) {
            newContactBtn.innerHTML = '<i class="fas fa-envelope"></i> Enviar Email';
            newContactBtn.onclick = () => {
                window.location.href = `mailto:${contactInfo}?subject=Interesse no animal - DruPets`;
            };
        } else if (contactInfo && /^[\d\s\(\)\-\+]+$/.test(contactInfo.replace(/\s/g, ''))) {
            newContactBtn.innerHTML = '<i class="fas fa-phone"></i> Ligar Agora';
            newContactBtn.onclick = () => {
                window.location.href = `tel:${contactInfo}`;
            };
        } else {
            newContactBtn.innerHTML = '<i class="fas fa-comment"></i> Entrar em Contato';
            newContactBtn.onclick = () => {
                showNotification(`📞 Contato: ${contactInfo}`, 'info');
            };
        }

        // Configura o botão do WhatsApp
        if (contactInfo && /^[\d\s\(\)\-\+]+$/.test(contactInfo.replace(/\s/g, ''))) {
            const phoneNumber = contactInfo.replace(/\D/g, '');
            const message = `Olá! Tenho interesse no animal que vi no DruPets. Poderia me dar mais informações?`;
            newWhatsappBtn.onclick = () => {
                window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
            };
            newWhatsappBtn.style.display = 'inline-block';
        } else {
            newWhatsappBtn.style.display = 'none';
        }
    }

    setupModalEvents(modal) {
        const closeModalHandler = () => this.closeModal();
        const outsideClickHandler = (event) => {
            if (event.target === modal) this.closeModal();
        };
        const escapeKeyHandler = (e) => {
            if (e.key === 'Escape') this.closeModal();
        };

        modal.querySelector('.close-modal').onclick = closeModalHandler;
        modal.onclick = outsideClickHandler;
        document.addEventListener('keydown', escapeKeyHandler);

        this.modalHandlers = {
            closeModalHandler,
            outsideClickHandler,
            escapeKeyHandler
        };
    }

    cleanupModalHandlers() {
        if (this.modalHandlers) {
            document.removeEventListener('keydown', this.modalHandlers.escapeKeyHandler);
            this.modalHandlers = null;
        }
    }

    closeModal() {
        const modal = document.getElementById('animal-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.cleanupModalHandlers();
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        if (typeof firebase !== 'undefined') {
            window.animalSystem = new AnimalSystem();
            console.log('✅ AnimalSystem inicializado com sucesso!');
        } else {
            console.error("❌ Firebase não está carregado.");
        }
    }, 100);
});
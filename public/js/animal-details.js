import { database } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Obter o ID do animal da URL
    const urlParams = new URLSearchParams(window.location.search);
    const animalId = urlParams.get('id');
    const isAdmin = urlParams.get('admin') === 'true';

    // Botão voltar
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            if (isAdmin) {
                window.close(); // Fecha a janela se for admin
            } else {
                window.history.back(); // Volta para a página anterior se não for admin
            }
        });
    }

    // Carregar detalhes do animal
    if (animalId) {
        loadAnimalDetails(animalId, isAdmin);
    } else {
        document.getElementById('animal-details').innerHTML = '<p>ID do animal não fornecido.</p>';
    }
});

async function loadAnimalDetails(animalId, isAdmin) {
    try {
        const snapshot = await database.ref(`cadastro_animais/${animalId}`).once('value');
        const animal = snapshot.val();

        if (!animal) {
            document.getElementById('animal-details').innerHTML = '<p>Animal não encontrado.</p>';
            return;
        }

        // Obter informações do responsável pelo cadastro
        const userSnapshot = await database.ref(`cadastro_conta/${animal.usuario_id}`).once('value');
        const user = userSnapshot.val();

        // Formatar dados do animal
        const speciesText = animal.especie === 'cachorro' ? 'Cachorro' :
            animal.especie === 'gato' ? 'Gato' : animal.outra_especie || 'Outro';

        const statusClass = animal.status === 'adotado' ? 'badge-inactive' :
            animal.status === 'suspenso' ? 'badge-suspended' : 'badge-active';

        const statusText = animal.status === 'adotado' ? 'Adotado' :
            animal.status === 'suspenso' ? 'Suspenso' : 'Disponível';

        // Construir HTML dos detalhes
        const detailsHTML = `
            <div class="animal-detail-card">
                <div class="animal-header">
                    <h2>${animal.nome || 'Sem nome'}</h2>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="animal-image">
                    ${animal.imagem ? `<img src="${animal.imagem}" alt="${animal.nome}">` : '<div class="no-image">Sem imagem</div>'}
                </div>
                
                <div class="animal-info">
                    <div class="info-group">
                        <h3>Informações Básicas</h3>
                        <p><strong>Espécie:</strong> ${speciesText}</p>
                        <p><strong>Idade:</strong> ${animal.idade || 'N/A'} anos</p>
                        <p><strong>Porte:</strong> ${animal.porte || 'N/A'}</p>
                        <p><strong>Sexo:</strong> ${animal.sexo || 'N/A'}</p>
                    </div>
                    
                    <div class="info-group">
                        <h3>Descrição</h3>
                        <p>${animal.descricao || 'Nenhuma descrição fornecida.'}</p>
                    </div>
                    
                    <div class="info-group">
                        <h3>Informações de Contato</h3>
                        <p><strong>Cadastrado por:</strong> ${user ? user.nome : 'N/A'}</p>
                        <p><strong>Email:</strong> ${user ? user.email : 'N/A'}</p>
                        <p><strong>Telefone:</strong> ${animal.telefone || 'N/A'}</p>
                        <p><strong>Localização:</strong> ${animal.localizacao || 'N/A'}</p>
                    </div>
                    
                    <div class="info-group">
                        <h3>Informações de Cadastro</h3>
                        <p><strong>Data de Cadastro:</strong> ${animal.data_cadastro ? new Date(animal.data_cadastro).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        <p><strong>Tipo de Cadastro:</strong> ${animal.tipo_cadastro === 'adocao' ? 'Para adoção' : animal.tipo_cadastro || 'N/A'}</p>
                    </div>
                </div>
                
                ${isAdmin ? `
                <div class="admin-actions">
                    <button class="btn btn-primary" onclick="window.open('https://wa.me/${animal.telefone}', '_blank')">
                        <i class="fab fa-whatsapp"></i> Entrar em Contato
                    </button>
                </div>
                ` : `
                <div class="user-actions">
                    <button class="btn btn-primary" onclick="window.open('https://wa.me/${animal.telefone}', '_blank')">
                        <i class="fab fa-whatsapp"></i> Entrar em Contato
                    </button>
                </div>
                `}
            </div>
        `;

        document.getElementById('animal-details').innerHTML = detailsHTML;

    } catch (error) {
        console.error("Erro ao carregar detalhes do animal:", error);
        document.getElementById('animal-details').innerHTML = '<p>Erro ao carregar detalhes do animal.</p>';
    }
}
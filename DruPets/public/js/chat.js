// js/chat.js - VERSÃO COMPLETA E ATUALIZADA (Incluindo Lei de Denúncia)

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
        const suggestions = document.getElementById('chatSuggestions'); 
        
        if (suggestions) {
            // Se houver botões de sugestão, exibe o container
            suggestions.style.display = 'flex'; 
        }

        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                if (chatInput) {
                    chatInput.value = question;
                    this.sendMessage();
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
        }
    }

    closeChat() {
        const chatPopup = document.getElementById('chatPopup');
        if (chatPopup) {
            this.isOpen = false;
            chatPopup.classList.remove('active');
        }
    }

    startAutoCleanup() {
        // Limpar histórico a cada 24 horas (exemplo)
        const ONE_DAY = 24 * 60 * 60 * 1000;
        setInterval(() => {
            this.clearChatHistory();
        }, ONE_DAY);
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const userMessage = chatInput ? chatInput.value.trim() : '';

        if (userMessage === '') return;

        // 1. Adiciona mensagem do usuário
        this.addMessage('user', userMessage);
        chatInput.value = '';

        // 2. Obtém e Adiciona resposta do bot
        const botResponseText = this.getBotResponse(userMessage);
        
        // Simula um pequeno delay para a resposta do bot (melhora a experiência)
        setTimeout(() => {
            this.addMessage('bot', botResponseText);
        }, 500);
    }
    
    // =======================================================================
    // MÉTODO PRINCIPAL DE RESPOSTA (Contém todas as suas informações)
    // =======================================================================
    getBotResponse(userMessage) {
        const msg = userMessage.toLowerCase().trim();

        // -----------------------------------------------------
        // 1. INFORMAÇÕES SOBRE DENÚNCIAS E LEIS (NOVO)
        // -----------------------------------------------------

        if (msg.includes('denuncia') || msg.includes('maus-tratos') || msg.includes('lei sansão') || msg.includes('crime')|| msg.includes('agressão aos animais')|| msg.includes('agressão')) {
            return `**🚨 COMO DENUNCIAR MAUS-TRATOS:**
Denúncias graves de abuso, maus-tratos, ferimento ou mutilação de animais devem ser feitas às autoridades competentes.

1.  **Canais Locais (São Paulo):** Para serviços municipais (adoção, remoção de animal morto, castração), utilize o **Portal SP156**.
    * **Link:** https://sp156.prefeitura.sp.gov.br/portal/servicos
2.  **Lei Federal:** O crime é amparado pelo **Art. 32 da Lei nº 9.605** (Lei de Crimes Ambientais).
    * **Lei Sansão (Lei nº 14.064/2020):** A pena para maus-tratos a **cães e gatos** é de **reclusão de 2 a 5 anos**, multa e proibição de guarda do animal.

O DruPets atua apenas como intermediário na listagem e conscientização, mas você deve buscar as autoridades para a ação legal.`;
        }

        // -----------------------------------------------------
        // 2. INFORMAÇÕES SOBRE O PROJETO (DruPets / Pex)
        // -----------------------------------------------------

        if (msg.includes('o que é') || msg.includes('drupets') || msg.includes('objetivo')) {
            return `O **DruPets**  é uma plataforma web que atua como **intermediária**. Foi criada para centralizar informações e facilitar o acesso a serviços essenciais para a proteção animal: **adoção responsável**, **listagem de ONGs** e **registro de denúncias**. Queremos potencializar o alcance das ONGs e simplificar o processo de ajuda para o cidadão.`;
        }

        if (msg.includes('quem somos') || msg.includes('equipe')|| msg.includes('quem são vcs?') || msg.includes('quem são voçês?')) {
            return `Somos a equipe **"DRUMMONETES & AGREGADO"**, um grupo de estudantes de Ciência da Computação e Sistemas de Informação. A equipe é composta por: Adrielly Rodrigues dos Santos, Barbara Coelho, Felipe Rodrigues Guimarães Geraldino, Jaciendy Nunes Teixeira, Jessica Emely Bomsucesso e Victoria Fernanda.`;
        }

        if (msg.includes('tecnologia') || msg.includes('utilizadas') || msg.includes('linguagens')|| msg.includes('quais tecnologia vcs usaram?')|| msg.includes('limguagem usada')) {
            return `As tecnologias utilizadas no desenvolvimento da plataforma são:
- **Frontend:** HTML, CSS e JavaScript
- **Backend/Banco de Dados:** Firebase
- **Integrações:** APIs (Google Maps e Listagem de ONGs)
- **Futuro (IA):** Python com foco em IA e Bibliotecas de reconhecimento de imagem.`;
        }

        // -----------------------------------------------------
        // 3. --- NOVO BLOCO: CONFIABILIDADE E SEGURANÇA ---
        // -----------------------------------------------------

        
        if (msg.includes('confiavel') || msg.includes('segurança') || msg.includes('confiança') || msg.includes('verificado') || msg.includes('cuidado') || msg.includes('ongs')) {
            return `**🔒 Segurança e Confiança no DruPets:**

        O **DruPets** é uma plataforma **intermediária** criada para facilitar a conexão entre ONGs/Protetores e Cidadãos.

        **1. Nosso Compromisso (Plataforma):**
        * Tratamos seus dados com segurança, conforme a **LGPD**.
        * Nosso objetivo é fornecer um espaço ético para a proteção animal.

        **2. A Responsabilidade do Usuário (Seu Cuidado):**
        * **Verificação de ONGs:** Embora listemos organizações, **sempre verifique** a idoneidade da ONG ou Protetor Independente através de canais externos (redes sociais, CNPJ, referências).
        * **Animais Cadastrados:** As informações e fotos dos animais são de responsabilidade de quem as cadastra. **Sempre marque encontros em locais públicos** e faça o acompanhamento do animal antes e depois da adoção.
        * **Transparência:** Se desconfiar de algo, **denuncie** a ocorrência às autoridades (veja a opção sobre Denúncias).

        A sua cautela é a melhor ferramenta para garantir uma adoção segura e responsável!`;
        }

        // -----------------------------------------------------
        // 4. DICAS DE CUIDADO, BRINQUEDOS E SAÚDE
        // -----------------------------------------------------

        if (msg.includes('brinquedo') && (msg.includes('cão') || msg.includes('cachorro'))|| msg.includes('brinquedos cachorros')) {
            return `**Dicas de Brinquedos para Cães:**
- **Roedores:** Brinquedos robustos de borracha (como Kong) recheados. Auxilia na saúde mental e dental.
- **Puxadores:** Cordas de nylon para cabo-de-guerra.
- **Farejadores:** Brinquedos que escondem petiscos (estimulação mental).
- **Ativos:** Bolas e frisbees.
**Dica de Segurança:** Supervisione e descarte brinquedos quebrados.`;
        }

        if (msg.includes('brinquedo') && msg.includes('gato')|| msg.includes('brinquedos gatos')) {
            return `**Dicas de Brinquedos para Gatos:**
- **Caça:** Varinhas com penas ou bichinhos. Ativa o instinto de caça.
- **Estímulo:** Bolinhas com guizos ou Catnip.
- **Catnip (erva-do-gato):** Estimulante natural e seguro para a maioria dos gatos.`;
        }
        
        if (msg.includes('alimentação') || msg.includes('dieta') || msg.includes('tóxicos')) {
            return `**Cuidados com a Alimentação:**
1.  **Veterinário:** Consulte sempre antes de mudar a dieta.
2.  **Água Fresca:** Mantenha água limpa e fresca sempre disponível.
3.  **Rações de Qualidade:** Opte por rações de alta qualidade.
4.  **Alimentos Tóxicos:** **Evite** doces, chocolate, cebola, alho, uvas e abacate.`;
        }
        
        if (msg.includes('cuidados') || msg.includes('saúde') || msg.includes('preventivos')) {
            return `**Cuidados Essenciais para a Saúde:**
1.  **Veterinário:** Consultas regulares, vacinação e vermifugação em dia.
2.  **Higiene:** Banhos regulares, escovação dos dentes e corte de unhas.
3.  **Comportamento:** Fique atento a mudanças (letargia, perda de apetite) e procure o veterinário imediatamente.`;
        }

        // -----------------------------------------------------
        // 5. SITES DE AJUDA / REFERÊNCIA
        // -----------------------------------------------------
        
        if (msg.includes('sites') || msg.includes('ajuda') || msg.includes('referência')) {
            return `Para mais informações consulte artigos de confiança:
- **Cães Online:** Saúde, comportamento, nutrição e raças.
- **Petlove (Dúvidas):** Artigos revisados por especialistas sobre a criação de animais.
- **Cachorro Verde:** Especializado em alimentação natural (Dra. Sylvia Angélico).
- **Blog do Bicho (G1):** Conteúdo atualizado sobre bem-estar animal.`;
        }
        // -----------------------------------------------------
        // 6. adotar um pet 
        // -----------------------------------------------------

            
        if (msg.includes('como adotar') || msg.includes('passos para adoção') || msg.includes('processo de adoção')) {
            return `**🐾 Guia Rápido de Adoção no DruPets/Pex:**
        O processo de adoção responsável é simples e seguro:

        1.  **Escolha seu Pet:** Navegue pela seção "Adotar um Pet" para ver os animais disponíveis (cães, gatos e outros). Use os filtros para encontrar seu companheiro ideal.
        2.  **Verifique as Regras:** Leia atentamente a descrição e os requisitos de adoção definidos pelo responsável (ONG ou protetor).
        3.  **Entre em Contato:** Utilize as informações de contato fornecidas (telefone, e-mail ou rede social) para falar diretamente com o responsável.
        4.  **Entrevista:** Prepare-se para uma entrevista, pois o responsável garantirá que sua casa e estilo de vida são adequados para o animal.
        5.  **Termo de Adoção:** Após a aprovação, será assinado o Termo de Adoção Responsável.

        Lembre-se: Adotar é um compromisso para a vida!`;
        }


                // --- 7 NOVO BLOCO: ANIMAIS PERDIDOS E LOCALIZADOS ---
        if (msg.includes('perdi meu pet') || msg.includes('animal perdido') || msg.includes('encontrei um pet') || msg.includes('animal achado')|| msg.includes('achei um animal')|| msg.includes('achei um cachorro')|| msg.includes('achei um gato')) {
            return `**🔎 Pet Perdido ou Localizado? Siga estes passos:**

        **Se você PERDEU um animal:**
        1.  **Cadastre no DruPets:** Vá na seção "Cadastrar Animal" e preencha o formulário na aba **"Perdido"** com todas as informações e uma foto recente.
        2.  **Contato:** Monitore o contato (telefone, e-mail) que você cadastrou.
        3.  **Procure o Encontrado:** Verifique a lista de animais na aba **"Localizados"** do site.

        **Se você ENCONTROU um animal:**
        1.  **Cadastre no DruPets:** Vá na seção "Cadastrar Animal" e preencha o formulário na aba **"Localizado (Achado)"**.
        2.  **Contato:** Preencha seus dados de contato e aguarde o responsável entrar em contato.
        3.  **Cuidado:** Se possível, acolha o animal temporariamente e verifique se ele possui coleira, plaqueta ou chip para encontrar o tutor mais rapidamente.

        **Lembre-se:** A plataforma DruPets conecta pessoas. Seja o mais detalhado e rápido possível ao registrar a ocorrência!`;
        }

        // --- 8 NOVO BLOCO: golpe---

        if ( msg.includes('pix') || msg.includes('vcs cobram') || msg.includes('golpe') || msg.includes('pagamento') || msg.includes('custo')|| msg.includes('taxa') ) {
            return `**🔒 Segurança, Golpes e Pagamentos no DruPets:**

        O **DruPets** é uma plataforma **intermediária** gratuita que conecta protetores e cidadãos.

        **⚠️ ALERTA DE GOLPE E PAGAMENTO:**
        * **ADOÇÃO NÃO É VENDA:** A adoção responsável geralmente envolve apenas uma taxa de castração/vacinação, mas **nunca** grandes valores de venda.
        * **NÃO FAÇA TRANSFERÊNCIAS:** Nunca transfira dinheiro ou envie Pix para desconhecidos que alegam que o animal "só será liberado após o pagamento".
        * **DruPets NÃO COBRA:** A plataforma DruPets **não cobra** taxas pela adoção, nem gerencia pagamentos. Qualquer pedido de pagamento em nome do site é **GOLPE**.
        * 
        A sua cautela é a melhor ferramenta para garantir uma adoção segura e responsável!`;
        }

        // -----------------------------------------------------
        // 10. RESPOSTA PADRÃO / FALLBACK
        // -----------------------------------------------------

        return 'Desculpe, não entendi sua pergunta. Posso ajudar com informações sobre o **Projeto DruPets**, **Denúncias e Leis**, **Termos de Uso** ou **Dicas de Cuidados e Brinquedos**?';
    }
    
    // =======================================================================
    // FUNÇÕES DE EXIBIÇÃO E HISTÓRICO (Mantidas e Otimizadas)
    // =======================================================================

    addMessage(sender, messageText) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Formatação do conteúdo: substitui **texto** por <strong>texto</strong> e \n por <br>
        let htmlContent = messageText.replace(/\n/g, '<br>');
        htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Permite links se houver
        htmlContent = htmlContent.replace(
                /(Link:)\s*(https?:\/\/[^\s<]+)/g,
                (match, label, url) => `${label} <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir Link</a>`
            );
            
        messageDiv.innerHTML = htmlContent;
        chatMessages.appendChild(messageDiv);

        // Rolagem para a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Salvar no histórico local
        this.saveChatHistory(sender, messageText);
    }

    saveChatHistory(sender, message) {
        let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
        // Limita o histórico
        if (chatHistory.length > 50) { 
            chatHistory = chatHistory.slice(-50);
        }
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    loadChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Limpa o conteúdo atual
        chatMessages.innerHTML = ''; 

        const initialMessageText = 'Olá! Bem-vindo ao chat do DruPets! Pergunte-me sobre o site, **Denúncias e Leis**, ou busque dicas de saúde e produtos. Pergunte!';
        
        // Adiciona a mensagem inicial (que não é salva no histórico para evitar duplicação)
        const initialDiv = document.createElement('div');
        initialDiv.className = 'message bot';
        
        let htmlContent = initialMessageText.replace(/\n/g, '<br>');
        htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        initialDiv.innerHTML = htmlContent;
        chatMessages.appendChild(initialDiv);
        
        // Carrega o histórico salvo
        chatHistory.forEach(entry => {
            // Ignora a mensagem inicial, caso tenha sido salva por erro
            if (entry.message.trim() === initialMessageText.trim()) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${entry.sender}`;
            
            // Formatação do conteúdo
            let entryContent = entry.message.replace(/\n/g, '<br>');
            entryContent = entryContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            entryContent = entryContent.replace(
                /(Link:)\s*(https?:\/\/[^\s<]+)/g,
                (match, label, url) => `${label} <a href="${url}" target="_blank" rel="noopener noreferrer">Abrir Link</a>`
            );
            
            messageDiv.innerHTML = entryContent;
            chatMessages.appendChild(messageDiv);
        });

        // Rolagem para a última mensagem
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
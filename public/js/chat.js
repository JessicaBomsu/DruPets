// js/chat.js - VERSÃO COMPLETA E ATUALIZADA (Incluindo Lei de Denúncia)

class ChatSystem {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.falhasConsecutivas = 0; 
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
    // Limpar histórico a cada 1 minuto
    const ONE_MINUTE = 60 * 9000; // 60 segundos * 1000 milissegundos
    setInterval(() => {
        this.clearChatHistory();
        console.log("Histórico do chat limpo automaticamente."); // Mensagem opcional para debug
    }, ONE_MINUTE);
}

        // >>> MODIFIQUE O MÉTODO sendMessage PARA FICAR ASSIM <<<

sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const userMessage = chatInput ? chatInput.value.trim() : '';

    if (userMessage === '') return;

    // 1. Adiciona mensagem do usuário
    this.addMessage('user', userMessage);
    chatInput.value = '';

    // 2. Mostra o indicador de digitação
    this.showTypingIndicator();

    // 3. Simula um delay e depois responde
    setTimeout(() => {
        this.hideTypingIndicator();
        
        // Pega a resposta original do bot
        const botResponseText = this.getBotResponse(userMessage);
        
        // >>> NOVA LINHA: Processa a resposta para verificar a "zoeira" <<<
        const processedResponse = this.processarRespostaDoBot(botResponseText);
        
        // >>> LINHA MODIFICADA: Adiciona a resposta JÁ PROCESSADA <<<
        this.addMessage('bot', processedResponse);
    }, 1200);
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

        // --- NOVO BLOCO: CUIDADOS E PREVENÇÃO VETERINÁRIA PARA GATOS ---
        if (msg.includes('gato') || msg.includes('saúde felina') || msg.includes('cuidados gato') || msg.includes('brinquedos gatos')|| msg.includes('brinquedos para gatos')|| msg.includes('cuidados para gato')|| msg.includes('cuidados para gatos')|| msg.includes('brinquedos para gato')) {
            return `**🐈 Cuidados Abrangentes e Prevenção Veterinária Essencial para Gatos**

        Manter a saúde e o bem-estar mental do seu felino em dia é vital para uma vida longa e feliz.

        **1. 🩺 Ciclo de Prevenção Veterinária:**
        * **Vacinação:** Aplicação anual da Polivalente (V3/V4/V5) e Antirrábica. Considere a vacina Felina (FeLV) se ele tiver acesso à rua.
        * **Controle de Parasitas:** Vermifugação periódica (3 a 6 meses) e uso regular de produtos contra pulgas e carrapatos.
        * **Odontologia:** Escovação regular e avaliação veterinária para controle de tártaro.
        * **Check-ups:** Consultas anuais (ou semestrais para gatos idosos) para detecção precoce de doenças renais ou cardíacas.
        * **Castração:** Essencial para prevenir tumores e reduzir comportamentos de marcação territorial e fugas.

        **2. 🧠 Enriquecimento e Brincadeiras:**
        * **Instinto de Caça:** Gatos precisam simular a caça para evitar estresse.
        * **Brinquedos:**
            * **Caça:** Varinhas com penas, ratinhos ou bichinhos (o tutor precisa mover para simular a presa).
            * **Estímulo:** Bolinhas com guizos e brinquedos de dispenser de petisco (para trabalhar por comida).
        * **Catnip (Erva-do-gato):** Estimulante natural e seguro para a maioria dos gatos, ajuda no enriquecimento.

        **Lembre-se:** Gatos escondem doenças! Qualquer mudança de apetite, comportamento ou na caixa de areia deve ser investigada pelo veterinário.

        *Conteúdo por:* **petz blog | Publicado em 11 de março de 2024**`;
        }
        
         // --- NOVO BLOCO: ALIMENTAÇÃO E ALIMENTOS TÓXICOS (REFORMULADO) ---
        if (msg.includes('alimentação') || msg.includes('dieta') || msg.includes('tóxicos')) {
            return `**🍎 Nutrição e Cuidados com a Alimentação do seu Pet**

        Uma dieta balanceada é o pilar da saúde e longevidade do seu companheiro!

        **✅ Passos Essenciais:**
        1.  **Água Fresca:** Mantenha água limpa e fresca **SEMPRE** disponível. Troque o recipiente diariamente.
        2.  **Rações de Qualidade:** Opte por rações Super Premium ou Premium Especial, adequadas para a idade e porte do seu pet. Qualidade reflete na saúde!
        3.  **Consulta Veterinária:** **Consulte o veterinário** antes de realizar qualquer mudança radical na dieta (como migrar para Alimentação Natural), ou se o pet for alérgico ou obeso.

        **⚠️ ATENÇÃO: Alimentos TÓXICOS que Devem ser EVITADOS!**
        * **Chocolate, Doces e Cafeína:** Podem causar intoxicação, tremores e problemas cardíacos.
        * **Uvas e Passas:** Tóxicas para cães e podem levar à insuficiência renal.
        * **Cebola e Alho:** Contêm substâncias que danificam as células vermelhas do sangue, causando anemia.
        * **Abacate:** Contém persina, uma toxina perigosa para algumas espécies de pets (aves e coelhos).
        * **Ossos Cozidos:** Podem lascar e causar perfurações no sistema digestivo.

        **Dica Bônus:** Nunca use suplementos sem a indicação de um profissional!

        `;
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

        // --- 9 ADOTAR UM PET? ---
        if (msg.includes('como adotar') || msg.includes('quero adotar') || msg.includes('adotar um pet') || msg.includes('adotar cachorro') || msg.includes('adotar gato')|| msg.includes('adotar animal')|| msg.includes('adotar um animal')|| msg.includes('como adotar um animal')|| msg.includes('como adotar animal')|| msg.includes('como adotar um cachorro')|| msg.includes('como adotar um gato')) {
            return `**🐾 Guia Rápido: Como Adotar um Pet Responsavelmente 🐶🐱**

        **1. Preparação:**
        * **Analise o Estilo de Vida:** Avalie seu tempo, espaço (casa/apartamento) e orçamento para um novo pet.
        * **Apoio Familiar:** Todos da casa devem concordar e estar prontos para as responsabilidades.
        * **Segurança:** Se mora em apartamento, instale telas de proteção nas janelas (essencial para gatos!).

        **2. Onde Adotar:**
        * **ONGs e Abrigos:** São os locais mais indicados. Eles resgatam, tratam e conhecem a personalidade de cada animal.
        * **Feiras de Adoção:** Participe de eventos na sua cidade.
        * **Evite comprar:** Dê preferência à adoção responsável.

        **3. O Processo de Adoção:**
        * **Questionário:** Você preencherá um formulário detalhado sobre seu perfil. Seja honesto para garantir o "match" perfeito.
        * **Entrevista/Visita:** A ONG pode realizar uma entrevista ou uma visita prévia à sua casa para verificar as condições.
        * **Termo de Adoção:** Você assinará um contrato se comprometendo a cuidar bem do animal, garantir a castração, vacinas e nunca abandoná-lo.

        **4. A Chegada em Casa:**
        * **Cantinho Preparado:** Tenha caminha, potes de ração/água e a caixa de areia (gatos) prontos antes da chegada.
        * **Paciência:** O pet pode estar assustado. Dê espaço para ele se adaptar no seu próprio ritmo.
        * **Veterinário:** Agende um check-up inicial para vacinação, vermifugação e orientação.
        
        **Lembre-se:** Adotar é um compromisso de uma vida inteira! Busque ONGs e abrigos confiáveis na sua região.`;
        }

        // --- Saude RAIVA CANINA (DOENÇA E PREVENÇÃO) ---
        if (msg.includes('raiva canina') || msg.includes('doença raiva') || msg.includes('vacina raiva') || msg.includes('sintomas raiva')|| msg.includes('raiva')) {
            return `**⚠️ Raiva Canina: Devo me preocupar com isso? SIM! ☠️**

        A raiva é uma doença infecciosa viral aguda que acomete mamíferos, inclusive o ser humano. É uma **encefalite progressiva e aguda com letalidade de aproximadamente 100%**.

        **O que é?**
        * É causada pelo vírus do gênero *Lyssavirus*.
        * **Transmissão:** Principalmente pela mordida de um animal infectado, mas também pode ocorrer por contato da saliva ou secreções com feridas abertas ou mucosas.

        **Sintomas no Cão:**
        * Mudanças de comportamento (agressividade ou apatia extrema).
        * Salivação excessiva (babando muito).
        * Dificuldade em engolir.
        * Paralisia e convulsões.
        
        🚨 **Se você suspeita que seu cão possa estar com raiva, procure imediatamente um veterinário e as autoridades de saúde.**

        **A Melhor Prevenção (e Única!):**
        * A melhor maneira de prevenir a raiva canina é **VACINANDO** seu cão regularmente.
        * A vacina contra a raiva é segura, eficaz e, em muitos locais, é **obrigatória**. É administrada quando o cão é jovem e repetida **anualmente** por toda a vida.

        **Seu pet está com a vacina da Raiva em dia?? 💉 Mantenha o calendário vacinal rigorosamente atualizado!**
        
        *Conteúdo por:* **Giovanna Sampaio M | (@sampaaiogi)**`;
        }
        // --- Saude ENRIQUECIMENTO AMBIENTAL PARA CÃES ---
        if (msg.includes('enriquecimento ambiental') || msg.includes('estimular meu cão') || msg.includes('brinquedos interativos') || msg.includes('bem-estar do cão')|| msg.includes('enriquecimento')) {
            return `**🧠 Enriquecimento Ambiental: Tornando a Vida do Seu Cão Mais Feliz!**

        O Enriquecimento Ambiental (EA) é uma técnica que torna o ambiente dos cães mais interessante, estimulando o bem-estar físico e mental.

        **Como aplicar o EA?**

        **1. Brinquedos Interativos:**
        * Use brinquedos que desafiem mentalmente, como os de alimentação (*snuffle mats*, bolas dispensadoras, *kong*). Ele precisa trabalhar para obter a recompensa!

        **2. Passeios e Exploração:**
        * Leve-o a novos locais (parques, trilhas). Permita que ele CHEIRE e descubra: o cheiro é a maneira como ele lê o mundo.

        **3. Atividades Físicas:**
        * Mantenha uma rotina de exercícios: caminhadas, natação, corridas ou jogos de busca. Isso o mantém ativo e saudável.

        **4. Estímulos Sensoriais:**
        * Apresente diferentes texturas, cheiros e sons (grama, areia, brinquedos com texturas variadas).

        **5. Treinamento e Comandos:**
        * Ensinar novos truques ou comandos básicos estimula a mente e fortalece o vínculo com o tutor.

        **6. Interação Social:**
        * Cães são sociais! Promova encontros controlados com outros cães ou participe de aulas em grupo.

        **7. Áreas de Descanso:**
        * Garanta espaços confortáveis e tranquilos (caminhas macias) para que ele possa se retirar e relaxar quando precisar.

        **Lembre-se:** Observe seu cão! Ajuste as atividades de enriquecimento de acordo com as preferências e necessidades dele.
        
        *Conteúdo por:* **Giovanna Sampaio M |  (@sampaaiogi)**`;
        }
        // ---  CUIDADOS ESPECIAIS COM AVES DOMÉSTICAS ---
        if (msg.includes('aves domésticas') || msg.includes('cuidados aves') || msg.includes('bem-estar pássaros') || msg.includes('calopsita cuidados')|| msg.includes('aves domesticas')|| msg.includes('cuidados com aves')) {
            return `**🐦 Aves Domésticas: Cuidados Especiais para o Bem-Estar**

        Aves como calopsitas, periquitos e canários precisam de mais do que só comida e água. O bem-estar delas envolve:

        **1. 🏠 Ambiente e Gaiola:**
        * **Espaço:** A gaiola deve ser a maior possível para que possam abrir as asas.
        * **Higiene:** Limpeza diária de potes de comida/água e semanal da gaiola para evitar doenças.
        * **Poleiros:** Use poleiros de diferentes diâmetros e materiais (galhos naturais são ótimos!) para evitar problemas nos pés.

        **2. 🛁 Banho e Penas:**
        * **Banho:** Ofereça diariamente um recipiente raso com água limpa para o banho, ou borrife água morna. O banho é essencial para a saúde das penas.
        * **Unhas e Bico:** Mantenha poleiros adequados para que possam desgastar naturalmente. Se necessário, procure um veterinário especializado para o corte.

        **3. 🧠 Enriquecimento e Interação:**
        * **Brinquedos:** Ofereça brinquedos de roer, balanços e quebra-cabeças para manter a mente ativa.
        * **Interação:** Aves são sociais! Reserve tempo diário para interagir com a sua (falar, brincar, soltar em ambiente seguro).

        **4. 🍎 Alimentação:**
        * **Dieta Completa:** Não ofereça apenas sementes! A dieta deve ser composta por ração extrusada, frutas, legumes e verduras (sempre pesquise o que é seguro para a sua espécie!).

        **Lembre-se:** A falta de estímulo pode causar estresse e problemas como a "depenagem".

        Conteúdo por: **petz blog | **`;
        }
        // --- saude: CUIDADOS COM COELHOS (MITOS E VERDADES) ---
        if (msg.includes('coelho') || msg.includes('como cuidar de coelho') || msg.includes('coelho mitos') || msg.includes('dieta coelho')|| msg.includes('como cuidar de coelho')) {
            return `**🐰 Como Cuidar de Coelhos: Mitos e Verdades sobre Esse Pet**

        Coelhos são dóceis, mas exigem cuidados específicos para serem saudáveis e felizes!

        **✅ VERDADES (O que você PRECISA fazer):**
        1.  **Dieta:** A base da alimentação deve ser o **Feno** (à vontade, 24h por dia). O feno é essencial para o desgaste dos dentes e bom funcionamento intestinal.
        2.  **Vegetais:** Ofereça vegetais folhosos escuros (como rúcula, couve) diariamente, em pequenas porções. Ração peletizada é apenas um complemento.
        3.  **Ambiente:** Deixe-o solto em um ambiente seguro e à prova de coelhos (*bunny proof*), pois eles precisam de exercício e roem TUDO (cabos elétricos, móveis, etc.).
        4.  **Coprofagia:** É normal! Coelhos comem suas próprias fezes moles (cecotrofos) para absorver nutrientes essenciais. Não impeça.

        **❌ MITOS (O que você NÃO deve fazer):**
        1.  **Água:** Eles **DEVEM** beber água! Use bebedouros tipo garrafa ou potes pesados.
        2.  **Cenouras:** Não podem ser a base da dieta! Cenouras e frutas são petiscos dados em pouca quantidade, devido ao alto teor de açúcar.
        3.  **Gaiola Pequena:** Não são felizes em gaiolas minúsculas! Eles precisam de espaço para correr e pular.
        4.  **Higiene:** Coelhos **NÃO** devem tomar banho de imersão, pois isso causa estresse e hipotermia. A limpeza é feita por eles mesmos (lambem-se como gatos).

        **Veterinário:** Coelhos precisam de veterinários especializados em animais silvestres e exóticos.

        Conteúdo por: **petz blog | Publicado em 09 de junho de 2019**`;
        }

        // --- Saude: CUIDADOS COM PORQUINHO-DA-ÍNDIA ---
        if (msg.includes('porquinho da índia') || msg.includes('cuidar porquinho') || msg.includes('dieta porquinho') || msg.includes('roedor porquinho')|| msg.includes('como cuidar do porquinho')) {
            return `**🐹 Como Cuidar de um Porquinho-da-Índia: Confira os Cuidados!**

        Porquinhos-da-Índia são roedores sociáveis e sensíveis que requerem manejo específico para se manterem saudáveis:

        **1. 🥕 Dieta Essencial:**
        * **Feno:** Deve ser a base da dieta e estar disponível **24 horas por dia (à vontade)**. É vital para o desgaste dos dentes e saúde intestinal.
        * **Vitamina C:** Diferente de outros roedores, eles **não sintetizam** a Vitamina C e precisam ingeri-la diariamente. Ofereça vegetais ricos na vitamina (pimentão, couve) e, se necessário, suplemente com orientação veterinária.
        * **Ração:** Deve ser específica para Porquinhos-da-Índia e oferecida em porções controladas (não à vontade).

        **2. 🏡 Ambiente e Habitat:**
        * **Espaço:** Precisam de muito espaço para correr! Gaiolas devem ser as maiores possíveis (ou use cercados) e ter fundo reto (evite grades que machucam os pés).
        * **Forração:** Use forração segura e troque diariamente ou a cada dois dias (Ex: *soft* ou granulado de madeira atóxico) para evitar umidade e problemas respiratórios.
        * **Interação:** São animais sociais. Se possível, mantenha-os em pares ou trios para evitar estresse e depressão.

        **3. 🦷 Saúde e Higiene:**
        * **Dentes:** Crescem continuamente. O Feno é crucial para o desgaste.
        * **Banhos:** Não são recomendados, exceto sob orientação veterinária. Eles fazem a própria higiene.
        * **Veterinário:** Precisam de acompanhamento de veterinário especializado em animais silvestres e exóticos.

        Conteúdo por: **petz blog| Publicado em 21 de março de 2020**`;
        }
        // --- cobras: COBRAS: TEMPO DE VIDA E ALIMENTAÇÃO ---
        if (msg.includes('tempo de vida cobra') || msg.includes('o que cobras comem') || msg.includes('cuidados serpente') || msg.includes('cobra de estimação')) {
            return `**🐍 Cobra Pet: Tempo de Vida e Alimentação Adequada**

        Cobras são répteis fascinantes e exóticos com alta longevidade em cativeiro.

        **⏳ Tempo de Vida:**
        * Em cativeiro e com os cuidados corretos, a maioria das cobras vive entre **15 a 30 anos**.
        * **Exemplos:** Cobra do Milho (em média 14 anos); Píton Real e Jiboia (podem chegar a 25-30 anos).
        * **Qualidade de Vida:** A longevidade depende de um terrário bem montado, temperatura ideal, alimentação correta e visitas regulares ao veterinário.

        **🍖 Alimentação (Todas são Carnívoras):**
        * **Dieta:** A alimentação deve ser baseada em **pequenos animais**, principalmente roedores (camundongos e ratos).
        * **Segurança:** **NÃO** é indicado oferecer roedores vivos. O ideal é comprar roedores já congelados de criadouros específicos e descongelá-los antes de oferecer.
        * **Frequência:** O processo de digestão é lento, então elas não comem todos os dias:
            * **Adultas:** Comem em intervalos de uma semana, 15 em 15 dias ou até uma vez por mês, dependendo da espécie e porte.
            * **Filhotes:** Precisam comer com mais frequência (a cada 10 a 15 dias).

        **⚠️ Terrário:**
        * Deve simular o ambiente natural (área seca/quente e área úmida) para a troca de pele.
        * A **temperatura** é crucial, pois cobras são de sangue frio.

        **Lembre-se:** A posse de cobras no Brasil é rigorosamente controlada. Adquira apenas de criadores legalizados e autorizados pelo IBAMA.

        *Conteúdo por:* **petz blog | Publicado em 23/07/2022 | 17/08/2021**`;
        }
        // -----------------------------------------------------
        //  SUGESTÃO DE PERGUNTAS (MENU PRINCIPAL: QUANDO DIGITA 'TÓPICOS' / 'DICAS')
        // -----------------------------------------------------
        if (msg.includes('topicos') || msg.includes('dicas') || msg.includes('menu')) {
            return `**💡 MENU PRINCIPAL: O Que Você Gostaria de Perguntar?**

            Navegue digitando as palavras-chave em negrito, ou o nome do animal:

            **1. 🐾 DRUPETS & SEGURANÇA:**
            * **DRUPETS:** (O que é a plataforma, nosso objetivo).
            * **QUEM SOMOS:** (A equipe "Drummonetes").
            * **TECNOLOGIA:** (Linguagens e ferramentas usadas).
            * **CONFIANÇA:** (Como garantimos a segurança e como evitar **GOLPE** / **PIX**).
            * **DENÚNCIA:** (Maus-tratos e **Lei Sansão**).

            **2. 🐶 ADOÇÃO E RESGATE:**
            * **COMO ADOTAR:** (Passos e preparação).
            * **PERDIDO:** (O que fazer se o pet se perdeu ou foi encontrado).

            **3. 🏥 SAÚDE E CUIDADOS GERAIS:**
            * **SAÚDE:** (Menu com opções para **Cães**, **Gatos** e **Exóticos**).
            * **ALIMENTAÇÃO** ou **TÓXICOS:** (Alimentos proibidos e dieta básica).
            * **RAÇÃO:** (Diferença entre **Ração Filhote vs. Adulto**).
            * **CUIDADOS:** (Dicas essenciais sobre higiene e veterinário).

            **4. 🐈 DICAS POR ESPÉCIE:**
            * **GATO** (ou Ciclo de Prevenção Gato).
            * **ENRIQUECIMENTO AMBIENTAL** (para cães).
            * **BRINQUEDO CACHORRO** (ou Brinquedo GATO).
            * **COELHO** ou **PORQUINHO-DA-ÍNDIA**.
            * **AVES DOMÉSTICAS** (Calopsita, Periquito).
            * **DRAGÃO BARBUDO** (ou Pogona).
            * **COBRA** (Tempo de vida e alimentação).

            **Qual tópico te interessa mais?** Digite o nome do assunto (Ex: **DENÚNCIA**, **SAÚDE**, **COELHO**).`;
        }
        // --- largato: DRAGÃO-BARBUDO (POGONA) - CUIDADOS ---
        if (msg.includes('dragão barbudo') || msg.includes('pogona') || msg.includes('lagarto estimação') || msg.includes('cuidados réptil exótico')|| msg.includes('lagarto de estimação')|| msg.includes('lagarto ')|| msg.includes('lagarto de estimacao')|| msg.includes('lagarto estimacao')) {
            return `**🐉 Quer ter um Dragão-Barbudo (Pogona)? Veja como!**

        O Dragão-Barbudo é um réptil dócil e popular, mas exige um terrário com parâmetros ambientais **rigorosos** para sobreviver.

        **1. 🏠 O Terrário (O Lar Perfeito):**
        * **Tamanho:** Deve ser espaçoso, pois a Pogona cresce.
        * **Substrato:** Use materiais seguros como jornal, tapetes de répteis ou areia de cálcio (evite areia de sílica).
        * **Enriquecimento:** Galhos e pedras para subir e se aquecer.

        **2. 🔥 Controle de Temperatura (Vital!):**
        * **Área de Aquecimento (*Basking Area*):** Deve atingir **38°C a 42°C**. É onde o réptil se aquece para digerir a comida. Use lâmpadas de calor e termômetros digitais.
        * **Área Fria:** Deve ficar em torno de **26°C a 29°C** para que ele regule sua temperatura.
        * **Noturno:** Temperaturas devem cair, mas nunca abaixo de 18°C.

        **3. 💡 Iluminação (Essencial!):**
        * **Lâmpada UVB/UVA:** É a mais importante! Deve ser de alta qualidade e trocada a cada 6-12 meses. A luz UVB é crucial para que o animal sintetize a **Vitamina D3**, que permite a absorção do cálcio.

        **4. 🥦 Dieta (Onívora):**
        * **Filhotes:** Mais proteína (cerca de 70-80% insetos) e o restante de vegetais.
        * **Adultos:** Mais vegetais (cerca de 70-80%) e o restante de insetos (grilos, baratas, tenébrios).
        * **Suplementação:** O cálcio deve ser polvilhado nas presas quase todos os dias, e o suplemento de vitaminas deve ser dado 1-2 vezes por semana, conforme indicação veterinária.

        **Lembre-se:** A falta de UVB e cálcio pode levar à **Doença Metabólica Óssea (DMO)**, uma condição fatal. Acompanhamento com veterinário de exóticos é obrigatório.

        Conteúdo por: **petz blog | Publicado em 19 de junho de 2025**`;
        }
        // --- saude: DIRECIONAMENTO DE PERGUNTAS SOBRE SAÚDE ---
        if (msg.includes('saude') || msg.includes('saúde') || msg.includes('doença')) {
            return `**🏥 Saúde Animal: Informação é Prevenção!**

        O DruPets/Pex pode te ajudar com dicas e informações essenciais sobre a saúde e o bem-estar de diferentes espécies. Qual assunto te interessa mais?

        **Selecione ou digite sobre:**

        **🐶 Saúde Canina (Cachorros):**
        * **Raiva Canina** (vacinação e sintomas).
        * **Enriquecimento Ambiental** (bem-estar e estimulação mental).
        * **Ração de Filhote vs. Adulto** (diferença e importância).

        **🐈 Saúde Felina (Gatos):**
        * **Ciclo de Prevenção Gato** (vacinas, vermífugos e check-ups).
        * **Brinquedos Gatos** (para estimular o instinto de caça).

        **🐰 Pets Exóticos:**
        * **Coelho** (cuidados e dieta).
        * **Porquinho-da-Índia** (cuidados e Vitamina C).
        * **Dragão-Barbudo (Pogona)** (terrário, luz UVB e alimentação).

        **Ou digite:** **Alimentação** para ver dicas sobre alimentos tóxicos e nutrição geral.`;
        }

        // --- alimentacao: RAÇÃO FILHOTE VS. ADULTO E TRANSIÇÃO ---
        if (msg.includes('ração filhote') || msg.includes('ração adulto') || msg.includes('troca de ração') || msg.includes('mudar ração filhote')|| msg.includes('ração')|| msg.includes('racao')) {
            return `**🍖 Rações Filhote (Puppy) vs. Adulto: A Hora Certa de Mudar!**

        A principal diferença entre as rações está na **composição nutricional** e nas **calorias**:

        **Ração de Filhote :**
        * **Nutrientes:** Níveis mais elevados de proteínas, gorduras, vitaminas e minerais.
        * **Objetivo:** Suportar o crescimento rápido e saudável de músculos, ossos e órgãos.
        * **Calorias:** Mais calórica para fornecer a energia adicional que o filhote precisa para o desenvolvimento.

        **Ração de Adulto:**
        * **Nutrientes:** Níveis equilibrados e de manutenção.
        * **Objetivo:** Manter a saúde e a vitalidade do cão adulto.
        * **Calorias:** Geralmente menos calórica, ajustada para um metabolismo mais estável.

        **🗓️ Quando Fazer a Transição?**
        A idade ideal varia conforme o porte e raça do cão:
        * **Portes Mini, Pequenos e Médios:** Entre **9 e 12 meses** de idade.
        * **Portes Grandes e Gigantes:** Entre **12 e 18 meses** de vida.

        ⚠️ **Atenção:** A troca **SEMPRE** precisa ser feita de forma gradual (misturando a nova com a antiga por 7 a 10 dias), caso contrário, problemas digestivos são prováveis! 🤭 Conteúdo por: **Giovanna Sampaio M |  (@sampaaiogi)**`;
        }
        // --- 7 NOVO BLOCO: ANIMAIS PERDIDOS E LOCALIZADOS (GUIA DE AÇÃO) ---
        if (msg.includes('perdi meu pet') || msg.includes('animal perdido') || msg.includes('encontrei um pet') || msg.includes('animal achado')|| msg.includes('achei um animal')|| msg.includes('achei um cachorro')|| msg.includes('achei um gato')|| msg.includes('perdido')|| msg.includes('achado')|| msg.includes('achei um animal')|| msg.includes('perdi meu animal')|| msg.includes('Perdi um animal oque fazer')|| msg.includes('achei um animal oque fazer')|| msg.includes('Perdi um animal oque fazer?')|| msg.includes('achei um animal oque fazer?')) {
        return `**🔎 Pet Perdido ou Localizado? Guia de Ação Rápida!**

        **1. 💔 SE VOCÊ PERDEU SEU PET:**
        * **Cadastre:** Vá na seção "Cadastrar Animal" e preencha a aba **"Perdido"** com todos os detalhes e uma foto clara.
        * **Monitore:** Monitore seu contato e procure a lista de animais na aba **"Localizados"** do site.

        ---

        **2. ✅ SE VOCÊ ENCONTROU UM PET (Guia de Ação Detalhado):**
        
        a) **Segurança e Identificação:**
        * **Aproxime-se** com calma e verifique se ele possui coleira ou plaqueta de identificação (telefone/nome).
        * **Microchip:** Leve o animal a uma clínica veterinária ou ONG para verificar gratuitamente se ele possui **microchip**. Essa é a forma mais rápida de achar o tutor!
        * **Abrigo:** Acolha-o temporariamente, se puder, oferecendo água e um local seguro, até encontrar o responsável.

        b) **Registro no DruPets (Ação Imediata!):**
        * **Cadastre:** Vá na seção "Cadastrar Animal" e preencha o formulário na aba **"Localizado (Achado)"**.
        * **Detalhes:** Preencha seus dados de contato e seja detalhado na descrição para que o tutor possa reconhecê-lo.

        c) **Divulgação:**
        * **Redes Sociais:** Publique em grupos de "Pets Perdidos e Achados" da sua cidade, com foto e o local exato em que foi encontrado.
        * **Cartazes:** Pendure cartazes perto do local do achado.

        **Lembre-se:** A plataforma DruPets conecta pessoas. Seja o mais detalhado e rápido possível ao registrar a ocorrência!`;
        }
        

        // -----------------------------------------------------
        // 10. RESPOSTA PADRÃO / FALLBACK
        // -----------------------------------------------------

        return `🤔 **Ops! Desculpe, não entendi sua pergunta.**

            Para que eu possa te ajudar, tente digitar apenas a **palavra-chave principal**, como:

            * **DICAS**
            * **SAÚDE** (ou Saude)
            * **ADOÇÃO** (ou Adocao)
            * **DENÚNCIA** (ou Denuncia)
            * **DRUPETS** (para saber sobre o site)
             ETC...

            Você também pode digitar **TÓPICOS** para ver o menu completo de sugestões!`;
    }
    // >>> ADICIONE ESTA FUNÇÃO COMPLETA DENTRO DA SUA CLASSE ChatSystem <<<

/**
 * Processa a resposta do bot para aplicar a lógica da "mensagem zoeira".
 * @param {string} respostaOriginal - A resposta que o bot gerou originalmente.
 * @returns {string} - A resposta final (pode ser a original ou a "zoeira").
 */
processarRespostaDoBot(respostaOriginal) {
    // Defina aqui as mensagens exatas que você quer comparar
    const mensagemNaoEntendida = `🤔 **Ops! Desculpe, não entendi sua pergunta.**

            Para que eu possa te ajudar, tente digitar apenas a **palavra-chave principal**, como:

            * **DICAS**
            * **SAÚDE** (ou Saude)
            * **ADOÇÃO** (ou Adocao)
            * **DENÚNCIA** (ou Denuncia)
            * **DRUPETS** (para saber sobre o site)
             ETC...

            Você também pode digitar **TÓPICOS** para ver o menu completo de sugestões!`;
    const mensagemZoeira = "auauau auauau Grrrrrr🐶"; // Sua mensagem customizada!

    let respostaFinal = respostaOriginal;

    // Verifica se a resposta do bot foi a de "não entendi"
    if (respostaOriginal.trim() === mensagemNaoEntendida.trim()) {
        this.falhasConsecutivas++; // Incrementa o contador de falhas

        // Se for a 3ª falha consecutiva (ou mais)...
        if (this.falhasConsecutivas >= 3) {
            respostaFinal = mensagemZoeira; // Troca para a mensagem de zoeira
            this.falhasConsecutivas = 0; // Reseta o contador para recomeçar o ciclo
        }
    } else {
        // Se o bot ENTENDEU a pergunta, ele zera o contador
        this.falhasConsecutivas = 0;
    }

    // Retorna a resposta final, que será exibida no chat
    return respostaFinal;
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

const initialMessageText = '🐾 Olá! Sou o assistente virtual do **DruPets**. Queremos te ajudar a cuidar e proteger os animais! 👋\n\n**Pergunte-me sobre:**\n\n* **O Site e Adoção** (Ex: "O que é o DruPets?", "Como Adotar?").\n* **Segurança e Leis** (Ex: "Denúncia", "Golpe", "Confiança").\n* **Dicas de Cuidados** (Ex: "Dicas", "Saúde", "Alimentação").\n\nOu digite **TÓPICOS** para ver um menu completo de sugestões!';        
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
    // =======================================================================
// FUNÇÕES DO INDICADOR DE DIGITAÇÃO 
// =======================================================================

showTypingIndicator() {
    // Evita mostrar múltiplos indicadores
    if (this.isTyping) return;
    
    this.isTyping = true;
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Cria o container do indicador
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator-container';
    
    // Cria os pontinhos do indicador
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Rola a tela para mostrar o indicador
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator-container');
    if (typingIndicator) {
        typingIndicator.remove();
        this.isTyping = false;
    }
}
}
/* ==========================================================================
   LÓGICA DE MENSAGEM ZOEIRA (NOVO) - REMOVA ESTE BLOCO INTEIRO
   ========================================================================== */

// 1. Contador global para falhas consecutivas
let falhasConsecutivas = 0;

// 2. Função que processa a resposta do bot antes de exibi-la
function processarRespostaDoBot(respostaOriginal) {
    // Defina aqui as mensagens que você quer usar
    const mensagemNaoEntendida = "Ops! Desculpe, não entendi sua pergunta.";
    const mensagemZoeira = "zoeira auauau 🐶"; // Sua mensagem customizada!

    let respostaFinal = respostaOriginal;

    // Verifica se a resposta do bot foi a de "não entendi"
    if (respostaOriginal === mensagemNaoEntendida) {
        falhasConsecutivas++; // Incrementa o contador de falhas

        // Se for a 3ª falha consecutiva (ou mais)...
        if (falhasConsecutivas >= 3) {
            respostaFinal = mensagemZoeira; // Troca para a mensagem de zoeira
            falhasConsecutivas = 0; // Reseta o contador para recomeçar o ciclo
        }
    } else {
        // Se o bot ENTENDEU a pergunta, ele zera o contador
        falhasConsecutivas = 0;
    }

    // Por fim, adiciona a mensagem final ao chat
    // Usando a função que você já deve ter para adicionar mensagens do bot
    addMessage(respostaFinal, true); 
    
    // E rola para o final para ver a nova mensagem
    scrollToBottom();
}
// Inicializar chat quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    window.chatSystem = new ChatSystem();
});
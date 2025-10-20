// 1. CÓDIGO DO HEADER (Copie o bloco <header> completo)
const headerHTML = `
    <header>
        <div class="header-container">
            <div class="logo">
                <img src="/img/logo.jpg" alt="DruPets -adoção de Animais" class="logo-img">
            </div>

            <nav>
                <ul>
                    <li><a href="index.html">Início</a></li>
                    <li><a href="animais-para-adocao.html">Adotar um Pet</a></li>
                    <li><a href="feira-adocoes.html">Feira de Adoções</a></li>
                    <li><a href="cadastraranimais.html">Cadastrar Animal</a></li>
                    <li><a href="sobre-nos.html">Sobre nos</a></li>
                
                    <li class="dropdown">
                        <a href="#"><i class="fas fa-paw" style="font-size: 1.2em;"></i></a>
                        <ul class="dropdown-content" id="userDropdown">
                            <!-- O conteúdo será carregado dinamicamente via JavaScript -->
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
`;

// 2. CÓDIGO DO FOOTER (Copie o bloco <footer> completo do index.html)
const footerHTML = `
    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>Dru Pets</h3>
                <p>Conectando animais abandonados a lares amorosos desde 2023.</p>
                <div class="social-icons">
                    <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
                </div>
            </div>

            <div class="footer-section">
                <h3>Contato</h3>
                <p><i class="fas fa-envelope"></i> contato@DruPets.org</p>
                <p><i class="fas fa-phone"></i> (11) 3456-7890</p>
                <p><i class="fas fa-map-marker-alt"></i> São Paulo, SP - Brasil</p>
            </div>

            <div class="footer-section">
                <h3>Links Rápidos</h3>
                <p><a href="index.html">Início</a></p>
                <p><a href="animais-para-adocao.html">Adotar</a></p>
                <p><a href="cadastraranimais.html">Cadastrar Animal</a></p>
                <p><a href="sobre-nos.html">Sobre Nós</a></p>
            </div>
        </div>

        <div class="copyright">
            <p>&copy; 2025 DruPets. Todos os direitos reservados.</p>
        </div>
    </footer>
`;

// Função para injetar o Header (no início do body)
export function injectHeader() {
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = headerHTML.trim();

    // CORREÇÃO CRÍTICA: Encontra o elemento <header> real
    const actualHeader = headerContainer.querySelector('header');

    const body = document.body;
    if (body && actualHeader) {
        body.insertAdjacentElement('afterbegin', actualHeader);
    }
}

// Função para injetar o Footer (no final do body)
export function injectFooter() {
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = footerHTML.trim(); // Usa .trim() para limpar

    // CORREÇÃO CRÍTICA: Encontra o elemento <footer> real dentro do container
    const actualFooter = footerContainer.querySelector('footer');

    const body = document.body;
    if (body && actualFooter) {
        // Usa 'beforeend' para injetar o <footer> no FINAL do body
        body.insertAdjacentElement('beforeend', actualFooter);
    }
}

// Função combinada para injetar tudo
export function injectComponents() {
    injectHeader();
    injectFooter();
}
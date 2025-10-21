// js/componentes.js

// Template base do Header
const headerTemplate = `
<header>
    <div class="header-container">
        <div class="logo">
            <img src="/img/logo.png" alt="DruPets - Causa Animal" class="logo-img">
        </div>

        <nav>
            <ul>
                <li><a href="index.html">Início</a></li>
                <li><a href="sobre-nos.html">Sobre Nós</a></li>
                <li><a href="animais-para-adocao.html">Ajude um Pet</a></li>
                <li><a href="feira-adocoes.html">Eventos</a></li>
                <li><a href="blog.html">Blog</a></li>

                <li class="dropdown">
                    <a href="#"><i class="fas fa-paw" style="font-size: 1.2em;"></i></a>
                    <ul class="dropdown-content" id="userDropdown"></ul>
                </li>
            </ul>
        </nav>
    </div>
</header>
`;

// Template do Footer
const footerHTML = `
<footer>
    <div class="footer-content">
        <div class="footer-section">
            <h3>Dru Pets</h3>
            <p>Conectando animais abandonados a lares amorosos desde 2025.</p>
            <div class="social-icons">
                <a href="https://www.facebook.com/unidrummond" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/unidrummond/" class="social-icon"><i class="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/school/grupo-educacional-drummond" class="social-icon"><i class="fa-brands fa-linkedin-in"></i></a>
                <a href="https://www.youtube.com/grupoeducacionaldrummond" class="social-icon"><i class="fab fa-youtube"></i></a>
            </div>
        </div>

        <div class="footer-section">
            <h3>Contato</h3>
            <p><i class="fas fa-envelope"></i> contato@drupets.com</p>
            <p><i class="fas fa-phone"></i> (11) 2227-8400</p>
            <p><i class="fas fa-map-marker-alt"></i> São Paulo, SP - Brasil</p>
        </div>

        <div class="footer-section">
            <h3>Links Rápidos</h3>
            <p><a href="index.html">Início</a></p>
            <p><a href="sobre-nos.html">Sobre Nós</a></p>
            <p><a href="animais-para-adocao.html">Ajude um Pet</a></p>
            <p><a href="blog.html">Blog</a></p>
        </div>
    </div>

    <div class="copyright">
        <p>&copy; 2025 DruPets. Todos os direitos reservados.</p>
    </div>
</footer>
`;

/**
 * Monta o dropdown de acordo com o usuário logado.
 */
function renderDropdownLinks(currentUser) {
    // Caso o usuário não esteja logado
    if (!currentUser) {
        return `
            <li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a></li>
            <li><a href="cadastro.html"><i class="fas fa-user-plus"></i> Criar Conta</a></li>
        `;
    }

    let links = ``;

    // Admin
    if (currentUser.tipo === 'admin') {
        links += `
            <li><a href="adm.html"><i class="fas fa-user-shield"></i> Painel Administrativo</a></li>
            <li><a href="feira-adocoes.html"><i class="fas fa-calendar-plus"></i> Gerenciar Feiras</a></li>
            <li><a href="cadastraranimais.html"><i class="fa-solid fa-dog"></i> Cadastrar Animal</a></li>
            <li class="separator"></li>
        `;
    }

    // ONG
    else if (currentUser.tipo === 'ong') {
        links += `
            <li><a href="meuperfil.html"><i class="fas fa-user-circle"></i> Meu Perfil</a></li>
            <li><a href="cadastraranimais.html"><i class="fa-solid fa-dog"></i> Cadastrar Animal</a></li>
            <li class="separator"></li>
        `;
    }

    // Usuário comum
    else {
        links += `
            <li><a href="meuperfil.html"><i class="fas fa-user-circle"></i> Meu Perfil</a></li>
            <li class="separator"></li>
        `;
    }

    // Opção comum a todos logados
    links += `
        <li><a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
    `;

    return links;
}

/**
 * Injeta o Header com o menu correto conforme o usuário logado.
 */
export function injectHeader() {
    const savedUser = localStorage.getItem('currentUser');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    // Insere o header
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = headerTemplate.trim();
    const actualHeader = headerContainer.querySelector('header');
    document.body.insertAdjacentElement('afterbegin', actualHeader);

    // Insere os links no dropdown
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.innerHTML = renderDropdownLinks(currentUser);

    // Listener para logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.authSystem && typeof window.authSystem.logout === 'function') {
                window.authSystem.logout();
            } else {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

/**
 * Injeta o Footer.
 */
export function injectFooter() {
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = footerHTML.trim();
    const actualFooter = footerContainer.querySelector('footer');
    document.body.insertAdjacentElement('beforeend', actualFooter);
}

/**
 * Função combinada — Header + Footer
 */
export function injectComponents() {
    injectHeader();
    injectFooter();
}

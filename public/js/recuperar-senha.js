// Dentro de /js/recuperar-senha.js (VERSÃO FINAL COM CSS e DEBUG)

import { database } from './config.js'; 
import { showPawLoader, hidePawLoader, showNotification } from './auth.js'; 

// ==============================================================================
// === INÍCIO DA CORREÇÃO DE CSS ===
// Copiamos os estilos da notificação do auth.js para garantir que elas apareçam
// ==============================================================================
const notificationStyles = `
.notification {
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background: white; border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000; display: flex; align-items: center; gap: 10px;
    transform: translateX(150%); transition: transform 0.3s ease;
    max-width: 400px;
}
.notification.show { transform: translateX(0); }
.notification.success { border-left: 4px solid #28a745; } /* Usei cores hex, var(--success) pode não funcionar aqui */
.notification.error { border-left: 4px solid #dc3545; }
.notification.info { border-left: 4px solid #17a2b8; }
.notification i { font-size: 1.5rem; }
.notification.success i { color: #28a745; }
.notification.error i { color: #dc3545; }
.notification.info i { color: #17a2b8; }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
// ==============================================================================
// === FIM DA CORREÇÃO DE CSS ===
// ==============================================================================


document.addEventListener("DOMContentLoaded", function() {
    
    console.log("DEBUG: DOM carregado. Script 'recuperar-senha.js' iniciou.");

    const recoverForm = document.getElementById('recover-password-form');
    if (!recoverForm) {
        console.error("DEBUG: ERRO CRÍTICO! Formulário #recover-password-form NÃO encontrado.");
        return; 
    }
    console.log("DEBUG: Formulário #recover-password-form encontrado.");

    recoverForm.addEventListener('submit', function(event) {
        console.log("DEBUG: Botão 'Redefinir Senha' clicado.");
        event.preventDefault(); 
        
        const email = document.getElementById('email').value;
        const securityWord = document.getElementById('security-word').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        console.log("DEBUG: Dados lidos do formulário:", { email, securityWord, newPassword: '***' });

        // 1. Validar se as senhas batem
        if (newPassword !== confirmPassword) {
            console.log("DEBUG: Falha na validação - Senhas não coincidem.");
            showNotification('Erro: As novas senhas não coincidem. A alteração não foi feita.', 'error');
            return; 
        }

        if (newPassword.length < 6) {
            console.log("DEBUG: Falha na validação - Senha curta.");
            showNotification('Erro: A nova senha deve ter no mínimo 6 caracteres. A alteração não foi feita.', 'error');
            return; 
        }

        showPawLoader('Verificando dados...');
        console.log("DEBUG: Iniciando busca no Realtime Database...");

        // 2. Buscar o usuário no REALTIME DATABASE pelo e-mail
        const usersRef = database.ref('cadastro_conta');
        usersRef.orderByChild('email').equalTo(email).once('value')
            .then((snapshot) => {
                console.log("DEBUG: Resposta do Firebase (once.value) recebida.");

                if (!snapshot.exists()) {
                    // Erro 1: E-mail não encontrado
                    console.log("DEBUG: Erro de Lógica - snapshot.exists() é falso. E-mail não encontrado.");
                    hidePawLoader();
                    showNotification('Erro: E-mail não encontrado. A alteração não foi feita.', 'error');
                    return;
                }

                console.log("DEBUG: Sucesso - E-mail encontrado no DB.");
                const users = snapshot.val();
                const userId = Object.keys(users)[0];
                const userData = users[userId];
                console.log("DEBUG: ID do usuário:", userId);
                
                // 3. Compara a palavra de segurança
                console.log(`DEBUG: Comparando palavra de segurança... Digitado: [${securityWord}], Salvo no DB: [${userData.palavra_de_seguranca}]`);

                if (userData.palavra_de_seguranca === securityWord) {
                    
                    console.log("DEBUG: Sucesso - Palavra de segurança CORRETA.");
                    console.log(`DEBUG: Tentando ATUALIZAR a senha no path: cadastro_conta/${userId}`);

                    const userRef = database.ref(`cadastro_conta/${userId}`);
                    
                    // 4. ATUALIZAR a senha
                    userRef.update({
                        senha: newPassword
                    })
                    .then(() => {
                        console.log("DEBUG: Sucesso - Senha ATUALIZADA no DB.");
                        
                        // 5. LOGIN AUTOMÁTICO
                        userData.senha = newPassword; 
                        const currentUserData = { id: userId, ...userData };
                        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
                        console.log("DEBUG: Sucesso - Usuário salvo no localStorage. Redirecionando...");
                        
                        hidePawLoader();
                        showNotification('Senha redefinida e login efetuado com sucesso!', 'success');
                        
                        recoverForm.reset(); 
                        
                        setTimeout(() => {
                            window.location.href = 'meuperfil.html';
                        }, 2000);
                    })
                    .catch((error) => {
                        console.error("DEBUG: ERRO CRÍTICO ao ATUALIZAR a senha no DB:", error);
                        hidePawLoader();
                        showNotification('Erro ao salvar a nova senha. A alteração não foi feita.', 'error');
                    });

                } else {
                    // Erro 2: Palavra de segurança errada
                    console.log("DEBUG: Erro de Lógica - Palavra de segurança INCORRETA.");
                    hidePawLoader();
                    showNotification('Erro: Palavra de segurança incorreta. A alteração não foi feita.', 'error');
                }
            })
            .catch((error) => {
                // Erro na consulta (provavelmente permissão)
                console.error("DEBUG: ERRO CRÍTICO na consulta 'once.value':", error);
                hidePawLoader();
                showNotification('Erro ao verificar os dados. A alteração não foi feita.', 'error');
            });
    });
});
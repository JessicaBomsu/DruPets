// init-admin.js - Executar uma vez no console do navegador
async function createFirstAdmin() {
    const firebaseConfig = {
        apiKey: "AIzaSyBudkk0obhdXCXfx08VvQP90zB5EsOcUAY",
        authDomain: "pex25-a64be.firebaseapp.com",
        databaseURL: "https://pex25-a64be-default-rtdb.firebaseio.com",
        projectId: "pex25-a64be",
        storageBucket: "pex25-a64be.firebasestorage.app",
        messagingSenderId: "524883286653",
        appId: "1:524883286653:web:8e2c8d9028d69e7d996f14",
        measurementId: "G-RE34NV3ZMH"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const database = firebase.database();

    const adminData = {
        nome: "Administrador Master",
        email: "admin@patasfelizes.com",
        senha: "admin123", // Mude esta senha!
        telefone: "(11) 99999-9999",
        tipo: "admin",
        data_criacao: new Date().toISOString(),
        status: "active",
        nivel_acesso: "master"
    };

    try {
        const adminId = 'admin_master';
        await database.ref('cadastro_conta/' + adminId).set(adminData);
        console.log('✅ Administrador criado com sucesso!');
        console.log('📧 Email: admin@patasfelizes.com');
        console.log('🔑 Senha: admin123');
        console.log('⚠️  Lembre-se de alterar a senha após o primeiro login!');
    } catch (error) {
        console.error('❌ Erro ao criar administrador:', error);
    }
}

// Execute esta função no console do navegador
// createFirstAdmin();
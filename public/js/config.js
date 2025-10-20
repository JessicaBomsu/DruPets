// js/config.js

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBudkk0obhdXCXfx08VvQP90zB5EsOcUAY",
    authDomain: "pex25-a64be.firebaseapp.com",
    databaseURL: "https://pex25-a64be-default-rtdb.firebaseio.com",
    projectId: "pex25-a64be",
    storageBucket: "pex25-a64be.firebasestorage.app",
    messagingSenderId: "524883286653",
    appId: "1:524883286653:web:8e2c8d9028d69e7d996f14",
    measurementId: "G-RE34NV3ZMH"
};

// Inicializar Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    console.log("Firebase inicializado com sucesso!");
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    // Adicionar lógica de notificação aqui se for global
}

export const database = firebase.database();
export const auth = firebase.auth();
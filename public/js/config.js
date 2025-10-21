// js/config.js (A VERSÃO FINAL CORRIGIDA)

// 1. IMPORTA as bibliotecas do Firebase (v9 "compat")
//    CORREÇÃO: Removemos o 'firebase from'. Estes imports apenas
//    rodam e criam o objeto global 'firebase' para compatibilidade.
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js";

// 2. ==========================================================
//    COLE A SUA CONFIGURAÇÃO DO FIREBASE AQUI
//    (apiKey, authDomain, databaseURL, etc.)
// ==========================================================
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

// 3. Inicializa o Firebase
//    Agora a variável 'firebase' EXISTE, pois foi criada pelos imports acima.
let app;
try {
    if (!firebase.apps.length) {
        app = firebase.initializeApp(FIREBASE_CONFIG);
        console.log("Firebase inicializado com sucesso!");
    } else {
        app = firebase.app();
    }
} catch (error) {
    console.error("Erro CRÍTICO ao inicializar Firebase:", error);
}

// 4. Exporta os serviços que os outros scripts (auth.js, recuperar-senha.js) vão usar
export const database = firebase.database(); // Para o Realtime Database
export const auth = firebase.auth();         // Para o Authentication
export const db = firebase.firestore();    // Para o Firestore
export { app };                           // Exporta o app principal
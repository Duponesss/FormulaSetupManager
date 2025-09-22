import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase usando suas credenciais
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY || "AIzaSyBBocwz2Sp3E8KpXTaZNrUez4AMCuIDgXg",
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN || "formulatsetupmanager.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "formulatsetupmanager",
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET || "formulatsetupmanager.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID || "542753300240",
  appId: process.env.EXPO_PUBLIC_APP_ID || "1:542753300240:android:c0c5d0e8ab526638d40f95",
};

// Debug: Log Firebase config 
console.log('Firebase Config Status:', {
  apiKey: firebaseConfig.apiKey ? '✅ Loaded' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ Loaded' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ Loaded' : '❌ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✅ Loaded' : '❌ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Loaded' : '❌ Missing',
  appId: firebaseConfig.appId ? '✅ Loaded' : '❌ Missing',
});

console.log('Using project:', firebaseConfig.projectId);

// Validate required fields
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  console.error('❌ Firebase configuration missing required fields:', missingFields);
  console.error('Please check your .env file and ensure all EXPO_PUBLIC_* variables are set correctly');
} else {
  console.log('✅ Firebase configuration is complete');
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth (AsyncStorage será usado automaticamente no React Native)
export const auth = getAuth(app);
export const db = getFirestore(app);
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence  } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase usando suas credenciais
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
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

// Inicializa o Firebase App
const app = initializeApp(firebaseConfig);

// Inicializa a Autenticação
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicializa o Firestore
const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage };
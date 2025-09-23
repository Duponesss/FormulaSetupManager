import {
  GoogleAuthProvider,
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebaseConfig';

// Conditional import for Google Sign-in (only works in development builds)
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.log('Google Sign-in not available in Expo Go');
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// INTERRUPTOR PARA O MODO DE DESENVOLVIMENTO
const MOCK_AUTH_IN_DEV = true; // <-- Mude para 'false' para testar o login real

// Objeto de utilizador falso para simulação
const FAKE_USER: User = {
  uid: 'dev-user-12345',
  email: 'dev@formula.com',
  displayName: 'Dev User',
  emailVerified: true,
  isAnonymous: false,
  photoURL: null,
  phoneNumber: null,
  providerId: 'password',
  metadata: {} as any, // Usamos 'as any' para simplificar o mock
  providerData: [],
  refreshToken: 'fake-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'fake-id-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // O estado inicial agora depende do nosso interruptor
  const [user, setUser] = useState<User | null>(MOCK_AUTH_IN_DEV ? FAKE_USER : null);
  // O 'loading' começa como 'false' no modo de simulação para um arranque mais rápido
  const [loading, setLoading] = useState(!MOCK_AUTH_IN_DEV);

  useEffect(() => {
    // Se estivermos a simular, não executa a lógica do Firebase
    if (MOCK_AUTH_IN_DEV) {
      return;
    }

    // Configure Google Sign-in only if available
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // From Google Cloud Console
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!GoogleSignin) {
      throw new Error('Google Sign-in não está disponível no Expo Go. Use um development build.');
    }

    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the users ID token
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await signInWithCredential(auth, googleCredential);
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

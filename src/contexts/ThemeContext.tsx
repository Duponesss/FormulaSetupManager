// src/contexts/ThemeContext.tsx

import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'nativewind';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();

  // 🎯 AQUI ESTÁ A CORREÇÃO PRINCIPAL
  // Enquanto o tema está sendo carregado do AsyncStorage, colorScheme é `undefined`.
  // Não renderizamos o app para evitar erros, podemos mostrar um splash/loading screen aqui no futuro.
  if (colorScheme === undefined) {
    return null;
  }

  const value = {
    // Agora, TypeScript sabe que colorScheme só pode ser 'light' or 'dark'.
    theme: colorScheme,
    toggleTheme: toggleColorScheme,
    // A função setColorScheme do NativeWind aceita 'light', 'dark', ou 'system'.
    // Para manter a consistência do nosso tipo, vamos garantir que só aceitamos 'light' ou 'dark'.
    setTheme: (newTheme: ThemeMode) => setColorScheme(newTheme),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
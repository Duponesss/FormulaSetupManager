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

  if (colorScheme === undefined) {
    return null;
  }

  const value = {
    theme: colorScheme,
    toggleTheme: toggleColorScheme,
    setTheme: (newTheme: ThemeMode) => setColorScheme(newTheme),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
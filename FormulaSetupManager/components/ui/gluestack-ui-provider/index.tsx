// components/ui/gluestack-ui-provider/index.tsx

import React from 'react';
import { config } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';

// A propriedade 'mode' foi removida
export function GluestackUIProvider({
  ...props
}: {
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme } = useColorScheme();

  // O useEffect foi removido daqui

  // Adicionamos a verificação de 'undefined' para evitar crashes na inicialização
  if (colorScheme === undefined) {
    return null;
  }

  return (
    <View
      style={[
        config[colorScheme], // Usamos o '!' pois já verificamos que não é undefined
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
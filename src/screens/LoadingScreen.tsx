import React from 'react';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Heading } from '../../components/ui/heading';

const LoadingScreen: React.FC = () => {
  return (
    <GluestackUIProvider mode="dark">
      <Box className="flex-1 justify-center items-center">
        <Heading size="xl">F1 Setup Manager</Heading>
        <Text className="mt-2">Carregando...</Text>
      </Box>
    </GluestackUIProvider>
  );
};

export default LoadingScreen;

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Box } from '../../components/ui/box';
import { Fab } from '../../components/ui/fab';
import { Heading } from '../../components/ui/heading';
import { Spinner } from '../../components/ui/spinner';
import { Text } from '../../components/ui/text';

import { VStack } from '@/components/ui/vstack';
import { ClipboardPlus } from 'lucide-react-native';
import StrategyCard from '../../src/components/cards/StrategyCard';
import { useSetupStore } from '../../src/stores/setupStore';

export default function StrategiesScreen() {
  const router = useRouter();

  const strategies = useSetupStore(state => state.strategies);
  const loadingStrategies = useSetupStore(state => state.loadingStrategies);
  const listenToUserStrategies = useSetupStore(state => state.listenToUserStrategies);

  useEffect(() => {
    const unsubscribe = listenToUserStrategies();
    return () => unsubscribe();
  }, [listenToUserStrategies]);

  if (loadingStrategies) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-black">
      <ImageBackground
        source={require('../../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <VStack className="flex-1 bg-black/50">
          <Heading className="pt-12 pb-4 px-6 text-2xl font-bold text-white">Minhas Estratégias</Heading>
        
        {strategies.length === 0 ? (
          <Box className="flex-1 justify-center items-center px-8">
            <Text className="text-lg text-center text-white">
              Nenhuma estratégia criada.
            </Text>
            <Text className="text-center text-white mt-2">
              Toque no botão <ClipboardPlus size={16} color="white" /> para planejar sua próxima corrida!
            </Text>
          </Box>
        ) : (
          <FlatList
            data={strategies}
            renderItem={({ item }) => <StrategyCard strategy={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          />
        )}

        <Fab
          size="lg"
          placement="bottom right"
          className="bg-red-500 mb-20"
          onPress={() => {
            router.push('/create-strategy-screen');
          }}
        >
          <ClipboardPlus color="white" />
        </Fab>
        </VStack>
      </ImageBackground>
    </Box>
  );
}
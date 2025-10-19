import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { Box } from '../../components/ui/box';
import { Heading } from '../../components/ui/heading';
import { Text } from '../../components/ui/text';
import { Spinner } from '../../components/ui/spinner';
import { Fab, FabLabel } from '../../components/ui/fab';
import { useRouter } from 'expo-router';

import { useSetupStore } from '../../src/stores/setupStore';
import StrategyCard from '../../src/components/cards/StrategyCard';
import { ClipboardPlus } from 'lucide-react-native';

export default function StrategiesScreen() {
  const router = useRouter();

  // 1. Conecta-se à store para buscar as estratégias e o estado de carregamento
  const strategies = useSetupStore(state => state.strategies);
  const loadingStrategies = useSetupStore(state => state.loadingStrategies);
  const listenToUserStrategies = useSetupStore(state => state.listenToUserStrategies);

  // 2. Inicia o ouvinte em tempo real para as estratégias do usuário
  useEffect(() => {
    const unsubscribe = listenToUserStrategies();
    // Limpa o ouvinte quando o componente é desmontado
    return () => unsubscribe();
  }, [listenToUserStrategies]);

  // 3. Exibe um spinner enquanto os dados são carregados
  if (loadingStrategies) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-gray-100">
      <Heading className="p-4 text-2xl font-bold">Minhas Estratégias</Heading>

      {/* 4. Renderiza a lista de estratégias ou uma mensagem de "lista vazia" */}
      {strategies.length === 0 ? (
        <Box className="flex-1 justify-center items-center px-8">
          <Text className="text-lg text-center text-gray-500">
            Nenhuma estratégia criada.
          </Text>
          <Text className="text-center text-gray-500 mt-2">
            Toque no botão <ClipboardPlus size={16} /> para planejar sua próxima corrida!
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

      {/* 5. Botão de Ação Flutuante (FAB) para criar uma nova estratégia */}
      <Fab
        size="lg"
        placement="bottom right"
        className="bg-red-500 mb-20"
        onPress={() => {
          // Navega para a tela de criação (que faremos a seguir)
          router.push('/create-strategy-screen');
        }}
      >
        <ClipboardPlus color="white" />
      </Fab>
    </Box>
  );
}
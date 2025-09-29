import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '../../components/ui/box';
import { FlatList } from '../../components/ui/flat-list';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Pressable } from '../../components/ui/pressable';
import { Text } from '../../components/ui/text'
import { SetupCard } from '../../src/components/cards/SetupCard'; 
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { Spinner } from '@/components/ui/spinner';

export default function ResultsScreen() {
  const router = useRouter();
  // Obtém os filtros que foram passados como parâmetros na navegação
  const filters = useLocalSearchParams<{ car?: string; track?: string; condition?: string; controlType?: string; }>();
  
  // Obtém a lista completa de setups e a função de apagar do nosso store
  const allSetups = useSetupStore((state) => state.allSetups);
  const deleteSetupById = useSetupStore((state) => state.deleteSetup);

  // Otimização: A lista de resultados é "memorizada" e só é recalculada
  // se a lista principal de setups (allSetups) ou os filtros mudarem.
  const filteredResults = useMemo(() => {
    // Se não houver setups, retorna uma lista vazia
    if (!allSetups) return [];
    
    // Aplica a lógica de filtro
    const filteredData = allSetups.filter(setup => {
      return (
        (!filters.car || setup.car === filters.car) &&
        (!filters.track || setup.track === filters.track) &&
        (!filters.condition || setup.condition === filters.condition) &&
        (!filters.controlType || setup.controlType === filters.controlType)
      );
    });

    return filteredData;
  }, [allSetups, filters]); // Dependências da memorização

  return (
    <Box className="flex-1 bg-white">
      <Box className="pt-12 pb-4 px-6 border-b border-neutral-200">
        <HStack className="items-center justify-between">
          <Heading size="xl">Resultados da Busca</Heading>
          <Pressable onPress={() => router.back()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <FlatList
        data={filteredResults} // Usa a lista já filtrada e memorizada
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <SetupCard item={item} onDelete={deleteSetupById} />
        )}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={
          <Box className="flex-1 justify-center items-center mt-20">
            <Text className="text-center text-lg font-medium">Nenhum setup encontrado</Text>
            <Text className="text-center text-neutral-500 mt-2">Tente ajustar os seus filtros ou crie um novo setup.</Text>
          </Box>
        }
      />
    </Box>
  );
}
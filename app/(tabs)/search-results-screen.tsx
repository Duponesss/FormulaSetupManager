import React, { useMemo, useState } from 'react';
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
import AddToFolderModal from '@/src/components/dialogs/AddToFolderModal';
import { ArrowBigLeft } from 'lucide-react-native';
import { ImageBackground } from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();
  const handleGoBack = () => {
    if (router.canGoBack()) {
      // Se houver uma tela anterior na pilha, volte para ela.
      router.back();
    } else {
      // Se não houver, navegue para a tela principal da aba (Home).
      router.push('/(tabs)');
    }
  };
  // Obtém os filtros que foram passados como parâmetros na navegação
  const filters = useLocalSearchParams<{ car?: string; track?: string; condition?: string; controlType?: string; }>();

  // Obtém a lista completa de setups e a função de apagar do nosso store
  const allSetups = useSetupStore((state) => state.allSetups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<SetupData | null>(null);

  const handleOpenAddToFolderModal = (setup: SetupData) => {
    setSelectedSetup(setup);
    setIsModalOpen(true);
  };

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
    <>
      <Box className="flex-1">
        <ImageBackground
          source={require('../../src/assets/images/apex-wallpaper.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <Box className="pt-12 pb-4 px-6 bg-white">
            <HStack className="items-center justify-between">
              <Pressable onPress={() => router.push('/(tabs)/search-setup-screen')}>
                {(props: { pressed: boolean }) => (
                  <Box
                    style={{
                      opacity: props.pressed ? 0.5 : 1.0,
                    }}
                  >
                    <ArrowBigLeft />
                  </Box>
                )}
              </Pressable>
              <Heading size="xl" className="flex-1 text-center">Resultados da Busca</Heading>
            </HStack>
          </Box>
          <Box className="flex-1 bg-black/60">
            <FlatList
              data={filteredResults} // Usa a lista já filtrada e memorizada
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <SetupCard item={item} onAddToFolder={handleOpenAddToFolderModal} />
              )}
              contentContainerStyle={{ padding: 24 }}
              ListEmptyComponent={
                <Box className="flex-1 justify-center items-center mt-20">
                  <Text className="text-center text-lg font-medium text-white">Nenhum setup encontrado</Text>
                  <Text className="text-center mt-2 text-white">Tente ajustar os seus filtros ou crie um novo setup.</Text>
                </Box>
              }
            />
          </Box>
        </ImageBackground>
      </Box>
      <AddToFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setup={selectedSetup}
      />
    </>
  );
}
import React, { useMemo, useState, useEffect } from 'react';
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
import { Button, ButtonText } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react-native';
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
  const params = useLocalSearchParams<{ car?: string; track?: string; condition?: string; controlType?: string; }>();

  // Obtém a lista completa de setups e a função de apagar do nosso store
  const publicSetups = useSetupStore((state) => state.publicSetups);
  const loadingPublicSetups = useSetupStore((state) => state.loadingPublicSetups);
  const loadingMoreSetups = useSetupStore((state) => state.loadingMoreSetups);
  const hasMoreSetups = useSetupStore((state) => state.hasMoreSetups);
  const searchPublicSetups = useSetupStore((state) => state.searchPublicSetups);
  const fetchMorePublicSetups = useSetupStore((state) => state.fetchMorePublicSetups);

  const handleAddToFolder = (item: SetupData) => {};
  
  const filtersJSON = JSON.stringify(params);
  console.log("Filtros JSON:", filtersJSON);
  
  useEffect(() => {
    console.log("Executando busca com filtros:", filtersJSON);
    const filtersObject = JSON.parse(filtersJSON);
    const filters = {
      car: filtersObject.car || undefined,
      track: filtersObject.track || undefined,
      controlType: filtersObject.controlType || undefined,
      condition: filtersObject.condition || undefined,
    };
    searchPublicSetups(filters).catch(err => {
      console.error("Erro pego na tela de resultados:", err);
    });
  }, [filtersJSON, searchPublicSetups]);

  const renderListFooter = () => {
    if (loadingMoreSetups) {
      return (
        <Box className="py-4 items-center">
          <Spinner color="$red600" />
        </Box>
      );
    }

    if (hasMoreSetups) {
      return (
        <Box className="py-4">
          <Button onPress={fetchMorePublicSetups} className="bg-red-600">
            <ButtonText>Carregar Mais 10</ButtonText>
          </Button>
        </Box>
      );
    }
    
    // Só mostra o "Fim" se a lista não estiver vazia
    if (!loadingPublicSetups && publicSetups.length > 0) {
      return (
        <Box className="py-4 items-center">
          <Text className="text-gray-400">Fim dos resultados</Text>
        </Box>
      );
    }

    return null; // Não mostra nada se estiver vazio ou carregando pela primeira vez
  };

  return (
    <>
      <Box className="flex-1">
        <ImageBackground
          source={require('../../src/assets/images/apex-wallpaper.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <Box className="pt-12 pb-4 px-6 bg-black/70">
            <HStack className="items-center justify-between">
              <Pressable onPress={() => router.back()} className="w-10">
                {(props: { pressed: boolean }) => (
                  <Box style={{ opacity: props.pressed ? 0.5 : 1.0 }}>
                    <ArrowLeft color="white" />
                  </Box>
                )}
              </Pressable>
              <Heading size="xl" className="flex-1 text-center text-white">Resultados da Busca</Heading>
            </HStack>
          </Box>
          <Box className="flex-1 bg-black/60">
            {loadingPublicSetups ? (
              <Box className="flex-1 justify-center items-center">
                <Spinner size="large" color="#ef4444" />
                <Text className="text-white mt-4">Buscando na comunidade...</Text>
              </Box>
            ) : (
              <FlatList
                data={publicSetups}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                  <SetupCard 
                    item={item} 
                    onAddToFolder={handleAddToFolder} 
                    isViewOnly={true} 
                  />
                )}
                contentContainerStyle={{ padding: 24, paddingTop: 24, paddingBottom: 100 }}
                ListFooterComponent={renderListFooter}
                ListEmptyComponent={
                  <Box className="flex-1 justify-center items-center mt-20 p-4 rounded-lg bg-gray-800/50">
                    <Text className="text-center text-lg font-medium text-white">Nenhum setup encontrado</Text>
                    <Text className="text-center mt-2 text-white">Tente ajustar os seus filtros.</Text>
                  </Box>
                }
              />
            )}
            
          </Box>
        </ImageBackground>
      </Box>
    </>
  );
}
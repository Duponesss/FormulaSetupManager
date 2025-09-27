import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Pressable } from '../../components/ui/pressable';
import { FlatList } from '../../components/ui/flat-list';
import CustomAlertDialog from '../../src/components/dialogs/CustomAlertDialog';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { useSingleTap } from '../../src/hooks/useSingleTap';
import { SetupCard } from '../../src/components/cards/SetupCard';
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { Spinner } from '../../components/ui/spinner';

export default function HomeScreen() {
  console.log('Renderizando HomeScreen...');
  const router = useRouter();
  const allSetups = useSetupStore((state) => state.allSetups);
  const loading = useSetupStore((state) => state.loading);
  const loadAllSetups = useSetupStore((state) => state.loadAllSetups);
  const deleteSetupById = useSetupStore((state) => state.deleteSetupById);


  const handleCreateSetup = useSingleTap(() => {
    router.push('/create-setup-screen');
  }, 1500);

  if (loading && allSetups.length === 0) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <>
      <Box className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={['#000000', '#434343']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Box className="pt-5 pb-5 px-6">
              <HStack className="items-center justify-between ml-4 mt-6">
                <Heading size="2xl" className="text-white">Meus Setups</Heading>
                <Pressable className="p-2" onPress={() => router.push('/search-setup-screen')}>
                  <Text size="2xl">🔍</Text>
                </Pressable>
              </HStack>
          </Box>
        </LinearGradient>

        {/* Main Content */}
        <Box className="flex-1 px-6 pt-4">
          <Text className="mb-4">{allSetups.length} setup{allSetups.length !== 1 ? 's' : ''} cadastrado{allSetups.length !== 1 ? 's' : ''}</Text>
          <FlatList
            data={allSetups}
            renderItem={({ item }) => <SetupCard item={item} onDelete={deleteSetupById} />}
            keyExtractor={(item) => item.id!}
            initialNumToRender={5} // Renderiza um número menor de itens no carregamento inicial da tela
            windowSize={11} // Define o tamanho da "janela" de renderização.
            removeClippedSubviews={true} // Remove os itens que saem da janela de renderização da memória.
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Box className="items-center py-12">
                <Text size="lg" className="mb-2">Nenhum setup cadastrado</Text>
                <Text className="text-center">Crie um novo setup clicando no botão +</Text>
              </Box>
            }
          />
        </Box>

        {/* Floating Action Button */}
        <Pressable
          className="absolute bottom-6 bg-red-500 right-6 font-bold w-14 h-14 rounded-full items-center justify-center"
          onPress={handleCreateSetup}
        >
          <Text size="3xl" className="text-white mb-1">+</Text>
        </Pressable>
      </Box >
    </>
  );
};
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback } from 'react';
import { useAuth } from "@/src/contexts/AuthContext";

import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Pressable } from '../../components/ui/pressable';
import { FlatList } from '../../components/ui/flat-list';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { useSingleTap } from '../../src/hooks/useSingleTap';
import { SetupCard } from '../../src/components/cards/SetupCard';
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { Spinner } from '../../components/ui/spinner';
import { LogOut, Trophy } from 'lucide-react-native';
import AddToFolderModal from "@/src/components/dialogs/AddToFolderModal";
import { ImageBackground } from "react-native";
import LogoutModal from "@/src/components/dialogs/LogoutModal";


export default function HomeScreen() {
  console.log('Renderizando HomeScreen...');
  const router = useRouter();
  const allSetups = useSetupStore((state) => state.allSetups);
  const loading = useSetupStore((state) => state.loadingSetups);
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<SetupData | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleOpenAddToFolderModal = useCallback((setup: SetupData) => {
    setSelectedSetup(setup);
    setIsModalOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutAlert(true);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    signOut();
    setShowLogoutAlert(false);
  }, []);

  const debouncedSignOut = useSingleTap(handleLogout);

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
        <ImageBackground
          source={require('../../src/assets/images/apex-wallpaper.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <Box className="pt-5 pb-5 px-6 bg-black/60">
            <HStack className="items-center justify-between ml-4 mt-5">
              <HStack className="items-center justify-between">
                <Trophy color="red" size={30} />
                <Heading size="2xl" className="text-white ml-3">Meus Setups</Heading>
              </HStack>
              <Pressable onPress={debouncedSignOut}>
                {(props: { pressed: boolean }) => (
                  <Box 
                    style={{
                      opacity: props.pressed ? 0.5 : 1.0,
                    }}
                  >
                    <LogOut color="red" size={30} />
                  </Box>
                )}
              </Pressable>
            </HStack>
          </Box>
          {/* Main Content */}

          <Box className="flex-1 px-6 pt-4 bg-black/30">
            <HStack className="items-center justify-between ml-4 mb-2">
              <Text className="text-white">{allSetups.length} setup{allSetups.length !== 1 ? 's' : ''} cadastrado{allSetups.length !== 1 ? 's' : ''}</Text>
            </HStack>
            <FlatList
              data={allSetups}
              renderItem={({ item }) => (
                <SetupCard
                  item={item}
                  onAddToFolder={handleOpenAddToFolderModal}
                />
              )}
              keyExtractor={(item) => item.id!}
              initialNumToRender={5} // Renderiza um número menor de itens no carregamento inicial da tela
              windowSize={11} // Define o tamanho da "janela" de renderização.
              removeClippedSubviews={true} // Remove os itens que saem da janela de renderização da memória.
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Box className="items-center py-12">
                  <Text size="lg" className="mb-2 text-white">Nenhum setup cadastrado</Text>
                  <Text className="text-center text-white">Crie um novo setup clicando no botão +</Text>
                </Box>
              }
            />
          </Box>
        </ImageBackground>
      </Box >
      <AddToFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setup={selectedSetup}
      />
      <LogoutModal
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
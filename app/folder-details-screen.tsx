import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowBigLeft, ArrowLeft, PencilLine, Trash, X } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '../components/ui/alert-dialog';
import { Box } from '../components/ui/box';
import { Button, ButtonText } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { HStack } from '../components/ui/hstack';
import { Pressable } from '../components/ui/pressable';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';

import { SetupCard } from '../src/components/cards/SetupCard';
import CreateEditFolderModal from '../src/components/dialogs/CreateEditFolderModal';
import { SetupData, useSetupStore } from '../src/stores/setupStore';
import AddToFolderModal from '@/src/components/dialogs/AddToFolderModal';

export default function FolderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ folderId: string; folderName: string }>();
  const { folderId, folderName } = params;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const folders = useSetupStore(state => state.folders);
  const folderSetups = useSetupStore(state => state.folderSetups);
  const loadingFolderSetups = useSetupStore(state => state.loadingFolderSetups);
  const getSetupsForFolder = useSetupStore(state => state.getSetupsForFolder);
  const deleteFolder = useSetupStore(state => state.deleteFolder);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState<SetupData | null>(null);

  const handleOpenAddToFolderModal = useCallback((setup: SetupData) => {
    setSelectedSetup(setup);
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (folderId) {
      getSetupsForFolder(folderId);
    }
  }, [folderId, getSetupsForFolder]);

  const currentFolder = folders.find(f => f.id === folderId);

  const handleDeleteFolder = async () => {
    if (folderId) {
      await deleteFolder(folderId);
      router.back(); 
    }
    setIsDeleteAlertOpen(false);
  };

  if (!folderId) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>ID da pasta não encontrado.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-gray-100">
      <ImageBackground
        source={require('../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
      {/* Cabeçalho Customizado */}
      <HStack className="bg-white p-4 justify-between items-center border-b border-gray-200">
        <HStack className='flex items-center mt-2'>
          <Pressable onPress={() => router.back()} className="p-2">
            {(props: { pressed: boolean }) => (
                  <Box 
                    style={{
                      opacity: props.pressed ? 0.5 : 1.0,
                    }}
                  >
                    <ArrowLeft />
                  </Box>
                )}
          </Pressable>
          <Heading size="md" className="flex-1 text-center">{folderName}</Heading>

          <HStack space="md">
            <Pressable onPress={() => setIsEditModalOpen(true)} className="p-2">
              {(props: { pressed: boolean }) => (
                <Box 
                  style={{
                    opacity: props.pressed ? 0.5 : 1.0,
                  }}
                >
                  <PencilLine color="blue" />
                </Box>
              )}
            </Pressable>
            <Pressable onPress={() => setIsDeleteAlertOpen(true)} className="p-2">
              {(props: { pressed: boolean }) => (
                <Box 
                  style={{
                    opacity: props.pressed ? 0.5 : 1.0,
                  }}
                >
                  <Trash color="red" />
                </Box>
              )}
            </Pressable>
          </HStack>
        </HStack>
      </HStack>

      {/* Corpo da Tela */}
      <Box className="flex-1 bg-black/60">
      {loadingFolderSetups ? (
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
        </Box>
      ) : folderSetups.length === 0 ? (
        <Box className="flex-1 justify-center items-center px-8">
          <Text className="text-lg text-center text-gray-500">
            Esta pasta está vazia.
          </Text>
        </Box>
      ) : (
        <FlatList
          data={folderSetups}
          renderItem={({ item }) => (
            <SetupCard item={item} onAddToFolder={handleOpenAddToFolderModal} />
          )}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        />
      )}

      {/* Modal de Edição */}
      {currentFolder && (
        <CreateEditFolderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          folderToEdit={currentFolder}
        />
      )}
      </Box>
      </ImageBackground>
      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading>Excluir Pasta</Heading>
            <AlertDialogCloseButton>
              <X />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              Você tem certeza que deseja excluir a pasta "{folderName}"? Todos os setups salvos
              nela serão removidos desta pasta (mas não serão excluídos do sistema).
              Esta ação não pode ser desfeita.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" action="secondary" onPress={() => setIsDeleteAlertOpen(false)} className="mr-3">
              <ButtonText>Cancelar</ButtonText>
            </Button>
            <Button action="negative" onPress={handleDeleteFolder}>
              <ButtonText>Excluir</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddToFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setup={selectedSetup}
      />
    </Box>
  );
}
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, PencilLine, Trash } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Box } from '../components/ui/box';
import { Heading } from '../components/ui/heading';
import { HStack } from '../components/ui/hstack';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';

import AddToFolderModal from '@/src/components/dialogs/AddToFolderModal';
import DeleteFolderDialog from '@/src/components/dialogs/DeleteFolderDialog';
import { useAuth } from "@/src/contexts/AuthContext";
import { SetupCard } from '../src/components/cards/SetupCard';
import CreateEditFolderModal from '../src/components/dialogs/CreateEditFolderModal';
import { SetupData, useSetupStore } from '../src/stores/setupStore';
import { DebouncedPressable } from '@/src/components/common/DebouncedPressable';

export default function FolderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ folderId: string; folderName: string }>();
  const { user } = useAuth();

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
  const isOwner = !!currentFolder;

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
    <Box className="flex-1 bg-black">
      <ImageBackground
        source={require('../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Cabeçalho Customizado */}
        <HStack className="bg-black/70 p-4 justify-between items-center">
          <HStack className='flex items-center mt-4'>
            <DebouncedPressable onPress={() => router.back()} className="p-2">
              {(props: { pressed: boolean }) => (
                <Box
                  style={{
                    opacity: props.pressed ? 0.5 : 1.0,
                  }}
                >
                  <ArrowLeft color="white" />
                </Box>
              )}
            </DebouncedPressable>
            <Heading size="md" className="flex-1 text-center text-white">{folderName}</Heading>
            {isOwner && (
              <HStack space="md">
                <DebouncedPressable onPress={() => setIsEditModalOpen(true)} className="p-2">
                  {(props: { pressed: boolean }) => (
                    <Box
                      style={{
                        opacity: props.pressed ? 0.5 : 1.0,
                      }}
                    >
                      <PencilLine color="blue" />
                    </Box>
                  )}
                </DebouncedPressable>
                <DebouncedPressable onPress={() => setIsDeleteAlertOpen(true)} className="p-2">
                  {(props: { pressed: boolean }) => (
                    <Box
                      style={{
                        opacity: props.pressed ? 0.5 : 1.0,
                      }}
                    >
                      <Trash color="red" />
                    </Box>
                  )}
                </DebouncedPressable>
              </HStack>
            )}
            {/* Se não for dono, colocamos um Box vazio para manter o alinhamento do título */}
            {!isOwner && <Box className="w-10" />}
          </HStack>
        </HStack>

        {/* Corpo da Tela */}
        <Box className="flex-1 bg-black/50">
          {loadingFolderSetups ? (
            <Box className="flex-1 justify-center items-center">
              <Spinner size="large" />
            </Box>
          ) : folderSetups.length === 0 ? (
            <Box className="flex-1 justify-center items-center px-8">
              <Text className="text-lg text-center text-white">
                Esta pasta está vazia.
              </Text>
            </Box>
          ) : (
            <FlatList
              data={folderSetups}
              renderItem={({ item }) => (
                <SetupCard
                  item={item}
                  onAddToFolder={handleOpenAddToFolderModal}
                  isViewOnly={!isOwner}
                />
              )}
              keyExtractor={(item) => item.id!}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
            />
          )}

          {/* Modal de Edição */}
          {isOwner && currentFolder && (
            <CreateEditFolderModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              folderToEdit={currentFolder}
            />
          )}
        </Box>
      </ImageBackground>
      {isOwner && currentFolder && (
        <DeleteFolderDialog
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirm={handleDeleteFolder}
          folderName={folderName}
        />
      )}
      {isOwner && currentFolder && (
        <AddToFolderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (folderId) {
              getSetupsForFolder(folderId);
            }
          }}
          setup={selectedSetup}
        />
      )}
    </Box>
  );
}
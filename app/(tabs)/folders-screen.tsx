import { FolderPlus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { Box } from '../../components/ui/box';
import { Fab } from '../../components/ui/fab';
import { Heading } from '../../components/ui/heading';
import { Spinner } from '../../components/ui/spinner';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import FolderCard from '../../src/components/cards/FolderCard';
import CreateEditFolderModal from '../../src/components/dialogs/CreateEditFolderModal';
import { useSetupStore } from '../../src/stores/setupStore';

export default function FoldersScreen() {
    const folders = useSetupStore(state => state.folders);
    const loadingFolders = useSetupStore(state => state.loadingFolders);
    const listenToUserFolders = useSetupStore(state => state.listenToUserFolders);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = listenToUserFolders();

        return () => unsubscribe();
    }, [listenToUserFolders]);
    if (loadingFolders) {
        return (
            <Box className="flex-1 justify-center items-center">
                <Spinner size="large" />
            </Box>
        );
    }

    return (
        <Box className="flex-1">
            <ImageBackground
                source={require('../../src/assets/images/apex-wallpaper.jpg')}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <VStack className="flex-1 bg-black/50">
                    <Heading className="pt-12 pb-4 px-6 text-2xl font-bold text-white">Minhas Pastas</Heading>

                    {folders.length === 0 ? (
                        <Box className="flex-1 justify-center items-center px-8">
                            <Text className="text-lg text-center text-white">
                                Você ainda não criou nenhuma pasta.
                            </Text>
                            <Text className="text-center text-white mt-2">
                                Toque no botão <FolderPlus size={17} color="white" /> para organizar seus setups!
                            </Text>
                        </Box>
                    ) : (
                        <FlatList
                            data={folders}
                            renderItem={({ item }) => <FolderCard folder={item} />}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        />
                    )}

                    <Fab
                        size="lg"
                        placement="bottom right"
                        className="bg-red-500 mb-20"
                        onPress={() => setIsModalOpen(true)}
                    >
                        <FolderPlus color="white" />
                    </Fab>
                </VStack>
            </ImageBackground>
            <CreateEditFolderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Box>
    );
}
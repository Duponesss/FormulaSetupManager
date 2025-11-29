import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Folder as FolderIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import { Box } from '../components/ui/box';
import { FlatList } from '../components/ui/flat-list';
import { Heading } from '../components/ui/heading';
import { HStack } from '../components/ui/hstack';
import { Spinner } from '../components/ui/spinner';
import { Text } from '../components/ui/text';
import { SetupCard } from '../src/components/cards/SetupCard';
import { useSetupStore } from '../src/stores/setupStore';
import { DebouncedPressable } from '@/src/components/common/DebouncedPressable';

export default function UserContentScreen() {
    const router = useRouter();
    const { userId, userName, type } = useLocalSearchParams<{ userId: string; userName: string; type: 'setups' | 'folders' }>();

    const viewedUserSetups = useSetupStore(state => state.viewedUserSetups);
    const viewedUserFolders = useSetupStore(state => state.viewedUserFolders);
    const loadingUserContent = useSetupStore(state => state.loadingUserContent);
    const fetchPublicSetupsByUser = useSetupStore(state => state.fetchPublicSetupsByUser);
    const fetchPublicFoldersByUser = useSetupStore(state => state.fetchPublicFoldersByUser);

    useEffect(() => {
        if (userId && type === 'setups') {
            fetchPublicSetupsByUser(userId);
        } else if (userId && type === 'folders') {
            fetchPublicFoldersByUser(userId);
        }
    }, [userId, type]);


    // Renderização de Item de Pasta (Simplificado, similar ao FolderScreen)
    const renderFolderItem = ({ item }: { item: any }) => (
        <DebouncedPressable
            onPress={() => router.push({
                pathname: '/folder-details-screen',
                params: { folderId: item.id, folderName: item.name }
            })}
            className="bg-gray-800/80 p-4 mb-3 rounded-xl border border-gray-700"
        >
            <HStack className="items-center justify-between">
                <HStack className="items-center" space="md">
                    <View>
                        <FolderIcon color="#fbbf24" fill="#fbbf24" size={24} />
                    </View>
                    <Text className="text-white font-bold text-lg">{item.name}</Text>
                </HStack>
            </HStack>
        </DebouncedPressable>
    );

    const title = type === 'setups' ? `Setups de ${userName}` : `Pastas de ${userName}`;

    return (
        <Box className="flex-1 bg-black">
            <ImageBackground
                source={require('../src/assets/images/apex-wallpaper.jpg')}
                style={{ flex: 1 }}
                resizeMode="cover"
                imageStyle={{ opacity: 0.3 }}
            >
                <Box className="pt-12 pb-4 px-6 bg-black/70">
                    <HStack className="items-center">
                        <DebouncedPressable onPress={() => router.back()} className="p-2 mr-2">
                            <ArrowLeft color="white" />
                        </DebouncedPressable>
                        <Heading size="lg" className="text-white flex-1" numberOfLines={1}>
                            {title}
                        </Heading>
                    </HStack>
                </Box>

                <Box className="flex-1 px-4 pt-4">
                    {loadingUserContent ? (
                        <Box className="flex-1 justify-center items-center">
                            <Spinner size="large" color="#ef4444" />
                        </Box>
                    ) : type === 'setups' ? (
                        /* Lista de Setups */
                        <FlatList
                            data={viewedUserSetups}
                            keyExtractor={(item) => item.id!}
                            renderItem={({ item }) => (
                                <SetupCard
                                    item={item}
                                    onAddToFolder={() => { }}
                                    isPublicSearch={true}
                                />
                            )}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            ListEmptyComponent={
                                <Box className="mt-20 items-center">
                                    <Text className="text-gray-400">Nenhum setup público encontrado.</Text>
                                </Box>
                            }
                        />
                    ) : (
                        /* Lista de Pastas */
                        <FlatList
                            data={viewedUserFolders}
                            keyExtractor={(item) => item.id}
                            renderItem={renderFolderItem}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            ListEmptyComponent={
                                <Box className="mt-20 items-center">
                                    <Text className="text-gray-400">Nenhuma pasta pública encontrada.</Text>
                                </Box>
                            }
                        />
                    )}
                </Box>
            </ImageBackground>
        </Box>
    );
}
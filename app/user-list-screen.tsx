import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { FlatList } from '@/components/ui/flat-list';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Image } from 'expo-image';
import { ArrowLeft, User } from 'lucide-react-native';
import { Spinner } from '@/components/ui/spinner';
import { useSetupStore } from '@/src/stores/setupStore';
import { ImageBackground } from 'react-native';

export default function UserListScreen() {
    const router = useRouter();
    const { userId, type } = useLocalSearchParams<{ userId: string; type: 'followers' | 'following' }>();

    const fetchUserList = useSetupStore(state => state.fetchUserList);
    const userList = useSetupStore(state => state.userList);
    const loadingUserList = useSetupStore(state => state.loadingUserList);

    useEffect(() => {
        if (userId && type) {
            fetchUserList(userId, type);
        }
    }, [userId, type]);

    const handleUserPress = (targetId: string) => {
        // Navega para o perfil do usuário clicado
        router.push({
            pathname: '/(tabs)/profile-screen',
            params: { userId: targetId }
        });
    };

    const title = type === 'followers' ? 'Seguidores' : 'Seguindo';

    const renderItem = ({ item }: { item: any }) => (
        <Pressable
            onPress={() => handleUserPress(item.uid)}
            className="mb-4 bg-gray-800/50 p-3 rounded-xl border border-gray-700"
        >
            {({ pressed }) => (
                <HStack space="md" className={`items-center ${pressed ? 'opacity-60' : 'opacity-100'}`}>
                    {/* Avatar Pequeno */}
                    {item.profilePictureUrl ? (
                        <Image
                            source={{ uri: item.profilePictureUrl }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            contentFit="cover"
                        />
                    ) : (
                        <Box className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center">
                            <User size={20} color="#9ca3af" />
                        </Box>
                    )}

                    <Text className="text-white font-bold text-lg">{item.username}</Text>
                </HStack>
            )}
        </Pressable>
    );

    return (
        <Box className="flex-1 bg-black">
            <ImageBackground
                source={require('../src/assets/images/apex-wallpaper.jpg')}
                style={{ flex: 1 }}
                resizeMode="cover"
                imageStyle={{ opacity: 0.3 }}
            >
                {/* Header */}
                <Box className="pt-12 pb-4 px-6 bg-black/70">
                    <HStack className="items-center">
                        <Pressable onPress={() => router.back()} className="mr-4 p-1">
                            {(props: { pressed: boolean }) => (
                                <Box
                                    style={{
                                        opacity: props.pressed ? 0.5 : 1.0,
                                    }}
                                >
                                    <ArrowLeft color="white" />
                                </Box>
                            )}
                        </Pressable>
                        <Heading size="xl" className="text-white">{title}</Heading>
                    </HStack>
                </Box>

                {/* Lista */}
                <Box className="flex-1 px-4 pt-4">
                    {loadingUserList ? (
                        <Box className="flex-1 justify-center items-center">
                            <Spinner size="large" color="#ef4444" />
                        </Box>
                    ) : (
                        <FlatList
                            data={userList}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.uid}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            ListEmptyComponent={
                                <Text className="text-gray-400 text-center mt-10">
                                    Nenhum usuário encontrado.
                                </Text>
                            }
                        />
                    )}
                </Box>
            </ImageBackground>
        </Box>
    );
}
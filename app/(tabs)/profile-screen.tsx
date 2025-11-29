import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { useSetupStore } from '@/src/stores/setupStore';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, Save, X, ArrowLeft, UserPlus, UserCheck, User } from 'lucide-react-native';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { useAuth } from '@/src/hooks/use-auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/services/firebaseConfig';
import AppAlertDialog from '@/src/components/dialogs/AppAlertDialog';
import { HStack } from '@/components/ui/hstack';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import StarRatingDisplay from '@/src/components/display/StarRatingDisplay';
import { Star } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAuth();

  const userProfile = useSetupStore(state => state.userProfile);
  const loadingProfile = useSetupStore(state => state.loadingProfile);
  const uploadProfilePicture = useSetupStore(state => state.uploadProfilePicture);

  const viewedUserProfile = useSetupStore(state => state.viewedUserProfile);
  const loadingViewedProfile = useSetupStore(state => state.loadingViewedProfile);
  const fetchUserProfile = useSetupStore(state => state.fetchUserProfile);
  const isFollowing = useSetupStore(state => state.isFollowing);
  const checkIfFollowing = useSetupStore(state => state.checkIfFollowing);
  const followUser = useSetupStore(state => state.followUser);
  const unfollowUser = useSetupStore(state => state.unfollowUser);

  const fetchUserStats = useSetupStore(state => state.fetchUserStats);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); 

  const [username, setUsername] = useState('');
  const [gamertagPSN, setGamertagPSN] = useState('');
  const [gamertagXbox, setGamertagXbox] = useState('');
  const [gamertagPC, setGamertagPC] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const isMyProfile = !params.userId || params.userId === user?.uid;

  const profileToDisplay = isMyProfile ? userProfile : viewedUserProfile;

  useFocusEffect(
    useCallback(() => {
      if (!isMyProfile && params.userId) {
        fetchUserProfile(params.userId);
        checkIfFollowing(params.userId);
        fetchUserStats(params.userId);
      }
      else if (isMyProfile && user?.uid) {
        fetchUserStats(user.uid);
      }
    }, [params.userId, isMyProfile, user?.uid]) 
  );

  useEffect(() => {
    if (isMyProfile && userProfile) {
      setGamertagPSN(userProfile.gamertagPSN || '');
      setGamertagXbox(userProfile.gamertagXbox || '');
      setGamertagPC(userProfile.gamertagPC || '');
      setUsername(userProfile.username || '');
    }
  }, [userProfile, isMyProfile]);

  const handleFollowToggle = async () => {
    if (!profileToDisplay?.uid) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileToDisplay.uid);
      } else {
        await followUser(profileToDisplay.uid);
      }
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Não foi possível atualizar o seguidor.");
      setShowAlert(true);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (!isMyProfile) return; 

    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
      alert("Precisamos de permissão para acessar sua galeria.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, 
    });

    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setIsUploading(true);
      try {
        await uploadProfilePicture(uri);
      } catch (error) {
        console.error(error);
        alert("Erro ao fazer upload da imagem.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: username, // Salva o novo username
        gamertagPSN: gamertagPSN,
        gamertagXbox: gamertagXbox,
        gamertagPC: gamertagPC,
      });
      setIsEditing(false);
      setAlertTitle("Sucesso");
      setAlertMessage("Seu perfil foi atualizado.");
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setAlertTitle("Erro");
      setAlertMessage("Não foi possível salvar seu perfil.");
      setShowAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setUsername(userProfile.username || ''); // Reseta o username
      setGamertagPSN(userProfile.gamertagPSN || '');
      setGamertagXbox(userProfile.gamertagXbox || '');
      setGamertagPC(userProfile.gamertagPC || '');
    }
    setIsEditing(false);
  };

  if (loadingProfile || (!isMyProfile && loadingViewedProfile)) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-900">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!profileToDisplay) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-900 p-4">
        <Text className="text-white text-center">Perfil não encontrado.</Text>
        {isMyProfile && <Text className="text-gray-400 text-center mt-2">Tente fazer logout e login novamente.</Text>}
        {!isMyProfile && (
          <Button variant="outline" onPress={() => router.back()} className="mt-4">
            <ButtonText className="text-white">Voltar</ButtonText>
          </Button>
        )}
      </Box>
    );
  }

  const profileImageSource = profileToDisplay.profilePictureUrl
    ? { uri: profileToDisplay.profilePictureUrl }
    : require('@/src/assets/images/apex-logo-dark.png');

  return (
    <Box className="flex-1 items-center bg-gray-900">
      {!isMyProfile && (
        <Box className="w-full pt-12 px-6 pb-2">
          <Pressable onPress={() => router.back()} className="p-2 bg-gray-800 rounded-full self-start">
            <ArrowLeft color="white" size={24} />
          </Pressable>
        </Box>
      )}

      <ScrollView className="w-full">
        <VStack className={`pb-10 items-center ${isMyProfile ? 'pt-20' : 'pt-4'}`} space="xl">

          {/* Avatar */}
          <Box className="items-center">
            <Image
              source={profileImageSource}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#262626', borderWidth: 2, borderColor: '#ef4444' }}
              contentFit="cover"
            />
            {isMyProfile && (
              <Pressable
                className="absolute -bottom-2 -right-2 bg-red-600 p-3 rounded-full border-4 border-gray-900"
                onPress={handlePickImage}
                disabled={isUploading}
              >
                {isUploading ? <Spinner size="small" color="$white" /> : <Camera size={20} color="white" />}
              </Pressable>
            )}
          </Box>

          {/* Nome e Email (Com edição condicional) */}
          <VStack className="items-center w-full px-10">
            {isMyProfile && isEditing ? (
               // Input de edição de nome
               <Input className="bg-gray-800/80 border-gray-700 mb-1 mt-4 w-1/2 text-center">
                  <InputField 
                    value={username} 
                    onChangeText={setUsername} 
                    className="text-white text-center text-xl font-bold"
                    placeholder="Seu Nome" 
                  />
               </Input>
            ) : (
               // Exibição normal
               <Heading size="2xl" className="text-white mt-6 text-center">
                 {profileToDisplay.username}
               </Heading>
            )}
            <Text className="text-gray-400">{profileToDisplay.email}</Text>
          </VStack>

          {/* --- ESTATÍSTICAS SOCIAIS --- */}
          <HStack space="2xl" className="mb-2">
            <Pressable
              onPress={() => router.push({
                pathname: '/user-list-screen',
                params: { userId: profileToDisplay?.uid, type: 'followers' }
              })}
            >
              {({ pressed }) => (
                <VStack className={`items-center ${pressed ? 'opacity-60' : 'opacity-100'}`}>
                  <Text className="text-white font-bold text-xl">{profileToDisplay?.followersCount || 0}</Text>
                  <Text className="text-gray-500 text-xs uppercase">Seguidores</Text>
                </VStack>
              )}
            </Pressable>

            <Box className="w-px h-full bg-gray-700" />

            <Pressable
              onPress={() => router.push({
                pathname: '/user-list-screen',
                params: { userId: profileToDisplay?.uid, type: 'following' }
              })}
            >
              {({ pressed }) => (
                <VStack className={`items-center ${pressed ? 'opacity-60' : 'opacity-100'}`}>
                  <Text className="text-white font-bold text-xl">{profileToDisplay?.followingCount || 0}</Text>
                  <Text className="text-gray-500 text-xs uppercase">Seguindo</Text>
                </VStack>
              )}
            </Pressable>
          </HStack>

          {/* --- BOTÕES DE AÇÃO PRINCIPAL --- */}
          <Box className="w-full px-6 mb-2">
            {isMyProfile ? (
              isEditing ? (
                <HStack space="md">
                  <Button variant="outline" action="secondary" onPress={handleCancelEdit} className="flex-1">
                    <X size={18} color="white" />
                    <ButtonText className="text-white ml-2">Cancelar</ButtonText>
                  </Button>
                  <Button action="positive" onPress={handleSaveChanges} disabled={isSaving} className="flex-1">
                    <Save size={18} color="white" />
                    <ButtonText className="ml-2">{isSaving ? 'Salvando...' : 'Salvar'}</ButtonText>
                  </Button>
                </HStack>
              ) : (
                <Button action="secondary" variant="outline" onPress={() => setIsEditing(true)}>
                  <ButtonText className="text-white">Editar Perfil</ButtonText>
                </Button>
              )
            ) : (
              <Button
                className={`w-full rounded-xl ${isFollowing ? 'bg-gray-700' : 'bg-red-600'}`}
                onPress={handleFollowToggle}
                isDisabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    {isFollowing ? <UserCheck size={18} color="white" className="mr-2" /> : <UserPlus size={18} color="white" className="mr-2" />}
                    <ButtonText className="text-white font-bold ml-2">{isFollowing ? "Seguindo" : "Seguir"}</ButtonText>
                  </>
                )}
              </Button>
            )}
          </Box>

          {/* Seção de Gamertags (Leitura ou Edição) */}
          <VStack className="w-full px-6" space="md">
            <Heading size="md" className="text-white">Gamertags</Heading>

            {isMyProfile && isEditing ? (
              <>
                <Input className="bg-gray-800/80 border-gray-700">
                  <InputField placeholder="ID da PlayStation" value={gamertagPSN} onChangeText={setGamertagPSN} className="text-white" />
                </Input>
                <Input className="bg-gray-800/80 border-gray-700">
                  <InputField placeholder="Gamertag do Xbox" value={gamertagXbox} onChangeText={setGamertagXbox} className="text-white" />
                </Input>
                <Input className="bg-gray-800/80 border-gray-700">
                  <InputField placeholder="ID do PC (Steam/EA)" value={gamertagPC} onChangeText={setGamertagPC} className="text-white" />
                </Input>
              </>
            ) : (
              <Box className="bg-gray-800/80 rounded-lg p-4">
                <VStack space="md">
                  <Text className="text-gray-400">PlayStation: <Text className="text-white">{profileToDisplay.gamertagPSN || 'N/A'}</Text></Text>
                  <Text className="text-gray-400">Xbox: <Text className="text-white">{profileToDisplay.gamertagXbox || 'N/A'}</Text></Text>
                  <Text className="text-gray-400">PC: <Text className="text-white">{profileToDisplay.gamertagPC || 'N/A'}</Text></Text>
                </VStack>
              </Box>
            )}
          </VStack>

          <VStack className="w-full px-6" space="md">
            <Heading size="md" className="text-white">Estatísticas da Comunidade</Heading>
            
            {/* LINHA 1: SETUPS e PASTAS */}
            <HStack space="md">
              
              {/* Card: Setups */}
              <Pressable 
                className="flex-1"
                onPress={() => {
                    // Só navega se tiver setups (> 0)
                    if ((profileToDisplay.setupsCount || 0) > 0) {
                        router.push({
                            pathname: '/user-content-screen',
                            params: { 
                                userId: profileToDisplay.uid, 
                                userName: profileToDisplay.username,
                                type: 'setups' 
                            }
                        });
                    }
                }}
              >
                {({pressed}) => (
                    <Box className={`bg-gray-800/80 p-4 rounded-xl border border-gray-700 items-center justify-center ${pressed ? 'opacity-70' : 'opacity-100'}`}>
                        <Text className="text-3xl font-bold text-white mb-1">
                        {profileToDisplay.setupsCount || 0}
                        </Text>
                        <Text className="text-gray-400 text-xs text-center uppercase">Setups Públicos</Text>
                    </Box>
                )}
              </Pressable>

              {/* Card: Pastas (NOVO) */}
              <Pressable 
                className="flex-1"
                onPress={() => {
                    if ((profileToDisplay.foldersCount || 0) > 0) {
                        router.push({
                            pathname: '/user-content-screen',
                            params: { 
                                userId: profileToDisplay.uid, 
                                userName: profileToDisplay.username,
                                type: 'folders' 
                            }
                        });
                    }
                }}
              >
                {({pressed}) => (
                    <Box className={`bg-gray-800/80 p-4 rounded-xl border border-gray-700 items-center justify-center ${pressed ? 'opacity-70' : 'opacity-100'}`}>
                        <Text className="text-3xl font-bold text-white mb-1">
                        {profileToDisplay.foldersCount || 0}
                        </Text>
                        <Text className="text-gray-400 text-xs text-center uppercase">Pastas Públicas</Text>
                    </Box>
                )}
              </Pressable>
            </HStack>

            {/* LINHA 2: MÉDIA DE AVALIAÇÃO (Full Width) */}
            <Box className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 items-center justify-center">
                <HStack className="items-center mb-1" space="xs">
                  <Text className="text-3xl font-bold text-white">
                    {(profileToDisplay.averageRating || 0).toFixed(1)}
                  </Text>
                  <Star size={24} color="#f59e0b" fill="#f59e0b" />
                </HStack>
                
                <Box className="mt-1">
                   <StarRatingDisplay 
                      rating={profileToDisplay.averageRating || 0} 
                      size={16} 
                   />
                </Box>
                <Text className="text-gray-400 text-xs text-center uppercase mt-2">Média Geral de Avaliações</Text>
            </Box>

          </VStack>

        </VStack>
      </ScrollView>

      <AppAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import { Box } from '../../components/ui/box';
import { Heading } from '../../components/ui/heading';
import { Text } from '../../components/ui/text';
import { Spinner } from '../../components/ui/spinner';
import { Button, ButtonText } from '../../components/ui/button';
import { Pressable } from '../../components/ui/pressable';
import { useSetupStore } from '../../src/stores/setupStore';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, Save, X } from 'lucide-react-native';
import { ScrollView } from '../../components/ui/scroll-view';
import { VStack } from '../../components/ui/vstack';
import { Input, InputField } from '../../components/ui/input';
import { useAuth } from '../../src/hooks/use-auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import AppAlertDialog from '../../src/components/dialogs/AppAlertDialog';
import { HStack } from '@/components/ui/hstack';

export default function ProfileScreen() {
  // Pega o perfil da store
  const userProfile = useSetupStore(state => state.userProfile);
  const loadingProfile = useSetupStore(state => state.loadingProfile);
  const uploadProfilePicture = useSetupStore(state => state.uploadProfilePicture);
  const { user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar o modo de edição
  const [isSaving, setIsSaving] = useState(false);

  const [gamertagPSN, setGamertagPSN] = useState('');
  const [gamertagXbox, setGamertagXbox] = useState('');
  const [gamertagPC, setGamertagPC] = useState('');

  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Preenche os campos quando o perfil é carregado
  useEffect(() => {
    if (userProfile) {
      setGamertagPSN(userProfile.gamertagPSN || '');
      setGamertagXbox(userProfile.gamertagXbox || '');
      setGamertagPC(userProfile.gamertagPC || '');
    }
  }, [userProfile]);

  // Função para pedir permissão e abrir o seletor de imagem
  const handlePickImage = async () => {
    // Pede permissão para a galeria (hardware)
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryPermission.status !== 'granted') {
      alert("Precisamos de permissão para acessar sua galeria.");
      return;
    }

    // Pede permissão para a câmera (hardware)
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      alert("Precisamos de permissão para acessar sua câmera.");
      return;
    }

    // Lança a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1], // Força uma imagem quadrada
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

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

  // --- FUNÇÃO PARA SALVAR GAMERTAGS ---
  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        gamertagPSN: gamertagPSN,
        gamertagXbox: gamertagXbox,
        gamertagPC: gamertagPC,
      });
      setIsEditing(false); // Sai do modo de edição
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
    // Restaura os valores originais
    if (userProfile) {
      setGamertagPSN(userProfile.gamertagPSN || '');
      setGamertagXbox(userProfile.gamertagXbox || '');
      setGamertagPC(userProfile.gamertagPC || '');
    }
    setIsEditing(false);
  };

  if (loadingProfile) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-900">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box className="flex-1 justify-center items-center bg-gray-900 p-4">
        <Text className="text-white text-center">Não foi possível carregar seu perfil.</Text>
        <Text className="text-gray-400 text-center mt-2">Tente fazer logout e login novamente.</Text>
      </Box>
    );
  }

  // Define a imagem de perfil (placeholder ou a do usuário)
  const profileImageSource = userProfile.profilePictureUrl
    ? { uri: userProfile.profilePictureUrl }
    : require('../../src/assets/images/apex-logo-dark.png'); // Use seu logo como placeholder

  return (
    <Box className="flex-1 items-center bg-gray-900 pt-20">
      <ScrollView>
        <VStack className="pt-20 pb-10 items-center" space="xl">
          {/* Avatar e Botão de Edição */}
          <Box className="items-center">
            <Image
              source={profileImageSource}
              style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#262626' }}
              contentFit="cover"
            />
            <Pressable
              className="absolute -bottom-2 -right-2 bg-red-600 p-3 rounded-full border-4 border-gray-900"
              onPress={handlePickImage}
              disabled={isUploading}
            >
              {isUploading ? <Spinner size="small" color="$white" /> : <Camera size={20} color="white" />}
            </Pressable>
          </Box>

          {/* Nome de Usuário */}
          <VStack className="items-center">
            <Heading size="2xl" className="text-white mt-6">
              {userProfile.username}
            </Heading>
            <Text className="text-gray-400">{userProfile.email}</Text>
          </VStack>

          <Box className="w-full px-6">
            {isEditing ? (
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
              <Button action="primary" variant="outline" onPress={() => setIsEditing(true)}>
                <ButtonText>Editar Gamertags</ButtonText>
              </Button>
            )}
          </Box>

          {/* --- NOVA SEÇÃO DE GAMERTAGS --- */}
          <VStack className="w-full px-6" space="md">
            <Heading size="md" className="text-white">Gamertags</Heading>
            {isEditing ? (
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
                  <Text className="text-gray-400">PlayStation: <Text className="text-white">{userProfile.gamertagPSN || 'N/A'}</Text></Text>
                  <Text className="text-gray-400">Xbox: <Text className="text-white">{userProfile.gamertagXbox || 'N/A'}</Text></Text>
                  <Text className="text-gray-400">PC: <Text className="text-white">{userProfile.gamertagPC || 'N/A'}</Text></Text>
                </VStack>
              </Box>
            )}
          </VStack>

          {/* --- PLACEHOLDERS PARA FASE 2/3 --- */}
          <VStack className="w-full px-6" space="md">
            <Heading size="md" className="text-white">Estatísticas</Heading>
            <Box className="bg-gray-800/80 rounded-lg p-4 items-center">
              <Text className="text-gray-400">(Em breve: Setups publicados, Média de avaliação)</Text>
            </Box>
          </VStack>

          <VStack className="w-full px-6" space="md">
            <Heading size="md" className="text-white">Meus Setups Publicados</Heading>
            <Box className="bg-gray-800/80 rounded-lg p-4 items-center">
              <Text className="text-gray-400">(Em breve: Lista dos seus setups públicos)</Text>
            </Box>
          </VStack>

        </VStack>
      </ScrollView>

      {/* Alerta para feedback de salvamento */}
      <AppAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </Box>
  );
}
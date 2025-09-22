import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { Pressable } from '../../components/ui/pressable';
import { FlatList } from '../../components/ui/flat-list';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';

type MainStackParamList = {
  Home: undefined;
  SetupDetails: { setupId: string };
  CreateSetup: { setupId?: string };
};

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface Setup {
  id: string;
  setupTitle: string;
  car: string;
  track: string;
  controlType: string;
  condition: string;
  frontWing: number;
  rearWing: number;
  createdAt: string;
  updatedAt: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSetups = async () => {
    try {
      setLoading(true);
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const parsedSetups = JSON.parse(storedSetups);
        setSetups(parsedSetups);
      } else {
        setSetups([]);
      }
    } catch (error) {
      console.error('Erro ao carregar setups:', error);
      showAlertDialog('Não foi possível carregar os setups');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSetups();
    }, [])
  );

  const showAlertDialog = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleDeleteSetup = async (setupId: string) => {
    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const setups = JSON.parse(storedSetups);
        const updatedSetups = setups.filter((s: any) => s.id !== setupId);
        await AsyncStorage.setItem('setups', JSON.stringify(updatedSetups));
        setSetups(updatedSetups);
      }
    } catch (error) {
      console.error('Erro ao deletar setup:', error);
      showAlertDialog('Não foi possível deletar o setup');
    }
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.removeItem('setups');
      setSetups([]);
      showAlertDialog('Dados limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      showAlertDialog('Erro ao limpar dados');
    }
  };

  const renderSetupItem = ({ item }: { item: Setup }) => (
    <Box className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md shadow-red-500">
      <HStack className="justify-between items-start mb-3">
        <Text size="lg" className="font-bold">{item.setupTitle}</Text>
        <HStack space="sm">
          <Pressable
            className="w-8 h-8 items-center justify-center"
            onPress={() => navigation.navigate('SetupDetails', { setupId: item.id })}
          >
            <Text size="lg">✏️</Text>
          </Pressable>
          <Pressable
            className="w-8 h-8 items-center justify-center"
            onPress={() => handleDeleteSetup(item.id)}
          >
            <Text size="lg">🗑️</Text>
          </Pressable>
        </HStack>
      </HStack>

      <VStack space="sm">
        <HStack className="items-center">
          <Text className="mr-2">🚗</Text>
          <Text>{item.car}</Text>
        </HStack>

        <HStack className="items-center">
          <Text className="mr-2">📍</Text>
          <Text>{item.track}</Text>
        </HStack>

        <HStack className="items-center">
          <Text className="mr-2">🎮</Text>
          <Text size="sm">{item.controlType}</Text>
        </HStack>

        <HStack className="items-center">
          <Text className="mr-2">🌤️</Text>
          <Text size="sm">{item.condition}</Text>
        </HStack>

        <HStack className="items-center justify-between">
          <Text size="sm">
            Criado: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
          <Text size="sm">
            Atualizado: {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-8 pb-5 px-6">
        <LinearGradient
          colors={['#000000', '#434343']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 130,
          }}
        >
          <HStack className="items-center mt-2 mb-2">
            <Text size="2xl" className="mr-3">🏆</Text>
            <Heading size="2xl" className="text-white">F1 Setup Manager</Heading>
          </HStack>
        <Pressable
          className="absolute top-12 right-6"
          onPress={handleClearData}
        >
          <Text size="sm">Limpar Dados</Text>
        </Pressable>
        </LinearGradient>
      </Box>

      {/* Main Content */}
      <Box className="flex-1 px-6 pt-6">
        <Heading size="xl" className="mb-2">Meus Setups</Heading>
        <Text className="mb-6">{setups.length} setup{setups.length !== 1 ? 's' : ''} cadastrado{setups.length !== 1 ? 's' : ''}</Text>

        <FlatList
          data={setups}
          renderItem={renderSetupItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Box className="items-center py-12">
              <Text size="lg" className="mb-2">Nenhum setup cadastrado</Text>
              <Text className="text-center">
                Toque no botão + para criar seu primeiro setup
              </Text>
            </Box>
          }
        />
      </Box>

      {/* Floating Action Button */}
      <Pressable
        className="absolute bottom-6 bg-red-500 right-6 font-bold w-14 h-14 rounded-full items-center justify-center"
        onPress={() => navigation.navigate('CreateSetup', {})}
      >
        <Text size="2xl">+</Text>
      </Pressable>

      <AlertDialog isOpen={showAlert} onClose={() => setShowAlert(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading>Erro</Heading>
            <AlertDialogCloseButton />
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>{alertMessage}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onPress={() => setShowAlert(false)}>
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box >
  );
};

export default HomeScreen;

import { StackNavigationProp } from '@react-navigation/stack';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useAuth } from '../hooks/use-auth';
import { db } from '../services/firebaseConfig';
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
  CreateSetup: undefined;
  SetupDetails: { setupId: string };
};

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface Setup {
  id: string;
  name: string;
  car: string;
  track: string;
  controlType: string;
  frontWing: number;
  rearWing: number;
  createdAt: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { user, signOut } = useAuth();
  
  // Animation values
  const floatAnimation = useSharedValue(0);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'setups'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const setupsData: Setup[] = [];
      querySnapshot.forEach((doc) => {
        setupsData.push({ id: doc.id, ...doc.data() } as Setup);
      });
      setSetups(setupsData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Start floating animation
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const showAlertDialog = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleDeleteSetup = async (setupId: string) => {
    try {
      await deleteDoc(doc(db, 'setups', setupId));
    } catch (error) {
      console.error('Erro ao deletar setup:', error);
      showAlertDialog('Não foi possível deletar o setup');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Animated style for floating button
  const animatedFloatingButton = useAnimatedStyle(() => {
    const translateY = interpolate(floatAnimation.value, [0, 1], [0, -8]);
    return {
      transform: [{ translateY }],
    };
  });

  const renderSetupItem = ({ item }: { item: Setup }) => (
    <Box className="rounded-xl p-4 mb-4">
      <HStack className="justify-between items-start mb-3">
        <Text size="lg" className="font-bold">{item.name}</Text>
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
        
        <HStack className="items-center justify-between">
          <HStack className="items-center">
            <Text className="mr-2">🎮</Text>
            <Box className="rounded-full px-3 py-1">
              <Text size="sm">{item.controlType}</Text>
            </Box>
          </HStack>
          <Text size="sm">
            {item.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
          </Text>
        </HStack>
        
        <HStack className="justify-between mt-3">
          <HStack className="items-center">
            <Text className="mr-2">Asa Diant.</Text>
            <Text className="font-bold">{item.frontWing}</Text>
          </HStack>
          <HStack className="items-center">
            <Text className="mr-2">Asa Tras.</Text>
            <Text className="font-bold">{item.rearWing}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-12 pb-6 px-6">
        <HStack className="items-center mb-2">
          <Text size="2xl" className="mr-3">🏆</Text>
          <Heading size="2xl">F1 Setup Manager</Heading>
        </HStack>
        <Text>Gerencie seus setups da F1 24</Text>
        
        <Pressable 
          className="absolute top-12 right-6"
          onPress={handleSignOut}
        >
          <Text size="sm">Sair</Text>
        </Pressable>
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
      <Animated.View style={[animatedFloatingButton]}>
        <Pressable
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
          onPress={() => navigation.navigate('CreateSetup')}
        >
          <Text size="2xl">+</Text>
        </Pressable>
      </Animated.View>

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
    </Box>
  );
};

export default HomeScreen;

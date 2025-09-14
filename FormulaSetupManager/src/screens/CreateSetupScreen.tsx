import { StackNavigationProp } from '@react-navigation/stack';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { db } from '../services/firebaseConfig';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Input, InputField } from '../../components/ui/input';
import { Button, ButtonText } from '../../components/ui/button';
import { ScrollView } from '../../components/ui/scroll-view';
import { Pressable } from '../../components/ui/pressable';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';
import { Textarea, TextareaInput } from '../../components/ui/textarea';

type MainStackParamList = {
  Home: undefined;
  CreateSetup: undefined;
  SetupDetails: { setupId: string };
  Aerodynamics: { setupId?: string };
};

type CreateSetupScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateSetup'>;

interface Props {
  navigation: CreateSetupScreenNavigationProp;
}

const CreateSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [setupName, setSetupName] = useState('');
  const [controlType, setControlType] = useState('Controle');
  const [car, setCar] = useState('');
  const [track, setTrack] = useState('');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertActions, setAlertActions] = useState<Array<{text: string, onPress: () => void}>>([]);
  const { user } = useAuth();

  const showAlertDialog = (title: string, message: string, actions?: Array<{text: string, onPress: () => void}>) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertActions(actions || [{text: 'OK', onPress: () => setShowAlert(false)}]);
    setShowAlert(true);
  };

  const handleSaveSetup = async () => {
    if (!setupName.trim()) {
      showAlertDialog('Erro', 'Por favor, informe o nome do setup');
      return;
    }

    if (!car.trim()) {
      showAlertDialog('Erro', 'Por favor, selecione um carro');
      return;
    }

    if (!track.trim()) {
      showAlertDialog('Erro', 'Por favor, selecione uma pista');
      return;
    }

    if (!user) {
      showAlertDialog('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'setups'), {
        name: setupName,
        controlType,
        car,
        track,
        observations,
        frontWing: 5,
        rearWing: 5,
        frontSuspension: 5,
        rearSuspension: 5,
        frontTirePressure: 23,
        rearTirePressure: 23,
        brakePressure: 80,
        brakeBalance: 56,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      showAlertDialog(
        'Sucesso', 
        'Setup criado com sucesso!',
        [
          {
            text: 'Configurar Setup',
            onPress: () => {
              setShowAlert(false);
              navigation.navigate('Aerodynamics', { setupId: docRef.id });
            }
          },
          {
            text: 'Voltar',
            onPress: () => {
              setShowAlert(false);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar setup:', error);
      showAlertDialog('Erro', 'Não foi possível criar o setup');
    } finally {
      setLoading(false);
    }
  };

  const cars = [
    'Red Bull Racing RB20',
    'Ferrari SF-24',
    'McLaren MCL38',
    'Mercedes W15',
    'Aston Martin AMR24',
    'Alpine A524',
    'Williams FW46',
    'Visa Cash App RB VCARB 01',
    'Kick Sauber C44',
    'Haas VF-24'
  ];

  const tracks = [
    'Bahrain International Circuit',
    'Saudi Arabian Grand Prix',
    'Australian Grand Prix',
    'Japanese Grand Prix',
    'Chinese Grand Prix',
    'Shanghai International Circuit',
    'Miami International Autodrome',
    'Imola Circuit',
    'Monaco Grand Prix',
    'Canadian Grand Prix',
    'Spanish Grand Prix',
    'Austrian Grand Prix',
    'British Grand Prix',
    'Hungarian Grand Prix',
    'Belgian Grand Prix',
    'Dutch Grand Prix',
    'Italian Grand Prix',
    'Azerbaijan Grand Prix',
    'Singapore Grand Prix',
    'United States Grand Prix',
    'Mexican Grand Prix',
    'Brazilian Grand Prix',
    'Las Vegas Grand Prix',
    'Qatar Grand Prix',
    'Abu Dhabi Grand Prix'
  ];

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-12 pb-4 px-6">
        <HStack className="items-center justify-between">
          <Heading size="xl">Novo Setup</Heading>
          <Pressable onPress={() => navigation.goBack()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 p-6">
        {/* Basic Information Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="xl" className="mb-6">Informações Básicas</Heading>
          
          <VStack space="md">
            {/* Setup Name */}
            <Box>
              <Text className="font-medium mb-2">Nome do Setup</Text>
              <Input>
                <InputField
                  placeholder="Ex: Monaco Qualificação"
                  value={setupName}
                  onChangeText={setSetupName}
                />
              </Input>
            </Box>

            {/* Control Type */}
            <Box>
              <Text className="font-medium mb-2">Tipo de Controle</Text>
              <Box className="border rounded-lg px-4 py-3">
                <Text>{controlType}</Text>
              </Box>
            </Box>

            {/* Car Selection */}
            <Box>
              <Text className="font-medium mb-2">Carro</Text>
              <Box className="border rounded-lg px-4 py-3">
                <Text>
                  {car || "Selecione o carro"}
                </Text>
              </Box>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                <HStack space="sm">
                  {cars.map((carName, index) => (
                    <Pressable
                      key={index}
                      className={car === carName ? 'px-3 py-1 rounded-full bg-red-600' : 'px-3 py-1 rounded-full bg-gray-200'}
                      onPress={() => setCar(carName)}
                    >
                      <Text size="sm">
                        {carName.split(' ')[0]}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </Box>

            {/* Track Selection */}
            <Box>
              <Text className="font-medium mb-2">Pista</Text>
              <Box className="border rounded-lg px-4 py-3">
                <Text>
                  {track || "Selecione a pista"}
                </Text>
              </Box>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                <HStack space="sm">
                  {tracks.map((trackName, index) => (
                    <Pressable
                      key={index}
                      className={track === trackName ? 'px-3 py-1 rounded-full bg-red-600' : 'px-3 py-1 rounded-full bg-gray-200'}
                      onPress={() => setTrack(trackName)}
                    >
                      <Text size="sm">
                        {trackName.split(' ')[0]}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </Box>

            {/* Observations */}
            <Box>
              <Text className="font-medium mb-2">Observações</Text>
              <Textarea>
                <TextareaInput
                  placeholder="Notas sobre o setup, condições de pista, etc..."
                  value={observations}
                  onChangeText={setObservations}
                />
              </Textarea>
            </Box>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack space="md" className="mb-6">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => navigation.goBack()}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          
          <Button
            className="flex-1"
            onPress={handleSaveSetup}
            disabled={loading}
          >
            <ButtonText>
              {loading ? 'Salvando...' : 'Salvar Setup'}
            </ButtonText>
          </Button>
        </HStack>
      </ScrollView>

      <AlertDialog isOpen={showAlert} onClose={() => setShowAlert(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading>{alertTitle}</Heading>
            <AlertDialogCloseButton />
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>{alertMessage}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack space="sm">
              {alertActions.map((action, index) => (
                <Button key={index} onPress={action.onPress}>
                  <ButtonText>{action.text}</ButtonText>
                </Button>
              ))}
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default CreateSetupScreen;

import { StackNavigationProp } from '@react-navigation/stack';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { ScrollView } from '../../components/ui/scroll-view';
import { Pressable } from '../../components/ui/pressable';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';
import { Divider } from '../../components/ui/divider';

type MainStackParamList = {
  Home: undefined;
  CreateSetup: undefined;
  SetupDetails: { setupId: string };
  Aerodynamics: { setupId?: string };
  Suspension: { setupId?: string };
  TiresBrakes: { setupId?: string };
};

type SetupDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SetupDetails'>;

interface Props {
  navigation: SetupDetailsScreenNavigationProp;
  route: {
    params: {
      setupId: string;
    };
  };
}

interface SetupData {
  id: string;
  name: string;
  car: string;
  track: string;
  controlType: string;
  frontWing: number;
  rearWing: number;
  frontSuspension: number;
  rearSuspension: number;
  frontTirePressure: number;
  rearTirePressure: number;
  brakePressure: number;
  brakeBalance: number;
  observations: string;
  createdAt: any;
}

const SetupDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { setupId } = route.params;
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertActions, setAlertActions] = useState<Array<{text: string, onPress: () => void}>>([]);

  useEffect(() => {
    loadSetupData();
  }, [setupId]);

  const showAlertDialog = (title: string, message: string, actions?: Array<{text: string, onPress: () => void}>) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertActions(actions || [{text: 'OK', onPress: () => setShowAlert(false)}]);
    setShowAlert(true);
  };

  const loadSetupData = async () => {
    try {
      const docRef = doc(db, 'setups', setupId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSetup({ id: docSnap.id, ...docSnap.data() } as SetupData);
      } else {
        showAlertDialog('Erro', 'Setup não encontrado', [{
          text: 'OK',
          onPress: () => {
            setShowAlert(false);
            navigation.goBack();
          }
        }]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do setup:', error);
      showAlertDialog('Erro', 'Não foi possível carregar o setup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    showAlertDialog(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este setup?',
      [
        { 
          text: 'Cancelar', 
          onPress: () => setShowAlert(false)
        },
        {
          text: 'Excluir',
          onPress: async () => {
            setShowAlert(false);
            try {
              await deleteDoc(doc(db, 'setups', setupId));
              showAlertDialog('Sucesso', 'Setup excluído com sucesso!', [{
                text: 'OK',
                onPress: () => {
                  setShowAlert(false);
                  navigation.goBack();
                }
              }]);
            } catch (error) {
              console.error('Erro ao excluir setup:', error);
              showAlertDialog('Erro', 'Não foi possível excluir o setup');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Carregando...</Text>
      </Box>
    );
  }

  if (!setup) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Setup não encontrado</Text>
      </Box>
    );
  }

  const DetailRow = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
    <Box>
      <HStack className="items-center justify-between py-3">
        <HStack className="items-center">
          <Text className="mr-3">{icon}</Text>
          <Text>{label}</Text>
        </HStack>
        <Text className="font-medium">{value}</Text>
      </HStack>
      <Divider />
    </Box>
  );

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-12 pb-4 px-6">
        <HStack className="items-center justify-between">
          <Heading size="xl">Detalhes do Setup</Heading>
          <Pressable onPress={() => navigation.goBack()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 p-6">
        {/* Basic Info Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="xl" className="mb-4">{setup.name}</Heading>
          
          <DetailRow label={setup.car} value="" icon="🚗" />
          <DetailRow label={setup.track} value="" icon="📍" />
          <DetailRow label={setup.controlType} value="" icon="🎮" />
          <DetailRow 
            label="Criado em" 
            value={setup.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'} 
            icon="📅" 
          />
        </Box>

        {/* Aerodynamics Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="xl" className="mb-4">Aerodinâmica</Heading>
          
          <DetailRow label="Asa Dianteira" value={setup.frontWing} icon="🏎️" />
          <DetailRow label="Asa Traseira" value={setup.rearWing} icon="🏎️" />
        </Box>

        {/* Suspension Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="xl" className="mb-4">Suspensão</Heading>
          
          <DetailRow label="Suspensão Dianteira" value={setup.frontSuspension} icon="🔧" />
          <DetailRow label="Suspensão Traseira" value={setup.rearSuspension} icon="🔧" />
        </Box>

        {/* Tires and Brakes Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="xl" className="mb-4">Pneus e Freios</Heading>
          
          <DetailRow label="Pressão Pneus Dianteiros" value={`${setup.frontTirePressure} psi`} icon="🛞" />
          <DetailRow label="Pressão Pneus Traseiros" value={`${setup.rearTirePressure} psi`} icon="🛞" />
          <DetailRow label="Pressão dos Freios" value={`${setup.brakePressure}%`} icon="🛑" />
          <DetailRow label="Balanço dos Freios" value={`${setup.brakeBalance}%`} icon="⚖️" />
        </Box>

        {/* Observations Card */}
        {setup.observations && (
          <Box className="rounded-xl p-6 mb-6">
            <Heading size="xl" className="mb-4">Observações</Heading>
            <Text>{setup.observations}</Text>
          </Box>
        )}

        {/* Action Buttons */}
        <VStack space="md" className="mb-6">
          <HStack space="md">
            <Button
              className="flex-1"
              onPress={() => navigation.navigate('Aerodynamics', { setupId: setup.id })}
            >
              <ButtonText>Editar Aerodinâmica</ButtonText>
            </Button>
            
            <Button
              className="flex-1"
              onPress={() => navigation.navigate('Suspension', { setupId: setup.id })}
            >
              <ButtonText>Editar Suspensão</ButtonText>
            </Button>
          </HStack>

          <HStack space="md">
            <Button
              className="flex-1"
              onPress={() => navigation.navigate('TiresBrakes', { setupId: setup.id })}
            >
              <ButtonText>Editar Pneus e Freios</ButtonText>
            </Button>
            
            <Button
              className="flex-1"
              variant="destructive"
              onPress={handleDelete}
            >
              <ButtonText>Excluir Setup</ButtonText>
            </Button>
          </HStack>
        </VStack>
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

export default SetupDetailsScreen;

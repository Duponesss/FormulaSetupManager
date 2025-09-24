import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router'; 
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { ScrollView } from '../../components/ui/scroll-view';
import { Pressable } from '../../components/ui/pressable';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';
import { Divider } from '../../components/ui/divider';
import ConfirmationModal from '../components/dialogs/ConfirmationModal';
import CustomAlertDialog from '../components/dialogs/CustomAlertDialog';
import { useSingleTap } from '../hooks/useSingleTap';

type MainStackParamList = {
  index: undefined;
  'setup-details': { setupId: string };
  'create-setup': { setupId?: string };
};

type SetupDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'setup-details'>;

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
  setupTitle: string;
  car: string;
  track: string;
  controlType: string;
  condition: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  // Aerodinâmica
  frontWing: number;
  rearWing: number;
  // Transmissão
  differentialOnThrottle: number;
  differentialOffThrottle: number;
  engineBraking: number;
  // Geometria da Suspensão
  frontCamber: number;
  rearCamber: number;
  frontToe: number;
  rearToe: number;
  // Suspensão
  frontSuspension: number;
  rearSuspension: number;
  frontAntiRollBar: number;
  rearAntiRollBar: number;
  frontRideHeight: number;
  rearRideHeight: number;
  // Freios
  brakePressure: number;
  brakeBalance: number;
  // Pneus
  frontRightTirePressure: number;
  frontLeftTirePressure: number;
  rearRightTirePressure: number;
  rearLeftTirePressure: number;
}

const SetupDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const router = useRouter();
  const { setupId } = route.params;
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    loadSetupData();
  }, [setupId]);

  const loadSetupData = async () => {
    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const setups = JSON.parse(storedSetups);
        const foundSetup = setups.find((s: any) => s.id === setupId);
        if (foundSetup) {
          setSetup(foundSetup as SetupData);
        } else {
          // 3. USA O ESTADO DO NOSSO CUSTOM ALERT DIALOG
          setAlertTitle('Erro');
          setAlertMessage('Setup não encontrado.');
          setShowAlert(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do setup:', error);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível carregar o setup.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const setups = JSON.parse(storedSetups);
        const updatedSetups = setups.filter((s: any) => s.id !== setupId);
        await AsyncStorage.setItem('setups', JSON.stringify(updatedSetups));
      }
      // Após a exclusão bem-sucedida, volta para a tela anterior
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao excluir setup:', error);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível excluir o setup.');
      setShowAlert(true);
    }
  };

  const confirmDeletion = () => setShowDeleteModal(true); 
  
  const handleEditNavigation = () => {
    console.log('EDITANDO SETUP COM setupId:', setupId);
    router.push({ pathname: '/create-setup', params: { setupId } });
  };

  const debouncedHandleEdit = useSingleTap(handleEditNavigation);
  const debouncedConfirmDeletion = useSingleTap(confirmDeletion);

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
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="xl" className="mb-4 text-red-600">{setup.setupTitle}</Heading>

          <DetailRow label="Carro" value={setup.car} icon="🚗" />
          <DetailRow label="Circuito" value={setup.track} icon="📍" />
          <DetailRow label="Tipo de Controle" value={setup.controlType} icon="🎮" />
          <DetailRow label="Condições" value={setup.condition} icon="🌤️" />
          <DetailRow
            label="Criado em"
            value={new Date(setup.createdAt).toLocaleDateString('pt-BR')}
            icon="📅"
          />
          <DetailRow
            label="Atualizado em"
            value={new Date(setup.updatedAt).toLocaleDateString('pt-BR')}
            icon="🔄"
          />
        </Box>

        {/* Notes Card */}
        {setup.notes && (
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Observações</Heading>
            <Text>{setup.notes}</Text>
          </Box>
        )}

        {/* Aerodynamics Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Aerodinâmica</Heading>

          <DetailRow label="Asa Dianteira" value={setup.frontWing} icon="✈️" />
          <DetailRow label="Asa Traseira" value={setup.rearWing} icon="✈️" />
        </Box>

        {/* Transmission Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Transmissão</Heading>

          <DetailRow label="Diferencial com Aceleração" value={`${setup.differentialOnThrottle}%`} icon="⚙️" />
          <DetailRow label="Diferencial sem Aceleração" value={`${setup.differentialOffThrottle}%`} icon="⚙️" />
          <DetailRow label="Frenagem do Motor" value={`${setup.engineBraking}%`} icon="🔧" />
        </Box>

        {/* Suspension Geometry Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Geometria da Suspensão</Heading>

          <DetailRow label="Cambagem Dianteira" value={`${setup.frontCamber}°`} icon="📐" />
          <DetailRow label="Cambagem Traseira" value={`${setup.rearCamber}°`} icon="📐" />
          <DetailRow label="Toe-out Dianteiro" value={`${setup.frontToe}°`} icon="📏" />
          <DetailRow label="Toe-in Traseiro" value={`${setup.rearToe}°`} icon="📏" />
        </Box>

        {/* Suspension Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Suspensão</Heading>

          <DetailRow label="Suspensão Dianteira" value={setup.frontSuspension} icon="🔧" />
          <DetailRow label="Suspensão Traseira" value={setup.rearSuspension} icon="🔧" />
          <DetailRow label="Barra Anti-Rolagem Dianteira" value={setup.frontAntiRollBar} icon="🔩" />
          <DetailRow label="Barra Anti-Rolagem Traseira" value={setup.rearAntiRollBar} icon="🔩" />
          <DetailRow label="Altura Dianteira" value={`${setup.frontRideHeight}mm`} icon="📏" />
          <DetailRow label="Altura Traseira" value={`${setup.rearRideHeight}mm`} icon="📏" />
        </Box>

        {/* Brakes Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Freios</Heading>

          <DetailRow label="Pressão dos Freios" value={`${setup.brakePressure}%`} icon="🛑" />
          <DetailRow label="Balanceamento de Freios" value={`${setup.brakeBalance}%`} icon="⚖️" />
        </Box>

        {/* Tires Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Pneus</Heading>

          <DetailRow label="Pressão Pneu Dianteiro Direito" value={`${setup.frontRightTirePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Dianteiro Esquerdo" value={`${setup.frontLeftTirePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Traseiro Direito" value={`${setup.rearRightTirePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Traseiro Esquerdo" value={`${setup.rearLeftTirePressure} PSI`} icon="🛞" />
        </Box>

        {/* Action Buttons */}
        <VStack space="md" className="m-10">
          <HStack space="md">
            <Button
              className="flex-1 p-2 rounded-xl"
              onPress={debouncedHandleEdit}
            >
              <ButtonText>Editar Setup</ButtonText>
            </Button>
            <Button
              className="flex-1 p-2 bg-red-500 rounded-xl"
              variant="destructive"
              onPress={debouncedConfirmDeletion}
            >
              <ButtonText className="text-white font-bold">Excluir Setup</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este setup? Esta ação não pode ser desfeita."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
      <CustomAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          // Se o erro foi 'Setup não encontrado', volta para a tela anterior
          if (alertMessage === 'Setup não encontrado.') {
            navigation.goBack();
          }
        }}
      />
    </Box>
  );
};

export default SetupDetailsScreen;

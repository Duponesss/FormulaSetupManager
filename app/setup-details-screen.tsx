import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Box } from '../components/ui/box';
import { Button, ButtonText } from '../components/ui/button';
import { Divider } from '../components/ui/divider';
import { Heading } from '../components/ui/heading';
import { HStack } from '../components/ui/hstack';
import { Pressable } from '../components/ui/pressable';
import { ScrollView } from '../components/ui/scroll-view';
import { Text } from '../components/ui/text';
import { VStack } from '../components/ui/vstack';
import ConfirmationModal from '../src/components/dialogs/ConfirmationModal';
import CustomAlertDialog from '../src/components/dialogs/CustomAlertDialog';
import { useSingleTap } from '../src/hooks/useSingleTap';
import { useSetupStore, type SetupData } from '../src/stores/setupStore';

export default function SetupDetailsScreen() {
  const router = useRouter();
  const handleGoBack = () => router.back();

  const params = useLocalSearchParams<{ setupId: string, isViewOnly?: string }>();
  const { setupId } = params;
  const isViewOnly = params.isViewOnly === 'true';
  const allSetups = useSetupStore((state) => state.allSetups);
  const deleteSetup = useSetupStore((state) => state.deleteSetup);
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (setupId) {
      const foundSetup = allSetups.find((s) => s.id === setupId);
      if (foundSetup) {
        setSetup(foundSetup);
      } else {
        console.warn(`Setup com id ${setupId} não encontrado no store.`);
      }
    }
  }, [setupId, allSetups]);

  const handleDelete = async () => {
    if (!setupId) return;
    try {
      await deleteSetup(setupId);
      router.push('/(tabs)' ); // Volta para a tela inicial após a exclusão
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
    router.push({ pathname: '/create-setup-screen', params: { setupId } });
  };

  const debouncedHandleEdit = useSingleTap(handleEditNavigation);
  const debouncedConfirmDeletion = useSingleTap(confirmDeletion);

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
          <Pressable onPress={handleGoBack}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 p-6">
        {/* Basic Info Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="xl" className="mb-4 text-red-600">{setup.setupTitle}</Heading>

          {/* <DetailRow label="Equipe" value={setup.team} icon="🚗" /> */}
          <DetailRow label="Carro" value={setup.car} icon="🚗" />
          <DetailRow label="Circuito" value={setup.track} icon="📍" />
          <DetailRow label="Tipo de Controle" value={setup.controlType} icon="🎮" />
          <DetailRow label="Condições" value={setup.condition} icon="🌤️" />
          <DetailRow
            label="Criado em"
            value={setup.createdAt ? setup.createdAt.toDate().toLocaleDateString('pt-BR') : '—'}
            icon="📅"
          />
          <DetailRow
            label="Atualizado em"
            value={setup.updatedAt ? setup.updatedAt.toDate().toLocaleDateString('pt-BR') : '—'}
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

          <DetailRow label="Diferencial com Aceleração" value={`${setup.diffAdjustmentOn}%`} icon="⚙️" />
          <DetailRow label="Diferencial sem Aceleração" value={`${setup.diffAdjustmentOff}%`} icon="⚙️" />
          <DetailRow label="Frenagem do Motor" value={`${setup.engineBraking}%`} icon="🔧" />
        </Box>

        {/* Suspension Geometry Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Geometria da Suspensão</Heading>

          <DetailRow label="Cambagem Dianteira" value={`${setup.frontCamber}°`} icon="📐" />
          <DetailRow label="Cambagem Traseira" value={`${setup.rearCamber}°`} icon="📐" />
          <DetailRow label="Toe-out Dianteiro" value={`${setup.frontToeOut}°`} icon="📏" />
          <DetailRow label="Toe-in Traseiro" value={`${setup.rearToeIn}°`} icon="📏" />
        </Box>

        {/* Suspension Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Suspensão</Heading>

          <DetailRow label="Suspensão Dianteira" value={setup.frontSuspension} icon="🔧" />
          <DetailRow label="Suspensão Traseira" value={setup.rearSuspension} icon="🔧" />
          <DetailRow label="Barra Anti-Rolagem Dianteira" value={setup.frontAntiRollBar} icon="🔩" />
          <DetailRow label="Barra Anti-Rolagem Traseira" value={setup.rearAntiRollBar} icon="🔩" />
          <DetailRow label="Altura Dianteira" value={`${setup.frontRideHeight}`} icon="📏" />
          <DetailRow label="Altura Traseira" value={`${setup.rearRideHeight}`} icon="📏" />
        </Box>

        {/* Brakes Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Freios</Heading>

          <DetailRow label="Pressão dos Freios" value={`${setup.brakePressure}%`} icon="🛑" />
          <DetailRow label="Balanceamento de Freios" value={`${setup.frontBrakeBias}%`} icon="⚖️" />
        </Box>

        {/* Tires Card */}
        <Box className="rounded-xl p-6 mb-6 bg-gray-50">
          <Heading size="lg" className="mb-4 text-red-600">Pneus</Heading>

          <DetailRow label="Pressão Pneu Dianteiro Direito" value={`${setup.frontRightTyrePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Dianteiro Esquerdo" value={`${setup.frontLeftTyrePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Traseiro Direito" value={`${setup.rearRightTyrePressure} PSI`} icon="🛞" />
          <DetailRow label="Pressão Pneu Traseiro Esquerdo" value={`${setup.rearLeftTyrePressure} PSI`} icon="🛞" />
        </Box>

        {/* Action Buttons */}
        {!isViewOnly && (
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
        )}
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
        onClose={() => {
          setShowAlert(false);
          if (alertMessage === 'Setup não encontrado.') {
            router.back();
          }
        }}
        onConfirm={() => {
          // Se o erro foi 'Setup não encontrado', volta para a tela anterior
          setShowAlert(false);
          if (alertMessage === 'Setup não encontrado.') {
            router.back();
          }
        }}
      />
    </Box>
  );
};


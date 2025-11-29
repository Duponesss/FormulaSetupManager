import { Box } from '@/components/ui/box';
import { ButtonIcon, ButtonText } from '@/components/ui/button';
import { DebouncedButton } from '@/src/components/common/DebouncedButton';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from "@/components/ui/spinner";
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import AppAlertDialog from '@/src/components/dialogs/AppAlertDialog';
import StarRatingDisplay from '@/src/components/display/StarRatingDisplay';
import { useSingleTap } from '@/src/hooks/useSingleTap';
import { useSetupStore } from '@/src/stores/setupStore';
import { DebouncedPressable } from "@/src/components/common/DebouncedPressable";
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  AlignVerticalSpaceAround,
  ArrowDownUp,
  CalendarDays,
  Car,
  CircleDashed,
  CloudRain,
  Cog,
  Copy,
  Gamepad2,
  Gauge,
  Globe, Lock,
  MapPin,
  Settings2,
  Share2,
  SlidersHorizontal,
  Star,
  Sun,
  User,
  Wind,
  X
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ImageBackground, Share } from 'react-native';

const teamColors = {
  'Oracle Red Bull Racing': '#3671C6',
  'Scuderia Ferrari HP': '#DC0000',
  'McLaren Formula 1 Team': '#FF8700',
  'Mercedes-AMG Petronas Formula One Team': '#6CD3BF',
  'Aston Martin Aramco Formula One Team': '#006F62',
  'BWT Alpine F1 Team': '#0090FF',
  'MoneyGram Haas F1 Team': '#999999',
  'VISA Cash App RB F1 Team': '#6692FF',
  'Williams Racing': '#85b8ff',
  'Kick Sauber F1 Team': '#52E252',
  'default': '#E5E7EB', 
};

const teamLogos = {
  'Oracle Red Bull Racing': require('../src/assets/images/redbull.png'),
  'Scuderia Ferrari HP': require('../src/assets/images/ferrari.png'),
  'McLaren Formula 1 Team': require('../src/assets/images/mclaren.png'),
  'Mercedes-AMG Petronas Formula One Team': require('../src/assets/images/mercedes.png'),
  'Aston Martin Aramco Formula One Team': require('../src/assets/images/aston-martin.png'),
  'BWT Alpine F1 Team': require('../src/assets/images/alpine.png'),
  'MoneyGram Haas F1 Team': require('../src/assets/images/haas.png'),
  'VISA Cash App RB F1 Team': require('../src/assets/images/racing-bulls.svg'),
  'Williams Racing': require('../src/assets/images/williams.png'),
  'Kick Sauber F1 Team': require('../src/assets/images/kick-sauber.svg'),
};

export default function SetupDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      router.back(); 
    } else {
      router.replace('/(tabs)'); 
    }
  };

  const params = useLocalSearchParams<{ setupId: string, isViewOnly?: string }>();
  const { setupId } = params;
  const isViewOnly = params.isViewOnly === 'true';

  const allSetups = useSetupStore((state) => state.allSetups);
  const folderSetups = useSetupStore((state) => state.folderSetups);
  const publicSetups = useSetupStore((state) => state.publicSetups);
  const userProfile = useSetupStore((state) => state.userProfile);
  const deleteSetup = useSetupStore((state) => state.deleteSetup);
  const cloneSetup = useSetupStore((state) => state.cloneSetup);
  const gameData = useSetupStore((state) => state.gameData);
  const loadingGameData = useSetupStore((state) => state.loadingGameData);
  const rateSetup = useSetupStore((state) => state.rateSetup);
  const fetchMyRating = useSetupStore((state) => state.fetchMyRating);
  const myRating = useSetupStore((state) => (setupId ? state.myRatings[setupId] : null) || 0);
  const topRatedSetups = useSetupStore((state) => state.topRatedSetups); 
  const deepLinkSetup = useSetupStore((state) => state.deepLinkSetup);

  const setup = React.useMemo(() => {
    if (!setupId) return null;
    return (
      allSetups.find((s) => s.id === setupId) ||
      folderSetups.find((s) => s.id === setupId) ||
      publicSetups.find((s) => s.id === setupId) ||
      topRatedSetups.find((s) => s.id === setupId) ||
      (deepLinkSetup?.id === setupId ? deepLinkSetup : null) ||
      null
    );
  }, [setupId, allSetups, folderSetups, publicSetups, topRatedSetups, deepLinkSetup]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleShare = async () => {
    if (!setup) return;
    try {
      const deepLink = `apexf1assistant://setup/${setup.id}`;

      const message = `Confira este setup para ${setup.track} no Apex F1 Manager!\n\n${deepLink}`;

      await Share.share({
        message: message,
        title: `Setup: ${setup.setupTitle}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const handleDelete = async () => {
    if (!setupId) return;
    try {
      await deleteSetup(setupId);
      router.back();
    } catch (error) {
      console.error('Erro ao excluir setup:', error);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível excluir o setup.');
      setShowAlert(true);
    }
  };

  const confirmDeletion = () => setShowDeleteModal(true);

  const handleEditNavigation = () => {
    // console.log('EDITANDO SETUP COM setupId:', setupId);
    router.push({ pathname: '/create-setup-screen', params: { setupId } });
  };

  const handleClone = async () => {
    if (!setup) return;
    try {
      await cloneSetup(setup);
      setAlertTitle('Sucesso!');
      setAlertMessage('Setup copiado para "Meus Setups".');
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao clonar:", error);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível copiar o setup.');
      setShowAlert(true);
    }
  };

  const debouncedHandleEdit = useSingleTap(handleEditNavigation);
  const debouncedConfirmDeletion = useSingleTap(confirmDeletion);

  const isOwner = setup?.userId === userProfile?.uid;

  useFocusEffect(
    React.useCallback(() => {
      if (setupId && !isOwner) {
        fetchMyRating(setupId);
      }
    }, [setupId, isOwner, fetchMyRating])
  );

  const StarRatingInput = ({ onRate, value }: { onRate: (value: number) => void, value: number }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = hoverRating || value;
    return (
      <HStack space="md">
        {[1, 2, 3, 4, 5].map((index) => (
          <DebouncedPressable
            key={index}
            onPress={() => onRate(index)}
            onPressIn={() => setHoverRating(index)}
            onPressOut={() => setHoverRating(0)}
          >
            <Star
              size={32}
              color="#f59e0b"
              fill={index <= displayRating ? "#f59e0b" : "none"}
            />
          </DebouncedPressable>
        ))}
      </HStack>
    );
  };

  const SetupStatRow = ({
    label, value, icon, min, max, suffix = ''
  }: {
    label: string, value: number, icon: React.ReactNode,
    min: number, max: number, suffix?: string
  }) => {
    const progressValue = ((value - min) / (max - min)) * 100;
    return (
      <VStack className="py-2">
        <HStack className="items-center justify-between">
          <HStack className="items-center" space="sm">
            <Box className="w-5 items-center">{icon}</Box>
            <Text>{label}</Text>
          </HStack>
          <Text className="font-medium">{value.toFixed(suffix === '°' ? 2 : 0)}{suffix}</Text>
        </HStack>
        <Progress value={progressValue} size="xs" className="mt-2">
          <ProgressFilledTrack className="bg-red-600" />
        </Progress>
      </VStack>
    );
  };

  const DetailRow = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
    <Box>
      <HStack className="items-center justify-between py-3">
        <HStack className="items-center mr-4" space="md">
          <Box className="w-5 items-center">{icon}</Box>
          <Text>{label}</Text>
        </HStack>
        <Box className="flex-1 items-end">
          <Text className="font-medium text-right">{value}</Text>
        </Box>
      </HStack>
      <Divider />
    </Box>
  );

  if (loadingGameData || !gameData) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!setup) {
    return (
      <Box className="flex-1 justify-center items-center bg-black/80">
        <Text className="text-white">Setup não encontrado</Text>
      </Box>
    );
  }

  const teamColor = teamColors[setup.car as keyof typeof teamColors] || teamColors.default;
  const teamLogo = teamLogos[setup.car as keyof typeof teamLogos] || null;
  const rules = gameData.validationRules;

  return (
    <Box className="flex-1">
      <ImageBackground
        source={require('../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Header */}
        <Box className="pt-12 pb-4 px-6 bg-black/50">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-white">Detalhes do Setup</Heading>
            <HStack space="md">
              {setup && (
                <DebouncedPressable onPress={handleShare} style={{ marginRight: 16 }}>
                  {({ pressed }) => (
                    <Box style={{ opacity: pressed ? 0.5 : 1.0 }}>
                      <Share2 color="white" size={24} />
                    </Box>
                  )}
                </DebouncedPressable>
              )}
              <DebouncedPressable onPress={handleGoBack}>
                {(props: { pressed: boolean }) => (
                  <Box
                    style={{
                      opacity: props.pressed ? 0.5 : 1.0,
                    }}
                  >
                    <X color="red" />
                  </Box>
                )}
              </DebouncedPressable>
            </HStack>
          </HStack>
        </Box>

        <ScrollView className="flex-1 p-6 bg-black/30">
          {/* Card de Informações Básicas */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="xl" className="mb-4" style={{ color: teamColor }}>
              {setup.setupTitle}
            </Heading>

            <DebouncedPressable onPress={() => router.push({ pathname: '/(tabs)/profile-screen', params: { userId: setup.userId } })}>
              {(props: { pressed: boolean }) => (
                <Box
                  style={{
                    opacity: props.pressed ? 0.5 : 1.0,
                  }}
                >
                  <DetailRow
                    label="Piloto"
                    value={setup.authorName || 'Desconhecido'}
                    icon={
                      setup.authorPhotoUrl ? (
                        <Image
                          source={{ uri: setup.authorPhotoUrl }}
                          style={{ width: 24, height: 24, borderRadius: 12 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <User size={20} color="#6B7280" />
                      )
                    }
                  />
                </Box>
              )}
            </DebouncedPressable>

            <DetailRow
              label="Visibilidade"
              value={setup.isPublic ? "Público" : "Privado"}
              icon={
                setup.isPublic ? (
                  <Globe size={20} color="#16a34a" /> 
                ) : (
                  <Lock size={20} color="#6B7280" /> 
                )
              }
            />

            <DetailRow
              label="Carro"
              value={setup.car}
              icon={teamLogo ? <Image source={teamLogo} style={{ width: 20, height: 20 }} resizeMode="contain" /> : <Car size={16} color="#6B7280" />}
            />
            <DetailRow label="Circuito" value={setup.track} icon={<MapPin size={16} color="#6B7280" />} />
            <DetailRow label="Tipo de Controle" value={setup.controlType} icon={<Gamepad2 size={16} color="#6B7280" />} />
            <DetailRow
              label="Condições"
              value={setup.condition}
              icon={setup.condition.toLowerCase().includes('chuva') ? <CloudRain size={16} color="#6B7280" /> : <Sun size={16} color="#6B7280" />}
            />
            <DetailRow
              label="Criado em"
              value={setup.createdAt ? setup.createdAt.toDate().toLocaleDateString('pt-BR') : '—'}
              icon={<CalendarDays size={16} color="#6B7280" />}
            />
            <DetailRow
              label="Atualizado em"
              value={setup.updatedAt ? setup.updatedAt.toDate().toLocaleDateString('pt-BR') : '—'}
              icon={<SlidersHorizontal size={16} color="#6B7280" />}
            />
            <HStack className="items-center mt-4" space="sm">
              <StarRatingDisplay rating={setup.rating || 0} size={20} />
              <Text className="text-gray-500 text-sm ml-1">
                ({setup.ratingCount || 0} {setup.ratingCount === 1 ? 'voto' : 'votos'})
              </Text>
            </HStack>
          </Box>

          {/* Card de Avaliação (Input) */}
          {!isOwner && (
            <Box className="rounded-xl p-6 mb-6 bg-gray-50 border border-gray-700">
              <Heading size="lg" className="mb-4 text-black">
                {myRating > 0 ? "Sua Avaliação" : "Avalie este Setup"}
              </Heading>
              <Box className="items-center">
                <StarRatingInput
                  value={myRating}
                  onRate={async (value) => {
                    if (!setup) return;
                    try {
                      await rateSetup(setup.id!, value);
                      setAlertTitle("Obrigado!");
                      setAlertMessage("Sua avaliação foi registrada.");
                      setShowAlert(true);
                    } catch (e: any) {
                      setAlertTitle("Erro");
                      setAlertMessage(e.message || "Não foi possível salvar.");
                      setShowAlert(true);
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Card de Observações */}
          {setup.notes && (
            <Box className="rounded-xl p-6 mb-6 bg-gray-50">
              <Heading size="lg" className="mb-4 text-red-600">Observações</Heading>
              <Text>{setup.notes}</Text>
            </Box>
          )}

          {/* Card de Aerodinâmica */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Aerodinâmica</Heading>
            <VStack space="md" >
              <SetupStatRow label="Asa Dianteira" value={setup.frontWing} icon={<Wind size={16} color="#6B7280" />} min={rules.aerodynamics.frontWing.min} max={rules.aerodynamics.frontWing.max} />
              <SetupStatRow label="Asa Traseira" value={setup.rearWing} icon={<Wind size={16} color="#6B7280" />} min={rules.aerodynamics.rearWing.min} max={rules.aerodynamics.rearWing.max} />
            </VStack>
          </Box>

          {/* Card de Transmissão */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Transmissão</Heading>
            <VStack space="md">
              <SetupStatRow label="Diferencial com Aceleração" value={setup.diffAdjustmentOn} icon={<Cog size={16} color="#6B7280" />} min={rules.transmission.diffAdjustmentOn.min} max={rules.transmission.diffAdjustmentOn.max} suffix="%" />
              <SetupStatRow label="Diferencial sem Aceleração" value={setup.diffAdjustmentOff} icon={<Settings2 size={16} color="#6B7280" />} min={rules.transmission.diffAdjustmentOff.min} max={rules.transmission.diffAdjustmentOff.max} suffix="%" />
              <SetupStatRow label="Frenagem do Motor" value={setup.engineBraking} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.transmission.engineBraking.min} max={rules.transmission.engineBraking.max} suffix="%" />
            </VStack>
          </Box>

          {/* Card de Geometria da Suspensão */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Geometria da Suspensão</Heading>
            <VStack space="md">
              <SetupStatRow label="Cambagem Dianteira" value={setup.frontCamber} icon={<AlignVerticalSpaceAround size={16} color="#6B7280" />} min={rules.suspensionGeometry.frontCamber.min} max={rules.suspensionGeometry.frontCamber.max} suffix="°" />
              <SetupStatRow label="Cambagem Traseira" value={setup.rearCamber} icon={<AlignVerticalSpaceAround size={16} color="#6B7280" />} min={rules.suspensionGeometry.rearCamber.min} max={rules.suspensionGeometry.rearCamber.max} suffix="°" />
              <SetupStatRow label="Toe-out Dianteiro" value={setup.frontToeOut} icon={<AlignVerticalSpaceAround size={16} color="#6B7280" />} min={rules.suspensionGeometry.frontToeOut.min} max={rules.suspensionGeometry.frontToeOut.max} suffix="°" />
              <SetupStatRow label="Toe-in Traseiro" value={setup.rearToeIn} icon={<AlignVerticalSpaceAround size={16} color="#6B7280" />} min={rules.suspensionGeometry.rearToeIn.min} max={rules.suspensionGeometry.rearToeIn.max} suffix="°" />
            </VStack>
          </Box>

          {/* Card de Suspensão */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Suspensão</Heading>
            <VStack space="md">
              <SetupStatRow label="Suspensão Dianteira" value={setup.frontSuspension} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.frontSuspension.min} max={rules.suspension.frontSuspension.max} />
              <SetupStatRow label="Suspensão Traseira" value={setup.rearSuspension} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.rearSuspension.min} max={rules.suspension.rearSuspension.max} />
              <SetupStatRow label="Barra Anti-Rolagem Dianteira" value={setup.frontAntiRollBar} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.frontAntiRollBar.min} max={rules.suspension.frontAntiRollBar.max} />
              <SetupStatRow label="Barra Anti-Rolagem Traseira" value={setup.rearAntiRollBar} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.rearAntiRollBar.min} max={rules.suspension.rearAntiRollBar.max} />
              <SetupStatRow label="Altura Dianteira" value={setup.frontRideHeight} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.frontRideHeight.min} max={rules.suspension.frontRideHeight.max} />
              <SetupStatRow label="Altura Traseira" value={setup.rearRideHeight} icon={<ArrowDownUp size={16} color="#6B7280" />} min={rules.suspension.rearRideHeight.min} max={rules.suspension.rearRideHeight.max} />
            </VStack>
          </Box>

          {/* Card de Freios */}
          <Box className="rounded-xl p-6 mb-6 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Freios</Heading>
            <VStack space="md">
              <SetupStatRow label="Pressão dos Freios" value={setup.brakePressure} icon={<Gauge size={16} color="#6B7280" />} min={rules.brakes.brakePressure.min} max={rules.brakes.brakePressure.max} suffix="%" />
              <SetupStatRow label="Balanceamento de Freios" value={setup.frontBrakeBias} icon={<Gauge size={16} color="#6B7280" />} min={rules.brakes.frontBrakeBias.min} max={rules.brakes.frontBrakeBias.max} suffix="%" />
            </VStack>
          </Box>

          {/* Card de Pneus */}
          <Box className="rounded-xl p-6 mb-8 bg-gray-50">
            <Heading size="lg" className="mb-4 text-red-600">Pneus</Heading>
            <VStack space="md">
              <SetupStatRow label="Pressão Pneu Diant. Dir." value={setup.frontRightTyrePressure} icon={<CircleDashed size={16} color="#6B7280" />} min={rules.tyres.frontRightTyrePressure.min} max={rules.tyres.frontRightTyrePressure.max} suffix=" PSI" />
              <SetupStatRow label="Pressão Pneu Diant. Esq." value={setup.frontLeftTyrePressure} icon={<CircleDashed size={16} color="#6B7280" />} min={rules.tyres.frontLeftTyrePressure.min} max={rules.tyres.frontLeftTyrePressure.max} suffix=" PSI" />
              <SetupStatRow label="Pressão Pneu Tras. Dir." value={setup.rearRightTyrePressure} icon={<CircleDashed size={16} color="#6B7280" />} min={rules.tyres.rearRightTyrePressure.min} max={rules.tyres.rearRightTyrePressure.max} suffix=" PSI" />
              <SetupStatRow label="Pressão Pneu Tras. Esq." value={setup.rearLeftTyrePressure} icon={<CircleDashed size={16} color="#6B7280" />} min={rules.tyres.rearLeftTyrePressure.min} max={rules.tyres.rearLeftTyrePressure.max} suffix=" PSI" />
            </VStack>
          </Box>


        </ScrollView>
        {/* Action Buttons */}
        {isOwner && !isViewOnly && (
          <Box className="bg-black/50">
            <VStack space="md" className="m-10 mb-10">
              <HStack space="md">
                <DebouncedButton
                  className="flex-1 p-2 rounded-xl"
                  onPress={debouncedHandleEdit}
                >
                  <ButtonText className="text-white">Editar Setup</ButtonText>
                </DebouncedButton>
                <DebouncedButton
                  className="flex-1 p-2 bg-red-500 rounded-xl"
                  variant="destructive"
                  onPress={debouncedConfirmDeletion}
                >
                  <ButtonText className="text-white font-bold">Excluir Setup</ButtonText>
                </DebouncedButton>
              </HStack>
            </VStack>
          </Box>
        )}

        {!isOwner && setup && (
          <Box className="bg-black/50">
            <VStack space="md" className="m-10 mb-10">
              <HStack space="md">
                <DebouncedButton
                  className="flex-1 p-2 bg-green-600 rounded-xl"
                  onPress={handleClone}
                >
                  <ButtonIcon as={Copy} className="mr-2" />
                  <ButtonText className="text-white font-bold" size="lg">Copiar para Meus Setups</ButtonText>
                </DebouncedButton>
              </HStack>
            </VStack>
          </Box>
        )}
      </ImageBackground>
      {/* Modal de Confirmação de Exclusão */}
      <AppAlertDialog
        isOpen={showDeleteModal}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este setup? Esta ação não pode ser desfeita."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Modal de Alerta */}
      <AppAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setShowAlert(false);
          if (alertTitle === 'Setup não encontrado.') {
            router.back();
          }
          if (alertTitle === 'Sucesso!') {
            router.push('/(tabs)');
          }
        }}
        okText="OK"
      />
    </Box>
  );
};


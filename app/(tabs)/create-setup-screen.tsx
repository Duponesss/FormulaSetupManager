import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useMemo, useEffect } from 'react';
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';

import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Input, InputField } from '../../components/ui/input';
import { Text } from '../../components/ui/text';
import { Textarea, TextareaInput } from '../../components/ui/textarea';
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from '../../components/ui/slider';
import { FormControl, FormControlError, FormControlErrorText } from '../../components/ui/form-control';
import {
  Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem
} from '../../components/ui/select';
import { ScrollView } from '../../components/ui/scroll-view';
import { ChevronDown } from 'lucide-react-native';
import AppAlertDialog from '../../src/components/dialogs/AppAlertDialog';
import { FlatList, ImageBackground } from 'react-native';
import { Spinner } from '@/components/ui/spinner';

type FormSectionItem = {
  type: 'header' | 'input' | 'picker' | 'textarea' | 'slider' | 'footer';
  id: string;
  label?: string;
  title?: string;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  suffix?: string;
};

const SliderComponent = React.memo(({
  label,
  value,
  onFinalChange, // Função para atualizar o store global 
  min,
  max,
  step,
  unit,
  suffix
}: {
  label: string;
  value: number;
  onFinalChange: (newValue: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  suffix?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sincroniza o estado local se o valor global mudar (ex: ao carregar um setup)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);


  return (
    <Box className="mb-4">
      <HStack className="justify-between items-center gap-3">
        <Text className="font-medium mb-2 text-sm text-white">{label}</Text>
        <Text className="font-bold text-white">{localValue.toFixed(step < 1 ? 2 : 0)}{unit}{suffix}</Text>
      </HStack>
      <Slider
        value={localValue}
        onChange={setLocalValue} // onChange atualiza apenas o estado local
        onChangeEnd={onFinalChange} // onChangeEnd atualiza o store global
        minValue={min} maxValue={max} step={step}
      >
        <SliderTrack>
          <SliderFilledTrack className="bg-red-600" />
        </SliderTrack>
        <SliderThumb className="bg-red-600" />
      </Slider>
    </Box>
  );
});


export default function CreateSetupScreen() {
  // console.log('OBJETO DE ROTA RECEBIDO:', JSON.stringify(route, null, 2));
  const router = useRouter();
  const { setupId } = useLocalSearchParams<{ setupId?: string }>();
  // Conecta-se ao store e pega os dados e ações necessárias
  const formData = useSetupStore((state) => state.formData);
  const gameData = useSetupStore((state) => state.gameData);
  const loadingGameData = useSetupStore((state) => state.loadingGameData);

  // 2. Pega as AÇÕES (funções) de forma estável com getState(), sem causar re-renderizações.
  const { updateField, loadFormWithExistingSetup, resetForm, saveSetup } = useSetupStore.getState();

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!setupId);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (setupId) {
        setIsEditMode(true);
        loadFormWithExistingSetup(setupId);
      } else {
        setIsEditMode(false);
        resetForm();
      }
      return () => { resetForm(); setSubmitted(false); };
    }, [setupId])
  );

  const handleSave = async () => {
    setSubmitted(true);
    if (!formData.setupTitle || !formData.controlType || !formData.car || !formData.track || !formData.condition) {
      const message = "Por favor, preencha todos os campos básicos obrigatórios.";
      setAlertTitle('Informações faltando');
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      await saveSetup(formData);
      setAlertTitle('Sucesso');
      setAlertMessage('Setup salvo com sucesso!');
      setShowAlert(true);
    } catch (error) {
      console.error('Erro ao salvar setup:', error);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível salvar o setup.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Dados para os selects
  const carOptions = useMemo(() => gameData?.teams.map(t => t.teamName) || [], [gameData]);
  const trackOptions = useMemo(() => gameData?.tracks || [], [gameData]);
  const controlTypes = useMemo(() => ['Controle', 'Volante'] as const, []);
  const conditionOptions = useMemo(() => ['Seco', 'Chuva', 'Chuva forte'] as const, []);

  const formSections: FormSectionItem[] = useMemo(() => {
    const rules = gameData?.validationRules;
    console.log("RULES RECEBIDAS:", JSON.stringify(rules, null, 2));
    if (!rules) return []; // Retorna vazio se as regras ainda não carregaram

    return [

      { type: 'header', id: 'basic_info_header', title: 'Informações Básicas' },
      { type: 'input', id: 'setupTitle', label: 'Nome do Setup' },
      { type: 'picker', id: 'car', label: 'Carro', options: carOptions },
      { type: 'picker', id: 'track', label: 'Circuito', options: trackOptions },
      { type: 'picker', id: 'controlType', label: 'Tipo de Controle', options: controlTypes },
      { type: 'picker', id: 'condition', label: 'Condições', options: conditionOptions },
      { type: 'textarea', id: 'notes', label: 'Observações' },

      { type: 'header', id: 'aero_header', title: 'Aerodinâmica' },
      {
        type: 'slider', id: 'frontWing', label: 'Asa Dianteira',
        min: rules.aerodynamics.frontWing.min,
        max: rules.aerodynamics.frontWing.max,
        step: rules.aerodynamics.frontWing.step,
      },
      {
        type: 'slider', id: 'rearWing', label: 'Asa Traseira',
        min: rules.aerodynamics.rearWing.min,
        max: rules.aerodynamics.rearWing.max,
        step: rules.aerodynamics.rearWing.step,
      },

      { type: 'header', id: 'trans_header', title: 'Transmissão' },
      {
        type: 'slider', id: 'diffAdjustmentOn', label: 'Diferencial Aceleração Ativa',
        min: rules.transmission.diffAdjustmentOn.min,
        max: rules.transmission.diffAdjustmentOn.max,
        step: rules.transmission.diffAdjustmentOn.step,
      },
      {
        type: 'slider', id: 'diffAdjustmentOff', label: 'Diferencial Aceleração Inativa',
        min: rules.transmission.diffAdjustmentOff.min,
        max: rules.transmission.diffAdjustmentOff.max,
        step: rules.transmission.diffAdjustmentOff.step,
      },
      {
        type: 'slider', id: 'engineBraking', label: 'Frenagem do Motor',
        min: rules.transmission.engineBraking.min,
        max: rules.transmission.engineBraking.max,
        step: rules.transmission.engineBraking.step,
      },

      { type: 'header', id: 'geo_header', title: 'Geometria da Suspensão' },
      {
        type: 'slider', id: 'frontCamber', label: 'Cambagem Dianteira',
        min: rules.suspensionGeometry.frontCamber.min,
        max: rules.suspensionGeometry.frontCamber.max,
        step: rules.suspensionGeometry.frontCamber.step,
      },
      {
        type: 'slider', id: 'rearCamber', label: 'Cambagem Traseira',
        min: rules.suspensionGeometry.rearCamber.min,
        max: rules.suspensionGeometry.rearCamber.max,
        step: rules.suspensionGeometry.rearCamber.step,
      },
      {
        type: 'slider', id: 'frontToeOut', label: 'Toe-out Dianteiro',
        min: rules.suspensionGeometry.frontToeOut.min,
        max: rules.suspensionGeometry.frontToeOut.max,
        step: rules.suspensionGeometry.frontToeOut.step,
      },
      {
        type: 'slider', id: 'rearToeIn', label: 'Toe-in Traseiro',
        min: rules.suspensionGeometry.rearToeIn.min,
        max: rules.suspensionGeometry.rearToeIn.max,
        step: rules.suspensionGeometry.rearToeIn.step,
      },

      { type: 'header', id: 'susp_header', title: 'Suspensão' },
      {
        type: 'slider', id: 'frontSuspension', label: 'Suspensão Dianteira',
        min: rules.suspension.frontSuspension.min,
        max: rules.suspension.frontSuspension.max,
        step: rules.suspension.frontSuspension.step,
      },
      {
        type: 'slider', id: 'rearSuspension', label: 'Suspensão Traseira',
        min: rules.suspension.rearSuspension.min,
        max: rules.suspension.rearSuspension.max,
        step: rules.suspension.rearSuspension.step,
      },
      {
        type: 'slider', id: 'frontAntiRollBar', label: 'Barra Estabilizadora Dianteira',
        min: rules.suspension.frontAntiRollBar.min,
        max: rules.suspension.frontAntiRollBar.max,
        step: rules.suspension.frontAntiRollBar.step,
      },
      {
        type: 'slider', id: 'rearAntiRollBar', label: 'Barra Estabilizadora Traseira',
        min: rules.suspension.rearAntiRollBar.min,
        max: rules.suspension.rearAntiRollBar.max,
        step: rules.suspension.rearAntiRollBar.step,
      },
      {
        type: 'slider', id: 'frontRideHeight', label: 'Altura Frontal',
        min: rules.suspension.frontRideHeight.min,
        max: rules.suspension.frontRideHeight.max,
        step: rules.suspension.frontRideHeight.step,
      },
      {
        type: 'slider', id: 'rearRideHeight', label: 'Altura Traseira',
        min: rules.suspension.rearRideHeight.min,
        max: rules.suspension.rearRideHeight.max,
        step: rules.suspension.rearRideHeight.step,
      },

      { type: 'header', id: 'brakes_header', title: 'Freios' },
      {
        type: 'slider', id: 'brakePressure', label: 'Pressão dos Freios',
        min: rules.brakes.brakePressure.min,
        max: rules.brakes.brakePressure.max,
        step: rules.brakes.brakePressure.step,
      },
      {
        type: 'slider', id: 'frontBrakeBias', label: 'Balanceamento dos Freios Diant.',
        min: rules.brakes.frontBrakeBias.min,
        max: rules.brakes.frontBrakeBias.max,
        step: rules.brakes.frontBrakeBias.step,
      },

      { type: 'header', id: 'tyres_header', title: 'Pneus' },
      {
        type: 'slider', id: 'frontRightTyrePressure', label: 'Pressão do Pneu Dianteiro Direito',
        min: rules.tyres.frontRightTyrePressure.min,
        max: rules.tyres.frontRightTyrePressure.max,
        step: rules.tyres.frontRightTyrePressure.step,
      },
      {
        type: 'slider', id: 'frontLeftTyrePressure', label: 'Pressão do Pneu Dianteiro Esquerdo',
        min: rules.tyres.frontLeftTyrePressure.min,
        max: rules.tyres.frontLeftTyrePressure.max,
        step: rules.tyres.frontLeftTyrePressure.step,
      },
      {
        type: 'slider', id: 'rearRightTyrePressure', label: 'Pressão do Pneu Traseiro Direito',
        min: rules.tyres.rearRightTyrePressure.min,
        max: rules.tyres.rearRightTyrePressure.max,
        step: rules.tyres.rearRightTyrePressure.step,
      },
      {
        type: 'slider', id: 'rearLeftTyrePressure', label: 'Pressão do Pneu Traseiro Esquerdo',
        min: rules.tyres.rearLeftTyrePressure.min,
        max: rules.tyres.rearLeftTyrePressure.max,
        step: rules.tyres.rearLeftTyrePressure.step,
      },
      { type: 'footer', id: 'action_buttons' }
    ];
  }, [gameData, carOptions, trackOptions]);

  if (loadingGameData || !gameData) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <ImageBackground
        source={require('../../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Header */}
        <Box className="pt-12 pb-4 px-6 bg-black/70">
          <HStack className="items-center justify-between">
            <Heading className="text-white " size="xl">{isEditMode ? 'Editar Setup' : 'Novo Setup'}</Heading>
          </HStack>
        </Box>

        <FlatList
          className="bg-black/50"
          data={formSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: FormSectionItem }) => {
            switch (item.type) {
              case 'header':
                const isFirstHeader = item.id === 'basic_info_header';
                return (
                  <Box className="p-2">
                    <Heading size="lg" className={`mb-4 text-white ${isFirstHeader ? '' : 'mt-6 text-red-600'}`}>{item.title}</Heading>
                  </Box>
                )

              case 'input':
                return (
                  <Box className="p-2 mb-2">
                    <FormControl isInvalid={submitted && !formData.setupTitle} className="mb-4">
                      <Text className="mb-2 font-medium text-white">{item.label}</Text>
                      <Input className="bg-gray-800/80 border-gray-700">
                        <InputField
                          placeholder="Digite o nome do setup"
                          value={formData.setupTitle}
                          onChangeText={(text) => updateField('setupTitle', text)}
                          style={{ color: 'white' }}
                          placeholderTextColor="#c7cbd2"
                        />
                      </Input>
                      {submitted && !formData.setupTitle && <FormControlError><FormControlErrorText>Campo obrigatório</FormControlErrorText></FormControlError>}
                    </FormControl>
                  </Box>
                );

              case 'picker':
                const pickerKey = item.id as keyof SetupData;
                const selectedValue = formData[pickerKey] as string;
                return (
                  <Box className="p-2 mb-2">
                    <FormControl isInvalid={submitted && !selectedValue} className="mb-4">
                      <Text className="mb-2 font-medium text-white">{item.label}</Text>
                      <Select
                        selectedValue={selectedValue}
                        onValueChange={(value) => updateField(pickerKey, value)}
                      >
                        <SelectTrigger className="bg-gray-800/80 border-gray-700">
                          <SelectInput
                            placeholder={`Selecione ${item.label?.toLowerCase()}`}
                            placeholderTextColor="#c7cbd2"
                            style={{ color: 'white' }} />
                          <ChevronDown className="mr-3" color="gray" />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                            {/* ScrollView para listas longas (pistas, carros) */}
                            <ScrollView style={{ maxHeight: 400, width: '100%' }}>
                              {(item.options as readonly string[]).map((opt) => (
                                <SelectItem key={opt} label={opt} value={opt} />
                              ))}
                            </ScrollView>
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                      {submitted && !selectedValue && <FormControlError><FormControlErrorText>Campo obrigatório</FormControlErrorText></FormControlError>}
                    </FormControl>
                  </Box>
                );

              case 'textarea':
                return (
                  <Box className="p-2 mb-2">
                    <Box className="mb-4">
                      <Text className="mb-2 font-medium text-white">{item.label}</Text>
                      <Textarea className="bg-gray-800/80 border-gray-700">
                        <TextareaInput
                          placeholder="Notas sobre o setup, condições de pista, etc..."
                          value={formData.notes}
                          onChangeText={(text) => updateField('notes', text)}
                          multiline
                          numberOfLines={3}
                          style={{ color: 'white' }}
                          placeholderTextColor="#c7cbd2"
                        />
                      </Textarea>
                    </Box>
                  </Box>
                );

              case 'slider':
                const sliderKey = item.id as keyof SetupData;
                return (
                  <Box className="p-2 mb-2">
                    <SliderComponent
                      label={item.label!}
                      value={formData[sliderKey] as number}
                      onFinalChange={(newValue) => updateField(sliderKey, newValue)}
                      min={item.min!} max={item.max!} step={item.step!} unit={item.unit} suffix={item.suffix}
                    />
                  </Box>
                );

              case 'footer':
                return (
                  <Box className="p-2">
                    <Box className="my-8">
                      <HStack space="md">
                        <Button variant="outline" className="flex-1 bg-gray-600" onPress={() => router.back()} isDisabled={loading}>
                          <ButtonText className="text-white">Cancelar</ButtonText>
                        </Button>
                        <Button className="flex-1 bg-red-600" onPress={handleSave} isDisabled={loading}>
                          <ButtonText>{loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar')}</ButtonText>
                        </Button>
                      </HStack>
                    </Box>
                  </Box>
                );

              default:
                return null;
            }
          }}
        />

        <AppAlertDialog
          isOpen={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          onConfirm={() => {
            setShowAlert(false);
            if (alertTitle === 'Sucesso') {
              router.replace('/(tabs)');
            }
          }}
        />
      </ImageBackground>
    </Box>
  );
};

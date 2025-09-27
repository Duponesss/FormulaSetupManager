import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Input, InputField } from '../../components/ui/input';
import { Pressable } from '../../components/ui/pressable';
import { Text } from '../../components/ui/text';
import { Textarea, TextareaInput } from '../../components/ui/textarea';
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from '../../components/ui/slider';
import { Picker } from '@react-native-picker/picker';
import { FormControl, FormControlError, FormControlErrorText } from '../../components/ui/form-control';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertDialog from '../../src/components/dialogs/CustomAlertDialog';
import { FlatList } from 'react-native';

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
        <Text className="font-medium mb-2 text-sm">{label}</Text>
        <Text className="font-bold">{localValue.toFixed(step < 1 ? 2 : 0)}{unit}{suffix}</Text>
      </HStack>
      <Slider
        value={localValue}
        onChange={setLocalValue} // onChange atualiza apenas o estado local
        onChangeEnd={onFinalChange} // onChangeEnd atualiza o store global
        minValue={min} maxValue={max} step={step}
      >
        <SliderTrack><SliderFilledTrack /></SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
});


export default function CreateSetupScreen() {
  // console.log('OBJETO DE ROTA RECEBIDO:', JSON.stringify(route, null, 2));
  const router = useRouter();
  const { setupId } = useLocalSearchParams<{ setupId?: string }>();
  // Conecta-se ao store e pega os dados e ações necessárias
  const { formData, updateField, loadExistingSetup, resetForm, addNewSetup, updateExistingSetup } = useSetupStore();
  
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!setupId);
  const [submitted, setSubmitted] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
      // Quando a tela ganha foco
      if (setupId) {
        setIsEditMode(true);
        loadExistingSetup(setupId);
      } else {
        setIsEditMode(false);
        resetForm();
      }

      // Função de limpeza: executada quando a tela perde o foco
      return () => {
        resetForm();
        setSubmitted(false); // Reseta o estado de submissão também
      };
    }, [setupId, loadExistingSetup, resetForm])
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

    const creationDate = isEditMode ? formData.createdAt : new Date().toISOString();

    const setupToSave = {
      ...formData,
      id: setupId || Date.now().toString(),
      createdAt: creationDate,
      updatedAt: new Date().toISOString()
    };

    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      let setups = storedSetups ? JSON.parse(storedSetups) : [];

      if (isEditMode && setupId) {
        const setupIndex = setups.findIndex((s: any) => s.id === setupId);
        if (setupIndex > -1) setups[setupIndex] = setupToSave;
        else setups.push(setupToSave); // Fallback para o caso de não encontrar
        updateExistingSetup(setupToSave);
      } else {
        setups.push(setupToSave);
        addNewSetup(setupToSave);
      }

      await AsyncStorage.setItem('setups', JSON.stringify(setups));

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
  const controlTypes = useMemo(() => ['Controle', 'Volante'] as const, []);
  const carOptions = useMemo(() => [
    'Mercedes W14', 'Red Bull RB19', 'Ferrari SF-23', 'McLaren MCL60',
    'Aston Martin AMR23', 'Alpine A523', 'Williams FW45', 'AlphaTauri AT04',
    'Sauber C44', 'Haas VF-23'
  ] as const, []);
  const trackOptions = useMemo(() => [
    'Bahrain', 'Saudi Arabia', 'Australia', 'Azerbaijan', 'Miami',
    'Monaco', 'Spain', 'Canada', 'Austria', 'Great Britain',
    'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Singapore',
    'Japan', 'Qatar', 'United States', 'Mexico', 'Brazil', 'Las Vegas', 'Abu Dhabi'
  ] as const, []);
  const conditionOptions = useMemo(() => ['Seco', 'Chuva', 'Chuva forte'] as const, []);

  const formSections: FormSectionItem[] = useMemo(() => [
    { type: 'header', id: 'basic_info_header' },
    { type: 'input', id: 'setupTitle', label: 'Nome do Setup' },
    { type: 'picker', id: 'controlType', label: 'Tipo de Controle', options: controlTypes },
    { type: 'picker', id: 'car', label: 'Carro', options: carOptions },
    { type: 'picker', id: 'track', label: 'Circuito', options: trackOptions },
    { type: 'picker', id: 'condition', label: 'Condições', options: conditionOptions },
    { type: 'textarea', id: 'notes', label: 'Observações' },
    { type: 'header', id: 'aero_header' },
    { type: 'slider', id: 'frontWing', label: 'Asa Dianteira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearWing', label: 'Asa Traseira', min: 0, max: 50, step: 1 },
    { type: 'header', id: 'transmission_header' },
    { type: 'slider', id: 'differentialOnThrottle', label: 'Diferencial com Aceleração', min: 0, max: 100, step: 1 },
    { type: 'slider', id: 'differentialOffThrottle', label: 'Diferencial sem Aceleração', min: 0, max: 100, step: 1 },
    { type: 'slider', id: 'engineBraking', label: 'Frenagem do Motor', min: 0, max: 100, step: 1 },
    { type: 'header', id: 'suspension_geometry_header' },
    { type: 'slider', id: 'frontCamber', label: 'Cambagem Dianteira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearCamber', label: 'Cambagem Traseira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'frontToe', label: 'Toe Dianteiro', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearToe', label: 'Toe Traseiro', min: 0, max: 50, step: 1 },
    { type: 'header', id: 'suspension_header' },
    { type: 'slider', id: 'frontSuspension', label: 'Suspensão Dianteira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearSuspension', label: 'Suspensão Traseira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'frontAntiRollBar', label: 'Anti-Roll Bar Dianteira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearAntiRollBar', label: 'Anti-Roll Bar Traseira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'frontRideHeight', label: 'Altura de Suspensão Dianteira', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearRideHeight', label: 'Altura de Suspensão Traseira', min: 0, max: 50, step: 1 },
    { type: 'header', id: 'brakes_header' },
    { type: 'slider', id: 'brakePressure', label: 'Pressão de Freio', min: 0, max: 100, step: 1 },
    { type: 'slider', id: 'brakeBalance', label: 'Balanceamento de Freio', min: 0, max: 100, step: 1 },
    { type: 'header', id: 'tires_header' },
    { type: 'slider', id: 'frontRightTirePressure', label: 'Pressão de Pneu Dianteiro Direito', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'frontLeftTirePressure', label: 'Pressão de Pneu Dianteiro Esquerdo', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearRightTirePressure', label: 'Pressão de Pneu Traseiro Direito', min: 0, max: 50, step: 1 },
    { type: 'slider', id: 'rearLeftTirePressure', label: 'Pressão de Pneu Traseiro Esquerdo', min: 0, max: 50, step: 1 },
    { type: 'footer', id: 'action_buttons' }
  ], [carOptions, trackOptions, conditionOptions, controlTypes]); 

  return (
    <Box className="flex-1 bg-white">
      {/* Header */}
      <Box className="pt-12 pb-4 px-6 border-b border-neutral-200">
        <HStack className="items-center justify-between">
          <Heading size="xl">{isEditMode ? 'Editar Setup' : 'Novo Setup'}</Heading>
          <Pressable onPress={() => router.back()}><Text size="2xl">×</Text></Pressable>
        </HStack>
      </Box>

      <FlatList
        data={formSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: FormSectionItem }) => {
          switch (item.type) {
            case 'header':
              const isFirstHeader = item.id === 'basic_info_header';
              return <Heading size="lg" className={`mb-4 ${isFirstHeader ? '' : 'mt-6 text-red-600'}`}>{item.title}</Heading>;

            case 'input':
              return (
                <FormControl isInvalid={submitted && !formData.setupTitle} className="mb-4">
                  <Text className="mb-2 font-medium">{item.label}</Text>
                  <Input>
                    <InputField
                      placeholder="Digite o nome do setup"
                      value={formData.setupTitle}
                      onChangeText={(text) => updateField('setupTitle', text)}
                    />
                  </Input>
                  {submitted && !formData.setupTitle && <FormControlError><FormControlErrorText>Campo obrigatório</FormControlErrorText></FormControlError>}
                </FormControl>
              );

            case 'picker':
              const pickerKey = item.id as keyof SetupData;
              return (
                <FormControl isInvalid={submitted && !formData[pickerKey]} className="mb-4">
                  <Text className="mb-2 font-medium">{item.label}</Text>
                  <Box className="border border-gray-300 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={formData[pickerKey]}
                      onValueChange={(value) => updateField(pickerKey, value)}
                      className="md"
                    >
                      <Picker.Item label={`Selecione ${item.label?.toLowerCase()}`} value="" />
                      {(item.options as readonly string[]).map((opt) => <Picker.Item key={opt} label={opt} value={opt} />)}
                    </Picker>
                  </Box>
                  {submitted && !formData[pickerKey] && <FormControlError><FormControlErrorText>Campo obrigatório</FormControlErrorText></FormControlError>}
                </FormControl>
              );

            case 'textarea':
              return (
                <Box className="mb-4">
                  <Text className="mb-2 font-medium">{item.label}</Text>
                  <Textarea>
                    <TextareaInput
                      placeholder="Notas sobre o setup, condições de pista, etc..."
                      value={formData.notes}
                      onChangeText={(text) => updateField('notes', text)}
                      multiline
                      numberOfLines={3}
                    />
                  </Textarea>
                </Box>
              );

            case 'slider':
              const sliderKey = item.id as keyof SetupData;
              return (
                <SliderComponent
                  label={item.label!}
                  value={formData[sliderKey] as number}
                  onFinalChange={(newValue) => updateField(sliderKey, newValue)}
                  min={item.min!} max={item.max!} step={item.step!} unit={item.unit} suffix={item.suffix}
                />
              );

            case 'footer':
              return (
                <Box className="my-8">
                  <HStack space="md">
                    <Button variant="outline" className="flex-1" onPress={() => router.back()} isDisabled={loading}>
                      <ButtonText>Cancelar</ButtonText>
                    </Button>
                    <Button className="flex-1" onPress={handleSave} isDisabled={loading}>
                      <ButtonText>{loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar')}</ButtonText>
                    </Button>
                  </HStack>
                </Box>
              );

            default:
              return null;
          }
        }}
      />

      <CustomAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          if (alertTitle === 'Sucesso') {
            router.replace('/(tabs)');
          }
        }}
      />
    </Box>
  );
};

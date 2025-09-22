import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '../../components/ui/alert-dialog';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Input, InputField } from '../../components/ui/input';
import { Pressable } from '../../components/ui/pressable';
import { ScrollView } from '../../components/ui/scroll-view';
import { Text } from '../../components/ui/text';
import { Textarea, TextareaInput } from '../../components/ui/textarea';
import { VStack } from '../../components/ui/vstack';
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from '../../components/ui/slider';
import { Picker } from '@react-native-picker/picker';
import { FormControl, FormControlError, FormControlErrorText } from '../../components/ui/form-control';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlertDialog from '../components/dialogs/CustomAlertDialog';

// (As interfaces e tipos continuam os mesmos)
type MainStackParamList = {
  Home: undefined;
  SetupDetails: { setupId: string };
  CreateSetup: { setupId?: string };
};
type CreateSetupScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateSetup'>;
interface Props {
  navigation: CreateSetupScreenNavigationProp;
  route: { params: { setupId?: string; }; };
}
interface SetupData {
  setupTitle: string; controlType: string; car: string; track: string; condition: string; notes: string; frontWing: number; rearWing: number; differentialOnThrottle: number; differentialOffThrottle: number; engineBraking: number; frontCamber: number; rearCamber: number; frontToe: number; rearToe: number; frontSuspension: number; rearSuspension: number; frontAntiRollBar: number; rearAntiRollBar: number; frontRideHeight: number; rearRideHeight: number; brakePressure: number; brakeBalance: number; frontRightTirePressure: number; frontLeftTirePressure: number; rearRightTirePressure: number; rearLeftTirePressure: number; id?: string; createdAt?: string; updatedAt?: string;
}

const SliderComponent = forwardRef(({
  label, initialValue, min = 0, max = 100, step = 1, unit = '', suffix = ''
}: { label: string; initialValue: number; min?: number; max?: number; step?: number; unit?: string; suffix?: string; }, ref) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState(() => initialValue.toFixed(step < 1 ? 2 : 0));

  // Expõe funções para o componente pai através da ref
  useImperativeHandle(ref, () => ({
    getValue: () => internalValue,
    setValue: (newValue: number) => setInternalValue(newValue),
  }));

  // Atualiza o estado interno se o valor inicial mudar (para o modo de edição)
  useEffect(() => {
    setInternalValue(initialValue);
  }, [initialValue]);

  // Sincroniza o campo de input com o valor do slider
  useEffect(() => {
    setInputValue(internalValue.toFixed(step < 1 ? 2 : 0));
  }, [internalValue, step]);

  // Lida com a submissão do valor digitado no input
  const handleInputSubmit = () => {
    let num = parseFloat(inputValue);
    if (!isNaN(num)) {
      if (num < min) num = min;
      if (num > max) num = max;
      setInternalValue(num);
    } else {
      // Se for inválido, reseta para o valor atual do slider
      setInputValue(internalValue.toFixed(step < 1 ? 2 : 0));
    }
  };

  return (
    <Box className="mb-4">
      <Text className="font-medium mb-2 text-sm">{label}</Text>
      <HStack className="items-center gap-3">
        <Box className="flex-1">
          <HStack className="items-center justify-between mb-1">
            <Text className="text-xs text-gray-500">{min}{unit}</Text>
            <Text className="text-xs text-gray-500">{max}{unit}</Text>
          </HStack>
          <Slider
            value={internalValue}
            onChange={setInternalValue}
            minValue={min} maxValue={max} step={step} className="mb-1"
          >
            <SliderTrack><SliderFilledTrack /></SliderTrack>
            <SliderThumb />
          </Slider>
          <HStack className="items-center justify-between mt-1">
            <Box className="bg-gray-200 rounded-full px-2 py-1">
              <Text className="text-xs">{internalValue.toFixed(step < 1 ? 2 : 0)}{unit}{suffix}</Text>
            </Box>
          </HStack>
        </Box>
        <Box className="w-16">
          <Input size="sm">
            <InputField
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleInputSubmit}
              onBlur={handleInputSubmit}
              keyboardType="numeric" textAlign="center" className="text-xs" selectTextOnFocus
            />
          </Input>
        </Box>
      </HStack>
    </Box>
  );
});



// O COMPONENTE PRINCIPAL DA TELA
const CreateSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  console.log('OBJETO DE ROTA RECEBIDO:', JSON.stringify(route, null, 2)); 
  const { setupId } = route.params;
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!setupId);

  const initialSetupValues = useMemo(() => ({
    frontWing: 25, rearWing: 25, differentialOnThrottle: 55, differentialOffThrottle: 55, engineBraking: 50, frontCamber: -3.0, rearCamber: -1.45, frontToe: 0.25, rearToe: 0.25, frontSuspension: 21, rearSuspension: 21, frontAntiRollBar: 11, rearAntiRollBar: 11, frontRideHeight: 25, rearRideHeight: 70, brakePressure: 90, brakeBalance: 60, frontRightTirePressure: 26.0, frontLeftTirePressure: 26.0, rearRightTirePressure: 23.5, rearLeftTirePressure: 23.5,
  }), []);

  // ESTADO APENAS PARA CAMPOS DE TEXTO E PICKER
  const [formData, setFormData] = useState({
    setupTitle: '', controlType: '', car: '', track: '', condition: '', notes: '',
  });

  // ESTADO PARA VALIDAÇÃO
  const [fieldErrors, setFieldErrors] = useState({
    setupTitle: false, controlType: false, car: false, track: false, condition: false
  });

  // REFERÊNCIAS PARA CADA SLIDER
  const sliderRefs = {
    frontWing: useRef(null), rearWing: useRef(null), differentialOnThrottle: useRef(null), differentialOffThrottle: useRef(null), engineBraking: useRef(null), frontCamber: useRef(null), rearCamber: useRef(null), frontToe: useRef(null), rearToe: useRef(null), frontSuspension: useRef(null), rearSuspension: useRef(null), frontAntiRollBar: useRef(null), rearAntiRollBar: useRef(null), frontRideHeight: useRef(null), rearRideHeight: useRef(null), brakePressure: useRef(null), brakeBalance: useRef(null), frontRightTirePressure: useRef(null), frontLeftTirePressure: useRef(null), rearRightTirePressure: useRef(null), rearLeftTirePressure: useRef(null),
  };

  useEffect(() => {
    // Usamos uma função anónima assíncrona que se chama a si mesma imediatamente (IIFE)
    (async () => {
      if (!setupId) {
        console.log('Modo: Criar Novo Setup.');
        return;
      }

      console.log('Modo: Editar. Carregando dados para o setupId:', setupId);

      try {
        const storedSetups = await AsyncStorage.getItem('setups');
        if (storedSetups) {
          const setups = JSON.parse(storedSetups);
          const setupToEdit = setups.find((s: any) => s.id === setupId);

          if (setupToEdit) {
            console.log('Setup encontrado:', setupToEdit.setupTitle);

            // Atualiza o estado dos campos de texto e pickers
            setFormData({
              setupTitle: setupToEdit.setupTitle || '',
              controlType: setupToEdit.controlType || '',
              car: setupToEdit.car || '',
              track: setupToEdit.track || '',
              condition: setupToEdit.condition || '',
              notes: setupToEdit.notes || '',
            });

            // Atualiza os sliders programaticamente através das refs
            for (const key in sliderRefs) {
              const ref = sliderRefs[key as keyof typeof sliderRefs];
              const valueToSet = setupToEdit[key];

              if (ref.current && valueToSet !== undefined) {
                (ref.current as any).setValue(valueToSet);
              }
            }
          } else {
            console.warn('Setup com ID', setupId, 'não encontrado no AsyncStorage.');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do setup:', error);
      }
    })(); // <-- Os parênteses aqui no final executam a função imediatamente

  }, [setupId]); // Executa apenas quando o setupId muda

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in fieldErrors) {
      setFieldErrors(prev => ({ ...prev, [field]: !value || value === '' }));
    }
  };

  // SUBSTITUA A SUA FUNÇÃO handleSave INTEIRA POR ESTA
  const handleSave = async () => {
    const errors = {
      setupTitle: !formData.setupTitle, controlType: !formData.controlType, car: !formData.car, track: !formData.track, condition: !formData.condition,
    };
    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some(Boolean);

    if (hasErrors) {
      const missing = Object.entries(errors).filter(([, value]) => value).map(([key]) => {
        const names = { setupTitle: 'Nome do Setup', controlType: 'Tipo de Controle', car: 'Carro', track: 'Circuito', condition: 'Condições' };
        return names[key as keyof typeof names];
      });
      const message = `Por favor, preencha os seguintes campos obrigatórios:\n\n• ${missing.join('\n• ')}`;
      setAlertTitle('Informações faltando');
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }

    setLoading(true);

    // Coleta os dados dos sliders através das refs no momento de salvar
    const sliderValues: any = {};
    for (const key in sliderRefs) {
      const ref = sliderRefs[key as keyof typeof sliderRefs];
      if (ref.current) {
        sliderValues[key] = (ref.current as any).getValue();
      }
    }

    const setupToSave = {
      ...formData,
      ...sliderValues,
      id: setupId || Date.now().toString(),
      createdAt: new Date().toISOString(), // Simplificado
      updatedAt: new Date().toISOString()
    };

    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      let setups = storedSetups ? JSON.parse(storedSetups) : [];

      if (isEditMode && setupId) {
        const setupIndex = setups.findIndex((s: any) => s.id === setupId);
        if (setupIndex !== -1) setups[setupIndex] = setupToSave;
        else setups.push(setupToSave);
      } else {
        setups.push(setupToSave);
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
    'Alfa Romeo C43', 'Haas VF-23'
  ] as const, []);
  const trackOptions = useMemo(() => [
    'Bahrain', 'Saudi Arabia', 'Australia', 'Azerbaijan', 'Miami',
    'Monaco', 'Spain', 'Canada', 'Austria', 'Great Britain',
    'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Singapore',
    'Japan', 'Qatar', 'United States', 'Mexico', 'Brazil', 'Las Vegas', 'Abu Dhabi'
  ] as const, []);
  const conditionOptions = useMemo(() => ['Seco', 'Chuva', 'Chuva forte'] as const, []);

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-12 pb-4 px-6">
        <HStack className="items-center justify-between">
          <Heading size="xl">{isEditMode ? 'Editar Setup' : 'Novo Setup'}</Heading>
          <Pressable onPress={() => navigation.goBack()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Formulário de Informações Básicas */}
        <Box className="mb-6">
          <Heading size="lg" className="mb-4">Informações Básicas</Heading>

          <VStack space="md">
            <FormControl isInvalid={fieldErrors.setupTitle}>
              <Text className="mb-2 font-medium">Nome do Setup</Text>
              <Input>
                <InputField
                  placeholder="Digite o nome do setup"
                  value={formData.setupTitle}
                  onChangeText={(text) => updateField('setupTitle', text)}
                />
              </Input>
              {fieldErrors.setupTitle && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.controlType}>
              <Text className="mb-2 font-medium">Tipo de Controle</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={formData.controlType}
                  onValueChange={(value: string) => updateField('controlType', value)}
                >
                  <Picker.Item label="Selecione o tipo de controle" value="" />
                  {controlTypes.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {fieldErrors.controlType && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.car}>
              <Text className="mb-2 font-medium">Carro</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={formData.car}
                  onValueChange={(value: string) => updateField('car', value)}
                >
                  <Picker.Item label="Selecione o carro" value="" />
                  {carOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {fieldErrors.car && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.track}>
              <Text className="mb-2 font-medium">Circuito</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={formData.track}
                  onValueChange={(value: string) => updateField('track', value)}
                >
                  <Picker.Item label="Selecione o circuito" value="" />
                  {trackOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {fieldErrors.track && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.condition}>
              <Text className="mb-2 font-medium">Condições</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={formData.condition}
                  onValueChange={(value: string) => updateField('condition', value)}
                >
                  <Picker.Item label="Selecione as condições" value="" />
                  {conditionOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {fieldErrors.condition && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <Box>
              <Text className="mb-2 font-medium">Observações</Text>
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
          </VStack>
        </Box>

        {/* Aerodinâmica */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Aerodinâmica</Heading>
          <SliderComponent ref={sliderRefs.frontWing} label="Asa Dianteira" initialValue={initialSetupValues.frontWing} min={0} max={50} step={1} />
          <SliderComponent ref={sliderRefs.rearWing} label="Asa Traseira" initialValue={initialSetupValues.rearWing} min={0} max={50} step={1} />
        </Box>

        {/* Transmissão */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Transmissão</Heading>
          <SliderComponent
            ref={sliderRefs.differentialOnThrottle}
            label="Diferencial com Aceleração"
            initialValue={initialSetupValues.differentialOnThrottle}
            min={10}
            max={100}
            step={5}
            unit="%"
          />
          <SliderComponent
            ref={sliderRefs.differentialOffThrottle}
            label="Diferencial sem Aceleração"
            initialValue={initialSetupValues.differentialOffThrottle}
            min={10}
            max={100}
            step={5}
            unit="%"
          />
          <SliderComponent
            ref={sliderRefs.engineBraking}
            label="Frenagem do Motor"
            initialValue={initialSetupValues.engineBraking}
            min={0}
            max={100}
            step={10}
            unit="%"
          />
        </Box>

        {/* Geometria da Suspensão */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Geometria da Suspensão</Heading>
          <SliderComponent
            ref={sliderRefs.frontCamber}
            label="Cambagem Dianteira"
            initialValue={initialSetupValues.frontCamber}
            min={-3.5}
            max={-2.5}
            step={0.1}
            unit="°"
          />
          <SliderComponent
            ref={sliderRefs.rearCamber}
            label="Cambagem Traseira"
            initialValue={initialSetupValues.rearCamber}
            min={-2.2}
            max={-0.7}
            step={0.1}
            unit="°"
          />
          <SliderComponent
            ref={sliderRefs.frontToe}
            label="Toe-out Dianteiro"
            initialValue={initialSetupValues.frontToe}
            min={0.0}
            max={0.5}
            step={0.01}
            unit="°"
          />
          <SliderComponent
            ref={sliderRefs.rearToe}
            label="Toe-in Traseiro"
            initialValue={initialSetupValues.rearToe}
            min={0.0}
            max={0.5}
            step={0.01}
            unit="°"
          />
        </Box>

        {/* Suspensão */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Suspensão</Heading>
          <SliderComponent
            ref={sliderRefs.frontSuspension}
            label="Rigidez da Suspensão Dianteira"
            initialValue={initialSetupValues.frontSuspension}
            min={1}
            max={41}
            step={1}
          />
          <SliderComponent
            ref={sliderRefs.rearSuspension}
            label="Rigidez da Suspensão Traseira"
            initialValue={initialSetupValues.rearSuspension}
            min={1}
            max={41}
            step={1}
          />
          <SliderComponent
            ref={sliderRefs.frontAntiRollBar}
            label="Barra Estabilizadora Dianteira"
            initialValue={initialSetupValues.frontAntiRollBar}
            min={1}
            max={21}
            step={1}
          />
          <SliderComponent
            ref={sliderRefs.rearAntiRollBar}
            label="Barra Estabilizadora Traseira"
            initialValue={initialSetupValues.rearAntiRollBar}
            min={1}
            max={21}
            step={1}
          />
          <SliderComponent
            ref={sliderRefs.frontRideHeight}
            label="Altura do Veículo Dianteira"
            initialValue={initialSetupValues.frontRideHeight}
            min={10}
            max={40}
            step={1}
            unit="mm"
          />
          <SliderComponent
            ref={sliderRefs.rearRideHeight}
            label="Altura do Veículo Traseira"
            initialValue={initialSetupValues.rearRideHeight}
            min={40}
            max={100}
            step={1}
            unit="mm"
          />
        </Box>

        {/* Freios */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Freios</Heading>
          <SliderComponent
            ref={sliderRefs.brakePressure}
            label="Pressão dos Freios"
            initialValue={initialSetupValues.brakePressure}
            min={80}
            max={100}
            step={1}
            unit="%"
          />
          <SliderComponent
            ref={sliderRefs.brakeBalance}
            label="Balanceamento dos Freios"
            initialValue={initialSetupValues.brakeBalance}
            min={50}
            max={70}
            step={1}
            unit="%"
          />
        </Box>

        {/* Pneus */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Pneus</Heading>
          <SliderComponent
            ref={sliderRefs.frontRightTirePressure}
            label="Pressão Pneu Dianteiro Direito"
            initialValue={initialSetupValues.frontRightTirePressure}
            min={22.5}
            max={29.5}
            step={0.1}
            unit=" PSI"
          />
          <SliderComponent
            ref={sliderRefs.frontLeftTirePressure}
            label="Pressão Pneu Dianteiro Esquerdo"
            initialValue={initialSetupValues.frontLeftTirePressure}
            min={22.5}
            max={29.5}
            step={0.1}
            unit=" PSI"
          />
          <SliderComponent
            ref={sliderRefs.rearRightTirePressure}
            label="Pressão Pneu Traseiro Direito"
            initialValue={initialSetupValues.rearRightTirePressure}
            min={20.5}
            max={26.5}
            step={0.1}
            unit=" PSI"
          />
          <SliderComponent
            ref={sliderRefs.rearLeftTirePressure}
            label="Pressão Pneu Traseiro Esquerdo"
            initialValue={initialSetupValues.rearLeftTirePressure}
            min={20.5}
            max={26.5}
            step={0.1}
            unit=" PSI"
          />
        </Box>

        {/* Botões de Ação */}
        <Box className="mb-8 mt-4">
          <HStack space="md" className="mb-4">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => navigation.goBack()}
              isDisabled={loading}
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            <Button
              className="flex-1"
              onPress={handleSave}
              isDisabled={loading}
            >
              <ButtonText>
                {loading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar')}
              </ButtonText>
            </Button>
          </HStack>
        </Box>
      </ScrollView>

      <CustomAlertDialog
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          // Adicionamos aqui a lógica que antes estava no botão do AlertDialog
          if (alertTitle === 'Sucesso') {
            navigation.navigate('Home');
          }
        }}
      />
    </Box>
  );
};

export default CreateSetupScreen;
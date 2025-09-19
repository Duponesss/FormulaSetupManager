import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState, useMemo } from 'react';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '../../components/ui/alert-dialog';
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
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem, SelectFlatList } from '../../components/ui/select';
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText } from '../../components/ui/form-control';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MainStackParamList = {
  Home: undefined;
  SetupDetails: { setupId: string };
  CreateSetup: { setupId?: string };
};

type CreateSetupScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateSetup'>;

interface Props {
  navigation: CreateSetupScreenNavigationProp;
  route: {
    params: {
      setupId?: string;
    };
  };
}

interface SetupData {
  // Informações Básicas
  setupTitle: string;
  controlType: string;
  car: string;
  track: string;
  condition: string;
  notes: string;
  
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

const CreateSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { setupId } = route.params;
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertActions, setAlertActions] = useState<Array<{text: string, onPress: () => void}>>([]);
  const [isEditMode, setIsEditMode] = useState(!!setupId);

  // Estados de validação
  const [fieldErrors, setFieldErrors] = useState({
    setupTitle: false,
    controlType: false,
    car: false,
    track: false,
    condition: false
  });

  // Estados para todos os campos do setup
  const [setupData, setSetupData] = useState<SetupData>({
    // Informações Básicas
    setupTitle: '',
    controlType: '',
    car: '',
    track: '',
    condition: '',
    notes: '',
    
    // Aerodinâmica (0-50, step: 1)
    frontWing: 25,
    rearWing: 25,
    
    // Transmissão
    differentialOnThrottle: 55, // 10-100%, step: 5
    differentialOffThrottle: 55, // 10-100%, step: 5
    engineBraking: 50, // 0-100%, step: 10
    
    // Geometria da Suspensão
    frontCamber: -3.0, // -3.50° a -2.50°, step: 0.10
    rearCamber: -1.45, // -2.20° a -0.70°, step: 0.10
    frontToe: 0.25, // 0.00° a 0.50°, step: 0.01
    rearToe: 0.25, // 0.00° a 0.50°, step: 0.01
    
    // Suspensão
    frontSuspension: 21, // 1-41, step: 1
    rearSuspension: 21, // 1-41, step: 1
    frontAntiRollBar: 11, // 1-21, step: 1
    rearAntiRollBar: 11, // 1-21, step: 1
    frontRideHeight: 25, // 10-40, step: 1
    rearRideHeight: 70, // 40-100, step: 1
    
    // Freios
    brakePressure: 90, // 80-100%, step: 1
    brakeBalance: 60, // 50-70%, step: 1
    
    // Pneus
    frontRightTirePressure: 26.0, // 22.5-29.5, step: 0.1
    frontLeftTirePressure: 26.0, // 22.5-29.5, step: 0.1
    rearRightTirePressure: 23.5, // 20.5-26.5, step: 0.1
    rearLeftTirePressure: 23.5, // 20.5-26.5, step: 0.1
  });

  useEffect(() => {
    if (setupId) {
      loadSetupData();
    }
  }, [setupId]);

  const loadSetupData = async () => {
    if (!setupId) return;
    
    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const setups = JSON.parse(storedSetups);
        const setup = setups.find((s: any) => s.id === setupId);
        if (setup) {
          setSetupData(prevData => ({
            ...prevData,
            ...setup
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do setup:', error);
    }
  };

  const showAlertDialog = (title: string, message: string, actions?: Array<{text: string, onPress: () => void}>) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertActions(actions || [{text: 'OK', onPress: () => setShowAlert(false)}]);
    setShowAlert(true);
  };

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (!validateRequiredFields()) {
      showAlertDialog('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const setupToSave = {
        ...setupData,
        id: setupId || Date.now().toString(),
        createdAt: isEditMode ? setupData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Carregar setups existentes
      const storedSetups = await AsyncStorage.getItem('setups');
      let setups = storedSetups ? JSON.parse(storedSetups) : [];

      if (isEditMode && setupId) {
        // Modo edição - atualizar setup existente
        const setupIndex = setups.findIndex((s: any) => s.id === setupId);
        if (setupIndex !== -1) {
          setups[setupIndex] = setupToSave;
        }
      } else {
        // Modo criação - adicionar novo setup
        setups.push(setupToSave);
      }

      // Salvar no AsyncStorage
      await AsyncStorage.setItem('setups', JSON.stringify(setups));

      showAlertDialog('Sucesso', 'Setup salvo com sucesso!', [
        {text: 'OK', onPress: () => navigation.navigate('Home')}
      ]);
    } catch (error) {
      console.error('Erro ao salvar setup:', error);
      showAlertDialog('Erro', 'Não foi possível salvar o setup');
      setLoading(false);
    }
  };

  const updateField = (field: keyof SetupData, value: string | number) => {
    setSetupData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    // Validação em tempo real para campos obrigatórios
    if (['setupTitle', 'controlType', 'car', 'track', 'condition'].includes(field)) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: !value || value === ''
      }));
    }
  };

  const validateRequiredFields = () => {
    const errors = {
      setupTitle: !setupData.setupTitle || setupData.setupTitle.trim() === '',
      controlType: !setupData.controlType || setupData.controlType === '',
      car: !setupData.car || setupData.car === '',
      track: !setupData.track || setupData.track === '',
      condition: !setupData.condition || setupData.condition === ''
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Dados dos selects memoizados para performance
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

  const SliderComponent = ({ 
    value, 
    onValueChange, 
    label, 
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    suffix = ''
  }: { 
    value: number; 
    onValueChange: (value: number) => void; 
    label: string; 
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    suffix?: string;
  }) => {
    const [inputValue, setInputValue] = useState(value.toString());

    // Atualizar inputValue quando value mudar externamente
    useEffect(() => {
      setInputValue(value.toString());
    }, [value]);

    const handleInputChange = (text: string) => {
      setInputValue(text);
    };

    const handleInputSubmit = () => {
      const num = parseFloat(inputValue);
      if (!isNaN(num) && num >= min && num <= max) {
        onValueChange(num);
      } else {
        // Resetar para valor atual se inválido
        setInputValue(value.toString());
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
            {/* Slider do Gluestack */}
            <Slider
              defaultValue={value}
              onChange={onValueChange}
              minValue={min}
              maxValue={max}
              step={step}
              className="mb-1"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <HStack className="items-center justify-between mt-1">
              <Box className="bg-gray-200 rounded-full px-2 py-1">
                <Text className="text-xs">{value}{unit}{suffix}</Text>
              </Box>
            </HStack>
          </Box>
          <Box className="w-16">
            <Input size="sm">
              <InputField
                value={inputValue}
                onChangeText={handleInputChange}
                onSubmitEditing={handleInputSubmit}
                onBlur={handleInputSubmit}
                keyboardType="numeric"
                textAlign="center"
                className="text-xs"
                selectTextOnFocus
              />
            </Input>
          </Box>
        </HStack>
      </Box>
    );
  };

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
        {/* Informações Básicas */}
        <Box className="mb-6">
          <Heading size="lg" className="mb-4">Informações Básicas</Heading>
          
          <VStack space="md">
            <FormControl isInvalid={fieldErrors.setupTitle}>
              <Text className="mb-2 font-medium">Nome do Setup</Text>
              <Input>
                <InputField
                  placeholder="Digite o nome do setup"
                  value={setupData.setupTitle}
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
              <Select
                selectedValue={setupData.controlType}
                onValueChange={(value) => updateField('controlType', value)}
                closeOnOverlayClick={true}
              >
                <SelectTrigger>
                  <SelectInput placeholder="Selecione o tipo de controle" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectFlatList
                      data={controlTypes as readonly string[]}
                      renderItem={({ item }: any) => (
                        <SelectItem key={item} label={item} value={item} />
                      )}
                      keyExtractor={(item: any) => item}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={3}
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
              {fieldErrors.controlType && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.car}>
              <Text className="mb-2 font-medium">Carro</Text>
              <Select
                selectedValue={setupData.car}
                onValueChange={(value) => updateField('car', value)}
                closeOnOverlayClick={true}
              >
                <SelectTrigger>
                  <SelectInput placeholder="Selecione o carro" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectFlatList
                      data={carOptions as readonly string[]}
                      renderItem={({ item }: any) => (
                        <SelectItem key={item} label={item} value={item} />
                      )}
                      keyExtractor={(item: any) => item}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
              {fieldErrors.car && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.track}>
              <Text className="mb-2 font-medium">Circuito</Text>
              <Select
                selectedValue={setupData.track}
                onValueChange={(value) => updateField('track', value)}
                closeOnOverlayClick={true}
              >
                <SelectTrigger>
                  <SelectInput placeholder="Selecione o circuito" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectFlatList
                      data={trackOptions as readonly string[]}
                      renderItem={({ item }: any) => (
                        <SelectItem key={item} label={item} value={item} />
                      )}
                      keyExtractor={(item: any) => item}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
              {fieldErrors.track && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={fieldErrors.condition}>
              <Text className="mb-2 font-medium">Condições</Text>
              <Select
                selectedValue={setupData.condition}
                onValueChange={(value) => updateField('condition', value)}
                closeOnOverlayClick={true}
              >
                <SelectTrigger>
                  <SelectInput placeholder="Selecione as condições" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectFlatList
                      data={conditionOptions as readonly string[]}
                      renderItem={({ item }: any) => (
                        <SelectItem key={item} label={item} value={item} />
                      )}
                      keyExtractor={(item: any) => item}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={3}
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
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
                  value={setupData.notes}
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
          
          <SliderComponent
            value={setupData.frontWing}
            onValueChange={(value) => updateField('frontWing', value)}
            label="Asa Dianteira"
            min={0}
            max={50}
            step={1}
          />

          <SliderComponent
            value={setupData.rearWing}
            onValueChange={(value) => updateField('rearWing', value)}
            label="Asa Traseira"
            min={0}
            max={50}
            step={1}
          />
        </Box>

        {/* Transmissão */}
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Heading size="md" className="mb-4 text-red-600">Transmissão</Heading>
          
          <SliderComponent
            value={setupData.differentialOnThrottle}
            onValueChange={(value) => updateField('differentialOnThrottle', value)}
            label="Diferencial com Aceleração"
            min={10}
            max={100}
            step={5}
            unit="%"
          />

          <SliderComponent
            value={setupData.differentialOffThrottle}
            onValueChange={(value) => updateField('differentialOffThrottle', value)}
            label="Diferencial sem Aceleração"
            min={10}
            max={100}
            step={5}
            unit="%"
          />

          <SliderComponent
            value={setupData.engineBraking}
            onValueChange={(value) => updateField('engineBraking', value)}
            label="Frenagem do Motor"
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
            value={setupData.frontCamber}
            onValueChange={(value) => updateField('frontCamber', value)}
            label="Cambagem Dianteira"
            min={-3.5}
            max={-2.5}
            step={0.1}
            unit="°"
          />

          <SliderComponent
            value={setupData.rearCamber}
            onValueChange={(value) => updateField('rearCamber', value)}
            label="Cambagem Traseira"
            min={-2.2}
            max={-0.7}
            step={0.1}
            unit="°"
          />

          <SliderComponent
            value={setupData.frontToe}
            onValueChange={(value) => updateField('frontToe', value)}
            label="Toe-out Dianteiro"
            min={0.0}
            max={0.5}
            step={0.01}
            unit="°"
          />

          <SliderComponent
            value={setupData.rearToe}
            onValueChange={(value) => updateField('rearToe', value)}
            label="Toe-in Traseiro"
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
            value={setupData.frontSuspension}
            onValueChange={(value) => updateField('frontSuspension', value)}
            label="Suspensão Dianteira"
            min={1}
            max={41}
            step={1}
          />

          <SliderComponent
            value={setupData.rearSuspension}
            onValueChange={(value) => updateField('rearSuspension', value)}
            label="Suspensão Traseira"
            min={1}
            max={41}
            step={1}
          />

          <SliderComponent
            value={setupData.frontAntiRollBar}
            onValueChange={(value) => updateField('frontAntiRollBar', value)}
            label="Barra Anti-Rolagem Dianteira"
            min={1}
            max={21}
            step={1}
          />

          <SliderComponent
            value={setupData.rearAntiRollBar}
            onValueChange={(value) => updateField('rearAntiRollBar', value)}
            label="Barra Anti-Rolagem Traseira"
            min={1}
            max={21}
            step={1}
          />

          <SliderComponent
            value={setupData.frontRideHeight}
            onValueChange={(value) => updateField('frontRideHeight', value)}
            label="Altura Dianteira"
            min={10}
            max={40}
            step={1}
            unit="mm"
          />

          <SliderComponent
            value={setupData.rearRideHeight}
            onValueChange={(value) => updateField('rearRideHeight', value)}
            label="Altura Traseira"
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
            value={setupData.brakePressure}
            onValueChange={(value) => updateField('brakePressure', value)}
            label="Pressão dos Freios"
            min={80}
            max={100}
            step={1}
            unit="%"
          />

          <SliderComponent
            value={setupData.brakeBalance}
            onValueChange={(value) => updateField('brakeBalance', value)}
            label="Balanceamento de Freios"
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
            value={setupData.frontRightTirePressure}
            onValueChange={(value) => updateField('frontRightTirePressure', value)}
            label="Pressão Pneu Dianteiro Direito"
            min={22.5}
            max={29.5}
            step={0.1}
            unit=" PSI"
          />

          <SliderComponent
            value={setupData.frontLeftTirePressure}
            onValueChange={(value) => updateField('frontLeftTirePressure', value)}
            label="Pressão Pneu Dianteiro Esquerdo"
            min={22.5}
            max={29.5}
            step={0.1}
            unit=" PSI"
          />

          <SliderComponent
            value={setupData.rearRightTirePressure}
            onValueChange={(value) => updateField('rearRightTirePressure', value)}
            label="Pressão Pneu Traseiro Direito"
            min={20.5}
            max={26.5}
            step={0.1}
            unit=" PSI"
          />

          <SliderComponent
            value={setupData.rearLeftTirePressure}
            onValueChange={(value) => updateField('rearLeftTirePressure', value)}
            label="Pressão Pneu Traseiro Esquerdo"
            min={20.5}
            max={26.5}
            step={0.1}
            unit=" PSI"
          />
        </Box>

        {/* Action Buttons - Fixos no final */}
        <Box className="mb-8 pt-4 border-t border-gray-200">
          <HStack className="gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => navigation.goBack()}
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>
            
            <Button
              className="flex-1"
              onPress={handleSave}
              disabled={loading}
            >
              <ButtonText>
                {loading ? 'Salvando...' : (isEditMode ? 'Atualizar Setup' : 'Criar Setup')}
              </ButtonText>
            </Button>
          </HStack>
        </Box>
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

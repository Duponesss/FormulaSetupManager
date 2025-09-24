import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { useSetupStore } from '../stores/setupStore';
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

const SliderComponent = ({
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
        onChangeEnd={onFinalChange} // onChangeEnd atualiza o store global - UMA ÚNICA VEZ
        minValue={min} maxValue={max} step={step}
      >
        <SliderTrack><SliderFilledTrack /></SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  );
};



// O COMPONENTE PRINCIPAL DA TELA
const CreateSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  console.log('OBJETO DE ROTA RECEBIDO:', JSON.stringify(route, null, 2));
  const { setupId } = route.params;
  // Conecta-se ao store e pega os dados e ações que precisamos
  const { data, updateField, loadExistingSetup, reset } = useSetupStore();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(!!setupId);
  const [submitted, setSubmitted] = useState(false);
  const [canRenderHeavyContent, setCanRenderHeavyContent] = useState(false);


  useEffect(() => {
    if (setupId) {
      loadExistingSetup(setupId);
    } else {
      reset();
    }
    // Função de limpeza para resetar o formulário quando a tela fecha
    return () => reset();
  }, [setupId, loadExistingSetup, reset]);

  // Este efeito ativa a renderização do conteúdo pesado após a tela ser montada
  useEffect(() => {
    // Delay de tempo para a animação de transição da tela terminar
    const timer = setTimeout(() => {
      setCanRenderHeavyContent(true);
    }, 50);

    return () => clearTimeout(timer); // Limpa o timer se a tela for fechada
  }, []);

  const handleSave = async () => {
    setSubmitted(true);
    // A validação é feita diretamente com os dados do store
    if (!data.setupTitle || !data.controlType || !data.car || !data.track || !data.condition) {
      const message = "Por favor, preencha todos os campos básicos obrigatórios.";
      setAlertTitle('Informações faltando');
      setAlertMessage(message);
      setShowAlert(true);
      return;
    }

    setLoading(true);

    const setupToSave = {
      ...data,
      id: setupId || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      let setups = storedSetups ? JSON.parse(storedSetups) : [];

      if (isEditMode && setupId) {
        const setupIndex = setups.findIndex((s: any) => s.id === setupId);
        if (setupIndex !== -1) {
          setups[setupIndex] = setupToSave;
        } else {
          setups.push(setupToSave);
        }
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
            <FormControl isInvalid={submitted && !data.setupTitle}>
              <Text className="mb-2 font-medium">Nome do Setup</Text>
              <Input>
                <InputField
                  placeholder="Digite o nome do setup"
                  value={data.setupTitle}
                  onChangeText={(text) => updateField('setupTitle', text)}
                />
              </Input>
              {submitted && !data.setupTitle && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={submitted && !data.controlType}>
              <Text className="mb-2 font-medium">Tipo de Controle</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={data.controlType}
                  onValueChange={(value: string) => updateField('controlType', value)}
                >
                  <Picker.Item label="Selecione o tipo de controle" value="" />
                  {controlTypes.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {submitted && !data.controlType && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={submitted && !data.car}>
              <Text className="mb-2 font-medium">Carro</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={data.car}
                  onValueChange={(value: string) => updateField('car', value)}
                >
                  <Picker.Item label="Selecione o carro" value="" />
                  {carOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {submitted && !data.car && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={submitted && !data.track}>
              <Text className="mb-2 font-medium">Circuito</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={data.track}
                  onValueChange={(value: string) => updateField('track', value)}
                >
                  <Picker.Item label="Selecione o circuito" value="" />
                  {trackOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {submitted && !data.track && (
                <FormControlError>
                  <FormControlErrorText>Este campo é obrigatório</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl isInvalid={submitted && !data.condition}>
              <Text className="mb-2 font-medium">Condições</Text>
              <Box className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={data.condition}
                  onValueChange={(value: string) => updateField('condition', value)}
                >
                  <Picker.Item label="Selecione as condições" value="" />
                  {conditionOptions.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </Box>
              {submitted && !data.condition && (
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
                  value={data.notes}
                  onChangeText={(text) => updateField('notes', text)}
                  multiline
                  numberOfLines={3}
                />
              </Textarea>
            </Box>
          </VStack>
        </Box>

        {canRenderHeavyContent && (
          <>
            {/* Aerodinâmica */}
            <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Heading size="md" className="mb-4 text-red-600">Aerodinâmica</Heading>
              <SliderComponent
                value={data.frontWing}
                label="Asa Dianteira"
                onFinalChange={(newValue) => updateField('frontWing', newValue)}
                min={0} max={50} step={1} />
              <SliderComponent
                value={data.rearWing}
                label="Asa Traseira"
                onFinalChange={(newValue) => updateField('rearWing', newValue)}
                min={0} max={50} step={1} />
            </Box>

            {/* Transmissão */}
            <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Heading size="md" className="mb-4 text-red-600">Transmissão</Heading>
              <SliderComponent
                value={data.differentialOnThrottle}
                label="Diferencial com Aceleração"
                onFinalChange={(newValue) => updateField('differentialOnThrottle', newValue)}
                min={10}
                max={100}
                step={5}
                unit="%"
              />
              <SliderComponent
                value={data.differentialOffThrottle}
                label="Diferencial sem Aceleração"
                onFinalChange={(newValue) => updateField('differentialOffThrottle', newValue)}
                min={10}
                max={100}
                step={5}
                unit="%"
              />
              <SliderComponent
                value={data.engineBraking}
                label="Frenagem do Motor"
                onFinalChange={(newValue) => updateField('engineBraking', newValue)}
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
                value={data.frontCamber}
                label="Cambagem Dianteira"
                onFinalChange={(newValue) => updateField('frontCamber', newValue)}
                min={-3.5}
                max={-2.5}
                step={0.1}
                unit="°"
              />
              <SliderComponent
                value={data.rearCamber}
                label="Cambagem Traseira"
                onFinalChange={(newValue) => updateField('rearCamber', newValue)}
                min={-2.2}
                max={-0.7}
                step={0.1}
                unit="°"
              />
              <SliderComponent
                value={data.frontToe}
                label="Toe-out Dianteiro"
                onFinalChange={(newValue) => updateField('frontToe', newValue)}
                min={0.0}
                max={0.5}
                step={0.01}
                unit="°"
              />
              <SliderComponent
                value={data.rearToe}
                label="Toe-in Traseiro"
                onFinalChange={(newValue) => updateField('rearToe', newValue)}
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
                value={data.frontSuspension}
                label="Rigidez da Suspensão Dianteira"
                onFinalChange={(newValue) => updateField('frontSuspension', newValue)}
                min={1}
                max={41}
                step={1}
              />
              <SliderComponent
                value={data.rearSuspension}
                label="Rigidez da Suspensão Traseira"
                onFinalChange={(newValue) => updateField('rearSuspension', newValue)}
                min={1}
                max={41}
                step={1}
              />
              <SliderComponent
                value={data.frontAntiRollBar}
                label="Barra Estabilizadora Dianteira"
                onFinalChange={(newValue) => updateField('frontAntiRollBar', newValue)}
                min={1}
                max={21}
                step={1}
              />
              <SliderComponent
                value={data.rearAntiRollBar}
                label="Barra Estabilizadora Traseira"
                onFinalChange={(newValue) => updateField('rearAntiRollBar', newValue)}
                min={1}
                max={21}
                step={1}
              />
              <SliderComponent
                value={data.frontRideHeight}
                label="Altura do Veículo Dianteira"
                onFinalChange={(newValue) => updateField('frontRideHeight', newValue)}
                min={10}
                max={40}
                step={1}
                unit="mm"
              />
              <SliderComponent
                value={data.rearRideHeight}
                label="Altura do Veículo Traseira"
                onFinalChange={(newValue) => updateField('rearRideHeight', newValue)}
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
                value={data.brakePressure}
                label="Pressão dos Freios"
                onFinalChange={(newValue) => updateField('brakePressure', newValue)}
                min={80}
                max={100}
                step={1}
                unit="%"
              />
              <SliderComponent
                value={data.brakeBalance}
                label="Balanceamento dos Freios"
                onFinalChange={(newValue) => updateField('brakeBalance', newValue)}
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
                value={data.frontRightTirePressure}
                label="Pressão Pneu Dianteiro Direito"
                onFinalChange={(newValue) => updateField('frontRightTirePressure', newValue)}
                min={22.5}
                max={29.5}
                step={0.1}
                unit=" PSI"
              />
              <SliderComponent
                value={data.frontLeftTirePressure}
                label="Pressão Pneu Dianteiro Esquerdo"
                onFinalChange={(newValue) => updateField('frontLeftTirePressure', newValue)}
                min={22.5}
                max={29.5}
                step={0.1}
                unit=" PSI"
              />
              <SliderComponent
                value={data.rearRightTirePressure}
                label="Pressão Pneu Traseiro Direito"
                onFinalChange={(newValue) => updateField('rearRightTirePressure', newValue)}
                min={20.5}
                max={26.5}
                step={0.1}
                unit=" PSI"
              />
              <SliderComponent
                value={data.rearLeftTirePressure}
                label="Pressão Pneu Traseiro Esquerdo"
                onFinalChange={(newValue) => updateField('rearLeftTirePressure', newValue)}
                min={20.5}
                max={26.5}
                step={0.1}
                unit=" PSI"
              />
            </Box>
          </>
        )}

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
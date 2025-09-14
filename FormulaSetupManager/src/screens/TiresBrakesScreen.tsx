import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { ScrollView } from '../../components/ui/scroll-view';
import { Pressable } from '../../components/ui/pressable';
import { Input, InputField } from '../../components/ui/input';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';

type MainStackParamList = {
  Home: undefined;
  CreateSetup: undefined;
  SetupDetails: { setupId: string };
  Aerodynamics: { setupId?: string };
  Suspension: { setupId?: string };
  TiresBrakes: { setupId?: string };
};

type TiresBrakesScreenNavigationProp = StackNavigationProp<MainStackParamList, 'TiresBrakes'>;

interface Props {
  navigation: TiresBrakesScreenNavigationProp;
  route: {
    params: {
      setupId?: string;
    };
  };
}

const TiresBrakesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { setupId } = route.params;
  const [frontTirePressure, setFrontTirePressure] = useState(23);
  const [rearTirePressure, setRearTirePressure] = useState(23);
  const [brakePressure, setBrakePressure] = useState(80);
  const [brakeBalance, setBrakeBalance] = useState(56);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertActions, setAlertActions] = useState<Array<{text: string, onPress: () => void}>>([]);

  useEffect(() => {
    if (setupId) {
      loadSetupData();
    }
  }, [setupId]);

  const loadSetupData = async () => {
    if (!setupId) return;
    
    try {
      const docRef = doc(db, 'setups', setupId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFrontTirePressure(data.frontTirePressure || 23);
        setRearTirePressure(data.rearTirePressure || 23);
        setBrakePressure(data.brakePressure || 80);
        setBrakeBalance(data.brakeBalance || 56);
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
    if (!setupId) {
      showAlertDialog('Erro', 'ID do setup não encontrado');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'setups', setupId);
      await updateDoc(docRef, {
        frontTirePressure,
        rearTirePressure,
        brakePressure,
        brakeBalance,
      });

      showAlertDialog('Sucesso', 'Setup salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar setup:', error);
      showAlertDialog('Erro', 'Não foi possível salvar o setup');
    } finally {
      setLoading(false);
    }
  };

  const SliderComponent = ({ 
    value, 
    onValueChange, 
    label, 
    max = 100,
    unit = '',
    suffix = ''
  }: { 
    value: number; 
    onValueChange: (value: number) => void; 
    label: string; 
    max?: number;
    unit?: string;
    suffix?: string;
  }) => (
    <Box className="mb-6">
      <Text className="font-medium mb-3">{label}</Text>
      <HStack className="items-center gap-4">
        <Box className="flex-1">
          <HStack className="items-center justify-between mb-2">
            <Text>0{unit}</Text>
            <Text>{max}{unit}</Text>
          </HStack>
          <Box className="h-2 bg-gray-300 rounded-full relative">
            <Box 
              className="h-2 bg-red-600 rounded-full absolute"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </Box>
          <HStack className="items-center justify-between mt-2">
            <Box className="bg-gray-200 rounded-full px-3 py-1">
              <Text className="text-sm">{value}{unit}{suffix}</Text>
            </Box>
          </HStack>
        </Box>
        <Box className="w-16">
          <Input>
            <InputField
              value={value.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (num >= 0 && num <= max) {
                  onValueChange(num);
                }
              }}
              keyboardType="numeric"
              textAlign="center"
            />
          </Input>
        </Box>
      </HStack>
    </Box>
  );

  return (
    <Box className="flex-1">
      {/* Header */}
      <Box className="pt-12 pb-4 px-6">
        <HStack className="items-center justify-between">
          <Heading size="xl">Pneus e Freios</Heading>
          <Pressable onPress={() => navigation.goBack()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 p-6">
        {/* Tires and Brakes Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="2xl" className="mb-6">Pneus e Freios</Heading>
          
          <SliderComponent
            value={frontTirePressure}
            onValueChange={setFrontTirePressure}
            label="Pressão Pneus Dianteiros"
            max={35}
            unit="psi"
          />

          <SliderComponent
            value={rearTirePressure}
            onValueChange={setRearTirePressure}
            label="Pressão Pneus Traseiros"
            max={35}
            unit="psi"
          />

          <SliderComponent
            value={brakePressure}
            onValueChange={setBrakePressure}
            label="Pressão dos Freios"
            max={100}
            unit="%"
          />

          <SliderComponent
            value={brakeBalance}
            onValueChange={setBrakeBalance}
            label="Balanço dos Freios"
            max={100}
            unit="%"
          />
        </Box>

        {/* Action Buttons */}
        <HStack space="md" className="mb-6">
          <Button
            className="flex-1"
            variant="outline"
            onPress={() => navigation.goBack()}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          
          <Button
            className="flex-1"
            onPress={handleSave}
            disabled={loading}
          >
            <HStack className="items-center justify-center">
              <Text className="mr-2">💾</Text>
              <ButtonText>
                {loading ? 'Salvando...' : 'Salvar Setup'}
              </ButtonText>
            </HStack>
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

export default TiresBrakesScreen;

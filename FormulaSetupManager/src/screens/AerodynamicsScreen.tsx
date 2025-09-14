import { StackNavigationProp } from '@react-navigation/stack';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Input, InputField } from '../../components/ui/input';
import { Button, ButtonText } from '../../components/ui/button';
import { ScrollView } from '../../components/ui/scroll-view';
import { Pressable } from '../../components/ui/pressable';
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
};

type AerodynamicsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Aerodynamics'>;

interface Props {
  navigation: AerodynamicsScreenNavigationProp;
  route: {
    params: {
      setupId?: string;
    };
  };
}

interface SetupData {
  frontWing: number;
  rearWing: number;
  observations?: string;
}

const AerodynamicsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { setupId } = route.params;
  const [frontWing, setFrontWing] = useState(5);
  const [rearWing, setRearWing] = useState(5);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

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
        setFrontWing(data.frontWing || 5);
        setRearWing(data.rearWing || 5);
        setObservations(data.observations || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do setup:', error);
    }
  };

  const showAlertDialog = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
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
        frontWing,
        rearWing,
        observations,
      });

      showAlertDialog('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showAlertDialog('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const SliderComponent = ({ 
    value, 
    onValueChange, 
    label, 
    max = 11 
  }: { 
    value: number; 
    onValueChange: (value: number) => void; 
    label: string; 
    max?: number;
  }) => (
    <Box className="mb-6">
      <Text className="font-medium mb-3">{label}</Text>
      <HStack className="items-center gap-4">
        <Box className="flex-1">
          <HStack className="items-center justify-between mb-2">
            <Text>0</Text>
            <Text>{max}</Text>
          </HStack>
          <Box className="h-2  rounded-full relative">
            <Box 
              className="h-2  rounded-full absolute"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </Box>
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
          <Heading size="xl">Aerodinâmica</Heading>
          <Pressable onPress={() => navigation.goBack()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1 p-6">
        {/* Aerodynamics Card */}
        <Box className="rounded-xl p-6 mb-6">
          <Heading size="2xl" className="mb-6">Aerodinâmica</Heading>
          
          <SliderComponent
            value={frontWing}
            onValueChange={setFrontWing}
            label="Asa Dianteira"
            max={11}
          />

          <SliderComponent
            value={rearWing}
            onValueChange={setRearWing}
            label="Asa Traseira"
            max={11}
          />
        </Box>

        {/* Observations */}
        <Box className="rounded-xl p-6 mb-6">
          <Text size="lg" className="font-medium mb-4">Observações</Text>
          <Box className="border rounded-lg p-4">
            <Text>
              {observations || "Notas sobre o setup, condições de pista, etc..."}
            </Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        <HStack className="gap-4 mb-6">
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
              {loading ? 'Salvando...' : 'Salvar'}
            </ButtonText>
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
            <Button onPress={() => setShowAlert(false)}>
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default AerodynamicsScreen;

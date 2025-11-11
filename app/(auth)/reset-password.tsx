import { useAuth } from "../../src/hooks/use-auth";
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { Input, InputField } from '../../components/ui/input';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { ImageBackground } from 'react-native';
import AppAlertDialog from '../../src/components/dialogs/AppAlertDialog';

export default function ResetPasswordScreen() {
  const { sendPasswordReset } = useAuth(); 
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setAlertTitle('Email necessário');
      setAlertMessage('Por favor, digite seu email.');
      setShowAlert(true);
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setAlertTitle('Email Enviado');
      setAlertMessage('Verifique sua caixa de entrada para o link de redefinição de senha.');
      setShowAlert(true);
    } catch (error: any) {
      setAlertTitle('Erro');
      setAlertMessage(error.message);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../src/assets/images/apex-wallpaper.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Box className="flex-1 justify-center items-center bg-black/70 p-6">
        <Box className="w-full" style={{ maxWidth: 370 }}>
          <VStack space="lg" className="mb-5">
            <Text className="text-center font-bold text-white text-2xl">Redefinir Senha</Text>
            <Text className="text-center text-gray-300">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </Text>
          </VStack>
          <VStack space="md" className="p-3">
            <Box>
              <Text className="mb-2 text-white">Email</Text>
              <Input className="bg-gray-800/80 border-gray-700">
                <InputField
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-white"
                />
              </Input>
            </Box>
            <VStack className="items-center">
              <Button
                className="mb-0 mt-8 w-1/2 bg-red-600 pressed:opacity-80"
                onPress={handleResetPassword}
                disabled={loading}
              >
                <ButtonText>{loading ? 'Enviando...' : 'Enviar Email'}</ButtonText>
              </Button>
            </VStack>
            <Button
              variant="link"
              onPress={() => router.back()} // Botão para voltar ao login
            >
              <ButtonText className="text-white pressed:opacity-70">
                Voltar para o Login
              </ButtonText>
            </Button>
          </VStack>
        </Box>
        <AppAlertDialog
          isOpen={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => {
            setShowAlert(false);
            if (alertTitle === 'Email Enviado') {
              router.replace('/(auth)/login'); // Volta pro login após sucesso
            }
          }}
        />
      </Box>
    </ImageBackground>
  );
};
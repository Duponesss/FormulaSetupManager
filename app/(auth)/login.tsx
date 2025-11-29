import { AntDesign } from '@expo/vector-icons';
import { Redirect, useRouter } from "expo-router";
import React, { useState } from 'react';
import { Image, ImageBackground } from 'react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { AlertCircle } from 'lucide-react-native';
import AppAlertDialog from '@/src/components/dialogs/AppAlertDialog';
import { useAuth } from "@/src/hooks/use-auth";


export default function LoginScreen() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const showAlertDialog = (titleOrMessage: string, message?: string) => {
    if (message) {
      setAlertTitle(titleOrMessage);
      setAlertMessage(message);
    } else {
      setAlertTitle('Erro');
      setAlertMessage(titleOrMessage);
    }
    setShowAlert(true);
  };

  const handleEmailAuth = async () => {
    // Validação básica antes de enviar
    let hasError = false;
    if (!email) {
      setEmailError('Digite seu email');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Digite sua senha');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      // --- TRATAMENTO DE ERRO INLINE ---
      const errorCode = error.code;
      
      if (errorCode === 'auth/invalid-email') {
        setEmailError('Formato de email inválido.');
      } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        setEmailError('Usuário não encontrado ou credenciais inválidas.');
      } else if (errorCode === 'auth/wrong-password') {
        setPasswordError('Senha incorreta.');
      } else if (errorCode === 'auth/too-many-requests') {
        setAlertTitle('Bloqueio Temporário');
        setAlertMessage('Muitas tentativas falhas. Tente novamente mais tarde.');
        setShowAlert(true);
      } else {
        setAlertTitle('Erro no Login');
        setAlertMessage(error.message || 'Ocorreu um erro inesperado.');
        setShowAlert(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setAlertTitle('Erro');
      setAlertMessage(error.message || 'Erro ao fazer login com Google');
      setShowAlert(true);
    }
  };

  return (
    <ImageBackground
      source={require('@/src/assets/images/apex-wallpaper.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Box className="flex-1 justify-center items-center bg-black/70">
        <Heading size="xl" className="text-center">
          <Image
            source={require('@/src/assets/images/apex-logo-dark.png')}
            className="w-10/12 h-60 mt-0"
          />
        </Heading>
        <Box className="w-full" style={{ maxWidth: 370 }}>
          <VStack space="lg" className="mb-5">
            <Text className="text-center font-bold text-white">
              Entre na sua conta
            </Text>
          </VStack>

          <VStack space="md" className="p-3">

            <FormControl isInvalid={!!emailError}>
              <Text className="mb-2 text-white">Email</Text>
              <Input className={`bg-gray-800/80 border-gray-700 ${emailError ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-white"
                />
              </Input>
              {emailError ? (
                <FormControlError>
                   <AlertCircle size={16} color="#ef4444" />
                   <FormControlErrorText className="text-red-500 ml-2">
                     {emailError}
                   </FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>

            <FormControl isInvalid={!!passwordError}>
              <Text className="mb-2 text-white">Senha</Text>
              <Input className={`bg-gray-800/80 border-gray-700 ${passwordError ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  className="text-white"
                />
              </Input>
              {passwordError ? (
                <FormControlError>
                   <AlertCircle size={16} color="#ef4444" />
                   <FormControlErrorText className="text-red-500 ml-2">
                     {passwordError}
                   </FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>

            <VStack className="items-center">
              <Button
                className="mb-0 mt-8 w-1/2 bg-red-600 pressed:opacity-80"
                onPress={handleEmailAuth}
                disabled={loading}
              >
                <ButtonText>
                  {loading ? (
                    <HStack space="sm" className="items-center">
                      <Spinner size="small" />
                      <Text className="text-white">Carregando...</Text>
                    </HStack>
                  ) : (
                    'Entrar'
                  )}
                </ButtonText>
              </Button>
            </VStack>

            <Button
              variant="link"
              onPress={() => router.push('/register')} 
            >
              <ButtonText className="text-white pressed:opacity-70">
                Não tem conta? Criar uma
              </ButtonText>
            </Button>
            <Button
              variant="link"
              onPress={() => router.push('/reset-password')} 
            >
              <ButtonText className="text-gray-400 pressed:opacity-70 text-xs">
                Esqueceu sua senha?
              </ButtonText>
            </Button>
          </VStack>

          <VStack space="md" className="mb-6">
            <HStack className="items-center">
              <Box className="flex-1 bg-gray-700" style={{ height: 1 }} />
              <Text className="px-4 text-white">Ou continue com</Text>
              <Box className="flex-1 bg-gray-700" style={{ height: 1 }} />
            </HStack>
          </VStack>

          <VStack className="items-center">
            <Button
              onPress={handleGoogleSignIn}
              disabled={loading}
              className="w-1/2 border-gray-700 pressed:bg-gray-800 rounded-md"
              variant="outline"
            >
              <HStack space="sm" className="items-center">
                <AntDesign name="google" size={16} color="white" />
                <ButtonText className="text-white">
                  {loading ? 'Carregando...' : 'Conta Google'}
                </ButtonText>
              </HStack>
            </Button>
          </VStack>

          <Box className="mt-8">
            <Text size="xs" className="text-center text-gray-500">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </Text>
          </Box>
        </Box>

        <AppAlertDialog
          isOpen={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      </Box>
    </ImageBackground>
  );
};

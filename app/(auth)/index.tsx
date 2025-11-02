import { useAuth } from "../../src/hooks/use-auth";
import React, { useState } from 'react';
import { Redirect } from "expo-router";
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Spinner } from '../../components/ui/spinner';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { Input, InputField } from '../../components/ui/input';
import { Image, ImageBackground } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';
import AppAlertDialog from '../../src/components/dialogs/AppAlertDialog';


export default function AuthScreen() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

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
    if (!email || !password) {
      showAlertDialog('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        console.log('Criando conta...');
        await signUpWithEmail(email, password);
        console.log('Conta criada com sucesso!');
      } else {
        console.log('Fazendo login...');
        await signInWithEmail(email, password);
        console.log('Login realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      let errorMessage = 'Erro ao fazer autenticação';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlertDialog('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      showAlertDialog(error.message || 'Erro ao fazer login com Google');
    }
  };

  return (
    <ImageBackground
      source={require('../../src/assets/images/apex-wallpaper.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
    <Box className="flex-1 justify-center items-center bg-black/70">
      <Heading size="xl" className="text-center">
        <Image
          source={require('../../src/assets/images/apex-logo-dark.png')}
          className="w-10/12 h-60 mt-0" // Ajuste a largura (w) e altura (h) como desejar
        />
      </Heading>
      <Box className="w-full" style={{ maxWidth: 370 }}>
        <VStack space="lg" className="mb-5">
          <Text className="text-center font-bold text-white">
            {isSignUp ? 'Criar nova conta' : 'Entre na sua conta'}
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

          <Box>
            <Text className="mb-2 text-white">Senha</Text>
            <Input className="bg-gray-800/80 border-gray-700">
              <InputField
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="text-white"
              />
            </Input>
          </Box>

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
                  isSignUp ? 'Criar Conta' : 'Entrar'
                )}
              </ButtonText>
            </Button>
          </VStack>

          <Button
            variant="link"
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <ButtonText className="text-white pressed:opacity-70">
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar uma'}
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
          // Sem 'onConfirm', ele mostra só o botão "OK"
        />
    </Box>
    </ImageBackground>
  );
};

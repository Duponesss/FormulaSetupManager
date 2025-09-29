import { useAuth } from "../../src/hooks/use-auth";
import React, { useState } from 'react';
import { Redirect, useRouter } from "expo-router";
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Spinner } from '../../components/ui/spinner';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { Input, InputField } from '../../components/ui/input';
import { Image } from 'react-native';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../../components/ui/alert-dialog';

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
    <Box className="flex-1 justify-center items-center">
      <Heading size="xl" className="text-center">
        <Image
          source={require('../../src/assets/images/apex-logo.png')}
          className="w-10/12 h-60 mt-0" // Ajuste a largura (w) e altura (h) como desejar
        />
      </Heading>
      <Box className="w-full" style={{ maxWidth: 370 }}>
        <VStack space="lg" className="mb-5">
          <Text className="text-center font-bold">
            {isSignUp ? 'Criar nova conta' : 'Entre na sua conta'}
          </Text>
        </VStack>

        <Card className="p-6 mb-6 rounded-xl">
          <VStack space="md">
            <Box>
              <Text className="mb-2">Email</Text>
              <Input>
                <InputField
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            </Box>

            <Box>
              <Text className="mb-2">Senha</Text>
              <Input>
                <InputField
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
            </Box>
            
            <VStack className="items-center">
            <Button
              className="mb-0 mt-8 w-1/2"
              onPress={handleEmailAuth}
              disabled={loading}
            >
              <ButtonText>
                {loading ? (
                  <HStack space="sm" className="items-center">
                    <Spinner size="small" />
                    <Text>Carregando...</Text>
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
              <ButtonText>
                {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar uma'}
              </ButtonText>
            </Button>
          </VStack>
        </Card>

        <VStack space="md" className="mb-6">
          <HStack className="items-center">
            <Box className="flex-1" style={{ height: 1 }} />
            <Text className="px-4">Ou continue com</Text>
            <Box className="flex-1" style={{ height: 1 }} />
          </HStack>
        </VStack>

        <VStack className="items-center">
          <Button
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="w-1/2"
          >
            <ButtonText>
              {loading ? 'Carregando...' : 'Continuar com Google'}
            </ButtonText>
          </Button>
        </VStack>

        <Box className="mt-8">
          <Text size="xs" className="text-center">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </Text>
        </Box>
      </Box>

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

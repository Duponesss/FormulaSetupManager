import { useAuth } from "../../src/hooks/use-auth";
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Spinner } from '../../components/ui/spinner';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { Input, InputField } from '../../components/ui/input';
import { Image, ImageBackground } from 'react-native';
import AppAlertDialog from '../../src/components/dialogs/AppAlertDialog';

export default function RegisterScreen() {
    const { signUpWithEmail } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

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

    const handleEmailSignUp = async () => {
        // Validação agora inclui o nome de usuário
        if (!email || !password || !username) {
            showAlertDialog('Campos incompletos', 'Por favor, preencha nome de usuário, email e senha.');
            return;
        }

        setLoading(true);
        try {
            // Passa o novo nome de usuário para a função de cadastro
            await signUpWithEmail(email, password, username);
            // O redirecionamento será tratado pelo listener de autenticação
        } catch (error: any) {
            console.error('Erro de autenticação:', error);
            let errorMessage = 'Erro ao fazer autenticação';
            showAlertDialog('Erro', errorMessage);
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
                <Heading size="xl" className="text-center">
                    <Image
                        source={require('../../src/assets/images/apex-logo-dark.png')}
                        className="w-10/12 h-60 mt-0"
                    />
                </Heading>
                <Box className="w-full" style={{ maxWidth: 370 }}>
                    <VStack space="lg" className="mb-5">
                        <Text className="text-center font-bold text-white">Criar nova conta</Text>
                    </VStack>
                    <VStack space="md" className="p-3">
                        <Box>
                            <Text className="mb-2 text-white">Nome de Usuário</Text>
                            <Input className="bg-gray-800/80 border-gray-700">
                                <InputField
                                    placeholder="Nome de Usuário"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    className="text-white"
                                />
                            </Input>
                        </Box>
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
                                    placeholder="Mínimo 6 caracteres"
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
                                onPress={handleEmailSignUp}
                                disabled={loading}
                            >
                                <ButtonText>{loading ? 'Criando...' : 'Criar Conta'}</ButtonText>
                            </Button>
                        </VStack>
                        <Button variant="link" onPress={() => router.push('/login')}>
                            <ButtonText className="text-white pressed:opacity-70">
                                Já tem conta? Entrar
                            </ButtonText>
                        </Button>
                    </VStack>
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
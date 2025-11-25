import { useRouter } from "expo-router";
import React, { useEffect, useCallback } from 'react';
import { useAuth } from "@/src/contexts/AuthContext";
import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Pressable } from '../../components/ui/pressable';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { VStack } from '../../components/ui/vstack';
import { ImageBackground, ScrollView, FlatList } from "react-native";
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { LogOut, Plus, List, Flame, User } from 'lucide-react-native';
import LogoutModal from "@/src/components/dialogs/LogoutModal";
import { SetupCard } from '../../src/components/cards/SetupCard';
import { Spinner } from "@/components/ui/spinner";

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const userProfile = useSetupStore((state) => state.userProfile);

  // Dados para a lista de populares
  const topRatedSetups = useSetupStore((state) => state.topRatedSetups);
  const loadingTopRated = useSetupStore((state) => state.loadingTopRated);
  const fetchTopRatedSetups = useSetupStore((state) => state.fetchTopRatedSetups);

  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);

  // Carrega os destaques ao entrar
  useEffect(() => {
    fetchTopRatedSetups();
  }, []);

  const handleLogout = () => setShowLogoutAlert(true);
  const handleConfirmLogout = () => {
    signOut();
    setShowLogoutAlert(false);
  };

  // Botão de ação rápida (Componente interno para organizar)
  const QuickAction = ({ title, icon, color, onPress, subtitle }: any) => (
    <Pressable onPress={onPress} className="flex-1">
      {({ pressed }) => (
        <Box
          className={`p-4 rounded-xl border-l-4 bg-gray-800 shadow-sm ${pressed ? 'opacity-80' : 'opacity-100'}`}
          style={{ borderLeftColor: color }}
        >
          <HStack className="justify-between items-start mb-2">
            <Box className="p-2 rounded-full bg-gray-700/50">
              {icon}
            </Box>
          </HStack>
          <Heading size="md" className="text-white mb-1">{title}</Heading>
          <Text size="xs" className="text-gray-400">{subtitle}</Text>
        </Box>
      )}
    </Pressable>
  );

  return (
    <>
      <Box className="flex-1 bg-black">
        <ImageBackground
          source={require('@/src/assets/images/apex-wallpaper.jpg')}
          style={{ flex: 1 }}
          resizeMode="cover"
          imageStyle={{ opacity: 0.6 }}
        >
          {/* Header da Home */}
          <Box className="pt-14 pb-6 px-6 bg-gradient-to-b from-black/80 to-transparent">
            <HStack className="items-center justify-between">
              <VStack>
                <Text className="text-gray-400 text-sm">Bem-vindo de volta,</Text>
                <Heading size="xl" className="text-white">
                  {userProfile?.username || "Piloto"}
                </Heading>
              </VStack>
              <Pressable onPress={handleLogout} className="p-2 bg-gray-800/80 rounded-full">
                {(props: { pressed: boolean }) => (
                  <Box
                    style={{
                      opacity: props.pressed ? 0.5 : 1.0,
                    }}
                  >
                    <LogOut color="#ef4444" size={24} />
                  </Box>
                )}
              </Pressable>
            </HStack>
          </Box>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

            {/* Seção de Ações Rápidas */}
            <HStack space="md" className="mb-8 mt-2">
              <QuickAction
                title="Novo Setup"
                subtitle="Crie e compartilhe"
                icon={<Plus color="#ef4444" size={24} />}
                color="#ef4444"
                onPress={() => router.push('/create-setup-screen')} // Rota atualizada (fora das tabs)
              />
              <QuickAction
                title="Meus Setups"
                subtitle="Gerencie sua garagem"
                icon={<List color="#3b82f6" size={24} />}
                color="#3b82f6"
                onPress={() => router.push('/my-setups-screen')}
              />
            </HStack>

            {/* Seção de Destaques da Comunidade */}
            <HStack className="items-center justify-between mb-4">
              <HStack className="items-center">
                <Flame color="#f59e0b" size={20} />
                <Heading size="lg" className="text-white ml-2">Em Alta na Comunidade</Heading>
              </HStack>
            </HStack>

            {loadingTopRated ? (
              <Box className="h-40 justify-center items-center">
                <Spinner color="$red600" />
              </Box>
            ) : (
              <Box className="pb-20">
                {topRatedSetups.map((item) => (
                  <SetupCard
                    key={item.id}
                    item={item}
                    onAddToFolder={() => { }} // Na home não precisamos dessa ação por enquanto
                    isPublicSearch={true} // Garante que abra como visualização pública
                  />
                ))}
                {topRatedSetups.length === 0 && (
                  <Text className="text-gray-400 text-center mt-4">
                    Ainda não há setups avaliados na comunidade.
                  </Text>
                )}
              </Box>
            )}

          </ScrollView>
        </ImageBackground>
      </Box>

      <LogoutModal
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
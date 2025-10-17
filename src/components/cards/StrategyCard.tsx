import React from 'react';
import { Pressable } from '../../../components/ui/pressable';
import { Text } from '../../../components/ui/text';
import { HStack } from '../../../components/ui/hstack';
import { VStack } from '../../../components/ui/vstack';
import { useRouter } from 'expo-router';
import { type Strategy } from '../../stores/setupStore'; // Importaremos a nova interface
import { ClipboardList, Flag, Route } from 'lucide-react-native';

interface StrategyCardProps {
  strategy: Strategy;
}

const StrategyCard: React.FC<StrategyCardProps> = React.memo(({ strategy }) => {
  const router = useRouter();

  // Navega para a tela de detalhes da estratégia, que está na raiz do app
  const handlePress = () => {
    router.push(`/strategy-details-screen?strategyId=${strategy.id}`);
  };

  // Formata as datas
  const createdAtFormatted = strategy.createdAt
    ? strategy.createdAt.toDate().toLocaleDateString('pt-BR')
    : '—';
  const updatedAtFormatted = strategy.updatedAt
    ? strategy.updatedAt.toDate().toLocaleDateString('pt-BR')
    : '—';

  return (
    <Pressable
      className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md"
      onPress={handlePress}
    >
      <VStack space="md">
        {/* Seção do Título */}
        <HStack className="items-center">
          <ClipboardList size={18} color="gray" />
          <Text className="font-bold text-lg ml-2 flex-1" numberOfLines={1}>
            {strategy.name}
          </Text>
        </HStack>

        {/* Seção de Informações Rápidas */}
        <VStack space="sm" className="pl-1">
            <HStack className="items-center">
                <Flag size={16} color="gray"/>
                <Text className="text-sm text-gray-600 ml-2">{strategy.track}</Text>
            </HStack>
            <HStack className="items-center">
                <Route size={16} color="gray"/>
                <Text className="text-sm text-gray-600 ml-2">Distância: {strategy.raceDistance}</Text>
            </HStack>
        </VStack>

        {/* Seção das Datas */}
        <HStack className="justify-between items-center mt-2">
          <Text className="text-xs text-gray-500">Criado: {createdAtFormatted}</Text>
          <Text className="text-xs text-gray-500">Atualizado: {updatedAtFormatted}</Text>
        </HStack>
      </VStack>
    </Pressable>
  );
});

export default StrategyCard;
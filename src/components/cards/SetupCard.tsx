import React from 'react';
import { Box } from '../../../components/ui/box';
import { HStack } from '../../../components/ui/hstack';
import { Text } from '../../../components/ui/text';
import { VStack } from '../../../components/ui/vstack';
import { Pressable } from '../../../components/ui/pressable';
import { useRouter } from 'expo-router';
import { type SetupData } from '../../stores/setupStore';
import { NotebookPen, Trash2 } from 'lucide-react-native';


interface SetupCardProps {
  item: SetupData;
  onDelete: (id: string) => void;
}

export const SetupCard: React.FC<SetupCardProps> = React.memo(({ item, onDelete }) => {
  const router = useRouter();
  console.log(`Renderizando SetupCard: ${item.setupTitle}`);

  return (
    <Box className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md">
      <HStack className="justify-between items-start mb-3">
        <Text size="lg" className="font-bold flex-1" numberOfLines={1}>{item.setupTitle}</Text>
        <HStack space="lg">
          <Pressable
            className="w-8 h-8 items-center justify-center bg-green-200 p-1 rounded-xl"
            onPress={() => router.push({ pathname: '/setup-details-screen', params: { setupId: item.id } })}
          >
            <NotebookPen color="green" />
          </Pressable>
          <Pressable
            className="w-8 h-8 items-center justify-center bg-red-200 p-1 rounded-xl"
            onPress={() => onDelete(item.id!)}
          >
            <Trash2 color="red" />
          </Pressable>
        </HStack>
      </HStack>
      <VStack space="sm">
        <HStack className="items-center"><Text className="mr-2">🚗</Text><Text>{item.car}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">📍</Text><Text>{item.track}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">🎮</Text><Text size="sm">{item.controlType}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">🌤️</Text><Text size="sm">{item.condition}</Text></HStack>
        <HStack className="items-center justify-between">
          <Text size="sm">Criado: {new Date(item.createdAt!).toLocaleDateString('pt-BR')}</Text>
          <Text size="sm">Atualizado: {new Date(item.updatedAt!).toLocaleDateString('pt-BR')}</Text>
        </HStack>
      </VStack>
    </Box>
  );
});
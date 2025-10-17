import React from 'react';
import { Box } from '../../../components/ui/box';
import { HStack } from '../../../components/ui/hstack';
import { Text } from '../../../components/ui/text';
import { VStack } from '../../../components/ui/vstack';
import { Pressable } from '../../../components/ui/pressable';
import { useRouter } from 'expo-router';
import { type SetupData } from '../../stores/setupStore';
import { Bookmark } from 'lucide-react-native';


interface SetupCardProps {
  item: SetupData;
  onAddToFolder: (item: SetupData) => void;
  isViewOnly?: boolean; 
}

export const SetupCard: React.FC<SetupCardProps> = React.memo(({ item, onAddToFolder, isViewOnly = false }) => {
  const router = useRouter();
  const handleCardPress = () => {
    // Se for apenas visualização, ainda permite ver os detalhes
    router.push(`/setup-details-screen?setupId=${item.id}`);
  };
  console.log(`Renderizando SetupCard: ${item.setupTitle}`);

  return (
    <Pressable onPress={handleCardPress} className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md">
      <HStack className="justify-between items-start mb-3">
        <Text size="lg" className="font-bold flex-1" numberOfLines={1}>{item.setupTitle}</Text>
        {!isViewOnly && (
          <HStack space="md">
            <Pressable
              className="w-8 h-8 items-center justify-center bg-blue-200 p-1 rounded-xl"
              onPress={(e) => { e.stopPropagation(); onAddToFolder(item); }} // Evita que o clique no botão ative o clique no card
            >
              <Bookmark color="blue" />
            </Pressable>
          </HStack>
        )}
      </HStack>
      <VStack space="sm">
        <HStack className="items-center"><Text className="mr-2">🚗</Text><Text>{item.car}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">📍</Text><Text>{item.track}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">🎮</Text><Text size="sm">{item.controlType}</Text></HStack>
        <HStack className="items-center"><Text className="mr-2">🌤️</Text><Text size="sm">{item.condition}</Text></HStack>
        <HStack className="items-center justify-between">
          <Text size="sm">Criado: {item.createdAt ? item.createdAt.toDate().toLocaleDateString('pt-BR') : '—'}</Text>
          <Text size="sm">Atualizado: {item.updatedAt ? item.updatedAt.toDate().toLocaleDateString('pt-BR') : '—'}</Text>
        </HStack>
      </VStack>
    </Pressable>
  );
});
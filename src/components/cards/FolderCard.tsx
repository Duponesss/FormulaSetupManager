import { useRouter } from 'expo-router';
import { Globe, Lock } from 'lucide-react-native';
import React from 'react';
import { HStack } from '../../../components/ui/hstack';
import { Text } from '../../../components/ui/text';
import { VStack } from '../../../components/ui/vstack';
import { type Folder } from '../../stores/setupStore';
import { DebouncedPressable } from '../common/DebouncedPressable';

interface FolderCardProps {
  folder: Folder;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/folder-details-screen', 
      params: { folderId: folder.id, folderName: folder.name },
    });
  };

  const createdAtFormatted = folder.createdAt
    ? folder.createdAt.toDate().toLocaleDateString('pt-BR')
    : '—';
  const updatedAtFormatted = folder.updatedAt
    ? folder.updatedAt.toDate().toLocaleDateString('pt-BR')
    : '—';

  return (
    <DebouncedPressable
      className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md"
      onPress={handlePress}
    >
      {(props: { pressed: boolean }) => (
        <VStack space="md" style={{ opacity: props.pressed ? 0.7 : 1.0 }}>
          {/* Seção do Título e Privacidade */}
          <HStack className="justify-between items-center">
            {/* Usa 'folder.name' */}
            <Text className="font-bold text-lg flex-1" numberOfLines={1}>
              {folder.name}
            </Text>
            <HStack className="items-center space-x-2">
              {/* Usa 'folder.isPublic' */}
              {folder.isPublic ? (
                <Globe color="green" size={16} />
              ) : (
                <Lock color="red" size={16} />
              )}
              <Text className="text-xs text-gray-500 m-1">
                {folder.isPublic ? 'Pública' : 'Privada'}
              </Text>
            </HStack>
          </HStack>

          {/* Seção das Datas */}
          <HStack className="justify-between items-center">
            <Text className="text-xs text-gray-500">Criado: {createdAtFormatted}</Text>
            <Text className="text-xs text-gray-500">Atualizado: {updatedAtFormatted}</Text>
          </HStack>
        </VStack>
      )}
    </DebouncedPressable>
  );
};

export default FolderCard;
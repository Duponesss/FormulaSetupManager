import React from 'react';
import { Pressable } from '../../../components/ui/pressable';
import { Text } from '../../../components/ui/text';
import { HStack } from '../../../components/ui/hstack';
import { VStack } from '../../../components/ui/vstack';
import { useRouter } from 'expo-router';
import { Globe, Lock } from 'lucide-react-native'; 
import { type Folder } from '../../stores/setupStore';

interface FolderCardProps {
  folder: Folder;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
  const router = useRouter();

  // Função para navegar para a tela de detalhes da pasta
  const handlePress = () => {
    router.push({
      pathname: '/folder-details-screen', // Tela que ainda vamos criar
      params: { folderId: folder.id, folderName: folder.name },
    });
  };

  // Formata as datas para o padrão pt-BR, igual ao seu SetupCard
  const createdAtFormatted = folder.createdAt
    ? folder.createdAt.toDate().toLocaleDateString('pt-BR')
    : '—';
  const updatedAtFormatted = folder.updatedAt
    ? folder.updatedAt.toDate().toLocaleDateString('pt-BR')
    : '—';

  return (
    <Pressable
      className="rounded-xl p-4 mb-4 bg-gray-50 shadow-md"
      onPress={handlePress}
    >
      <VStack space="md">
        {/* Seção do Título e Privacidade */}
        <HStack className="justify-between items-center">
          <Text className="font-bold text-lg flex-1" numberOfLines={1}>
            {folder.name}
          </Text>
          <HStack className="items-center space-x-2">
            {folder.isPublic ? (
              <Globe color="green" size={16} />
            ) : (
              <Lock color="red" size={16} />
            )}
            <Text className="text-xs text-gray-500">
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
    </Pressable>
  );
};

export default FolderCard;
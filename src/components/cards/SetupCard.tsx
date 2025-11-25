import React from 'react';
import { Box } from '../../../components/ui/box';
import { HStack } from '../../../components/ui/hstack';
import { Text } from '../../../components/ui/text';
import { VStack } from '../../../components/ui/vstack';
import { Pressable } from '../../../components/ui/pressable';
import { useRouter } from 'expo-router';
import { type SetupData } from '../../stores/setupStore';
import { Image } from 'expo-image';
import { Bookmark, MapPin, Gamepad2, Sun, CloudRain, CalendarDays, Globe, Lock, Star } from 'lucide-react-native';
import StarRatingDisplay from '../display/StarRatingDisplay';

// --- MAPEAMENTO DE CORES DAS EQUIPES ---
const teamColors = {
  'Oracle Red Bull Racing': '#3671C6',
  'Scuderia Ferrari HP': '#DC0000',
  'McLaren Formula 1 Team': '#FF8700',
  'Mercedes-AMG Petronas Formula One Team': '#6CD3BF',
  'Aston Martin Aramco Formula One Team': '#006F62',
  'BWT Alpine F1 Team': '#0090FF',
  'MoneyGram Haas F1 Team': '#999999',
  'VISA Cash App RB F1 Team': '#6692FF',
  'Williams Racing': '#85b8ff',
  'Kick Sauber F1 Team': '#52E252',
  'default': '#E5E7EB', // Um cinza padrão para fallback
};

// --- MAPEAMENTO DE LOGOS DAS EQUIPES ---
const teamLogos = {
  'Oracle Red Bull Racing': require('../../assets/images/redbull.png'),
  'Scuderia Ferrari HP': require('../../assets/images/ferrari.png'),
  'McLaren Formula 1 Team': require('../../assets/images/mclaren.png'),
  'Mercedes-AMG Petronas Formula One Team': require('../../assets/images/mercedes.png'),
  'Aston Martin Aramco Formula One Team': require('../../assets/images/aston-martin.png'),
  'BWT Alpine F1 Team': require('../../assets/images/alpine.png'),
  'MoneyGram Haas F1 Team': require('../../assets/images/haas.png'),
  'VISA Cash App RB F1 Team': require('../../assets/images/racing-bulls.svg'),
  'Williams Racing': require('../../assets/images/williams.png'),
  'Kick Sauber F1 Team': require('../../assets/images/kick-sauber.svg'),
};

// Componente de linha de detalhe para limpar o código
const DetailRow = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <HStack className="items-center" space="sm">
    <Box className="w-5 items-center">{icon}</Box>
    <Text size="sm" className="text-gray-600">{text}</Text>
  </HStack>
);

interface SetupCardProps {
  item: SetupData;
  onAddToFolder: (item: SetupData) => void;
  isViewOnly?: boolean;
  isPublicSearch?: boolean;
}

export const SetupCard: React.FC<SetupCardProps> = React.memo(({ item, onAddToFolder, isViewOnly = false }) => {
  const router = useRouter();
  const handleCardPress = () => {
    router.push({
      pathname: '/setup-details-screen',
      params: {
        setupId: item.id,
        isViewOnly: isViewOnly ? 'true' : undefined
      }
    });
  };
  console.log(`Renderizando SetupCard: ${item.setupTitle}`);

  const teamColor = teamColors[item.car as keyof typeof teamColors] || teamColors.default;
  const teamLogo = teamLogos[item.car as keyof typeof teamLogos] || null;

  return (
    <Pressable
      onPress={handleCardPress}
      className="rounded-xl p-4 mb-5 bg-white shadow-lg overflow-hidden border-l-4 border-t-4"
      style={{
        borderLeftColor: teamColor,
        borderTopColor: teamColor,
      }}
    >
      {(props: { pressed: boolean }) => (
        <Box style={{ opacity: props.pressed ? 0.5 : 1.0 }}>
          {/* SEÇÃO DO CABEÇALHO */}
          <HStack className="justify-between items-start mb-3">
            <Text size="lg" className="font-bold flex-1" numberOfLines={1}>{item.setupTitle}</Text>
            {!isViewOnly && (
              <HStack space="md">
                <Pressable
                  className="w-8 h-8 items-center justify-center bg-blue-100 p-1 rounded-lg" // Ajustado para rounded-lg
                  onPress={(e) => { e.stopPropagation(); onAddToFolder(item); }}
                >
                  {(props: { pressed: boolean }) => (
                    <Box
                      style={{
                        opacity: props.pressed ? 0.5 : 1.0
                      }}
                    >
                      <Bookmark color="#2563EB" />
                    </Box>
                  )}
                </Pressable>
              </HStack>
            )}
          </HStack>

          {/* SEÇÃO DE DETALHES COM ÍCONES */}
          <VStack space="sm">
            <DetailRow
              icon={
                teamLogo ? (
                  <Image source={teamLogo} style={{ width: 20, height: 20 }} contentFit="contain" />
                ) : (
                  // Fallback se o logo não for encontrado
                  <Text>🚗</Text>
                )
              }
              text={item.car}
            />
            <DetailRow
              icon={<MapPin size={16} color="#6B7280" />}
              text={item.track}
            />
            <DetailRow
              icon={<Gamepad2 size={16} color="#6B7280" />}
              text={item.controlType}
            />
            <DetailRow
              icon={
                item.condition.toLowerCase().includes('chuva') ?
                  <CloudRain size={16} color="#6B7280" /> :
                  <Sun size={16} color="#6B7280" />
              }
              text={item.condition}
            />
            {!isViewOnly && (
              <HStack
                space="xs"
                className={`px-2 py-1 rounded-md self-start mb-2 items-center ${item.isPublic ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                {item.isPublic ? <Globe size={10} color="#15803d" /> : <Lock size={10} color="#4b5563" />}
                <Text className={`text-xs font-bold ${item.isPublic ? 'text-green-700' : 'text-gray-600'}`}>
                  {item.isPublic ? 'Público' : 'Privado'}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* SEÇÃO DE RODAPÉ (DATAS) */}
          <HStack className="items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <HStack space="sm" className="items-center">
              <CalendarDays size={14} color="#9CA3AF" />
              <Text size="xs" className="text-gray-400">
                Criado: {item.createdAt ? item.createdAt.toDate().toLocaleDateString('pt-BR') : '—'}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center">
              <CalendarDays size={14} color="#9CA3AF" />
              <Text size="xs" className="text-gray-400">
                Atualizado: {item.updatedAt ? item.updatedAt.toDate().toLocaleDateString('pt-BR') : '—'}
              </Text>
            </HStack>
          </HStack>
          <HStack space="xs" className="items-center mt-2">
            <StarRatingDisplay rating={item.rating || 0} size={20} />
            <Text className="text-gray-500 text-sm ml-1">
              ({item.ratingCount || 0} {item.ratingCount === 1 ? 'voto' : 'votos'})
            </Text>
          </HStack>
        </Box>
      )}
    </Pressable>
  );
});
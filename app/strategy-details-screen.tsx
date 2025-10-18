import React, { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Box } from '../components/ui/box';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';
import { Spinner } from '../components/ui/spinner';
import { Pressable } from '../components/ui/pressable';
import { ScrollView } from '../components/ui/scroll-view';
import { HStack } from '../components/ui/hstack';
import { VStack } from '../components/ui/vstack';
import { Button, ButtonText } from '../components/ui/button';
import { AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody } from '../components/ui/alert-dialog';
import { Input, InputField } from '../components/ui/input';
import { ArrowLeft, Pencil, Trash2, X } from 'lucide-react-native';

import { useSetupStore, type Strategy } from '../src/stores/setupStore';
import { SetupCard } from '../src/components/cards/SetupCard';
import { BarChart, LineChart } from "react-native-gifted-charts";

// --- FUNÇÕES HELPER ---
// Converte uma string "MM:SS.mls" para milissegundos
const timeToMillis = (time: string): number | null => {
  const parts = time.match(/(\d{2}):(\d{2})\.(\d{3})/);
  if (!parts) return null;
  const [, minutes, seconds, millis] = parts.map(Number);
  return (minutes * 60 + seconds) * 1000 + millis;
};

// Converte milissegundos de volta para "MM:SS.mls"
const millisToTime = (millis: number): string => {
  const totalMillis = Math.round(millis); // Garante que estamos trabalhando com um inteiro
  const minutes = Math.floor(totalMillis / 60000);
  const seconds = Math.floor((totalMillis % 60000) / 1000);
  // Arredonda o resto dos milissegundos para evitar casas decimais extras
  const remainingMillis = Math.round(totalMillis % 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(remainingMillis).padStart(3, '0')}`;
};

export default function StrategyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ strategyId: string }>();
  const { strategyId } = params;

  // Conecta-se ao store
  const strategies = useSetupStore(state => state.strategies);
  const allSetups = useSetupStore(state => state.allSetups);
  const deleteStrategy = useSetupStore(state => state.deleteStrategy);
  const updateLapTimes = useSetupStore(state => state.updateLapTimes);

  // Estados locais
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [lapTimeInput, setLapTimeInput] = useState('');
  const [isSavingLap, setIsSavingLap] = useState(false);

  const tyreImages = {
        soft: require('../src/assets/images/soft_pirelli_tyre.png'), 
        medium: require('../src/assets/images/medium_pirelli_tyre.png'),
        hard: require('../src/assets/images/hard_pirelli_tyre.png'),
        intermediate: require('../src/assets/images/inter_pirelli_tyre.png'), 
        wet: require('../src/assets/images/wet_pirelli_tyre.png'),  
    };

  // Busca a estratégia específica quando a tela carrega
  useEffect(() => {
    const foundStrategy = strategies.find(s => s.id === strategyId);
    if (foundStrategy) {
      setStrategy(foundStrategy);
    }
    setIsLoading(false);
  }, [strategyId, strategies]);

  // Encontra o setup vinculado a esta estratégia
  const linkedSetup = strategy ? allSetups.find(s => s.id === strategy.setupId) : null;

  const handleEdit = () => {
    // Navega para a tela de criação em modo de edição
    router.push(`/create-strategy-screen?strategyId=${strategyId}`);
  };

  const handleDelete = async () => {
    if (strategyId) {
      console.log("Deletando estratégia...");
      await deleteStrategy(strategyId);
      setIsDeleteAlertOpen(false);
      router.back();
    }
  };

  const stintChartDataForStackedBar = useMemo(() => {
    if (!strategy?.pitStopStrategy || strategy.pitStopStrategy.length === 0) {
      return []; // Retorna um array vazio se não houver stints
    }

    const colorMap = {
      soft: '#E10600',
      medium: '#FFD700',
      hard: '#F0F0F0',
      intermediate: '#4CAF50',
      wet: '#2196F3',
    };

    // 1. Cria o array de stacks (segmentos) como antes.
    const stacksArray = strategy.pitStopStrategy.map((stint, index) => ({
      value: stint.laps,
      color: colorMap[stint.tyreCompound] || 'gray',
      // Label opcional para tooltip
      label: `Stint ${index + 1}: ${stint.tyreCompound} (${stint.laps}v)`
    }));

    // 2. Encapsula o array 'stacksArray' dentro de um objeto com a propriedade 'stacks'.
    // O array final para 'stackData' precisa conter este objeto.
    return [{ stacks: stacksArray }];

  }, [strategy]);

  // --- Cálculos para tempos de volta com useMemo ---
  const { lapTimesData, averageTime, standardDeviation } = useMemo(() => {
    if (!strategy?.lapTimes || strategy.lapTimes.length < 1) { // Mudança para < 1
      return { lapTimesData: [], averageTime: null, standardDeviation: null };
    }

    const lapValues = strategy.lapTimes.map(lap => lap.timeInMillis);
    const minLap = Math.min(...lapValues);
    const maxLap = Math.max(...lapValues);

    const chartData = strategy.lapTimes.map(lap => {
      let dataPointColor = '#34D399'; // Verde (consistente)

      if (lap.timeInMillis === minLap) {
        dataPointColor = '#8A2BE2'; // Roxo (volta mais rápida)
      } else if (lap.timeInMillis === maxLap) {
        dataPointColor = '#EF4444'; // Vermelho (volta mais lenta)
      }

      return {
        value: lap.timeInMillis,
        label: `V${lap.lapNumber}`,
        dataPointColor: dataPointColor,
        dataPointRadius: 4,
      };
    });

    const totalMillis = strategy.lapTimes.reduce((sum, lap) => sum + lap.timeInMillis, 0);
    const avg = totalMillis / strategy.lapTimes.length;
    const variance = strategy.lapTimes.reduce((sum, lap) => sum + Math.pow(lap.timeInMillis - avg, 2), 0) / strategy.lapTimes.length;
    const stdDev = Math.sqrt(variance);

    return { lapTimesData: chartData, averageTime: avg, standardDeviation: stdDev };
  }, [strategy]);

  // --- Função para adicionar tempo de volta ---
  const handleAddLapTime = async () => {
    const timeInMillis = timeToMillis(lapTimeInput);
    if (!timeInMillis || !strategy) {
      // Opcional: mostrar um alerta de formato inválido
      return;
    }

    setIsSavingLap(true);
    const newLap = {
      lapNumber: (strategy.lapTimes?.length || 0) + 1,
      timeInMillis: timeInMillis,
    };
    const updatedLapTimes = [...(strategy.lapTimes || []), newLap];

    try {
      await updateLapTimes(strategy.id, updatedLapTimes);
      setLapTimeInput(''); // Limpa o input em caso de sucesso
    } catch (error) {
      console.error("Erro ao salvar tempo de volta:", error);
    } finally {
      setIsSavingLap(false);
    }
  };

  // --- Função para deletar uma volta ---
  const handleDeleteLap = async (lapNumberToDelete: number) => {
    if (!strategy) return;

    // Filtra a volta a ser removida e renumera as subsequentes
    const updatedLapTimes = strategy.lapTimes
      .filter(lap => lap.lapNumber !== lapNumberToDelete)
      .map((lap, index) => ({
        ...lap,
        lapNumber: index + 1,
      }));

    try {
      await updateLapTimes(strategy.id, updatedLapTimes);
    } catch (error) {
      console.error("Erro ao deletar tempo de volta:", error);
    }
  };

  if (isLoading) {
    return <Box className="flex-1 justify-center items-center"><Spinner size="large" /></Box>;
  }

  if (!strategy) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Estratégia não encontrada.</Text>
        <Button onPress={() => router.back()} className="mt-4"><ButtonText>Voltar</ButtonText></Button>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-gray-100">
      {/* Cabeçalho Customizado */}
      <HStack className="bg-white p-4 justify-between items-center border-b border-gray-200 pt-12">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft />
        </Pressable>
        <Heading size="md" className="flex-1 text-center" numberOfLines={1}>{strategy.name}</Heading>
        <HStack space="md">
          <Pressable onPress={handleEdit} className="p-2">
            <Pencil size={20} color="blue" />
          </Pressable>
          <Pressable onPress={() => setIsDeleteAlertOpen(true)} className="p-2">
            <Trash2 size={20} color="red" />
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView className="p-4">
        <VStack space="lg" className="pb-24">
          {/* Card de Informações Gerais */}
          <Box className="bg-white p-4 rounded-lg">
            <Text className="font-bold">Pista:</Text>
            <Text className="mb-2">{strategy.track}</Text>
            <Text className="font-bold">Distância:</Text>
            <Text>{strategy.raceDistance}</Text>
          </Box>

          {/* Card do Setup Vinculado */}
          <Box className="bg-white p-4 rounded-lg">
            <Heading size="sm" className="mb-2">Setup Vinculado</Heading>
            {linkedSetup ? (
              <SetupCard
                item={linkedSetup}
                isViewOnly={true}
                // Passamos funções vazias pois os botões não serão renderizados
                onAddToFolder={() => { }}
              />
            ) : (
              <Text>Setup não encontrado.</Text>
            )}
          </Box>

          {/* Seção de Anotações */}
          {strategy.notes && (
            <Box className="bg-white p-4 rounded-lg">
              <Heading size="sm" className="mb-2">Anotações</Heading>
              <Text>{strategy.notes}</Text>
            </Box>
          )}

          {/* --- SEÇÃO DO GRÁFICO --- */}
          <Box className="bg-white p-4 rounded-lg">
                        <Heading size="sm" className="mb-3">Estratégia de Pneus e Paradas</Heading>
                        {stintChartDataForStackedBar.length > 0 ? (
                            <VStack> 
                                {/* 2. Remove o Box verde e adiciona VStack */}
                                <BarChart
                                    stackData={stintChartDataForStackedBar}
                                    isAnimated
                                    horizontal
                                    barWidth={30} // Pode ajustar a largura conforme necessário
                                    barBorderRadius={4}
                                    hideRules
                                    hideYAxisText
                                    xAxisThickness={0}
                                    yAxisThickness={0}
                                    initialSpacing={0}
                                    // Define uma altura fixa menor para o gráfico em si
                                    height={20} 
                                />

                                {/* 3. Nova seção para exibir os detalhes dos stints */}
                                <HStack space="md" className="justify-center items-end mt-2">
                                    {strategy?.pitStopStrategy.map((stint, index) => (
                                        <VStack key={index} className="items-center">
                                            <Image
                                                // @ts-ignore - TypeScript pode reclamar, mas o require funciona
                                                source={tyreImages[stint.tyreCompound]}
                                                style={{ width: 30, height: 30 }}
                                                contentFit="contain" // Garante que a imagem caiba
                                            />
                                            <Text className="text-xs mt-1">{stint.laps} Voltas</Text>
                                        </VStack>
                                    ))}
                                </HStack>
                            </VStack>
                        ) : (
                            <Box className="h-20 justify-center items-center bg-gray-100 rounded">
                                <Text className="text-gray-500">Nenhum stint definido.</Text>
                            </Box>
                        )}
                    </Box>

          {/* --- SEÇÃO DE ANÁLISE DE DESEMPENHO --- */}
          <Box className="bg-white p-4 rounded-lg">
            <Heading size="sm" className="mb-2">Análise de Desempenho</Heading>

            {lapTimesData.length > 0 ? (
              <VStack space="md" className=' p-1'>
                {lapTimesData.length > 1 ? (
                  <LineChart
                    data={lapTimesData}
                    height={150}
                    // --- MUDANÇAS NO ESTILO DO GRÁFICO ---
                    animateOnDataChange // <-- Nova animação fluida!
                    animationDuration={1000}
                    // Remove o preenchimento de área
                    // areaChart={false} 
                    // Estilo da linha principal
                    color="#e2d62b" // Roxo
                    thickness={3}
                    // Estilo dos pontos de dados (usará as cores que definimos)
                    dataPointsShape="circular"

                    // Define o valor mínimo do eixo Y para "dar zoom"
                    yAxisOffset={67000}
                    xAxisThickness={0}
                    // hideRules
                    formatYLabel={(label: string) => millisToTime(Number(label)).substring(0, 5)}
                  />
                ) : (
                  // Mostra um gráfico de barras simples para a primeira volta
                  <BarChart
                    data={lapTimesData}
                    barWidth={50}
                    initialSpacing={100}
                    barBorderRadius={4}
                    yAxisOffset={100000}
                    formatYLabel={(label: string) => millisToTime(Number(label)).substring(0, 5)}
                    frontColor="#8A2BE2"
                  />
                )}
                <HStack className="justify-around mt-2">
                  <VStack className="items-center">
                    <Text className="text-xs text-gray-500">Tempo Médio</Text>
                    <Text className="font-bold">{averageTime ? millisToTime(averageTime) : 'N/A'}</Text>
                  </VStack>
                  <VStack className="items-center">
                    <Text className="text-xs text-gray-500">Consistência (Desvio)</Text>
                    <Text className="font-bold">±{standardDeviation ? (standardDeviation / 1000).toFixed(3) : 'N/A'}s</Text>
                  </VStack>
                </HStack>
              </VStack>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                Adicione pelo menos 2 voltas para ver a análise.
              </Text>
            )}

            {/* Formulário de Input */}
            <HStack space="md" className="mt-4 pt-4 border-t border-gray-200">
              <Box className="flex-1">
                <Input>
                  <InputField
                    placeholder="01:34.567"
                    keyboardType="numeric"
                    value={lapTimeInput}
                    onChangeText={setLapTimeInput}
                  />
                </Input>
              </Box>
              <Button onPress={handleAddLapTime} disabled={isSavingLap}>
                {isSavingLap ? <Spinner color="white" /> : <ButtonText>Adicionar</ButtonText>}
              </Button>
            </HStack>

            {/* Nova Lista de Voltas Cadastradas */}
            {strategy?.lapTimes && strategy.lapTimes.length > 0 && (
              <VStack className="mt-4 pt-4 border-t border-gray-200">
                {strategy.lapTimes.map(lap => (
                  <HStack key={lap.lapNumber} className="justify-between items-center py-1">
                    <Text>Volta {lap.lapNumber}: <Text className="font-bold">{millisToTime(lap.timeInMillis)}</Text></Text>
                    <Pressable onPress={() => handleDeleteLap(lap.lapNumber)} className="p-1">
                      <Trash2 size={16} color="red" />
                    </Pressable>
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>

        </VStack>
      </ScrollView>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading>Excluir Estratégia</Heading>
            <AlertDialogCloseButton><X /></AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              Você tem certeza que deseja excluir a estratégia "{strategy.name}"? Esta ação não pode ser desfeita.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" action="secondary" onPress={() => setIsDeleteAlertOpen(false)} className="mr-3">
              <ButtonText>Cancelar</ButtonText>
            </Button>
            <Button action="negative" onPress={handleDelete}>
              <ButtonText>Excluir</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
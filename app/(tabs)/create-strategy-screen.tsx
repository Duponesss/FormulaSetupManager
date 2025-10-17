import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Box } from '../../components/ui/box';
import { Heading } from '../../components/ui/heading';
import { Text } from '../../components/ui/text';
import { Pressable } from '../../components/ui/pressable';
import { ScrollView } from '../../components/ui/scroll-view';
import { Input, InputField } from '../../components/ui/input';
import { Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '../../components/ui/select';
import { Textarea, TextareaInput } from '../../components/ui/textarea';
import { Button, ButtonText } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { HStack } from '../../components/ui/hstack';
import { ArrowLeft, ChevronDown, X } from 'lucide-react-native';
import { Strategy, useSetupStore } from '../../src/stores/setupStore';
import { VStack } from '@/components/ui/vstack';
// Precisaremos de um modal para selecionar o setup
import SelectSetupModal from '../../src/components/dialogs/SelectSetupModal';

export default function CreateStrategyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ strategyId?: string }>();
    const isEditing = !!params.strategyId;

    // Conecta à store para pegar os dados necessários
    const allSetups = useSetupStore(state => state.allSetups);
    const gameData = useSetupStore(state => state.gameData);
    const createStrategy = useSetupStore(state => state.createStrategy); // Adicionaremos depois
    const updateStrategy = useSetupStore(state => state.updateStrategy); // Adicionaremos depois

    // Estados do formulário
    const [name, setName] = useState('');
    const [track, setTrack] = useState('');
    const [raceDistance, setRaceDistance] = useState<Strategy['raceDistance'] | ''>('');
    const [notes, setNotes] = useState('');
    const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRaceDistanceChange = (value: string) => {
    // We use a type assertion to tell TypeScript we trust this value is correct
    setRaceDistance(value as Strategy['raceDistance']);
  };

    // Lógica para preencher o formulário em modo de edição (a ser implementada)
    useEffect(() => {
        if (isEditing) {
            // TODO: Buscar a estratégia da store e preencher os campos
            console.log('Modo de Edição para a estratégia:', params.strategyId);
        }
    }, [params.strategyId, isEditing]);

    const handleSave = async () => {
    if (!name || !track || !raceDistance || !selectedSetupId) {
      setErrorMessage('Por favor, preencha o nome, pista, distância e setup.');
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');

    try {
      // Monta o objeto de dados com base no formulário
      const strategyData = {
        name,
        track,
        raceDistance: raceDistance as Strategy['raceDistance'],
        notes,
        setupId: selectedSetupId,
        // Valores padrão para os campos que ainda não têm UI
        availableTyres: { soft: 0, medium: 0, hard: 0 },
        fuelLoadInLaps: 0,
        pitStopStrategy: [],
        lapTimes: [],
      };

      if (isEditing) {
        await updateStrategy(params.strategyId!, strategyData);
      } else {
        await createStrategy(strategyData);
      }

      router.back(); // Volta para a lista de estratégias após salvar

    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
      setErrorMessage("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

    const selectedSetup = allSetups.find(s => s.id === selectedSetupId);

    return (
        <Box className="flex-1 bg-gray-100">
            {/* Cabeçalho Customizado */}
            <HStack className="bg-white p-4 justify-between items-center border-b border-gray-200 pt-12">
                <Pressable onPress={() => router.back()} className="p-2">
                    <ArrowLeft />
                </Pressable>
                <Heading size="md" className="flex-1 text-center">
                    {isEditing ? 'Editar Estratégia' : 'Criar Nova Estratégia'}
                </Heading>
                <Box className="w-8" /> {/* Espaçador para centralizar o título */}
            </HStack>

            <ScrollView className="p-4">
                <VStack space="lg">
                    {/* Seção de Informações Gerais */}
                    <Box className="bg-white p-4 rounded-lg">
                        <Heading size="sm" className="mb-4">Informações Gerais</Heading>
                        <VStack space="md">
                            <Input>
                                <InputField placeholder="Nome da Estratégia (ex: Bahrein 50%)" value={name} onChangeText={setName} />
                            </Input>

                            <Select onValueChange={setTrack} selectedValue={track}>
                                <SelectTrigger>
                                    <SelectInput placeholder="Selecione a Pista" />
                                    <ChevronDown className="mr-2" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                        {gameData?.tracks.map(t => <SelectItem key={t} label={t} value={t} />)}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <Select onValueChange={handleRaceDistanceChange} selectedValue={raceDistance}>
                                <SelectTrigger>
                                    <SelectInput placeholder="Selecione a Distância da Corrida" />
                                    <ChevronDown className="mr-2" />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                        {["5 Laps", "25%", "35%", "50%", "100%"].map(d => <SelectItem key={d} label={d} value={d} />)}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>
                    </Box>

                    {/* Seção de Setup Vinculado */}
                    <Box className="bg-white p-4 rounded-lg">
                        <Heading size="sm" className="mb-4">Setup Vinculado</Heading>
                        {!selectedSetup ? (
                            // Se nenhum setup estiver selecionado, mostra o botão grande
                            <Pressable
                                className="border border-gray-300 p-3 rounded-md items-center"
                                onPress={() => setIsSetupModalOpen(true)}
                            >
                                <Text>Clique para selecionar um setup</Text>
                            </Pressable>
                        ) : (
                            // Se um setup estiver selecionado, mostra os detalhes e botões de ação
                            <Box className="border border-green-300 bg-green-50 p-3 rounded-md">
                                <HStack className="justify-between items-center">
                                    <VStack className="flex-1">
                                        <Text className="font-bold">{selectedSetup.setupTitle}</Text>
                                        <Text className="text-xs text-gray-500">{selectedSetup.track} - {selectedSetup.car}</Text>
                                    </VStack>
                                    <HStack space="md">
                                        <Button variant="outline" size="sm" onPress={() => setIsSetupModalOpen(true)}>
                                            <ButtonText>Trocar</ButtonText>
                                        </Button>
                                        <Pressable className="p-2" onPress={() => setSelectedSetupId(null)}>
                                            <X size={18} color="red" />
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        )}
                    </Box>

                    {/* Seção de Anotações */}
                    <Box className="bg-white p-4 rounded-lg">
                        <Heading size="sm" className="mb-4">Anotações da Estratégia</Heading>
                        <Textarea>
                            <TextareaInput
                                placeholder="Dicas sobre desgaste, melhor momento para parar, etc."
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </Textarea>
                    </Box>
                </VStack>

                {errorMessage ? <Text className="text-red-500 mt-4 text-center">{errorMessage}</Text> : null}

                <Button onPress={handleSave} disabled={isSaving} className="mt-6">
                    {isSaving ? <Spinner color="white" /> : <ButtonText>Salvar Estratégia</ButtonText>}
                </Button>
            </ScrollView>

            {/* Aqui renderizaríamos o modal de seleção de setup */}
            <SelectSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                onSelect={(id) => {
                    setSelectedSetupId(id);
                    setIsSetupModalOpen(false); // Fecha o modal após a seleção
                }}
            />
        </Box>
    );
}
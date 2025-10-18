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
import { ArrowLeft, ChevronDown, Trash2, X } from 'lucide-react-native';
import { type Strategy, useSetupStore } from '../../src/stores/setupStore';
import { VStack } from '@/components/ui/vstack';
import SelectSetupModal from '../../src/components/dialogs/SelectSetupModal';

type PitStopStint = Strategy['pitStopStrategy'][0];

export default function CreateStrategyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ strategyId?: string }>();
    const isEditing = !!params.strategyId;

    // Conecta à store para pegar os dados necessários
    const allSetups = useSetupStore(state => state.allSetups);
    const gameData = useSetupStore(state => state.gameData);
    const createStrategy = useSetupStore(state => state.createStrategy);
    const updateStrategy = useSetupStore(state => state.updateStrategy);
    const strategies = useSetupStore(state => state.strategies);

    // Estados do formulário
    const [name, setName] = useState('');
    const [track, setTrack] = useState('');
    const [raceDistance, setRaceDistance] = useState<Strategy['raceDistance'] | ''>('');
    const [notes, setNotes] = useState('');
    const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);
    const [stints, setStints] = useState<PitStopStint[]>([]);

    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRaceDistanceChange = (value: string) => {
        setRaceDistance(value as Strategy['raceDistance']);
    };

    const addStint = () => {
        const lastPitLap = stints.length > 0 ? stints[stints.length - 1].pitOnLap : 0;
        setStints([...stints, { tyreCompound: 'soft', laps: 10, pitOnLap: lastPitLap + 10 }]);
    };

    const updateStint = (index: number, field: keyof PitStopStint, value: string | number) => {
        const newStints = [...stints];
        // @ts-ignore - TypeScript pode reclamar da tipagem dinâmica aqui, mas é seguro
        newStints[index][field] = value;

        // Recalcula a volta de parada dos stints subsequentes
        for (let i = index; i < newStints.length; i++) {
            const prevPitLap = i > 0 ? newStints[i - 1].pitOnLap : 0;
            newStints[i].pitOnLap = prevPitLap + Number(newStints[i].laps);
        }
        setStints(newStints);
    };

    const removeStint = (index: number) => {
        const newStints = stints.filter((_, i) => i !== index);
        // Recalcula tudo após a remoção
        for (let i = 0; i < newStints.length; i++) {
            const prevPitLap = i > 0 ? newStints[i - 1].pitOnLap : 0;
            newStints[i].pitOnLap = prevPitLap + Number(newStints[i].laps);
        }
        setStints(newStints);
    };

    // Lógica para preencher o formulário em modo de edição
    useEffect(() => {
        if (isEditing && strategies.length > 0) {
            const strategyToEdit = strategies.find(s => s.id === params.strategyId);
            if (strategyToEdit) {
                setName(strategyToEdit.name);
                setTrack(strategyToEdit.track);
                setRaceDistance(strategyToEdit.raceDistance);
                setNotes(strategyToEdit.notes);
                setSelectedSetupId(strategyToEdit.setupId);
                setStints(strategyToEdit.pitStopStrategy || []); // Garante que stints seja um array
            }
        }
    }, [params.strategyId, isEditing, strategies]);

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
                pitStopStrategy: stints,
                lapTimes: [],
            };

            if (isEditing) {
                await updateStrategy(params.strategyId!, strategyData);
            } else {
                await createStrategy(strategyData);
            }

            router.push('/strategies-screen'); // Volta para a lista de estratégias após salvar

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

                    {/* --- Seção de Pneus e Paradas --- */}
                    <Box className="bg-white p-4 rounded-lg">
                        <Heading size="sm" className="mb-4">Estratégia de Pneus e Paradas</Heading>
                        <VStack space="md">
                            {stints.map((stint, index) => (
                                <HStack key={index} space="md" className="items-center p-2 border border-gray-200 rounded-md">
                                    <VStack className="flex-1">
                                        <Text className="text-xs">Stint {index + 1}</Text>
                                        <Select
                                            selectedValue={stint.tyreCompound}
                                            onValueChange={(value) => updateStint(index, 'tyreCompound', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectInput placeholder="Composto" />
                                                <ChevronDown className="mr-2" />
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                                    {['soft', 'medium', 'hard', 'intermediate', 'wet'].map(t => <SelectItem key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} value={t} />)}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    </VStack>
                                    <VStack className="w-24">
                                        <Text className="text-xs">Voltas</Text>
                                        <Input>
                                            <InputField
                                                keyboardType="numeric"
                                                value={String(stint.laps)}
                                                onChangeText={(value) => updateStint(index, 'laps', Number(value))}
                                            />
                                        </Input>
                                    </VStack>
                                    <VStack className="items-center">
                                        <Text className="text-xs">Parar na</Text>
                                        <Text className="font-bold text-lg">{stint.pitOnLap}</Text>
                                    </VStack>
                                    <Pressable onPress={() => removeStint(index)} className="self-center p-2">
                                        <Trash2 size={18} color="red" />
                                    </Pressable>
                                </HStack>
                            ))}
                            <Button variant="outline" onPress={addStint}>
                                <ButtonText>+ Adicionar Stint</ButtonText>
                            </Button>
                        </VStack>
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

                <Button onPress={handleSave} disabled={isSaving} className="mt-6 mb-6">
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
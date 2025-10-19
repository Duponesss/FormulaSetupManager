import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
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
import { type Strategy, useSetupStore, StrategyPlan, PlannedStint } from '../../src/stores/setupStore';
import { VStack } from '@/components/ui/vstack';
import SelectSetupModal from '../../src/components/dialogs/SelectSetupModal';

// Converte uma string "MM:SS.mls" para milissegundos
const timeToMillis = (time: string): number | null => {
    const parts = time.match(/(\d{2}):(\d{2})\.(\d{3})/);
    if (!parts) return null;
    const [, minutes, seconds, millis] = parts.map(Number);
    return (minutes * 60 + seconds) * 1000 + millis;
};

// Tipo para os pneus disponíveis (incluindo inter e wet)
type AvailableTyres = Strategy['initialAvailableTyres'];
type TyreCompound = PlannedStint['tyreCompound'];

// Mapeamento para as imagens do formulário
const formTyreImages = {
    soft: require('../../src/assets/images/soft_tyre.png'),
    medium: require('../../src/assets/images/medium_tyre.png'),
    hard: require('../../src/assets/images/hard_tyre.png'),
    intermediate: require('../../src/assets/images/inter_tyre.png'),
    wet: require('../../src/assets/images/wet_tyre.png'),
};
const tyreCompounds: TyreCompound[] = ['soft', 'medium', 'hard', 'intermediate', 'wet'];

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
    const [totalRaceLaps, setTotalRaceLaps] = useState(''); // Input de voltas totais
    const [initialAvailableTyres, setInitialAvailableTyres] = useState<AvailableTyres>({
        soft: 2, medium: 2, hard: 2, intermediate: 2, wet: 2 // Valores iniciais padrão
    });
    const [strategyPlans, setStrategyPlans] = useState<StrategyPlan[]>([]); // Array para Planos A, B, C

    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRaceDistanceChange = (value: string) => {
        setRaceDistance(value as Strategy['raceDistance']);
    };

    // Adiciona um novo plano (A, B ou C) se houver menos de 3
    const addStrategyPlan = () => {
        if (strategyPlans.length < 3) {
            const nextPlanLabel = `Plano ${String.fromCharCode(65 + strategyPlans.length)}`; // A, B, C
            setStrategyPlans([
                ...strategyPlans,
                {
                    planLabel: nextPlanLabel,
                    plannedStints: [], // Começa sem stints
                    fuelLoad: 0,
                    totalTime: '00:00.000',
                }
            ]);
        }
    };

    // Remove um plano pelo índice
    const removeStrategyPlan = (planIndex: number) => {
        let plans = strategyPlans.filter((_, index) => index !== planIndex);
        // Reajusta os labels (A, B, C...)
        plans = plans.map((plan, index) => ({
            ...plan,
            planLabel: `Plano ${String.fromCharCode(65 + index)}`
        }));
        setStrategyPlans(plans);
    };

    // Adiciona um stint a um plano específico (máximo 3 stints)
    const addStintToPlan = (planIndex: number) => {
        const currentPlan = strategyPlans[planIndex];
        if (currentPlan && currentPlan.plannedStints.length < 3) {
            const newStint: PlannedStint = { tyreCompound: 'soft', pitStopLap: 0 };
            const updatedPlans = [...strategyPlans];
            updatedPlans[planIndex].plannedStints.push(newStint);
            setStrategyPlans(updatedPlans);
        }
    };

    // Remove um stint de um plano específico
    const removeStintFromPlan = (planIndex: number, stintIndex: number) => {
        const updatedPlans = [...strategyPlans];
        updatedPlans[planIndex].plannedStints.splice(stintIndex, 1);
        setStrategyPlans(updatedPlans);
    };

    // Atualiza um campo dentro de um stint específico
    const updateStintInPlan = (planIndex: number, stintIndex: number, field: keyof PlannedStint, value: string | number) => {
        const updatedPlans = [...strategyPlans];
        // @ts-ignore - Confiança na tipagem, embora dinâmica
        updatedPlans[planIndex].plannedStints[stintIndex][field] = value;
        setStrategyPlans(updatedPlans);
    };

    // Atualiza um campo do Plano (fuelLoad, totalTime)
    const updatePlanField = (planIndex: number, field: keyof StrategyPlan, value: string | number) => {
        const updatedPlans = [...strategyPlans];
        // @ts-ignore
        updatedPlans[planIndex][field] = value;
        setStrategyPlans(updatedPlans);
    }

    // Atualiza a quantidade de pneus disponíveis
    const updateAvailableTyreCount = (compound: keyof AvailableTyres, value: string) => {
        const count = parseInt(value, 10);
        if (!isNaN(count) && count >= 0) {
            setInitialAvailableTyres(prev => ({ ...prev, [compound]: count }));
        } else if (value === '') { // Permite apagar o campo
            setInitialAvailableTyres(prev => ({ ...prev, [compound]: 0 }));
        }
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
                setTotalRaceLaps(String(strategyToEdit.totalRaceLaps || ''));
                setInitialAvailableTyres(strategyToEdit.initialAvailableTyres || { soft: 0, medium: 0, hard: 0, intermediate: 0, wet: 0 });
                setStrategyPlans(strategyToEdit.strategyPlans || []);
            }
        }
    }, [params.strategyId, isEditing, strategies]);

    const handleSave = async () => {
        if (!name || !track || !raceDistance || !selectedSetupId || !totalRaceLaps || strategyPlans.length === 0) {
            setErrorMessage('Preencha as informações gerais, setup, voltas totais e adicione pelo menos um plano.');
            return;
        }
        // Validação adicional pode ser feita aqui (ex: formato do tempo, combustível)

        setIsSaving(true);
        setErrorMessage('');

        try {
            const finalTotalRaceLaps = parseInt(totalRaceLaps, 10);
            if (isNaN(finalTotalRaceLaps)) throw new Error("Número de voltas inválido");

            // Valida e converte combustível e tempo para cada plano
            const validatedPlans = strategyPlans.map(plan => {
                const fuel = parseFloat(String(plan.fuelLoad).replace(',', '.')); // Garante formato numérico
                if (isNaN(fuel)) throw new Error(`Carga de combustível inválida no ${plan.planLabel}`);
                if (!timeToMillis(plan.totalTime)) throw new Error(`Tempo total inválido no ${plan.planLabel}`);
                return { ...plan, fuelLoad: fuel };
            });


            const strategyData = {
                name,
                track,
                raceDistance: raceDistance as Strategy['raceDistance'],
                notes,
                setupId: selectedSetupId,
                totalRaceLaps: finalTotalRaceLaps,
                initialAvailableTyres,
                strategyPlans: validatedPlans, // Usa os planos validados
                lapTimes: isEditing ? (strategies.find(s => s.id === params.strategyId)?.lapTimes || []) : [], // Mantém os tempos de volta se estiver editando
            };

            if (isEditing) {
                await updateStrategy(params.strategyId!, strategyData);
            } else {
                await createStrategy(strategyData);
            }

            router.push('/strategies-screen');

        } catch (error: any) {
            console.error("Erro ao salvar estratégia:", error);
            setErrorMessage(error.message || "Ocorreu um erro ao salvar.");
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
                            {/* Input Voltas Totais */}
                            <Box>
                                <Text className="mb-1 text-xs">Total de voltas da corrida</Text>
                                <Input>
                                    <InputField
                                        placeholder="Ex: 50"
                                        keyboardType="numeric"
                                        value={totalRaceLaps}
                                        onChangeText={setTotalRaceLaps}
                                    />
                                </Input>
                            </Box>

                            {/* Pneus Disponíveis */}
                            <Box className="border border-gray-200 p-3 rounded-md">
                                <Text className="text-xs mb-2">Total de jogos disponíveis para a corrida</Text>
                                <HStack className="justify-around">
                                    {tyreCompounds.map(compound => (
                                        <VStack key={compound} className="items-center w-12">
                                            <Image
                                                // @ts-ignore
                                                source={formTyreImages[compound]}
                                                style={{ width: 30, height: 30 }}
                                                contentFit="contain"
                                            />
                                            <Input size="sm" className="mt-1">
                                                <InputField
                                                    textAlign="center"
                                                    keyboardType="numeric"
                                                    value={String(initialAvailableTyres[compound])}
                                                    onChangeText={(value) => updateAvailableTyreCount(compound, value)}
                                                />
                                            </Input>
                                        </VStack>
                                    ))}
                                </HStack>
                            </Box>

                            {/* Renderização Dinâmica dos Planos */}
                            {strategyPlans.map((plan, planIndex) => (
                                <Box key={planIndex} className="border border-blue-300 p-3 rounded-md bg-blue-50">
                                    <HStack className="justify-between items-center mb-3">
                                        <Heading size="xs">{plan.planLabel}</Heading>
                                        <Pressable onPress={() => removeStrategyPlan(planIndex)}>
                                            <Trash2 size={18} color="red" />
                                        </Pressable>
                                    </HStack>
                                    <VStack space="md">
                                        {/* Stints do Plano */}
                                        {plan.plannedStints.map((stint, stintIndex) => (
                                            <HStack key={stintIndex} space="sm" className="items-end">
                                                <VStack className="flex-1">
                                                    <Text className="text-xs mb-1">Stint {stintIndex + 1}</Text>
                                                    <Select
                                                        selectedValue={stint.tyreCompound}
                                                        onValueChange={(value) => updateStintInPlan(planIndex, stintIndex, 'tyreCompound', value)}
                                                    >
                                                        <SelectTrigger><SelectInput placeholder="Pneu" /><ChevronDown className="mr-2" /></SelectTrigger>
                                                        <SelectPortal><SelectBackdrop /><SelectContent>
                                                            <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                                            {tyreCompounds.map(t => <SelectItem key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} value={t} />)}
                                                        </SelectContent></SelectPortal>
                                                    </Select>
                                                </VStack>
                                                {stintIndex > 0 ? (
                                                    <VStack className="w-24">
                                                        <Text className="text-xs mb-1">Parar na Volta</Text>
                                                        <Input size="sm">
                                                            <InputField
                                                                placeholder="Volta"
                                                                keyboardType="numeric"
                                                                value={String(stint.pitStopLap)}
                                                                onChangeText={(value) => updateStintInPlan(planIndex, stintIndex, 'pitStopLap', Number(value))}
                                                            />
                                                        </Input>
                                                    </VStack>
                                                ) : (
                                                    // Espaçador para manter o alinhamento quando o input está oculto
                                                    <Box className="w-24" />
                                                )}
                                                <Pressable onPress={() => removeStintFromPlan(planIndex, stintIndex)} className="pb-2">
                                                    <Trash2 size={16} color="gray" />
                                                </Pressable>
                                            </HStack>
                                        ))}
                                        {plan.plannedStints.length < 3 && (
                                            <Button size="xs" variant="link" onPress={() => addStintToPlan(planIndex)}>
                                                <ButtonText>+ Adicionar Stint</ButtonText>
                                            </Button>
                                        )}

                                        {/* Combustível e Tempo Total */}
                                        <HStack space="md" className="items-end">
                                            <VStack className="flex-1">
                                                <Text className="text-xs mb-1">Carga de combustível (voltas)</Text>
                                                <Input size="sm">
                                                    <InputField
                                                        placeholder="Ex: 35.5"
                                                        keyboardType="decimal-pad"
                                                        value={String(plan.fuelLoad)}
                                                        onChangeText={(value) => updatePlanField(planIndex, 'fuelLoad', value)}
                                                    />
                                                </Input>
                                            </VStack>
                                            <VStack className="flex-1">
                                                <Text className="text-xs mb-1">Tempo total de corrida</Text>
                                                <Input size="sm">
                                                    <InputField
                                                        placeholder="MM:SS.mls"
                                                        keyboardType="numbers-and-punctuation" // Melhor teclado
                                                        value={plan.totalTime}
                                                        onChangeText={(value) => updatePlanField(planIndex, 'totalTime', value)}
                                                    />
                                                </Input>
                                            </VStack>
                                        </HStack>
                                    </VStack>
                                </Box>
                            ))}

                            {/* Botão para Adicionar Novo Plano */}
                            {strategyPlans.length < 3 && (
                                <Button variant="solid" action="primary" onPress={addStrategyPlan}>
                                    <ButtonText>+ Adicionar {strategyPlans.length === 0 ? 'Plano A' : (strategyPlans.length === 1 ? 'Plano B' : 'Plano C')}</ButtonText>
                                </Button>
                            )}
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
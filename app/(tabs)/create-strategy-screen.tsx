import { Box } from '@/components/ui/box';
import { ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { DebouncedButton } from '@/src/components/common/DebouncedButton';
import { DebouncedPressable } from '@/src/components/common/DebouncedPressable';
import SelectSetupModal from '@/src/components/dialogs/SelectSetupModal';
import { PlannedStint, type Strategy, StrategyPlan, useSetupStore } from '@/src/stores/setupStore';
import { Image, ImageBackground } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

const timeToMillis = (time: string): number | null => {
    const parts = time.match(/(\d{2}):(\d{2})\.(\d{3})/);
    if (!parts) return null;
    const [, minutes, seconds, millis] = parts.map(Number);
    return (minutes * 60 + seconds) * 1000 + millis;
};

const formatRaceTime = (text: string) => {
    // 1. Remove tudo que não for número
    const cleaned = text.replace(/\D/g, '');

    // 2. Limita a 7 dígitos (MMSSmmm)
    const limited = cleaned.substring(0, 7);

    // 3. Adiciona a pontuação
    let formatted = limited;
    if (limited.length > 2) {
        formatted = `${limited.slice(0, 2)}:${limited.slice(2)}`;
    }
    if (limited.length > 4) {
        formatted = `${formatted.slice(0, 5)}.${limited.slice(4)}`;
    }

    return formatted;
};

type AvailableTyres = Strategy['initialAvailableTyres'];
type TyreCompound = PlannedStint['tyreCompound'];

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

    const allSetups = useSetupStore(state => state.allSetups);
    const gameData = useSetupStore(state => state.gameData);
    const createStrategy = useSetupStore(state => state.createStrategy);
    const updateStrategy = useSetupStore(state => state.updateStrategy);
    const strategies = useSetupStore(state => state.strategies);

    const [name, setName] = useState('');
    const [track, setTrack] = useState('');
    const [raceDistance, setRaceDistance] = useState<Strategy['raceDistance'] | ''>('');
    const [notes, setNotes] = useState('');
    const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null);
    const [totalRaceLaps, setTotalRaceLaps] = useState('');
    const [initialAvailableTyres, setInitialAvailableTyres] = useState<AvailableTyres>({
        soft: 2, medium: 2, hard: 2, intermediate: 2, wet: 2
    });
    const [strategyPlans, setStrategyPlans] = useState<StrategyPlan[]>([]);

    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleRaceDistanceChange = (value: string) => {
        setRaceDistance(value as Strategy['raceDistance']);
    };

    const addStrategyPlan = () => {
        if (strategyPlans.length < 3) {
            const nextPlanLabel = `Plano ${String.fromCharCode(65 + strategyPlans.length)}`;
            setStrategyPlans([
                ...strategyPlans,
                {
                    planLabel: nextPlanLabel,
                    plannedStints: [],
                    fuelLoad: 0,
                    totalTime: '00:00.000',
                }
            ]);
        }
    };

    const removeStrategyPlan = (planIndex: number) => {
        let plans = strategyPlans.filter((_, index) => index !== planIndex);
        plans = plans.map((plan, index) => ({
            ...plan,
            planLabel: `Plano ${String.fromCharCode(65 + index)}`
        }));
        setStrategyPlans(plans);
    };

    const addStintToPlan = (planIndex: number) => {
        const currentPlan = strategyPlans[planIndex];
        if (currentPlan && currentPlan.plannedStints.length < 3) {
            const newStint: PlannedStint = { tyreCompound: 'soft', pitStopLap: 0 };
            const updatedPlans = [...strategyPlans];
            updatedPlans[planIndex].plannedStints.push(newStint);
            setStrategyPlans(updatedPlans);
        }
    };

    const removeStintFromPlan = (planIndex: number, stintIndex: number) => {
        const updatedPlans = [...strategyPlans];
        updatedPlans[planIndex].plannedStints.splice(stintIndex, 1);
        setStrategyPlans(updatedPlans);
    };

    const updateStintInPlan = (planIndex: number, stintIndex: number, field: keyof PlannedStint, value: string | number) => {
        const updatedPlans = [...strategyPlans];
        // @ts-ignore
        updatedPlans[planIndex].plannedStints[stintIndex][field] = value;
        setStrategyPlans(updatedPlans);
    };

    const updatePlanField = (planIndex: number, field: keyof StrategyPlan, value: string | number) => {
        const updatedPlans = [...strategyPlans];
        // @ts-ignore
        updatedPlans[planIndex][field] = value;
        setStrategyPlans(updatedPlans);
    }

    const updateAvailableTyreCount = (compound: keyof AvailableTyres, value: string) => {
        const count = parseInt(value, 10);
        if (!isNaN(count) && count >= 0) {
            setInitialAvailableTyres(prev => ({ ...prev, [compound]: count }));
        } else if (value === '') {
            setInitialAvailableTyres(prev => ({ ...prev, [compound]: 0 }));
        }
    };

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

        setIsSaving(true);
        setErrorMessage('');

        try {
            const finalTotalRaceLaps = parseInt(totalRaceLaps, 10);
            if (isNaN(finalTotalRaceLaps)) throw new Error("Número de voltas inválido");

            const validatedPlans = strategyPlans.map(plan => {
                const fuel = parseFloat(String(plan.fuelLoad).replace(',', '.'));
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
                strategyPlans: validatedPlans,
                lapTimes: isEditing ? (strategies.find(s => s.id === params.strategyId)?.lapTimes || []) : [],
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
        <Box className="flex-1 bg-black">
            <ImageBackground
                source={require('@/src/assets/images/apex-wallpaper.jpg')}
                style={{ flex: 1 }}
                resizeMode="cover"
                imageStyle={{ opacity: 0.5 }}
            >
                {/* Cabeçalho Customizado */}
                <HStack className="bg-black/50 p-4 justify-between items-center pt-10">
                    <DebouncedPressable onPress={() => router.push('/strategies-screen')} className="p-2">
                        {(props: { pressed: boolean }) => (
                            <Box
                                style={{
                                    opacity: props.pressed ? 0.5 : 1.0,
                                }}
                            >
                                <ArrowLeft color="white"/>
                            </Box>
                        )}
                    </DebouncedPressable>
                    <Heading size="lg" className="flex-1 text-center text-white">
                        {isEditing ? 'Editar Estratégia' : 'Criar Nova Estratégia'}
                    </Heading>
                    <Box className="w-10" />
                </HStack>

                <ScrollView className="p-4">
                    <VStack space="xl" className="pb-10">
                        
                        {/* Seção de Informações Gerais */}
                        <Box className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                            <Heading size="sm" className="mb-4 text-white">Informações Gerais</Heading>
                            <VStack space="md">
                                <Input className="bg-gray-800 border-gray-700">
                                    <InputField 
                                        placeholder="Nome da Estratégia (ex: Bahrein 50%)" 
                                        value={name} 
                                        onChangeText={setName}
                                        className="text-white"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </Input>

                                <Select onValueChange={setTrack} selectedValue={track}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700">
                                        <HStack className="items-center justify-between flex-1">
                                            <SelectInput 
                                                placeholder="Selecione a Pista" 
                                                style={{ color: 'white' }} 
                                                placeholderTextColor="#9ca3af"
                                            />
                                            <ChevronDown className="mr-2" color="gray" />
                                        </HStack>
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            <ScrollView style={{ maxHeight: 400, width: '100%' }}>
                                                {gameData?.tracks.map(t => <SelectItem key={t} label={t} value={t} />)}
                                            </ScrollView>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>

                                <Select onValueChange={handleRaceDistanceChange} selectedValue={raceDistance}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700">
                                        <HStack className="items-center justify-between flex-1">
                                            <SelectInput 
                                                placeholder="Selecione a Distância" 
                                                style={{ color: 'white' }}
                                                placeholderTextColor="#9ca3af"
                                            />
                                            <ChevronDown className="mr-2" color="gray" />
                                        </HStack>
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
                        <Box className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                            <Heading size="sm" className="mb-4 text-white">Setup Vinculado</Heading>
                            {!selectedSetup ? (
                                <DebouncedPressable
                                    className="border border-dashed border-gray-600 bg-gray-800/50 p-4 rounded-xl items-center"
                                    onPress={() => setIsSetupModalOpen(true)}
                                >
                                    <Text className="text-gray-400">Clique para selecionar um setup</Text>
                                </DebouncedPressable>
                            ) : (
                                <Box className="border border-green-900/50 bg-green-900/20 p-3 rounded-xl">
                                    <HStack className="justify-between items-center">
                                        <VStack className="flex-1">
                                            <Text className="font-bold text-white">{selectedSetup.setupTitle}</Text>
                                            <Text className="text-xs text-gray-400">{selectedSetup.track} - {selectedSetup.car}</Text>
                                        </VStack>
                                        <HStack space="md">
                                            <DebouncedButton variant="outline" size="sm" className="border-gray-600" onPress={() => setIsSetupModalOpen(true)}>
                                                <ButtonText className="text-gray-300">Trocar</ButtonText>
                                            </DebouncedButton>
                                            <DebouncedPressable className="p-2" onPress={() => setSelectedSetupId(null)}>
                                                <X size={18} color="#ef4444" />
                                            </DebouncedPressable>
                                        </HStack>
                                    </HStack>
                                </Box>
                            )}
                        </Box>

                        {/* --- Seção de Pneus e Paradas --- */}
                        <Box className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                            <Heading size="sm" className="mb-4 text-white">Estratégia de Pneus e Paradas</Heading>
                            <VStack space="md">
                                {/* Input Voltas Totais */}
                                <Box>
                                    <Text className="mb-2 text-xs text-gray-400">Total de voltas da corrida</Text>
                                    <Input className="bg-gray-800 border-gray-700">
                                        <InputField
                                            placeholder="Ex: 50"
                                            keyboardType="numeric"
                                            value={totalRaceLaps}
                                            onChangeText={setTotalRaceLaps}
                                            className="text-white"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </Input>
                                </Box>

                                {/* Pneus Disponíveis */}
                                <Box className="border border-gray-700 p-3 rounded-xl bg-gray-800/30">
                                    <Text className="text-xs mb-3 text-gray-400 text-center">Pneus disponíveis</Text>
                                    <HStack className="justify-around">
                                        {tyreCompounds.map(compound => (
                                            <VStack key={compound} className="items-center w-12">
                                                <Image
                                                    // @ts-ignore
                                                    source={formTyreImages[compound]}
                                                    style={{ width: 30, height: 30 }}
                                                    resizeMode="contain"
                                                />
                                                <Input size="sm" className="mt-1 bg-gray-800 border-gray-700 h-8">
                                                    <InputField
                                                        textAlign="center"
                                                        keyboardType="numeric"
                                                        value={String(initialAvailableTyres[compound])}
                                                        onChangeText={(value) => updateAvailableTyreCount(compound, value)}
                                                        className="text-white text-xs"
                                                    />
                                                </Input>
                                            </VStack>
                                        ))}
                                    </HStack>
                                </Box>

                                {/* Renderização Dinâmica dos Planos */}
                                {strategyPlans.map((plan, planIndex) => (
                                    <Box key={planIndex} className="border border-gray-700 p-3 rounded-xl bg-gray-800/50">
                                        <HStack className="justify-between items-center mb-3">
                                            <Heading size="xs" className="text-white">{plan.planLabel}</Heading>
                                            <DebouncedPressable onPress={() => removeStrategyPlan(planIndex)}>
                                                <Trash2 size={18} color="#ef4444" />
                                            </DebouncedPressable>
                                        </HStack>
                                        <VStack space="md">
                                            {/* Stints do Plano */}
                                            {plan.plannedStints.map((stint, stintIndex) => (
                                                <HStack key={stintIndex} space="sm" className="items-end">
                                                    <VStack className="flex-1">
                                                        <Text className="text-xs mb-1 text-gray-400">Stint {stintIndex + 1}</Text>
                                                        <Select
                                                            selectedValue={stint.tyreCompound}
                                                            onValueChange={(value) => updateStintInPlan(planIndex, stintIndex, 'tyreCompound', value)}
                                                        >
                                                            <SelectTrigger className="bg-gray-800 border-gray-700 h-10">
                                                                <HStack className="items-center justify-between flex-1">
                                                                    <SelectInput 
                                                                        placeholder="Pneu" 
                                                                        className="text-white text-xs" 
                                                                        placeholderTextColor="#9ca3af"
                                                                    />
                                                                    <ChevronDown className="mr-2" size={16} color="gray" />
                                                                </HStack>
                                                            </SelectTrigger>
                                                            <SelectPortal><SelectBackdrop /><SelectContent>
                                                                <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                                                                {tyreCompounds.map(t => <SelectItem key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} value={t} />)}
                                                            </SelectContent></SelectPortal>
                                                        </Select>
                                                    </VStack>
                                                    {stintIndex > 0 ? (
                                                        <VStack className="w-24">
                                                            <Text className="text-xs mb-1 text-gray-400">Parar na Volta</Text>
                                                            <Input size="sm" className="bg-gray-800 border-gray-700 h-10">
                                                                <InputField
                                                                    placeholder="Volta"
                                                                    keyboardType="numeric"
                                                                    value={String(stint.pitStopLap)}
                                                                    onChangeText={(value) => updateStintInPlan(planIndex, stintIndex, 'pitStopLap', Number(value))}
                                                                    className="text-white text-xs"
                                                                    placeholderTextColor="#9ca3af"
                                                                />
                                                            </Input>
                                                        </VStack>
                                                    ) : (
                                                        <Box className="w-24" />
                                                    )}
                                                    <DebouncedPressable onPress={() => removeStintFromPlan(planIndex, stintIndex)} className="pb-3 pl-1">
                                                        <Trash2 size={16} color="gray" />
                                                    </DebouncedPressable>
                                                </HStack>
                                            ))}
                                            {plan.plannedStints.length < 3 && (
                                                <DebouncedButton size="xs" variant="link" onPress={() => addStintToPlan(planIndex)}>
                                                    <ButtonText className="text-blue-400">+ Adicionar Stint</ButtonText>
                                                </DebouncedButton>
                                            )}

                                            {/* Combustível e Tempo Total */}
                                            <HStack space="md" className="items-end pt-2 border-t border-gray-700">
                                                <VStack className="flex-1">
                                                    <Text className="text-xs mb-1 text-gray-400">Combustível (voltas)</Text>
                                                    <Input size="sm" className="bg-gray-800 border-gray-700">
                                                        <InputField
                                                            placeholder="Ex: 35.5"
                                                            keyboardType="decimal-pad"
                                                            value={String(plan.fuelLoad)}
                                                            onChangeText={(value) => updatePlanField(planIndex, 'fuelLoad', value)}
                                                            className="text-white"
                                                            placeholderTextColor="#9ca3af"
                                                        />
                                                    </Input>
                                                </VStack>
                                                <VStack className="flex-1">
                                                    <Text className="text-xs mb-1 text-gray-400">Tempo Estimado</Text>
                                                    <Input size="sm" className="bg-gray-800 border-gray-700">
                                                        <InputField
                                                            placeholder="MM:SS.mls"
                                                            keyboardType="number-pad" 
                                                            maxLength={9} 
                                                            value={plan.totalTime}
                                                            onChangeText={(text) => {
                                                                const formatted = formatRaceTime(text);
                                                                updatePlanField(planIndex, 'totalTime', formatted);
                                                            }}
                                                            className="text-white"
                                                            placeholderTextColor="#9ca3af"
                                                        />
                                                    </Input>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                ))}

                                {/* Botão para Adicionar Novo Plano */}
                                {strategyPlans.length < 3 && (
                                    <DebouncedButton variant="outline" className="border-gray-600" onPress={addStrategyPlan}>
                                        <ButtonText className="text-gray-300">+ Adicionar {strategyPlans.length === 0 ? 'Plano A' : (strategyPlans.length === 1 ? 'Plano B' : 'Plano C')}</ButtonText>
                                    </DebouncedButton>
                                )}
                            </VStack>
                        </Box>

                        {/* Seção de Anotações */}
                        <Box className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                            <Heading size="sm" className="mb-4 text-white">Anotações</Heading>
                            <Textarea className="bg-gray-800 border-gray-700">
                                <TextareaInput
                                    placeholder="Dicas sobre desgaste, melhor momento para parar, etc."
                                    value={notes}
                                    onChangeText={setNotes}
                                    className="text-white"
                                    placeholderTextColor="#9ca3af"
                                />
                            </Textarea>
                        </Box>
                    </VStack>

                    {errorMessage ? <Text className="text-red-500 mb-4 text-center">{errorMessage}</Text> : null}

                    <DebouncedButton onPress={handleSave} disabled={isSaving} className="mb-10 bg-red-600 rounded-xl">
                        {isSaving ? <Spinner color="white" /> : <ButtonText>Salvar Estratégia</ButtonText>}
                    </DebouncedButton>
                </ScrollView>

                <SelectSetupModal
                    isOpen={isSetupModalOpen}
                    onClose={() => setIsSetupModalOpen(false)}
                    onSelect={(id) => {
                        setSelectedSetupId(id);
                        setIsSetupModalOpen(false);
                    }}
                />
            </ImageBackground>
        </Box>
    );
}
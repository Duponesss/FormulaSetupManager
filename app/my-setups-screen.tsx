import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from "@/src/contexts/AuthContext";

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { FlatList } from '@/components/ui/flat-list';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { useSingleTap } from '@/src/hooks/useSingleTap';
import { SetupCard } from '@/src/components/cards/SetupCard';
import { useSetupStore, type SetupData } from '@/src/stores/setupStore';
import { Spinner } from '@/components/ui/spinner';
import { Trophy, ArrowLeft, ChevronDown } from 'lucide-react-native';
import AddToFolderModal from "@/src/components/dialogs/AddToFolderModal";
import { ImageBackground, ScrollView } from "react-native";
import LogoutModal from "@/src/components/dialogs/LogoutModal";
import { Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from "@/components/ui/select";


export default function MySetupsScreen() {
    console.log('Renderizando MySetupsScreen...');
    const router = useRouter();
    const allSetups = useSetupStore((state) => state.allSetups);
    const gameData = useSetupStore((state) => state.gameData);
    const loading = useSetupStore((state) => state.loadingSetups);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSetup, setSelectedSetup] = useState<SetupData | null>(null);

    const [filterCar, setFilterCar] = useState<string>("");
    const [filterTrack, setFilterTrack] = useState<string>("");
    const [filterControl, setFilterControl] = useState<string>("");
    const carOptions = useMemo(() => gameData?.teams.map(t => t.teamName) || [], [gameData]);
    const trackOptions = useMemo(() => gameData?.tracks || [], [gameData]);
    const controlTypes = ['Controle', 'Volante'];

    const filteredSetups = useMemo(() => {
        return allSetups.filter(setup => {
            if (filterCar && setup.car !== filterCar) return false;
            if (filterTrack && setup.track !== filterTrack) return false;
            if (filterControl && setup.controlType !== filterControl) return false;
            return true;
        });
    }, [allSetups, filterCar, filterTrack, filterControl]);

    const handleOpenAddToFolderModal = useCallback((setup: SetupData) => {
        setSelectedSetup(setup);
        setIsModalOpen(true);
    }, []);

    const FilterSelect = ({ placeholder, value, onChange, options }: any) => (
        <Box className="flex-1 mx-1">
            <Select selectedValue={value} onValueChange={onChange}>
                <SelectTrigger variant="outline" size="sm" className="bg-gray-800/80 border-gray-600 h-10">
                    <SelectInput
                        placeholder={placeholder}
                        className="text-white text-xs"
                        placeholderTextColor="#9ca3af"
                        numberOfLines={1}
                    />
                    <ChevronDown size={14} color="gray" />
                </SelectTrigger>
                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                        <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                        <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                            <SelectItem label="Todos" value="" />
                            {options.map((opt: string) => (
                                <SelectItem key={opt} label={opt} value={opt} />
                            ))}
                        </ScrollView>
                    </SelectContent>
                </SelectPortal>
            </Select>
        </Box>
    );

    if (loading && allSetups.length === 0) {
        return (
            <Box className="flex-1 justify-center items-center">
                <Spinner size="large" />
            </Box>
        );
    }

    return (
        <>
            <Box className="flex-1">
                {/* Header */}
                <ImageBackground
                    source={require('@/src/assets/images/apex-wallpaper.jpg')}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                >
                    <Box className="pt-5 pb-5 px-6 bg-black/60">
                        <HStack className="items-center mt-5">
                            <Pressable onPress={() => router.back()} className="p-2">
                                {(props: { pressed: boolean }) => (
                                    <Box
                                        style={{
                                            opacity: props.pressed ? 0.5 : 1.0,
                                        }}
                                    >
                                        <ArrowLeft color="white" />
                                    </Box>
                                )}
                            </Pressable>
                            <Heading size="2xl" className="text-white ml-3">Meus Setups</Heading>
                        </HStack>

                    </Box>
                    {/* Main Content */}

                    <Box className="flex-1 px-6 pt-4 bg-black/30">

                        <HStack className="mb-4 justify-between">
                            <FilterSelect
                                placeholder="Carro"
                                value={filterCar}
                                onChange={setFilterCar}
                                options={carOptions}
                            />
                            <FilterSelect
                                placeholder="Pista"
                                value={filterTrack}
                                onChange={setFilterTrack}
                                options={trackOptions}
                            />
                            <FilterSelect
                                placeholder="Tipo"
                                value={filterControl}
                                onChange={setFilterControl}
                                options={controlTypes}
                            />
                        </HStack>
                        <HStack className="items-center justify-between ml-4 mb-2">
                            <Text className="text-white">{filteredSetups.length} de {allSetups.length} setups cadastrados</Text>
                            {(filterCar || filterTrack || filterControl) && (
                                <Pressable className="bg-red-500 m-1 p-2 rounded-md" onPress={() => { setFilterCar(""); setFilterTrack(""); setFilterControl(""); }}>
                                    {(props: { pressed: boolean }) => (
                                        <Box
                                            style={{
                                                opacity: props.pressed ? 0.5 : 1.0,
                                            }}
                                        >
                                            <Text className="text-white text-xs font-bold">Limpar Filtros</Text>
                                        </Box>
                                    )}
                                </Pressable>
                            )}
                        </HStack>
                        <FlatList
                            data={filteredSetups}
                            renderItem={({ item }) => (
                                <SetupCard
                                    item={item}
                                    onAddToFolder={handleOpenAddToFolderModal}
                                />
                            )}
                            keyExtractor={(item) => item.id!}
                            initialNumToRender={5} // Renderiza um número menor de itens no carregamento inicial da tela
                            windowSize={11} // Define o tamanho da "janela" de renderização.
                            removeClippedSubviews={true} // Remove os itens que saem da janela de renderização da memória.
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Box className="items-center py-12">
                                    <Text size="lg" className="mb-2 text-white">Nenhum setup cadastrado</Text>
                                    <Text className="text-center text-white">Volte para a home e crie um novo setup!</Text>
                                </Box>
                            }
                        />
                    </Box>
                </ImageBackground>
            </Box >
            <AddToFolderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                setup={selectedSetup}
            />
        </>
    );
};
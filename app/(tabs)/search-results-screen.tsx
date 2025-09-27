// app/(tabs)/results.tsx
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '../../components/ui/box';
import { FlatList } from '../../components/ui/flat-list';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Pressable } from '../../components/ui/pressable';
import { Text } from '../../components/ui/text'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SetupCard } from '../../src/components/cards/SetupCard'; 
import { useSetupStore, type SetupData } from '../../src/stores/setupStore';
import { Spinner } from '@/components/ui/spinner';

export default function ResultsScreen() {
  const router = useRouter();
  const filters = useLocalSearchParams<{ car?: string; track?: string; }>(); // Recebe os filtros
  const { car, track, condition, controlType } = useLocalSearchParams<{ car?: string; track?: string; condition?: string; controlType?: string; }>();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { deleteSetupById } = useSetupStore(); 

  useEffect(() => {
    const fetchAndFilterSetups = async () => {
      setLoading(true);
      try {
        const storedSetups = await AsyncStorage.getItem('setups');
        if (!storedSetups) {
          setResults([]);
          return;
        }
        
        let setups = JSON.parse(storedSetups);

        // Lógica de filtragem
        if (car) setups = setups.filter((s: any) => s.car === car);
        if (track) setups = setups.filter((s: any) => s.track === track);
        if (condition) setups = setups.filter((s: any) => s.condition === condition);
        if (controlType) setups = setups.filter((s: any) => s.controlType === controlType);

        setResults(setups);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterSetups();
  }, [car, track, condition, controlType]);

  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-white">
      <Box className="pt-12 pb-4 px-6 border-b border-neutral-200">
        <HStack className="items-center justify-between">
          <Heading size="xl">Resultados da Busca</Heading>
          <Pressable onPress={() => router.back()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <FlatList
        data={results}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: SetupData }) => (
          <SetupCard item={item} onDelete={deleteSetupById} />
        )}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={<Text className="text-center mt-10">Nenhum setup encontrado para estes filtros.</Text>}
      />
    </Box>
  );
}
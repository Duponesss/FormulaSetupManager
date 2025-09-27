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
  const { car, track, condition, controlType } = useLocalSearchParams<{ 
    car?: string; 
    track?: string; 
    condition?: string; 
    controlType?: string; 
  }>();
  
  const [results, setResults] = useState<SetupData[]>([]);
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
        
        let setups: SetupData[] = JSON.parse(storedSetups);

        // Lógica de filtragem usando o objeto de filtros
        let filteredData = setups.filter(setup => {
          return (
            (!car || setup.car === car) &&
            (!track || setup.track === track) &&
            (!condition || setup.condition === condition) &&
            (!controlType || setup.controlType === controlType)
          );
        });

        setResults(filteredData);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterSetups();
  },  [car, track, condition, controlType]);

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
        keyExtractor={(item: any) => item.id!}
        renderItem={({ item }) => (
          <SetupCard item={item} onDelete={deleteSetupById} />
        )}
        contentContainerStyle={{ padding: 24 }}
        ListEmptyComponent={<Text className="text-center mt-10">Nenhum setup encontrado para estes filtros.</Text>}
      />
    </Box>
  );
}
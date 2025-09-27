import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Box } from '../../components/ui/box';
import { Button, ButtonText } from '../../components/ui/button';
import { FormControl } from '../../components/ui/form-control';
import { Heading } from '../../components/ui/heading';
import { HStack } from '../../components/ui/hstack';
import { Pressable } from '../../components/ui/pressable';
import { ScrollView } from '../../components/ui/scroll-view';
import { Text } from '../../components/ui/text';
import { VStack } from '../../components/ui/vstack';
import { Picker } from '@react-native-picker/picker';

export default function SearchScreen() {
  const router = useRouter();
  
  // Estado local para guardar as seleções de filtro
  const [filters, setFilters] = useState({
    car: '',
    track: '',
    controlType: '',
    condition: '',
  });

  // Opções para os Pickers (você já as tem)
  const carOptions = useMemo(() => [/* Sua lista de carros aqui */] as const, []);
  const trackOptions = useMemo(() => [/* Sua lista de pistas aqui */] as const, []);
  const controlTypes = useMemo(() => ['Controle', 'Volante'] as const, []);
  const conditionOptions = useMemo(() => ['Seco', 'Chuva', 'Chuva forte'] as const, []);

  const handleApplyFilters = () => {
    // Apenas navega para a tela de resultados, passando os filtros como parâmetros
    router.push({
      pathname: '/search-results-screen',
      params: filters,
    });
  };

  return (
    <Box className="flex-1 bg-white">
      <Box className="pt-12 pb-4 px-6 border-b border-neutral-200">
        <HStack className="items-center justify-between">
          <Heading size="xl">Buscar Setups</Heading>
          <Pressable onPress={() => router.back()}>
            <Text size="2xl">×</Text>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView className="flex-1">
        <VStack space="xl" className="p-6">
          {/* Adicione os Pickers para cada filtro */}
          <FormControl>
            <Text className="font-medium mb-2">Carro</Text>
            <Box className="border border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={filters.car}
                onValueChange={(value) => setFilters(prev => ({ ...prev, car: value }))}
              >
                <Picker.Item label="Qualquer Carro" value="" />
                {carOptions.map(item => <Picker.Item key={item} label={item} value={item} />)}
              </Picker>
            </Box>
          </FormControl>
          
          {/* ... Adicione aqui os Pickers para Pista, Tipo de Controle e Condições ... */}
          
        </VStack>
      </ScrollView>

      <Box className="p-6 border-t border-neutral-200">
        <Button onPress={handleApplyFilters}>
          <ButtonText>Aplicar Filtros</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
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
import { useSetupStore } from '../../src/stores/setupStore';

export default function SearchScreen() {
  const router = useRouter();

  // Estado local para guardar as seleções de filtro
  const [filters, setFilters] = useState({
    car: '',
    track: '',
    controlType: '',
    condition: '',
  });

  const gameData = useSetupStore(state => state.gameData);
  const carOptions = useMemo(() => gameData?.teams.map(t => t.teamName) || [], [gameData]);
  const trackOptions = useMemo(() => gameData?.tracks || [], [gameData]);
  const controlTypes = useMemo(() => ['Controle', 'Volante'] as const, []);
  const conditionOptions = useMemo(() => ['Seco', 'Chuva', 'Chuva forte'] as const, []);

  const handleApplyFilters = () => {
    const activeFilters: Record<string, string> = {};
    if (filters.car) activeFilters.car = filters.car;
    if (filters.track) activeFilters.track = filters.track;
    if (filters.controlType) activeFilters.controlType = filters.controlType;
    if (filters.condition) activeFilters.condition = filters.condition;
    router.push({
      pathname: '/search-results-screen',
      params: activeFilters,
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
          {/* Pickers para cada filtro */}
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

          {/* Picker de Pista */}
          <FormControl>
            <Text className="font-medium mb-2">Circuito</Text>
            <Box className="border border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={filters.track}
                onValueChange={(value) => setFilters(prev => ({ ...prev, track: value }))}
              >
                <Picker.Item label="Qualquer Circuito" value="" />
                {trackOptions.map(item => <Picker.Item key={item} label={item} value={item} />)}
              </Picker>
            </Box>
          </FormControl>

          {/* Picker de Tipo de Controle */}
          <FormControl>
            <Text className="font-medium mb-2">Tipo de Controle</Text>
            <Box className="border border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={filters.controlType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, controlType: value }))}
              >
                <Picker.Item label="Qualquer Tipo" value="" />
                {controlTypes.map(item => <Picker.Item key={item} label={item} value={item} />)}
              </Picker>
            </Box>
          </FormControl>

          {/* Picker de Condições */}
          <FormControl>
            <Text className="font-medium mb-2">Condições Climáticas</Text>
            <Box className="border border-gray-300 rounded-lg overflow-hidden">
              <Picker
                selectedValue={filters.condition}
                onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}
              >
                <Picker.Item label="Qualquer Condição" value="" />
                {conditionOptions.map(item => <Picker.Item key={item} label={item} value={item} />)}
              </Picker>
            </Box>
          </FormControl>

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
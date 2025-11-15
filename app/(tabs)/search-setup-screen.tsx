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
import {
  Select, SelectTrigger, SelectInput, SelectPortal, SelectBackdrop,
  SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem
} from '../../components/ui/select';
import { ChevronDown } from 'lucide-react-native';
import { useSetupStore } from '../../src/stores/setupStore';
import { ImageBackground } from 'react-native';

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
      <ImageBackground
        source={require('../../src/assets/images/apex-wallpaper.jpg')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >

        <Box className="pt-12 pb-4 px-6 bg-black/70">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-white">Buscar Setups</Heading>
          </HStack>
        </Box>
        <Box className="flex-1 bg-black/60">
          <ScrollView className="flex-1">
            <VStack space="xl" className="p-6">

              <FormControl>
                <Text className="font-medium mb-2 text-white">Carro</Text>
                <Select
                  selectedValue={filters.car}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, car: value }))}
                >
                  <SelectTrigger className="bg-gray-800/80 border-gray-700">
                    <SelectInput
                      placeholder="Qualquer Carro"
                      style={{ color: 'white' }}
                      placeholderTextColor="#c7cbd2"
                    />
                    <ChevronDown className="mr-3" color="gray" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                      <ScrollView style={{ maxHeight: 400, width: '100%' }}>
                        <SelectItem label="Qualquer Carro" value="" />
                        {carOptions.map(item => <SelectItem key={item} label={item} value={item} />)}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              <FormControl>
                <Text className="font-medium mb-2 text-white">Circuito</Text>
                <Select
                  selectedValue={filters.track}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, track: value }))}
                >
                  <SelectTrigger className="bg-gray-800/80 border-gray-700">
                    <SelectInput
                      placeholder="Qualquer Circuito"
                      style={{ color: 'white' }}
                      placeholderTextColor="#c7cbd2"
                    />
                    <ChevronDown className="mr-3" color="gray" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                      <ScrollView style={{ maxHeight: 400, width: '100%' }}>
                        <SelectItem label="Qualquer Circuito" value="" />
                        {trackOptions.map(item => <SelectItem key={item} label={item} value={item} />)}
                      </ScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              <FormControl>
                <Text className="font-medium mb-2 text-white">Tipo de Controle</Text>
                <Select
                  selectedValue={filters.controlType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, controlType: value }))}
                >
                  <SelectTrigger className="bg-gray-800/80 border-gray-700">
                    <SelectInput
                      placeholder="Qualquer Tipo"
                      style={{ color: 'white' }}
                      placeholderTextColor="#c7cbd2"
                    />
                    <ChevronDown className="mr-3" color="gray" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                      <SelectItem label="Qualquer Tipo" value="" />
                      {controlTypes.map(item => <SelectItem key={item} label={item} value={item} />)}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

              <FormControl>
                <Text className="font-medium mb-2 text-white">Condições Climáticas</Text>
                <Select
                  selectedValue={filters.condition}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="bg-gray-800/80 border-gray-700">
                    <SelectInput
                      placeholder="Qualquer Condição"
                      style={{ color: 'white' }}
                      placeholderTextColor="#c7cbd2"
                    />
                    <ChevronDown className="mr-3" color="gray" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                      <SelectItem label="Qualquer Condição" value="" />
                      {conditionOptions.map(item => <SelectItem key={item} label={item} value={item} />)}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>

            </VStack>
          </ScrollView>

          <Box className="p-6 border-t border-neutral-200">
            <Button onPress={handleApplyFilters}>
              <ButtonText>Aplicar Filtros</ButtonText>
            </Button>
          </Box>
        </Box>
      </ImageBackground>
    </Box>
  );
}
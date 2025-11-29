import { Box } from '@/components/ui/box';
import { ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import {
  Modal, ModalBackdrop, ModalContent,
  ModalFooter,
  ModalHeader
} from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { useSetupStore } from '../../stores/setupStore';
import { DebouncedButton } from '../common/DebouncedButton';
import { DebouncedPressable } from '../common/DebouncedPressable';

interface SelectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (setupId: string) => void;
}

const SelectSetupModal: React.FC<SelectSetupModalProps> = ({ isOpen, onClose, onSelect }) => {
  const allSetups = useSetupStore(state => state.allSetups);
  const loadingSetups = useSetupStore(state => state.loadingSetups);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSetups = useMemo(() => {
    if (!searchTerm) {
      return allSetups;
    }
    return allSetups.filter(setup =>
      setup.setupTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSetups]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-white rounded-lg">
        <ModalHeader>
          <Heading size="md">Selecionar Setup</Heading>
        </ModalHeader>
        <Box className="p-4">
          {/* Campo de Busca */}
          <Input className="mb-4">
            <InputIcon as={Search} className="ml-2" />
            <InputField
              placeholder="Buscar pelo nome do setup..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </Input>

          {/* Lista de Setups */}
          {loadingSetups ? (
            <Spinner />
          ) : (
            <FlatList
              data={filteredSetups}
              keyExtractor={(item) => item.id!}
              style={{ maxHeight: 300 }} 
              renderItem={({ item }) => (
                <DebouncedPressable
                  className="p-3 border-b border-gray-200"
                  onPress={() => onSelect(item.id!)}
                >
                  <Text className="font-semibold">{item.setupTitle}</Text>
                  <Text className="text-xs text-gray-500">{item.track} - {item.car}</Text>
                </DebouncedPressable>
              )}
              ListEmptyComponent={
                <Box className="items-center p-4">
                  <Text>
                    {searchTerm ? 'Nenhum setup encontrado.' : 'Você não tem setups cadastrados.'}
                  </Text>
                </Box>
              }
            />
          )}
        </Box>
        <ModalFooter>
          <DebouncedButton variant="outline" action="secondary" onPress={onClose}>
            <ButtonText>Cancelar</ButtonText>
          </DebouncedButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelectSetupModal;
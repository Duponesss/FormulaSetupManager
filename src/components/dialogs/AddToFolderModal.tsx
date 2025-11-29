import React, { useState, useEffect } from 'react';
import {
  Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '../../../components/ui/modal';
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '../../../components/ui/checkbox';
import { Heading } from '../../../components/ui/heading';
import { Button, ButtonText } from '../../../components/ui/button';
import { Text } from '../../../components/ui/text';
import { Spinner } from '../../../components/ui/spinner';
import { useSetupStore, type SetupData } from '../../stores/setupStore';
import { VStack } from '../../../components/ui/vstack';
import { FlatList } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';

interface AddToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  setup: SetupData | null;
}

const AddToFolderModal: React.FC<AddToFolderModalProps> = ({ isOpen, onClose, setup }) => {
  const folders = useSetupStore(state => state.folders);
  const setupFolderIds = useSetupStore(state => state.setupFolderIds);
  const loadingSetupFolders = useSetupStore(state => state.loadingSetupFolders);
  const getFoldersForSetup = useSetupStore(state => state.getFoldersForSetup);
  const updateSetupFolders = useSetupStore(state => state.updateSetupFolders);

  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && setup?.id) {
      getFoldersForSetup(setup.id);
    }
  }, [isOpen, setup, getFoldersForSetup]);

  useEffect(() => {
    if (!loadingSetupFolders) {
      setSelectedFolderIds(new Set(setupFolderIds));
    }
  }, [setupFolderIds, loadingSetupFolders]);

  const handleCheckboxChange = (folderId: string, isChecked: boolean) => {
    setSelectedFolderIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(folderId);
      } else {
        newSet.delete(folderId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!setup?.id) return;
    setIsSaving(true);
    await updateSetupFolders(setup.id, Array.from(selectedFolderIds));
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white rounded-lg">
        <ModalHeader>
          <Heading size="md">Adicionar à Pasta</Heading>
        </ModalHeader>
        <Box className="p-4"> 
          {loadingSetupFolders ? (
            <Spinner />
          ) : (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Checkbox
                  value={item.id}
                  isChecked={selectedFolderIds.has(item.id)}
                  onChange={(isChecked) => handleCheckboxChange(item.id, isChecked)}
                  className="my-2"
                >
                  <CheckboxIndicator className="mr-2">
                    <CheckboxIcon as={Check} />
                  </CheckboxIndicator>
                  <CheckboxLabel>{item.name}</CheckboxLabel>
                </Checkbox>
              )}
              ListEmptyComponent={<Text>Você não tem nenhuma pasta.</Text>}
            />
          )}
        </Box>
        <ModalFooter>
          <Button variant="outline" action="secondary" className="mr-3" onPress={onClose} disabled={isSaving}>
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button onPress={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner color="white" /> : <ButtonText>Salvar</ButtonText>}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddToFolderModal;
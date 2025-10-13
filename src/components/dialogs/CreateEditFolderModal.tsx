import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '../../../components/ui/modal';
import { Heading } from '../../../components/ui/heading';
import { Input, InputField } from '../../../components/ui/input';
import { Button, ButtonText } from '../../../components/ui/button';
import { Text } from '../../../components/ui/text';
import { HStack } from '../../../components/ui/hstack';
import { Switch } from '../../../components/ui/switch';
import { Spinner } from '../../../components/ui/spinner';
import { useSetupStore, type Folder } from '../../stores/setupStore';
import { VStack } from '@/components/ui/vstack';
import { X } from 'lucide-react-native';

interface CreateEditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: Folder | null; // Pasta opcional para o modo de edição
}

const CreateEditFolderModal: React.FC<CreateEditFolderModalProps> = ({
  isOpen,
  onClose,
  folderToEdit,
}) => {
  // 1. Pega as ações da store
  const createFolder = useSetupStore(state => state.createFolder);
  const updateFolder = useSetupStore(state => state.updateFolder);

  // 2. Estados internos para o formulário
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 3. Determina se está no modo de edição
  const isEditing = !!folderToEdit;

  // 4. useEffect para preencher o formulário no modo de edição
  useEffect(() => {
    // Se o modal estiver abrindo e for para editar, preenche os campos
    if (isOpen && isEditing) {
      setName(folderToEdit.name);
      setIsPublic(folderToEdit.isPublic);
    } 
    // Se o modal estiver fechando ou abrindo para criar, limpa os campos
    else if (!isOpen) {
      setName('');
      setIsPublic(false);
      setErrorMessage('');
    }
  }, [isOpen, folderToEdit, isEditing]);

  // 5. Função para salvar (criar ou atualizar)
  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('O nome da pasta não pode ser vazio.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isEditing) {
        // Atualiza a pasta existente
        await updateFolder(folderToEdit.id, { name, isPublic });
      } else {
        // Cria uma nova pasta
        await createFolder(name, isPublic);
      }
      onClose(); // Fecha o modal em caso de sucesso
    } catch (error) {
      console.error("Erro ao salvar pasta:", error);
      setErrorMessage('Ocorreu um erro ao salvar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="bg-white rounded-lg">
        <ModalHeader>
          <Heading>{isEditing ? 'Editar Pasta' : 'Criar Nova Pasta'}</Heading>
          <ModalCloseButton>
          <X />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody className="py-4">
          <Text className="mb-2">Nome da Pasta</Text>
          <Input>
            <InputField
              placeholder="Ex: Circuitos de Rua"
              value={name}
              onChangeText={setName}
            />
          </Input>

          <HStack className="items-center justify-between mt-6">
            <VStack className="flex-1 mr-4">
              <Text className="font-semibold">Privacidade da Pasta</Text>
              {/* Texto dinâmico com cor condicional para feedback claro */}
              <Text 
                className={`text-sm ${isPublic ? 'text-emerald-500' : 'text-red-600'}`}
              >
                {isPublic ? 'Pública' : 'Privada'}
              </Text>
              {/* Descrição também é dinâmica */}
              <Text className="text-xs text-gray-500 mt-1">
                {isPublic
                  ? 'Outros usuários poderão ver esta pasta.'
                  : 'Apenas você poderá ver esta pasta.'}
              </Text>
            </VStack>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
            />
          </HStack>

          {errorMessage && <Text className="text-red-500 mt-4">{errorMessage}</Text>}

        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            className="mr-3"
            onPress={onClose}
            disabled={isLoading}
          >
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button onPress={handleSave} disabled={isLoading}>
            {isLoading ? <Spinner color="white" /> : <ButtonText>Salvar</ButtonText>}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEditFolderModal;
import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
} from '../../../components/ui/alert-dialog'; // Ajuste o caminho conforme sua estrutura
import { Heading } from '../../../components/ui/heading';
import { Text } from '../../../components/ui/text';
import { Button, ButtonText } from '../../../components/ui/button';

interface DeleteFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folderName: string;
}

const DeleteFolderDialog: React.FC<DeleteFolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folderName,
}) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading>Excluir Pasta</Heading>
        </AlertDialogHeader>
        
        <AlertDialogBody>
          <Text className="text-gray-300">
            Você tem certeza que deseja excluir a pasta <Text className="font-bold text-white">"{folderName}"</Text>? 
            Todos os setups salvos nela serão removidos desta pasta (mas não serão excluídos do sistema).
            Esta ação não pode ser desfeita.
          </Text>
        </AlertDialogBody>

        <AlertDialogFooter className="mt-4">
          <Button variant="outline" action="secondary" onPress={onClose} className="mr-3 border-gray-600">
            <ButtonText className="text-gray-300">Cancelar</ButtonText>
          </Button>
          <Button action="negative" onPress={onConfirm} className="bg-red-600">
            <ButtonText className="text-white">Excluir</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFolderDialog;
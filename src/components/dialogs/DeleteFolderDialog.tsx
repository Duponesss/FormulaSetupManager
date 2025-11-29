import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { DebouncedButton } from '@/src/components/common/DebouncedButton';
import React from 'react';

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
          <DebouncedButton variant="outline" action="secondary" onPress={onClose} className="mr-3 border-gray-600">
            <ButtonText className="text-gray-300">Cancelar</ButtonText>
          </DebouncedButton>
          <DebouncedButton action="negative" onPress={onConfirm} className="bg-red-600">
            <ButtonText className="text-white">Excluir</ButtonText>
          </DebouncedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteFolderDialog;
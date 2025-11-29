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

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading>Confirmar Saída</Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text>Você tem certeza que deseja sair da sua conta?</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <DebouncedButton variant="outline" action="secondary" onPress={onClose} className="mr-3">
            <ButtonText>Cancelar</ButtonText>
          </DebouncedButton>
          <DebouncedButton action="negative" onPress={onConfirm}>
            <ButtonText>Sair</ButtonText>
          </DebouncedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutModal;
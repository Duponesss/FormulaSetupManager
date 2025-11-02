import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
} from '../../../components/ui/alert-dialog'; 
import { Heading } from '../../../components/ui/heading';
import { Text } from '../../../components/ui/text';
import { Button, ButtonText  } from '../../../components/ui/button';
import { X } from 'lucide-react-native';

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
          <AlertDialogCloseButton onPress={onClose}>
            <X />
          </AlertDialogCloseButton>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text>Você tem certeza que deseja sair da sua conta?</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button variant="outline" action="secondary" onPress={onClose} className="mr-3">
            <ButtonText>Cancelar</ButtonText>
          </Button>
          <Button action="negative" onPress={onConfirm}>
            <ButtonText>Sair</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutModal;
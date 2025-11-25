import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
} from '../../../components/ui/alert-dialog';
import { Heading } from '../../../components/ui/heading';
import { Text } from '../../../components/ui/text';
import { Button, ButtonText } from '../../../components/ui/button';

interface AppAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  okText?: string;
}

const AppAlertDialog: React.FC<AppAlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  okText = "OK",
}) => {
  const isConfirmation = !!onConfirm;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading>{title}</Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text>{message}</Text>
        </AlertDialogBody>
        <AlertDialogFooter className="mt-4">
          {isConfirmation ? (
            <>
              <Button variant="outline" action="secondary" onPress={onClose} className="mr-3">
                <ButtonText>{cancelText}</ButtonText>
              </Button>
              <Button action="negative" onPress={onConfirm}>
                <ButtonText>{confirmText}</ButtonText>
              </Button>
            </>
          ) : (
            <Button action="primary" onPress={onClose}>
              <ButtonText>{okText}</ButtonText>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AppAlertDialog;
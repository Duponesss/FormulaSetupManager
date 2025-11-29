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
              <DebouncedButton variant="outline" action="secondary" onPress={onClose} className="mr-3">
                <ButtonText>{cancelText}</ButtonText>
              </DebouncedButton>
              <DebouncedButton action="negative" onPress={onConfirm}>
                <ButtonText>{confirmText}</ButtonText>
              </DebouncedButton>
            </>
          ) : (
            <DebouncedButton action="negative" onPress={onClose}>
              <ButtonText>{okText}</ButtonText>
            </DebouncedButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AppAlertDialog;
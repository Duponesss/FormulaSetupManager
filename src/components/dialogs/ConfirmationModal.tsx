import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;      // Chamado ao cancelar
  onConfirm: () => void;    // Chamado ao confirmar
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} onStartShouldSetResponder={() => true}>
          <View className="w-11/12 max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <Text className="text-2xl font-bold text-neutral-800 mb-2 text-center">{title}</Text>
            <Text className="text-base text-neutral-600 mb-8 text-center">{message}</Text>

            {/* Container dos Botões */}
            <View className="flex-row w-full space-x-3">
              {/* Botão Cancelar */}
              <Pressable onPress={onClose} className="flex-1 bg-neutral-200 py-3 rounded-lg active:bg-neutral-300">
                <Text className="text-neutral-800 text-base font-bold text-center">{cancelText}</Text>
              </Pressable>

              {/* Botão Confirmar (Excluir) */}
              <Pressable
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-red-500 py-3 rounded-lg active:bg-red-600"
              >
                <Text className="text-white text-base font-bold text-center">{confirmText}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default ConfirmationModal;
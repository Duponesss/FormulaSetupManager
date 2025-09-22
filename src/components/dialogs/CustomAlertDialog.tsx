import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

const CustomAlertDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'OK',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose} // Permite fechar com o botão "voltar" do Android
    >
      {/* Fundo Escuro Semitransparente */}
      <Pressable onPress={onClose} className="flex-1 h-full justify-center items-center bg-black/60">
        
        {/* Usamos o Animated.View para uma entrada e saída suave */}
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          // Impede que o clique no conteúdo feche o modal
          onStartShouldSetResponder={() => true} 
        >
          {/* Caixa de Conteúdo do Diálogo */}
          <View className="w-11/12 max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            
            {/* Título */}
            <Text className="text-2xl font-bold text-neutral-800 mb-2 text-center">
              {title}
            </Text>
            
            {/* Mensagem */}
            <Text className="text-base text-neutral-600 mb-6 text-center">
              {message}
            </Text>

            {/* Botão de Confirmação */}
            <Pressable
              onPress={() => {
                onConfirm(); // Executa a ação de confirmação
                onClose();   // Fecha o modal
              }}
              className="w-full bg-red-500 p-3 rounded-2xl active:bg-red-600"
            >
              <Text className="text-white text-lg font-bold text-center">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default CustomAlertDialog;
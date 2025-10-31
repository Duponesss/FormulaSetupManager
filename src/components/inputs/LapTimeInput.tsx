// src/components/inputs/LapTimeInput.tsx

import React, { useState } from 'react';
import { Box } from '../../../components/ui/box';
import { Input, InputField } from '../../../components/ui/input';
import { Button, ButtonText } from '../../../components/ui/button';
import { Spinner } from '../../../components/ui/spinner';
import { HStack } from '../../../components/ui/hstack';

interface LapTimeInputProps {
  onAddLap: (timeString: string) => Promise<void>; // Função que será chamada ao adicionar
}

const LapTimeInput: React.FC<LapTimeInputProps> = ({ onAddLap }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handlePressAdd = async () => {
    if (!inputValue.trim()) return; // Não faz nada se estiver vazio

    setIsAdding(true);
    try {
      await onAddLap(inputValue); // Chama a função do pai
      setInputValue(''); // Limpa o input apenas se a adição for bem-sucedida
    } catch (error) {
      console.error("Erro ao chamar onAddLap:", error);
      // Você pode querer mostrar um feedback de erro aqui
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <HStack space="md" className="mt-4 pt-4 border-t border-gray-200">
      <Box className="flex-1">
        <Input>
          <InputField
            placeholder="MM:SS.mls (ex: 01:34.567)"
            keyboardType="numbers-and-punctuation" // Teclado mais adequado
            value={inputValue}
            onChangeText={setInputValue} // Atualiza apenas o estado interno
          />
        </Input>
      </Box>
      <Button onPress={handlePressAdd} disabled={isAdding || !inputValue.trim()}>
        {isAdding ? <Spinner color="white" /> : <ButtonText>Adicionar</ButtonText>}
      </Button>
    </HStack>
  );
};

export default LapTimeInput;
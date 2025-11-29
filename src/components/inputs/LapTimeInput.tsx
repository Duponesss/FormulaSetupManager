import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Input, InputField } from '@/components/ui/input';
import { ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';
import { DebouncedButton } from '@/src/components/common/DebouncedButton';

interface LapTimeInputProps {
  onAddLap: (timeString: string) => Promise<void>;
}

const LapTimeInput: React.FC<LapTimeInputProps> = ({ onAddLap }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handlePressAdd = async () => {
    if (!inputValue.trim()) return; 

    setIsAdding(true);
    try {
      await onAddLap(inputValue); 
      setInputValue(''); 
    } catch (error) {
      console.error("Erro ao chamar onAddLap:", error);
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
            keyboardType="numbers-and-punctuation"
            value={inputValue}
            onChangeText={setInputValue}
          />
        </Input>
      </Box>
      <DebouncedButton onPress={handlePressAdd} disabled={isAdding || !inputValue.trim()}>
        {isAdding ? <Spinner color="white" /> : <ButtonText>Adicionar</ButtonText>}
      </DebouncedButton>
    </HStack>
  );
};

export default LapTimeInput;
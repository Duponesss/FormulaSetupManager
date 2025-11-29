import React from 'react';
import { Button } from '@/components/ui/button'; 
import { useSingleTap } from '@/src/hooks/useSingleTap';

type ButtonProps = React.ComponentProps<typeof Button> & {
  delay?: number;
  children?: React.ReactNode;
};

export const DebouncedButton: React.FC<ButtonProps> = ({ 
  children, 
  onPress, 
  delay = 1000, 
  ...props 
}) => {
  const handlePress = useSingleTap(onPress || (() => {}), delay);

  return (
    <Button {...props} onPress={onPress ? handlePress : undefined}>
      {children}
    </Button>
  );
};
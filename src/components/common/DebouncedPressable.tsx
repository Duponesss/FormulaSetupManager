import React from 'react';
import { Pressable } from '@/components/ui/pressable'; 
import { useSingleTap } from '@/src/hooks/useSingleTap';

type GlueStackPressableProps = React.ComponentProps<typeof Pressable>;

interface DebouncedPressableProps extends GlueStackPressableProps {
  delay?: number;
  children?: React.ReactNode | ((state: { pressed: boolean; hovered?: boolean; focused?: boolean }) => React.ReactNode);
}

export const DebouncedPressable: React.FC<DebouncedPressableProps> = ({ 
  children, 
  onPress, 
  delay = 1000, 
  ...props 
}) => {
  const handlePress = useSingleTap(onPress || (() => {}), delay);

  return (
    <Pressable {...props} onPress={onPress ? handlePress : undefined}>
      {children}
    </Pressable>
  );
};
import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Star, StarHalf } from 'lucide-react-native';

interface StarRatingDisplayProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating = 0,
  size = 16,
  color = "#f5b20b",
  emptyColor = "#d1d5db"
}) => {
  return (
    <HStack space="xs">
      {[1, 2, 3, 4, 5].map((index) => {
        if (rating >= index) {
          return <Star key={index} size={size} color={color} fill={color} />;
        }
        if (rating >= index - 0.5) {
          return <StarHalf key={index} size={size} color={color} fill={color} />;
        }
        return <Star key={index} size={size} color={emptyColor} />;
      })}
    </HStack>
  );
};

export default StarRatingDisplay;
import { useRouter } from 'expo-router';
import { Box } from '../components/ui/box';
import { Button, ButtonText } from '../components/ui/button';
import { Heading } from '../components/ui/heading';
import { Text } from '../components/ui/text';

export default function StrategyDetailsScreen() {
  const router = useRouter();

  return (
    <Box className="flex-1 items-center justify-center"
    >
      <Heading className="mb-4" size="xl">
        Detalhes da Estratégia
      </Heading>
      <Text className="mb-6" size="lg">
        Esta funcionalidade ainda está em desenvolvimento.
      </Text>
      <Text className="mb-8" size="md">
        Aqui você poderá ver os detalhes da estratégia.
      </Text>
      <Button
        size="lg"
        variant="solid"
        action="primary"
        onPress={() => router.push('/(tabs)')} // Navega para a home
      >
        <ButtonText>Voltar para a Home</ButtonText>
      </Button>
    </Box>
  );
}
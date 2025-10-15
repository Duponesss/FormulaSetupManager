import { Box } from '../../components/ui/box';
import { Text } from '../../components/ui/text';
import { Button, ButtonText } from '../../components/ui/button';
import { Heading } from '../../components/ui/heading';
import { useRouter } from 'expo-router';

export default function StrategiesScreen() {
  const router = useRouter();

  return (
    <Box className="flex-1 items-center justify-center"
    >
      <Heading className="mb-4" size="xl">
        Estratégias
      </Heading>
      <Text className="mb-6" size="lg">
        Esta funcionalidade ainda está em desenvolvimento.
      </Text>
      <Text className="mb-8" size="md">
        Aqui você poderá criar e gerenciar suas estratégias.
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
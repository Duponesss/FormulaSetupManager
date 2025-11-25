import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useSetupStore } from '@/src/stores/setupStore';
import { ImageBackground } from 'react-native';

export default function SetupDeepLinkHandler() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const fetchSetupById = useSetupStore(state => state.fetchSetupById);

  useEffect(() => {
    const loadAndRedirect = async () => {
      if (id) {
        const success = await fetchSetupById(id);
        
        if (success) {
          router.replace({
            pathname: '/setup-details-screen',
            params: { setupId: id, isViewOnly: 'false' } 
          });
        } else {
          alert("Setup não encontrado ou link inválido.");
          router.replace('/(tabs)');
        }
      }
    };

    loadAndRedirect();
  }, [id]);

  return (
    <Box className="flex-1 bg-black justify-center items-center">
       <ImageBackground
          source={require('../../src/assets/images/apex-wallpaper.jpg')}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
          resizeMode="cover"
          imageStyle={{ opacity: 0.4 }}
        >
          <Spinner size="large" color="#ef4444" />
          <Text className="text-white mt-4 font-bold">Abrindo Setup...</Text>
      </ImageBackground>
    </Box>
  );
}
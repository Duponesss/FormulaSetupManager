import { Tabs } from 'expo-router';
import { CircleUserRound, Folder, House, Search, Wrench } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#E10600', // Cor do ícone ativo (Vermelho Ferrari/F1)
        tabBarInactiveTintColor: 'gray', // Cor do ícone inativo
        tabBarStyle: {
            backgroundColor: '#1F1F1F', // Um fundo escuro para a barra
            borderTopWidth: 0,
        }
      }}
    >
      <Tabs.Screen
        name="search-setup-screen"
        options={{
          title: 'Busca',
          tabBarIcon: ({ color }) => <Search color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="create-setup-screen"
        options={{
          title: 'Criar Setup',
          tabBarIcon: ({ color }) => <Wrench color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="folders-screen"
        options={{
          title: 'Pastas',
          tabBarIcon: ({ color }) => <Folder color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="profile-screen"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <CircleUserRound color={color} size={30} />,
        }}
      />
      {/* Estas telas são parte da navegação da aba, mas não aparecem na barra */}
      <Tabs.Screen
        name="setup-details-screen"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search-results-screen"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
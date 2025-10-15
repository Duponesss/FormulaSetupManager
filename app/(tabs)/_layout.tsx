import { Tabs } from 'expo-router';
import { CircleUserRound, Folder, House, Search, Wrench, ClipboardList } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs 
      initialRouteName="index" 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#E10600',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
            backgroundColor: '#1F1F1F',
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
        name="strategies-screen" 
        options={{
          title: 'Estratégias',
          tabBarIcon: ({ color }) => <ClipboardList color={color} size={30} />,
        }}
      />
      <Tabs.Screen
        name="profile-screen"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <CircleUserRound color={color} size={30} />,
        }}
      />
      
      {/* Telas ocultas */}
      <Tabs.Screen name="setup-details-screen" options={{ href: null }} />
      <Tabs.Screen name="search-results-screen" options={{ href: null }} />
      <Tabs.Screen name="folder-details-screen" options={{ href: null }} />
      <Tabs.Screen name="strategy-details-screen" options={{ href: null }} />
    </Tabs>
  );
}
import { Tabs } from 'expo-router';
import { CircleUserRound, Folder, House, Search, Wrench, ClipboardList } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  // ordem visual personalizada (índices das rotas do state.routes)
  const visualOrder = [1, 2, 0, 3, 4, 5];
  // nesse exemplo: Busca, Criar Setup, Home, Pastas, Estratégias, Perfil

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1F1F1F',
        paddingBottom: insets.bottom,
        paddingTop: 8,
      }}
    >
      {visualOrder.map((routeIndex) => {
        const route = state.routes[routeIndex];
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;

        const isFocused = state.index === routeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const Icon = options.tabBarIcon
          ? options.tabBarIcon({ focused: isFocused, color: isFocused ? '#E10600' : 'gray', size: 30 })
          : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ alignItems: 'center' }}
          >
            {Icon}
            <Text style={{ color: isFocused ? '#E10600' : 'gray', fontSize: 12 }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // tabBarActiveTintColor: '#E10600',
        // tabBarInactiveTintColor: 'gray',
        // tabBarStyle: {
        //     backgroundColor: '#1F1F1F',
        //     borderTopWidth: 0,
        // }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} size={30} />,
        }}
      />
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
      <Tabs.Screen name="search-results-screen" options={{ href: null }} />
    </Tabs>
  );
}
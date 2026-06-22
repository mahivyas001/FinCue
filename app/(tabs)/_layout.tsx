import { Tabs } from 'expo-router';
import { Home, Star, Search, Settings } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle: {
          backgroundColor:  COLORS.appBg.card,
          borderTopWidth:   0.5,
          borderTopColor:   COLORS.border.default,
          height:           72,
          paddingBottom:    18,
          paddingTop:       10,
        },
        tabBarActiveTintColor:   COLORS.bullish,            // #A2E0FC — same as MarketFilterBar active pill
        tabBarInactiveTintColor: COLORS.textPrimary.dim,    // #9CA3AF — same as MarketFilterBar inactive label
        tabBarLabelStyle: {
          fontSize:   10,
          fontWeight: '500',
          marginTop:  2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:    'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title:    'Watchlist',
          tabBarIcon: ({ color, size }) => (
            <Star size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title:    'Search',
          tabBarIcon: ({ color, size }) => (
            <Search size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title:    'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
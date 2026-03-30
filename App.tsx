
import React from 'react';
import GroupDashboard from './screens/GroupDashboard';

export default function App() {
  return <GroupDashboard />;
}

// App.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './screens/LoginScreen';

// Placeholder ekrany zakładek
const HomeScreen = () => <Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>Home</Text>;
const SearchScreen = () => <Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>Search</Text>;
const ProfileScreen = () => <Text style={{ color: '#fff', marginTop: 100, textAlign: 'center' }}>Profile</Text>;

export type RootStackParamList = {
    MainTabs: undefined;
    Login: undefined;
};

export type BottomTabParamList = {
    Home: undefined;
    Search: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ navigation }) => ({
                tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#2e2e2e' },
                tabBarActiveTintColor: '#6C63FF',
                tabBarInactiveTintColor: '#888',
                // 👇 Przycisk "Zaloguj się" w prawym górnym rogu KAŻDEJ zakładki
                headerStyle: { backgroundColor: '#0f0f0f' },
                headerTintColor: '#fff',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        style={{ marginRight: 16 }}
                    >
                        <Text style={{ color: '#6C63FF', fontWeight: '600', fontSize: 15 }}>
                            Zaloguj się
                        </Text>
                    </TouchableOpacity>
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Strona główna',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    title: 'Szukaj',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default function App() {
    return (
        <NavigationContainer>
            {/* 👇 App startuje od MainTabs, nie od Login */}
            <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Logowanie',
                        headerStyle: { backgroundColor: '#0f0f0f' },
                        headerTintColor: '#fff',
                        presentation: 'modal', // ← ładny efekt "wysuwania" ekranu od dołu
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}


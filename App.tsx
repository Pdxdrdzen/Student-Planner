// App.tsx
import React from 'react';
import {ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking'

import LoginScreen from './screens/auth_screens/LoginScreen';
import RegisterScreen from './screens/auth_screens/RegisterScreen';
import ForgotPasswordScreen from './screens/auth_screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import GroupDashboardScreen from './screens/GroupDashboardScreen';
import ChatScreen from './screens/ChatScreen';
import GroupDetailScreen from "./screens/GroupDetailScreen";
import GroupViewScreen from "./screens/GroupViewScreen";
import { useAuth } from './contexts/AuthContext';
import {AuthProvider} from "./contexts/AuthContext";

export type RootStackParamList = {
    MainTabs: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    GroupChat: undefined;
    GroupDetail: {
        groupId: string;
        groups: import('./screens/groupTypes').Group[];
    };
};

export type BottomTabParamList = {
    'Strona główna': undefined;
    GroupDashboard: undefined;
    Search: undefined;
    Profile: undefined;
    GroupView:undefined;
};

const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#0f0f0f',
        card: '#0f0f0f',
        text: '#ffffff',
        border: '#2e2e2e',
        primary: '#6C63FF',
        notification: '#6C63FF',
    },
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();


const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#2e2e2e' },
                tabBarActiveTintColor: '#6C63FF',
                tabBarInactiveTintColor: '#888',
                headerStyle: { backgroundColor: '#0f0f0f' },
                headerTintColor: '#fff',
            }}
        >
            <Tab.Screen
                name="Strona główna"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="GroupDashboard"
                component={GroupDashboardScreen}
                options={{
                    title: 'Grupy',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
                }}
            />
            <Tab.Screen
                name="GroupView"
                component={GroupViewScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    headerShown: false,
                    title: 'Szukaj',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    title: 'Profil',
                    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
                }}
            />

        </Tab.Navigator>
    );
};


const AppNavigator=()=>{
    const {session,loading} = useAuth();
    if(loading){
        return (
            <View style={{flex: 1, backgroundColor: '#0f0f0f',justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator color="#6C63FF" size="large" />
            </View>
        );
    }
    const linking={
        prefixes: ['studentplanner://'],
        config: {
            screens: {
                ResetPassword: 'reset-password',
                EmailConfirmed: 'email-confirmed'
            },
        },
    };



return (
    <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
            initialRouteName={session?'MainTabs':'Login'}
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 220,
            }}
        >
            <Stack.Screen name="MainTabs" component={MainTabs} />

            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Logowanie',
                    headerStyle: { backgroundColor: '#0f0f0f' },
                    headerTintColor: '#fff',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    animationDuration: 350,
                }}
            />

            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Rejestracja',
                    headerStyle: { backgroundColor: '#0f0f0f' },
                    headerTintColor: '#fff',
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            />

            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Resetuj hasło',
                    headerStyle: { backgroundColor: '#0f0f0f' },
                    headerTintColor: '#fff',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    animationDuration: 350,
                }}
            />

            <Stack.Screen
                name="GroupChat"
                component={ChatScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Czat grupy',
                    headerStyle: { backgroundColor: '#0f0f0f' },
                    headerTintColor: '#fff',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    animationDuration: 350,
                }}
            />
            <Stack.Screen
                name="GroupDetail"
                component={GroupDetailScreen}
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerStyle: { backgroundColor: '#0f0f0f' },
                    headerTintColor: '#fff',
                    animation: 'slide_from_right',
                    animationDuration: 280,
                }}
            />
        </Stack.Navigator>
    </NavigationContainer>
    );
};
export default function App(){
     return(
         <AuthProvider>
             <AppNavigator/>
         </AuthProvider>
     );
 }

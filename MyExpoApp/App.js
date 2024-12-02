import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './components/HomePage';
import CameraPage from './components/CameraPage';
import ImportImagePage from './components/ImagePage';
import ImageGamePage from './components/GamePage';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Camera" component={CameraPage} />
        <Stack.Screen name="Import Image" component={ImportImagePage} />
        <Stack.Screen name="Game" component={ImageGamePage} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './HomePage';
import CameraPage from './CameraPage';
import ImportImagePage from './ImagePage';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Camera" component={CameraPage} />
        <Stack.Screen name="Import Image" component={ImportImagePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

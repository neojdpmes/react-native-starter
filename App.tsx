/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FileScreen from './screens/FileScreen';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Files">
        <Stack.Screen name="Home" component={WelcomeScreen} />
        <Stack.Screen name="Files" component={FileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

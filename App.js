import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';

import HomeScreen     from './screens/HomeScreen';
import DayScreen      from './screens/DayScreen';
import ExerciseScreen from './screens/ExerciseScreen';

const Stack = createStackNavigator();
const theme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: '#1976d2' },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerLargeTitle: true }}>
          <Stack.Screen name="Home"     component={HomeScreen} />
          <Stack.Screen name="Day"      component={DayScreen}  />
          <Stack.Screen name="Exercise" component={ExerciseScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

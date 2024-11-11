import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import CountriesListScreen from './screens/CountriesListScreen';
import CountryDetailsScreen from './screens/CountryDetailsScreen';
import { Button } from 'react-native';
import { auth } from './firebaseConfig';
import { signOut } from "firebase/auth";
import FavoriteCountriesScreen from './screens/FavoriteCountriesScreen';
import { Feather, FontAwesome } from '@expo/vector-icons';

/** 
 * Create the stack and bottom tab navigator
 * -----------------------------------------
 * Screen layout:
 * -----------------------------------------
 * 1. Login screen: Stack
 * 2. Countries List: Tab
 * 3. Country Details: Stack
 * 4. Favorite Countries: Tab
 */
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * When the session is no longer required,
 * the user will be logged out of the app
 * with Firebase Auth signOut function.
 * Will return to the Login screen.
 * Implemented using error handling.
 * @param {*} navigation 
 * navigation object
 */
const logoutPressed = async (navigation) => {
  try {
    if (auth.currentUser === null) {
      alert("There is no user to logout!")
    } else {
      await signOut(auth);
      navigation.navigate("Login");
    }
  } catch (err) {
    alert("Error while logging out!");
    console.log(err);
  }
}

/**
 * Countries list displays city name
 * and capital. When the user taps
 * on a specific item in the list,
 * take them to a details screen.
 * Back button has been removed and a logout
 * button was added in top-right corner.
 * @returns Stack Navigator
 */
function CountriesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Countries List"
        component={CountriesListScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: null,
          headerRight: () => (
            <Button
              title="Logout"
              onPress={() => logoutPressed(navigation)} />
          ),
        })} />
      <Stack.Screen name="Details" component={CountryDetailsScreen}
        options={() => ({
          headerShown: true,
        })} />
    </Stack.Navigator>
  );
}

/**
 * Users can click at the bottom to switch
 * between the countries list or favorite
 * countries saved to Firestore. The screen
 * contains a route to highlight the tab bar
 * icon, represented as a globe and star.
 * The user can logout from the favorite
 * countries screen similar to countries list.
 * @returns Tab Navigator
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          if (route.name == "Countries") {
            return (
              <Feather name="globe" size={23} color={color} />
            );
          }
          if (route.name == "Favorite Countries") {
            return (
              <FontAwesome name="star-o" size={23} color={color} />
            );
          }
        }
      })}>
      <Tab.Screen name="Countries" component={CountriesStack}
        options={() => ({
          headerShown: false,
        })} />
      <Tab.Screen name="Favorite Countries" component={FavoriteCountriesScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: null,
          headerRight: () => (
            <Button
              title="Logout"
              onPress={() => logoutPressed(navigation)} />
          ),
        })} />
    </Tab.Navigator>
  );
}

/**
 * Login screen and tab navigator holding
 * the countries list and favorite countries
 * (TabNavigator function) are embedded within
 * a stack navigator. The header is invisible.
 * @returns NavigationContainer
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CountriesTabNavigator" component={TabNavigator}
          options={() => ({
            headerShown: false,
          })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import {
  StatusBar
} from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  NavigationContainer
} from '@react-navigation/native';
import {
  createStackNavigator
} from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';

export default function App() {
  return ( <
    View style = {
      styles.container
    } >
    <
    Text > Open up App.js to start working on your app! < /Text> <
    StatusBar style = "auto" / >
    <
    /View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
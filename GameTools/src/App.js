

import { createStackNavigator, createAppContainer } from "react-navigation";


import HomeScreen from "./home-screen"


const AppNavigator = createStackNavigator({
  Home: { screen: HomeScreen }
}, {
    initialRouteName: 'Home',
  });

export default createAppContainer(AppNavigator);
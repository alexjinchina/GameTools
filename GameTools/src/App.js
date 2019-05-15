import { createStackNavigator, createAppContainer } from "react-navigation";

import HomeScreen from "./home-screen";
// import React from "react";
// import { View, Text } from "react-native";
// class HomeScreen extends React.Component {
//   render() {
//     return (
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//         <Text>Home Screen</Text>
//       </View>
//     );
//   }
// }

const AppNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen }
  },
  {
    initialRouteName: "Home",
    headerMode: "none"
  }
);

export default createAppContainer(AppNavigator);

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  centerView: {
    justifyContent: "center",
    alignItems: "center"
  },
  homeScreenView: {
  },
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },

  progressView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },

  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  errorText: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    color: "red"
  },
  infoText: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    color: "#333333"
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  itemText: {
    // fontSize: 20,
    // textAlign: 'center',
    // color: '#333333',
    // marginBottom: 5,
  },
  tabSceneView: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  valueItemText: {
    color: "green"
  },
  updatedValueItemText: {
    color: "red"
  }
});

export default styles;

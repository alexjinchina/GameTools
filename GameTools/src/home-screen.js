import React from "react";
import { View, ScrollView, Text } from "react-native";

import { ListItem } from "react-native-elements";
import { lodash } from "./utils";

import styles from "./styles";

import { loadGamesConfig } from "./config";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { gamesConfig: null };
  }
  componentDidMount() {
    loadGamesConfig().then(gamesConfig => {
      this.setState({
        gamesConfig
      });
    });
  }

  render() {
    return (
      <View
        style={{
          ...styles.screen,
          ...styles.homeScreenView
          // backgroundColor: "green"
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "#F5FCFF"
          }}
        >
          {!this.state.gamesConfig ? (
            <Text style={styles.infoText}>loading config....</Text>
          ) : lodash.keys(this.state.gamesConfig).length === 0 ? (
            <Text style={styles.errorText}>No game defined in config!</Text>
          ) : (
            lodash.map(this.state.gamesConfig, (config, game) => {
              return (
                <ListItem
                  key={`game-${game}`}
                  title={`${game}`}
                  chevron={true}
                  onPress={() => {
                    this.props.navigation.navigate("Details", {
                      game,
                      config
                    });
                  }}
                />
              );
            })
          )}
        </ScrollView>
      </View>
    );
  }
}

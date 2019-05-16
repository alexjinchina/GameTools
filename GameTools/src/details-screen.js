import React from "react";
import { Dimensions, View, ScrollView, Text } from "react-native";

import { TabView, SceneMap } from "react-native-tab-view";
import { ListItem, Button } from "react-native-elements";
import { lodash } from "./utils";

import styles from "./styles";

export default class DetailesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: "values", title: "VALUES" },
        { key: "locks", title: "LOCKS" },
        { key: "items", title: "ITEMS" }
      ],
      isError: false,
      errorMessage: null,
      isInProgress: true,
      progressMessage: "working..."
    };
  }

  _renderEmptyView(name) {
    console.log(`_renderEmptyView(${name})`)
    return (
      <View style={[styles.tabSceneView]}>
        <Text>{name}</Text>
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    const { game, config } = navigation.state.params;
    if (game !== this.state.game || config !== this.state.config) {
      // this.setState({});
    }

    console.log("render")
    return (
      <View style={styles.screen}>
        {/* <Text>{game}</Text> */}
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            values: () => this._renderEmptyView("values"),
            locks: () => this._renderEmptyView("locks"),
            items: () => this._renderEmptyView("items")
          })}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get("window").width }}
        />
        <ApplyButton
          title="Apply"
          ref={"applyButton"}
          onPress={() => this._applyChanges()}
        />
      </View>
    );
  }
}

class ApplyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changed: false
    };
  }
  render() {
    return (
      <Button
        title="Apply"
        disabled={!this.state.changed}
        onPress={this.props.onPress}
      />
    );
  }
}

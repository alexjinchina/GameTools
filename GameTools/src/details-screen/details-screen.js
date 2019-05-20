import React from "react";
import { Dimensions, View, ScrollView, Text } from "react-native";

import { TabView, SceneMap } from "react-native-tab-view";
import { ListItem, Button, Overlay } from "react-native-elements";

import { lodash } from "./utils";

import styles from "./styles";
import * as ProgressInfo from "./progress-info";

import Game from "./game";

import ValuesTab from "./values-tab";

export default class DetailesScreen extends React.Component {
  constructor(props) {
    super(props);
    // console.log(ProgressInfo)
    this.state = {
      index: 0,
      routes: [
        { key: "values", title: "VALUES" },
        { key: "locks", title: "LOCKS" },
        { key: "items", title: "ITEMS" }
      ],
      ...ProgressInfo.stateTemplate
    };
  }

  componentDidMount() {
    // console.log("DetailesScreen.componentDidMount")
    this.loadGameData(this.props.navigation.state.params);
  }
  // componentDidUpdate() {
  //   console.log("DetailesScreen.componentDidUpdate")
  //   this.loadGameData(this.props.navigation.state.params)
  // }

  async loadGameData({ name, config }) {
    // if (game === this.state.game && config === this.state.config)
    //   return
    const game = new Game(name, config, {
      ...ProgressInfo.makeCallbacks(this)
    });
    ProgressInfo.startProgress(this, "loading game data...");

    await game.load();

    ProgressInfo.endProgress(this, { game });
  }

  _renderEmptyView(name) {
    console.log(`_renderEmptyView(${name})`);
    return (
      <View style={[styles.tabSceneView]}>
        <Text>{name}</Text>
      </View>
    );
  }
  render() {
    // const { navigation } = this.props;
    // const { game, config } = navigation.state.params;
    // if (game !== this.state.game || config !== this.state.config) {
    //   // this.setState({});
    // }

    console.log("render");

    if (ProgressInfo.isInProgress(this)) return ProgressInfo.render(this);
    return (
      <View style={styles.screen}>
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            values: <ValuesTab game={this.state.game} />,
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

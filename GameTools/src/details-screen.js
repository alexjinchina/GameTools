import React from "react";
import { Dimensions, View, ScrollView, Text } from "react-native";

import { TabView, SceneMap } from "react-native-tab-view";
import { ListItem } from "react-native-elements";
import { lodash } from "./utils";

import styles from "./styles";

export default class DetailesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: "data", title: "Data" },
        { key: "area", title: "Area" },
        { key: "items", title: "Items" }
      ],
      isError: false,
      errorMessage: null,
      isInProgress: true,
      progressMessage: "working..."
    };
  }

  render() {
    const { navigation } = this.props;
    const { game, config } = navigation.state.params;
    if (game !== this.state.game || config !== this.state.config) {
      this.setState({});
    }
    return (
      <View style={styles.screen}>
        {/* <Text>{game}</Text> */}
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            // data: () => this._renderDataView(),
            // area: () => this._renderAreaView(),
            // items: () => this._renderItemsView()
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

import React from "react";
import PropTypes from "prop-types";

import { View, Text, ScrollView } from "react-native";

import styles from "../styles";
import { lodash } from "../utils";

export default class ValuesTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { game } = this.props;
    if (!game) {
      return (
        <View style={[styles.tabSceneView]}>
          <Text>game is null</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.tabSceneView}>
        {lodash
          .keys(game.config.values)
          .sort()
          .map(key => {
            // const valueConfig = game.config.values[key];

            return (
              <ValueItem
                key={`value-item-${key}`}
                valueKey={key}
                game={game}
                valueKey={key}
              />
            );
          })}
      </ScrollView>
    );
  }
}

ValuesTab.propTypes = {
  game: PropTypes.object
};

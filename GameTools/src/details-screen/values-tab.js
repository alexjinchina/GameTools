import React from "react";
import PropTypes from "prop-types";

import { View, Text, ScrollView } from "react-native";

import styles from "../styles";
import { lodash } from "../utils";

import ValueItem from "./value-item";

export default class ValuesTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { values, onValueChanged } = this.props;
    if (!values) {
      return (
        <View style={[styles.tabSceneView]}>
          <Text>NO VALUES!</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.tabSceneVieww}>
        {lodash
          .keys(values)
          .sort()
          .map(key => {
            const value = values[key];
            return (
              <ValueItem
                key={`value-item-${key}`}
                valueKey={key}
                valueEntry={value}
                onValueChanged={onValueChanged}
              />
            );
          })}
      </ScrollView>
    );
  }
}

ValuesTab.propTypes = {};

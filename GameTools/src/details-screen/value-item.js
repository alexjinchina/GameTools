import React from "react";
import PropTypes from "prop-types";
import { ListItem } from "react-native-elements";
import { lodash } from "../utils";

export default class ValueItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { game, valueKey } = this.props;
    const config = game.config.values[valueKey];
    const { valuePath, displayText } = lodash.isString(config)
      ? { valuePath: config }
      : config;
    return (
      <ListItem
        title={displayText || valueKey}
        rightElement={
          <TextInput
            style={[
              updated ? styles.updatedValueItemText : styles.valueItemText,
              {}
            ]}
            keyboardType="numeric"
            defaultValue={value.toString()}
            // onChangeText={text => {
            onEndEditing={({ nativeEvent }) => {
              this._setValueItem(key, nativeEvent.text);
            }}
          />
        }
      />
    );
  }
}

import React from "react";
import PropTypes from "prop-types";
import { TextInput } from "react-native"
import { ListItem } from "react-native-elements";

import { lodash, castValueType } from "../utils";
import styles from "../styles";

export default class ValueItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newValue: undefined
    };
  }

  render() {
    const { game, valueKey } = this.props;
    const config = game.config.values[valueKey];
    const { valuePath, displayText } = lodash.isString(config)
      ? { valuePath: config }
      : config;

    const oldValue = game.getValueByPath(valuePath)
    if (lodash.isUndefined(oldValue)) {
      return <ListItem title={displayText || valueKey} rightTitle={"NOT FOUND!"} />
    }

    const { newValue } = this.state;
    const updated = !lodash.isUndefined(newValue) && (oldValue !== newValue)
    return (
      <ListItem
        title={displayText || valueKey}
        rightElement={
          <TextInput
            style={{
              ...(updated ? styles.updatedValueItemText : styles.valueItemText)
            }}
            keyboardType="numeric"
            defaultValue={(updated ? newValue : oldValue).toString()}
            onEndEditing={({ nativeEvent }) => {
              const newValue = castValueType(nativeEvent.text, null, oldValue)
              this.setState({ newValue })
              if (this.props.onValueChanged) {
                this.props.onValueChanged({ valueKey, oldValue, newValue })
              }
              // this._setValueItem(key, nativeEvent.text);

            }}
          />
        }
      />
    );
  }
}

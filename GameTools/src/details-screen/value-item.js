import React from "react";
import PropTypes from "prop-types";
import { View, TextInput } from "react-native";
import { ListItem, Icon, Input } from "react-native-elements";

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
    const { valueKey: key, valueEntry: entry } = this.props;
    const { value: oldValue, config } = entry;
    const { displayText } = config;
    const title = displayText || key;
    if (lodash.isUndefined(oldValue)) {
      return <ListItem title={title} rightTitle={"NOT FOUND!"} />;
    }

    const { newValue } = this.state;
    const updated = !lodash.isUndefined(newValue) && oldValue !== newValue;
    return (
      <ListItem
        title={title}
        input={{
          inputStyle: {
            ...(updated ? styles.updatedValueItemText : styles.valueItemText)
          },
          keyboardType: "numeric",
          defaultValue: (updated ? newValue : oldValue).toString(),
          onEndEditing: ({ nativeEvent }) => {
            this.onValueChanged(
              castValueType(nativeEvent.text, null, oldValue)
            );
          },
          ...(updated
            ? {
                rightIcon: {
                  name: "undo",
                  size: 14,
                  onPress: () => {
                    this.onValueChanged(undefined);
                  }
                }
              }
            : {})
        }}
      />
    );
  }

  onValueChanged(newValue) {
    this.setState({ newValue });
    if (this.props.onValueChanged) {
      const { valueKey: key, valueEntry: entry } = this.props;
      const { value: oldValue, config } = entry;

      this.props.onValueChanged({
        key,
        newValue,
        oldValue,
        config
      });
    }
  }
}

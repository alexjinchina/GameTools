/* eslint-disable no-mixed-spaces-and-tabs */
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
		const {
			displayText,
			subTitle = "",
			type = typeof oldValue,
			editable = true
		} = config;
		const title = displayText || key;

		if (lodash.isUndefined(oldValue)) {
			return (
				<ListItem title={title} subtitle={subTitle} rightTitle={"NOT FOUND!"} />
			);
		}

		const { newValue } = this.state;
		const updated = !lodash.isUndefined(newValue) && oldValue !== newValue;

		if (type === "boolean" || type === "bool") {
			if (!editable) {
				return (
					<ListItem
						title={title}
						subtitle={subTitle}
						rightIcon={{
							name: oldValue ? "lock" : "lock-open"
						}}
					/>
				);
			}
			return (
				<ListItem
					title={title}
					subtitle={subTitle}
					switch={{
						value: (updated ? newValue : oldValue) ? false : true,
						onValueChange: enabled => this.onValueChanged(!enabled)
					}}
				/>
			);
		} else if (type === "int" || type === "number" || type === "string") {
			if (!editable) {
				return (
					<ListItem title={title} subtitle={subTitle} rightTitle={oldValue} />
				);
			} else {
				return (
					<ListItem
						title={title}
						subtitle={subTitle}
						input={{
							inputStyle: {
								...(updated
									? styles.updatedValueItemText
									: styles.valueItemText)
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
		} else {
			debugger;
			<ListItem
				title={title}
				subtitle={subTitle}
				rightTitle={`[${type}]${oldValue.toString()}`}
			/>;
		}
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

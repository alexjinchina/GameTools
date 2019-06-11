import React from "react";
import PropTypes from "prop-types";

import { Dimensions, View, ScrollView, TextInput } from "react-native";

import { ListItem, Text, Button } from "react-native-elements";
import { TabView, SceneMap } from "react-native-tab-view";
import { lodash, castValueType } from "./utils";

import styles from "./styles";
export default class MainView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			index: 0,
			routes: [
				{ key: "data", title: "Data" },
				{ key: "area", title: "Area" },
				{ key: "items", title: "Items" }
			],
			updateCounter: 0,
			values: {},
			areas: {}
		};
	}
	componentDidMount() {
		// console.debug(`${this}.componentDidMount`)
		if (this.props.db) this._buildData(this.props.db);
	}

	componentDidUpdate(prevProps) {
		// console.debug(`${this}.componentDidUpdate`)
		if (this.props.db && this.props.db !== prevProps.db)
			this._buildData(this.props.db);
	}

	render() {
		if (!this.props.db)
			return (
				<View style={[{ flex: 1 }]}>
					<Text>ERROR:NO DATABASE!!!</Text>
				</View>
			);
		return (
			<View style={[{ flex: 1 }]}>
				<TabView
					navigationState={this.state}
					renderScene={SceneMap({
						data: () => this._renderDataView(),
						area: () => this._renderAreaView(),
						items: () => this._renderItemsView()
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

	_renderDataView() {
		// console.log("_renderDataView");
		return (
			<ScrollView style={styles.tabSceneView}>
				{lodash
					.keys(this.state.values)
					.sort()
					.map(key => {
						const { info, value, oldValue } = this.state.values[key];
						const { displayText = key } = info;
						const updated = value !== oldValue;
						// console.log(key, value, oldValue, updated);
						return (
							<ListItem
								key={`item-${key}`}
								title={`${displayText}`}
								rightElement={
									<TextInput
										style={[
											updated
												? styles.updatedValueItemText
												: styles.valueItemText,
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
					})}
			</ScrollView>
		);
	}

	_renderAreaView() {
		// console.log("_renderAreaView");
		return (
			<ScrollView style={styles.tabSceneView}>
				{lodash
					.keys(this.state.areas)
					.sort()
					.map(area => {
						const areaState = this.state.areas[area];
						return (
							<AreaItem
								key={`item-area-${area}`}
								area={area}
								areaState={areaState}
								onChange={() => this._checkUpdated()}
							/>
						);
					})}
			</ScrollView>
		);
	}
	_renderItemsView() {
		// console.log("_renderItemsView");
		return (
			<View style={[styles.tabSceneView]}>
				<Text>ITEM</Text>
			</View>
		);
	}

	_setValueItem(key, value) {
		const valueItem = this.state.values[key];
		valueItem.value = castValueType(valueItem.info.type, value);
		const maxValueItem = this.state.values[`${key}_max`];
		if (maxValueItem && maxValueItem.value < valueItem.value)
			maxValueItem.value = valueItem.value;
		this._checkUpdated();
	}

	_buildData(db) {
		const values = {};
		db.getKeys().map(key => {
			const info = db.getKeyInfo(key);
			const oldValue = db.getValue(key);
			values[key] = { info, oldValue, value: oldValue };
		});

		const areas = {};
		const cashAreas = new Set(db.getCashAreas());
		const lockedAreas = db.getLockedAreas();
		for (const area of db.getAreas()) {
			areas[area] = {
				isCash: cashAreas.has(area),
				isLocked: lockedAreas.has(area),
				unlock: false,
				reset: false
			};
		}

		this.setState({
			values,
			areas
		});
	}

	_checkUpdated() {
		const changed =
			lodash
				.values(this.state.values)
				.some(({ oldValue, value }) => oldValue !== value) ||
			lodash
				.values(this.state.areas)
				.some(({ unlock, reset }) => unlock || reset);
		this.refs.applyButton.setState({
			changed
		});
	}

	_applyChanges() {
		console.log(`_applyChanges`);
		const { db } = this.props;

		lodash.map(this.state.values, (valueItem, key) => {
			if (valueItem.value !== valueItem.oldValue) {
				console.log(`set value: ${key}=${valueItem.value}`);
				db.setValue(key, valueItem.value);
				valueItem.oldValue = valueItem.value;
			}
		});

		lodash.forEach(this.state.areas, (state, area) => {
			if (!state.unlock && !state.reset) return;
			db.unlockArea(area, state.reset);
			state.unlock = false;
			state.reset = false;
			if (state.isLocked && state.unlock) state.isLocked = false;
		});

		if (this.props.onApplyChanges) this.props.onApplyChanges();
	}
}

MainView.propTypes = {
	db: PropTypes.object,
	onApplyChanges: PropTypes.func
};

MainView.defaultProps = {};

class AreaItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reset: this.props.areaState.reset,
			unlock: this.props.areaState.unlock
		};
	}
	render() {
		const { area } = this.props;
		const { isLocked, isCash } = this.props.areaState;
		const { reset, unlock } = this.state;
		const title = `${area}${isCash ? "[Cash]" : ""}`;
		return (
			<ListItem
				title={title}
				rightIcon={
					!isLocked
						? {
								name: "check",
								color: reset ? "red" : "green",
								onPress: () => {
									const reset = !this.state.reset;
									this.props.areaState.reset = reset;
									this.setState({ reset });
									if (this.props.onChange)
										this.props.onChange({
											area,
											reset,
											unlock: this.state.unlock
										});
								}
						  }
						: null
				}
				switch={
					isLocked
						? {
								value: unlock,
								onValueChange: value => {
									this.props.areaState.unlock = value;
									this.setState({ unlock: value });
									if (this.props.onChange)
										this.props.onChange({
											area,
											reset: this.state.reset,
											unlock: value
										});
								}
						  }
						: null
				}
			/>
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

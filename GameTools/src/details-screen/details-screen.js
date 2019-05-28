import React from "react";
import { Dimensions, View, Text } from "react-native";

import { TabView, SceneMap } from "react-native-tab-view";
import { Button } from "react-native-elements";

import { lodash } from "../utils";

import styles from "../styles";
import * as ProgressInfo from "../progress-info";

import createGame from "../game";

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
		this.changedValues = new Map();
		this.changedLockes = new Map();
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
		const game = createGame(name, config, {
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
		if (ProgressInfo.isInProgress(this)) return ProgressInfo.render(this);
		const { game } = this.state;
		return (
			<View style={styles.screen}>
				<TabView
					navigationState={this.state}
					renderScene={SceneMap({
						// values: () => this._renderEmptyView("values"),

						values: () => (
							<ValuesTab
								values={lodash.reduce(
									game.getValueKeys(),
									(values, key) => {
										values[key] = {
											config: game.getValueConfig(key),
											value: game.getValue(key)
										};
										return values;
									},
									{}
								)}
								onValueChanged={({ key, newValue, oldValue }) =>
									this._onValueChanged(
										this.changedValues,
										key,
										newValue,
										oldValue
									)
								}
							/>
						),
						// locks: () => this._renderEmptyView("locks"),

						locks: () => (
							<ValuesTab
								values={lodash.reduce(
									game.getLockKeys(),
									(values, key) => {
										values[key] = {
											config: game.getLockConfig(key),
											value: game.isLocked(key)
										};
										return values;
									},
									{}
								)}
								onValueChanged={({ key, newValue, oldValue }) =>
									this._onValueChanged(
										this.changedLockes,
										key,
										newValue,
										oldValue
									)
								}
							/>
						),
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
	_onValueChanged(values, key, newValue, oldValue) {
		if (lodash.isUndefined(newValue) || oldValue === newValue) {
			values.delete(key);
		} else {
			values.set(key, newValue);
		}
		this._checkModified();
	}
	_checkModified() {
		this.refs.applyButton.setState({
			changed: this.changedValues.size > 0 || this.changedLockes.size > 0
		});
	}

	async _applyChanges() {
		ProgressInfo.startProgress(this, "applying changes...");
		this.changedValues.forEach((value, key) => {
			this.state.game.setValue(key, value);
		});
		this.changedLockes.forEach((lock, key) => {
			if (!lock) this.state.game.unlock(key);
		});
		await this.state.game.save();
		ProgressInfo.endProgress(this);
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

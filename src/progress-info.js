import React from "react";

import {
	Platform,
	PermissionsAndroid,
	YellowBox,
	StyleSheet,
	Dimensions,
	View,
	ScrollView,
	TextInput,
	ActivityIndicator
} from "react-native";
import { Text, ListItem, Button, Overlay, Icon } from "react-native-elements";

import styles from "./styles";

export const stateTemplate = {
	isInProgress: true,
	progressMessage: null,
	isError: false,
	errorMessage: null
};

export function makeCallbacks(comp) {
	return {
		infoCallback: msg => {
			comp.setState({ progressMessage: msg });
		},
		errorCallback: error => {
			comp.setState({
				isError: true,
				errorMessage: error.message || error
			});
		}
	};
}

export function startProgress(comp, initMessage) {
	comp.setState({
		isInProgress: true,
		progressMessage: initMessage || "starting...",
		isError: false,
		errorMessage: null
	});
}

export function endProgress(comp, state = {}) {
	comp.setState({
		isInProgress: false,
		progressMessage: null,
		// isError: false,
		// errorMessage: null,
		...(state || {})
	});
}

export function isInProgress(comp) {
	return comp.state.isInProgress;
}

export function isError(comp) {
	return comp.state.isError;
}

export function render(comp) {
	if (!comp.state.isInProgress && !comp.state.isError) return;
	return (
		<View style={styles.progressView}>
			{!comp.state.isError ? (
				<ActivityIndicator size="large" />
			) : (
				<Icon name="error" />
			)}
			<Text style={styles.infoText}>{comp.state.progressMessage || ""}</Text>
			{comp.state.isError && (
				<Text style={styles.errorText}>{comp.state.errorMessage || ""}</Text>
			)}
		</View>
	);
}

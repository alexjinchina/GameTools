/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
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

import { ListItem, Text, Button } from "react-native-elements";
// import NumericInput from 'react-native-numeric-input'
// import Spinner from 'react-native-number-spinner';
import Spinner from "./spinner";
import { TabView, SceneMap } from "react-native-tab-view";
import { fs, path, lodash, castValueType } from "./utils";
import DB from "./db";
import styles from "./styles";
import MainView from "./main-view"

YellowBox.ignoreWarnings(["componentWillMount is deprecated"]);

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      errorMessage: null,
      isInProgress: true,
      progressMessage: "preparing...",
      db: null,
      values: {},
      valuesUpdated: false
    };
  }
  componentDidMount() {
    this.openDatabase();
  }
  async openDatabase() {
    try {
      this.setState({
        isInProgress: true,
        progressMessage: "opening data base...",
        isError: false
      });
      const db = new DB({
        messageCallback: msg => {
          this.setState({ progressMessage: msg });
        },
        errorCallback: error => {
          this.setState({
            isError: true,
            errorMessage: error.message || error
          });
        }
      });
      await db.open();
      this.setState({ isInProgress: false, db });
    } catch (error) {
      // debugger
      this.handleError(error);
    }
  }
  handleSQLError = (tx, error) => {
    this.handleError(error);
  };

  handleError = error => {
    this.setState({
      isError: true,
      errorMessage: error.message || error
    });
  };
  _renderError() {
    return (
      <View style={styles.container}>
        <Text style={[styles.welcome, { color: "#FF0000" }]}>ERROR</Text>
        <Text style={styles.instructions}>
          {this.state.progressMessage || ""}
        </Text>
        <Text style={[styles.instructions, { color: "#FF0000" }]}>
          {this.state.errorMessage || ""}
        </Text>
      </View>
    );
  }
  _renderProgress() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={styles.instructions}>
          {this.state.progressMessage || ""}
        </Text>
      </View>
    );
  }
  _renderMainView() {
    return (<MainView
      db={this.state.db}
      onApplyChanges={() => this._applyChanges()}
    />)
  }

  render() {
    if (this._renderTest) return this._renderTest()
    if (this.state.isError) return this._renderError()
    if (this.state.isInProgress) return this._renderProgress()
    if (this.state.db) return this._renderMainView()

    return this._renderError()
  }

  _xrenderTest() {
    return (
      <View style={styles.container}>
        <TextInput defaultValue="123" />
      </View>
    )
  }

  async _applyChanges() {
    console.log(`_applyChanges`);
    this.setState({
      isInProgress: true,
      progressMessage: "applying changes...",
      isError: false
    });

    try {
      await this.state.db.save()
      this.setState({ isInProgress: false });
    } catch (error) {
      this.handleError(error)
    }

  }



}

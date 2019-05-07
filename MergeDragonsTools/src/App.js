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

YellowBox.ignoreWarnings(["componentWillMount is deprecated"]);

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      errorMessage: null,
      isInProgress: false,
      progressMessage: null,
      db: null,
      index: 0,
      routes: [
        { key: "data", title: "Data" },
        { key: "area", title: "Area" },
        { key: "items", title: "Items" }
      ],
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
      this._buildData(db);
      this.setState({ isInProgress: false, db });
    } catch (error) {
      // debugger
      this.handleError(error);
    }
  }
  _buildData(db) {
    const values = {};
    db.getKeys().map(key => {
      const info = db.getKeyInfo(key);
      const oldValue = db.getValue(key);
      values[key] = { info, oldValue, value: oldValue };
    });
    this.setState({ values, valuesUpdated: false });
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
      <View>
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
      <View>
        <ActivityIndicator />
        <Text style={styles.instructions}>
          {this.state.progressMessage || ""}
        </Text>
      </View>
    );
  }
  _renderMainView() {
    console.log("_renderMainView");
    // console.log(this.state.valuesUpdated);
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
        <Button
          title="Apply"
          disabled={this.state.index === 0 ? !this.state.valuesUpdated : true}
          onPress={() => this._applyChanges()}
        />
      </View>
    );
  }

  _renderDataView() {
    console.log("_renderDataView");
    return (
      <ScrollView style={styles.tabSceneView}>
        {this.state.db
          .getKeys()
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
    console.log("_renderAreaView");
    return (
      <View style={[styles.tabSceneView]}>
        <Text>AREA</Text>
      </View>
    );
  }
  _renderItemsView() {
    console.log("_renderItemsView");
    return (
      <View style={[styles.tabSceneView]}>
        <Text>ITEMS</Text>
      </View>
    );
  }
  _render() {
    if (this._renderTest) return this._renderTest();
    else if (this.state.isError) return this._renderError();
    else if (this.state.isInProgress) return this._renderProgress();
    else if (this.state.db) return this._renderMainView();
  }
  render() {
    return <View style={styles.container}>{this._render()}</View>;
  }

  _xrenderTest() {
    return <TextInput defaultValue="123" />;
  }

  _setValueItem(key, value) {
    const valueItem = this.state.values[key];
    valueItem.value = castValueType(valueItem.info.type, value);
    const maxValueItem = this.state.values[`${key}_max`];
    if (maxValueItem && maxValueItem.value < valueItem.value)
      maxValueItem.value = valueItem.value;
    this._checkUpdated();
  }

  _checkUpdated() {
    let valuesUpdated = false;

    const values = lodash.clone(this.state.values);
    lodash.map(values, valueItem => {
      if (valueItem.oldValue === valueItem.value) {
        valuesUpdated = true;
      }
    });
    this.setState({ values, valuesUpdated });
  }

  _applyChanges() {
    console.log(`_applyChanges`);
    this.setState({
      isInProgress: true,
      progressMessage: "applying changes...",
      isError: false
    });

    const { db } = this.state;
    lodash.map(this.state.values, (valueItem, key) => {
      if (valueItem.value !== valueItem.oldValue) {
        console.log(`set value: ${key}=${valueItem.value}`);
        db.setValue(key, valueItem.value);
      }
    });

    db.save().then(() => {
      this._buildData(db);
      this.setState({
        isInProgress: false
      });
    });
  }
}
